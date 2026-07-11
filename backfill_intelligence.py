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

GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY"

def generate_intelligence(name, rr):
    prompt = f"""
    You are a Senior AI Product Architect and Data Intelligence Specialist.
    Based on the following Golden Record data for {name}, analyze the company's campus hiring behavior and placement profile.

    Company Data:
    {json.dumps(rr, indent=2, default=str)}

    Perform two tasks:
    1. Categorize the company into exactly one of these tiers based on typical campus hiring volume, selectivity, and compensation:
       - Mass Recruiter
       - Mid-Tier Recruiter
       - Premium Niche
       - Elite Dream Company
       Provide a short 'reasoning' for why you chose this tier.
    2. Estimate the expected hiring volume FROM A SINGLE TYPICAL COLLEGE CAMPUS, broken down by college tier (Tier 1 like IITs/NITs/BITS, Tier 2 like top state colleges, Tier 3 like local engineering colleges). Use rough ranges like "10-20 students", "1-3 students", or "Rarely hires". Also assign relevant badges (e.g., "High Volume Campus Hiring", "Highly Selective", "Top Tier Pay", "Stable Backup").

    Output MUST be valid JSON in this exact structure, with no markdown formatting or extra text:
    {{
        "company_tier": "Elite Dream Company",
        "reasoning": "...",
        "campus_hiring_volumes": {{
            "tier_1": "...",
            "tier_2": "...",
            "tier_3": "..."
        }},
        "badges": ["badge1", "badge2"]
    }}
    """
    
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2
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
    intel = fj.get("intelligence_data", {})
    
    # Check if intelligence failed
    if intel.get("company_tier") == "Unknown" or intel.get("reasoning") == "Failed to analyze data.":
        print(f"[{name}] Intelligence Data failed previously. Regenerating...")
        try:
            rr = fj.get("raw_research", {})
            new_intel = generate_intelligence(name, rr)
            print(f"[{name}] Successfully generated new intelligence!")
            
            # Patch it
            fj["intelligence_data"] = new_intel
            patch_url = f"{SUPABASE_URL}/rest/v1/companies_json?company_id=eq.{cid}"
            patch_resp = requests.patch(patch_url, headers=headers, json={"full_json": fj})
            
            if patch_resp.status_code in [200, 204]:
                print(f"[{name}] Successfully patched DB!")
            else:
                print(f"[{name}] Failed to patch DB: {patch_resp.text}")
                
        except Exception as e:
            print(f"[{name}] Error regenerating: {e}")
        
        time.sleep(1) # Groq rate limit safety

print("Backfill complete.")
