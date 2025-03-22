from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
import requests
import json

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Idea Refiner API is running"}

@app.get("/refine/")
def refine_idea(idea: str = Query(..., title="Idea to refine")):
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "idea-refiner",
            "prompt": f"Refine this idea: {idea}"
        }
    )

    # Handle streaming or multiple JSON lines
    try:
        refined_text = ""
        for line in response.text.strip().splitlines():
            if line.strip():
                data = json.loads(line)
                refined_text += data.get("response", "")

        return JSONResponse(content={"refined_idea": refined_text.strip()})
    
    except json.JSONDecodeError:
        return JSONResponse(
            content={"error": "Invalid response format from model API."},
            status_code=500
        )
