import praw
import requests
import subprocess
import concurrent.futures
from time import sleep
from serpapi import GoogleSearch
from bs4 import BeautifulSoup
from fpdf import FPDF
from flask import Flask, request, jsonify, send_file
import os
import functools
from cachetools import cached, TTLCache
import unicodedata
import re

app = Flask(__name__)

# Reddit API Credentials
REDDIT_CLIENT_ID = "QKGDGzkyoyva4v2KEH0SVA"
REDDIT_CLIENT_SECRET = "7on0Zt2o5zAfCJM9wiFF0aBWOiochg"
REDDIT_USER_AGENT = "feasibility_analysis/1.0"

# SerpAPI Key
SERPAPI_KEY = "a5d3176dd35f580072eeda90645ee39b1b81c4cc18b9fc8eef5e0ee970abd842"

# Initialize Reddit API
reddit = praw.Reddit(
    client_id=REDDIT_CLIENT_ID,
    client_secret=REDDIT_CLIENT_SECRET,
    user_agent=REDDIT_USER_AGENT
)

# Create caches for API responses (1 hour TTL)
reddit_cache = TTLCache(maxsize=100, ttl=3600)
competition_cache = TTLCache(maxsize=100, ttl=3600)
investor_cache = TTLCache(maxsize=100, ttl=3600)
news_cache = TTLCache(maxsize=100, ttl=3600)

# Function to get Reddit trend score with caching
@cached(cache=reddit_cache)
def get_reddit_trend_score(idea, subreddit="all", limit=20):  # Reduced limit for faster performance
    """Fetches Reddit trend score based on idea popularity."""
    total_upvotes, num_posts = 0, 0
    try:
        for post in reddit.subreddit(subreddit).search(idea, sort="top", limit=limit):
            total_upvotes += post.score
            num_posts += 1
            sleep(0.5)  # Reduced sleep time
    except Exception as e:
        print(f"Error fetching Reddit trends: {e}")
        return 20  # Default low score
    
    # More balanced calculation that's harder to max out
    if num_posts == 0:
        return 20
    avg_upvotes = total_upvotes / num_posts
    # Logarithmic scale to prevent extremely high scores
    # A post would need ~5000 avg upvotes to score 100
    return round(min(100, 20 + 20 * (avg_upvotes ** 0.5) / 15))

# Function to get competition score using SerpAPI with caching
@cached(cache=competition_cache)
def get_competition_score(idea):
    """Evaluates competition intensity using SerpAPI.
    Lower number of competitors = higher score (inverse relationship)"""
    search = GoogleSearch({"q": idea, "api_key": SERPAPI_KEY})
    try:
        search_results = search.get_dict()
        num_competitors = len(search_results.get("organic_results", []))
        # More balanced scoring - harder to get 100
        if num_competitors == 0:
            return 95  # Almost no competition, but not 100
        elif num_competitors < 3:
            return 85
        elif num_competitors < 7:
            return 70
        elif num_competitors < 15:
            return 55
        elif num_competitors < 25:
            return 40
        else:
            return 25  # High competition
    except Exception as e:
        print(f"Error fetching competition score: {e}")
        return 50  # Default medium competition

# Function to get investor interest with caching
@cached(cache=investor_cache)
def get_investor_interest(idea):
    """Scrapes AngelList for investor interest data."""
    try:
        response = requests.get(
            f"https://angel.co/search?q={idea}", 
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=10  # Add timeout
        )
        num_investors = len(BeautifulSoup(response.text, "lxml").find_all("div", class_="styles_startupCard__3kRzV"))
        # More balanced scoring with a higher bar for max score
        return 90 if num_investors > 15 else 75 if num_investors > 8 else 60 if num_investors > 4 else 45 if num_investors > 1 else 30
    except Exception as e:
        print(f"Error fetching investor interest: {e}")
        return 40  # Default moderate interest

# Function to get news mentions score with caching
@cached(cache=news_cache)
def get_news_mentions_score(idea):
    """Scrapes Google News for idea mentions."""
    try:
        response = requests.get(
            f"https://news.google.com/search?q={idea.replace(' ', '%20')}", 
            headers={"User-Agent": "Mozilla/5.0"},
            timeout=10  # Add timeout
        )
        soup = BeautifulSoup(response.text, "lxml")
        num_articles = len(soup.find_all("article"))
        
        # More balanced scoring with higher threshold for max score
        return 90 if num_articles > 20 else 75 if num_articles > 10 else 60 if num_articles > 5 else 45 if num_articles > 2 else 30
    except Exception as e:
        print(f"Error fetching news mentions: {e}")
        return 40  # Default moderate news coverage

# Function to calculate feasibility score with parallel processing
def get_feasibility_score(idea):
    """Aggregates all scores to determine final feasibility using parallel processing."""
    # Use ThreadPoolExecutor to run API calls in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        # Submit all tasks
        reddit_future = executor.submit(get_reddit_trend_score, idea)
        competition_future = executor.submit(get_competition_score, idea)
        investor_future = executor.submit(get_investor_interest, idea)
        news_future = executor.submit(get_news_mentions_score, idea)
        
        # Get results from futures
        reddit_score = reddit_future.result()
        competition_score = competition_future.result()
        investor_score = investor_future.result()
        news_score = news_future.result()
    
    scores = {
        "idea": idea,
        "reddit_trend_score": reddit_score,
        "competition_score": competition_score,
        "investor_interest_score": investor_score,
        "news_mentions_score": news_score,
    }
    
    scores["final_feasibility_score"] = round(
        (scores["reddit_trend_score"] * 0.3) +
        (scores["competition_score"] * 0.25) +
        (scores["investor_interest_score"] * 0.25) +
        (scores["news_mentions_score"] * 0.2)
    )
    return scores

# Function to analyze feasibility using Ollama
def analyze_with_llama(feasibility_data):
    """Generates feasibility report using Ollama AI model."""
    prompt = f"""
    You are an expert in business analysis. Analyze the following feasibility data and generate a detailed report:
    {feasibility_data}
    
    Format your response with clear sections and avoid using special Unicode characters like em dashes.
    """
    try:
        result = subprocess.run(["ollama", "run", "gemma3:1b", prompt], capture_output=True, text=True, encoding="utf-8", timeout=60)
        return result.stdout.strip()
    except Exception as e:
        return f"Error running Ollama: {str(e)}"

def generate_pdf(feasibility_data, ai_analysis):
    """Creates a downloadable PDF report with Unicode support."""
    # Create PDF with default settings
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    
    # Sanitize all text input to ensure no Unicode character issues
    def sanitize_text(text):
        # Replace fancy quotes and other problematic characters
        text = text.replace("'", "'").replace("'", "'")
        text = text.replace(""", "\"").replace(""", "\"")
        text = text.replace("–", "-").replace("—", "-")
        text = text.replace("…", "...")
        text = text.replace("•", "*")
        
        # Normalize Unicode to ASCII where possible
        text = unicodedata.normalize('NFKD', text)
        
        # Strip any remaining non-ASCII characters
        text = re.sub(r'[^\x00-\x7F]+', '', text)
        
        return text
    
    # Apply sanitization to the idea and analysis
    idea = sanitize_text(feasibility_data["idea"])
    ai_analysis = sanitize_text(ai_analysis)
    
    # Title
    pdf.set_font("Arial", style="B", size=16)
    pdf.cell(200, 10, "Feasibility Analysis Report", ln=True, align="C")
    pdf.ln(10)

    # Idea Title
    pdf.set_font("Arial", style="B", size=14)
    pdf.cell(0, 10, f"Idea: {idea}", ln=True)
    pdf.ln(5)

    # Feasibility Scores Section
    pdf.set_font("Arial", style="B", size=14)
    pdf.cell(0, 10, "Feasibility Scores", ln=True)
    pdf.ln(5)

    pdf.set_font("Arial", size=12)
    for key, value in feasibility_data.items():
        if key != "idea":  # Exclude idea from score section
            pdf.set_font("Arial", style="B", size=12)  # Bold Key
            pdf.cell(0, 10, f"{key.replace('_', ' ').title()}:", ln=True)
            pdf.set_font("Arial", size=12)  # Normal Value
            pdf.multi_cell(0, 10, str(value))
            pdf.ln(2)

    # AI Feasibility Report Section
    pdf.set_font("Arial", style="B", size=14)
    pdf.cell(0, 10, "Feasibility Report", ln=True)
    pdf.ln(5)

    # Process AI Analysis Text
    pdf.set_font("Arial", size=12)
    for line in ai_analysis.split("\n"):
        if line.strip():  # Only process non-empty lines
            line = sanitize_text(line)  # Extra sanitization per line
            if line.startswith("**") and line.endswith("**"):  # Detect headings
                pdf.set_font("Arial", style="B", size=14)
                pdf.cell(0, 10, line.replace("**", ""), ln=True)
                pdf.ln(3)
            elif line.startswith("* "):  # Bullet points
                pdf.set_font("Arial", size=12)
                pdf.cell(5)  # Indent
                pdf.cell(0, 10, "- " + line[2:], ln=True)  # Use hyphen instead of bullet
            elif line and line[0:1].isdigit() and len(line) > 1 and line[1:2] == ".":  # Numbered lists
                pdf.set_font("Arial", size=12)
                pdf.cell(0, 10, line, ln=True)
            else:  # Normal paragraph text
                pdf.set_font("Arial", size=12)
                pdf.multi_cell(0, 10, line)
            pdf.ln(2)

    # Save PDF
    pdf_filename = "feasibility_report.pdf"
    pdf.output(pdf_filename)
    return pdf_filename

# Consolidated API Endpoint
@app.route('/analyze-and-generate', methods=['POST'])
def analyze_and_generate():
    """Single API endpoint to analyze idea feasibility and generate PDF report."""
    data = request.json
    
    if not data or 'idea' not in data:
        return jsonify({"error": "No idea provided"}), 400
    
    idea = data['idea']
    return_json = data.get('return_json', False)
    
    try:
        # Get feasibility scores
        feasibility_data = get_feasibility_score(idea)
        
        # Generate AI analysis
        ai_analysis = analyze_with_llama(feasibility_data)
        
        # Generate PDF report
        pdf_path = generate_pdf(feasibility_data, ai_analysis)
        
        # If return_json flag is set, return JSON data instead of file
        if return_json:
            return jsonify({
                "feasibility_data": feasibility_data,
                "ai_analysis": ai_analysis,
                "pdf_path": pdf_path
            })
        
        # Otherwise return the PDF file
        return send_file(
            pdf_path, 
            as_attachment=True,
            download_name="feasibility_report.pdf",
            mimetype="application/pdf"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Keep the original endpoints for backward compatibility
@app.route('/analyze', methods=['POST'])
def analyze_idea():
    """API endpoint to analyze idea feasibility."""
    data = request.json
    
    if not data or 'idea' not in data:
        return jsonify({"error": "No idea provided"}), 400
    
    idea = data['idea']
    
    try:
        # Get feasibility scores
        feasibility_data = get_feasibility_score(idea)
        
        # Generate AI analysis
        ai_analysis = analyze_with_llama(feasibility_data)
        
        # Return the analysis results
        return jsonify({
            "feasibility_data": feasibility_data,
            "ai_analysis": ai_analysis
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/generate-report', methods=['POST'])
def generate_report():
    """API endpoint to generate PDF report."""
    data = request.json
    
    if not data or 'idea' not in data:
        return jsonify({"error": "No idea provided"}), 400
    
    idea = data['idea']
    
    try:
        # Get feasibility scores
        feasibility_data = get_feasibility_score(idea)
        
        # Generate AI analysis
        ai_analysis = analyze_with_llama(feasibility_data)
        
        # Generate PDF report
        pdf_path = generate_pdf(feasibility_data, ai_analysis)
        
        # Return path to generated PDF
        return jsonify({
            "message": "PDF report generated successfully",
            "pdf_path": pdf_path
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/download-report/<filename>', methods=['GET'])
def download_report(filename):
    """API endpoint to download generated PDF report."""
    try:
        return send_file(filename, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)