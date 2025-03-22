import streamlit as st
import praw
import requests
import subprocess
from time import sleep
from serpapi import GoogleSearch
from bs4 import BeautifulSoup
from fpdf import FPDF  # Using original fpdf but with encoding fixes

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

# Function to get Reddit trend score
def get_reddit_trend_score(idea, subreddit="all", limit=50):
    """Fetches Reddit trend score based on idea popularity."""
    total_upvotes, num_posts = 0, 0
    try:
        for post in reddit.subreddit(subreddit).search(idea, sort="top", limit=limit):
            total_upvotes += post.score
            num_posts += 1
            sleep(1)  # Prevent hitting rate limits
    except Exception as e:
        st.error(f"Error fetching Reddit trends: {e}")
        return 20  # Default low score
    
    # More balanced calculation that's harder to max out
    if num_posts == 0:
        return 20
    avg_upvotes = total_upvotes / num_posts
    # Logarithmic scale to prevent extremely high scores
    # A post would need ~5000 avg upvotes to score 100
    return round(min(100, 20 + 20 * (avg_upvotes ** 0.5) / 15))

# Function to get competition score using SerpAPI
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
        st.error(f"Error fetching competition score: {e}")
        return 50  # Default medium competition

# Function to get investor interest
def get_investor_interest(idea):
    """Scrapes AngelList for investor interest data."""
    try:
        response = requests.get(f"https://angel.co/search?q={idea}", headers={"User-Agent": "Mozilla/5.0"})
        num_investors = len(BeautifulSoup(response.text, "lxml").find_all("div", class_="styles_startupCard__3kRzV"))
        # More balanced scoring with a higher bar for max score
        return 90 if num_investors > 15 else 75 if num_investors > 8 else 60 if num_investors > 4 else 45 if num_investors > 1 else 30
    except Exception as e:
        st.error(f"Error fetching investor interest: {e}")
        return 40  # Default moderate interest

# Function to get news mentions score
def get_news_mentions_score(idea):
    """Scrapes Google News for idea mentions."""
    try:
        response = requests.get(f"https://news.google.com/search?q={idea.replace(' ', '%20')}", headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(response.text, "lxml")
        num_articles = len(soup.find_all("article"))
        
        # More balanced scoring with higher threshold for max score
        return 90 if num_articles > 20 else 75 if num_articles > 10 else 60 if num_articles > 5 else 45 if num_articles > 2 else 30
    except Exception as e:
        st.error(f"Error fetching news mentions: {e}")
        return 40  # Default moderate news coverage

# Function to calculate feasibility score
def get_feasibility_score(idea):
    """Aggregates all scores to determine final feasibility."""
    scores = {
        "idea": idea,
        "reddit_trend_score": get_reddit_trend_score(idea),
        "competition_score": get_competition_score(idea),
        "investor_interest_score": get_investor_interest(idea),
        "news_mentions_score": get_news_mentions_score(idea),
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
    """
    try:
        result = subprocess.run(["ollama", "run", "gemma3:1b", prompt], capture_output=True, text=True, encoding="utf-8")
        return result.stdout.strip()
    except Exception as e:
        return f"Error running Ollama: {str(e)}"


def generate_pdf(feasibility_data, ai_analysis):
    """Creates a downloadable PDF report."""
    # Clean the AI analysis text to replace problematic Unicode characters
    # Replace en-dash with regular hyphen
    ai_analysis = ai_analysis.replace('\u2013', '-')
    ai_analysis = ai_analysis.replace('\u2014', '-')  # em-dash
    ai_analysis = ai_analysis.replace('\u2018', "'")  # curly single quote open
    ai_analysis = ai_analysis.replace('\u2019', "'")  # curly single quote close
    ai_analysis = ai_analysis.replace('\u201c', '"')  # curly double quote open
    ai_analysis = ai_analysis.replace('\u201d', '"')  # curly double quote close
    ai_analysis = ai_analysis.replace('\u2022', '*')  # bullet point
    
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # Title
    pdf.set_font("Arial", style="B", size=16)
    pdf.cell(200, 10, "Feasibility Analysis Report", ln=True, align="C")
    pdf.ln(10)

    # Idea Title
    pdf.set_font("Arial", style="B", size=14)
    pdf.cell(0, 10, "Idea: " + feasibility_data["idea"], ln=True)
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
            if line.startswith("**") and line.endswith("**"):  # Detect headings
                pdf.set_font("Arial", style="B", size=14)
                pdf.cell(0, 10, line.replace("**", ""), ln=True)
                pdf.ln(3)
            elif line.startswith("* "):  # Bullet points
                pdf.set_font("Arial", size=12)
                pdf.cell(5)  # Indent
                pdf.cell(0, 10, "- " + line[2:], ln=True)  # Use hyphen instead of bullet
            elif line[0].isdigit() and line[1] == ".":  # Numbered lists
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

# Streamlit UI
st.title("📊 Feasibility Analysis Tool")
idea = st.text_input("Enter your idea:", "")

if st.button("Analyze Idea"):
    if idea:
        with st.spinner("Fetching feasibility data..."):
            feasibility_data = get_feasibility_score(idea)
        st.subheader("Results")
        for key, value in feasibility_data.items():
            if key != "idea":
                st.metric(key.replace("_", " ").title(), f"{value}/100")
        with st.spinner("Generating AI feasibility analysis..."):
            ai_analysis = analyze_with_llama(feasibility_data)
        st.subheader("📢 AI Feasibility Analysis")
        st.write(ai_analysis)
        pdf_filename = generate_pdf(feasibility_data, ai_analysis)
        with open(pdf_filename, "rb") as file:
            st.download_button("📥 Download Report", file, file_name=pdf_filename)
    else:
        st.error("Please enter an idea to analyze.")