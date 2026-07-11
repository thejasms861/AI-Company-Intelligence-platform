import os
import json
import time
import requests
import re

SUPABASE_URL = "https://dqmbmyrpalpudpumxwbq.supabase.co"
SUPABASE_KEY = "YOUR_SUPABASE_KEY"
GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

GROQ_API_KEY = "YOUR_GROQ_API_KEY"

from duckduckgo_search import DDGS

def get_realtime_context(name):
    try:
        with DDGS() as ddgs:
            results = ddgs.text(f"{name} company layoffs 2023 2024 2025 2026", max_results=5)
            context = "\n".join([f"- {res.get('title')}: {res.get('body')}" for res in results])
            return context
    except Exception as e:
        return ""

def generate_layoffs_data(name):
    realtime_context = get_realtime_context(name)
    
    prompt = f"""
    You are an expert tech industry analyst. Provide the historical layoff data for the company "{name}" ONLY for the last 5 years (2021 to 2026).
    
    Here is real-time search data from the internet about their recent layoffs (use this to include 2024, 2025, and 2026 data if it exists):
    {realtime_context}
    
    If the company has never had significant public layoffs in the last 5 years, return an empty array for layoff_events and set has_layoffs to false.
    If they have, list each major event with the year, the approximate number of employees laid off (as an integer, not a string), and the roles affected.
    
    Output MUST be valid JSON in this exact structure:
    {{
        "has_layoffs": true,
        "layoff_events": [
            {{ "year": 2022, "number_laid_off": 150, "roles_affected": "Engineering, Recruiting" }},
            {{ "year": 2024, "number_laid_off": 800, "roles_affected": "Sales, Operations" }}
        ]
    }}
    """
    
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.1
        }
    )
    
    if response.status_code == 200:
        content = response.json()["choices"][0]["message"]["content"]
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            content = json_match.group(0)
        return json.loads(content.strip())
    else:
        raise Exception(f"Groq API Error: {response.text}")

print("Fetching companies from Supabase...")
resp = requests.get(f"{SUPABASE_URL}/rest/v1/companies_json?select=company_id,full_json", headers=headers)
companies = resp.json()

for comp in companies:
    cid = comp["company_id"]
    fj = comp.get("full_json", {})
    if not fj: continue
    
    name = fj.get("name", "Unknown")
        
    print(f"[{name}] Fetching layoff data...")
    try:
        layoffs_data = generate_layoffs_data(name)
        print(f"  -> Found layoffs? {layoffs_data.get('has_layoffs')}")
        
        fj["layoffs_data"] = layoffs_data
        patch_url = f"{SUPABASE_URL}/rest/v1/companies_json?company_id=eq.{cid}"
        patch_resp = requests.patch(patch_url, headers=headers, json={"full_json": fj})
        
        if patch_resp.status_code in [200, 204]:
            pass
        else:
            print(f"  [ERROR] Failed to patch DB: {patch_resp.text}")
            
    except Exception as e:
        print(f"  [ERROR] Regenerating: {e}")
    
    time.sleep(5) # Strict 5 second delay to avoid Gemini free tier rate limit

print("Layoffs Backfill complete.")
