import os
import json
import time
import requests
import re

SUPABASE_URL = "https://dqmbmyrpalpudpumxwbq.supabase.co"
SUPABASE_KEY = "YOUR_SUPABASE_KEY"
GROQ_API_KEY = "YOUR_GROQ_API_KEY"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

from duckduckgo_search import DDGS

def generate_roadmap_data(name):
    realtime_context = ""
    try:
        with DDGS() as ddgs:
            results = ddgs.text(f"{name} interview experience difficulty software engineer preparation", max_results=3)
            realtime_context = "\n".join([f"- {res.get('title')}: {res.get('body')}" for res in results])
    except Exception as e:
        print(f"DDGS error: {e}")

    prompt = f"""
    You are an expert technical recruiter and interview coach. Provide a "Skills & Effort Required Roadmap" for a candidate preparing to interview at {name}.
    
    Here is real-time internet context about their interview difficulty and preparation:
    {realtime_context}
    
    1. Generate skill ratings out of 10 for: DSA, Aptitude, Problem Solving, Communication, Projects, Core Subjects, Coding, System Design.
    2. Generate: Overall Effort Rating (out of 10), Company Difficulty Rating (e.g. "Easy", "Medium", "Hard", "Extreme"), Company Type ("Product-based" or "Service-based"), Preparation Focus Areas (list of 3-4 strings), Estimated Preparation Time (e.g. "3-6 months").
    
    Product-based companies should generally have higher DSA and problem-solving ratings. Service-based companies should generally have higher aptitude and communication ratings.
    
    Output MUST be valid JSON in this exact structure:
    {{
        "skills": {{
            "dsa": 9,
            "aptitude": 4,
            "problem_solving": 9,
            "communication": 6,
            "projects": 8,
            "core_subjects": 7,
            "coding": 9,
            "system_design": 8
        }},
        "overall_effort": 9,
        "difficulty": "Hard",
        "company_type": "Product-based",
        "focus_areas": ["Dynamic Programming", "System Design", "Behavioral"],
        "estimated_prep_time": "3-6 months"
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
        match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
        if match:
            content = match.group(1)
        else:
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                content = match.group(0)
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
        
    print(f"[{name}] Fetching roadmap data...")
    try:
        roadmap_data = generate_roadmap_data(name)
        print(f"  -> Generated roadmap data.")
        
        fj["roadmap_data"] = roadmap_data
        patch_url = f"{SUPABASE_URL}/rest/v1/companies_json?company_id=eq.{cid}"
        patch_resp = requests.patch(patch_url, headers=headers, json={"full_json": fj})
        
        if patch_resp.status_code not in [200, 204]:
            print(f"  [ERROR] Failed to patch DB: {patch_resp.text}")
            
    except Exception as e:
        print(f"  [ERROR] Regenerating: {e}")
    
    time.sleep(2)

print("Roadmap Backfill complete.")
