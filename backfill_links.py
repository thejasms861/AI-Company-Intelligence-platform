import os
import json
import time
import requests
from duckduckgo_search import DDGS

SUPABASE_URL = "https://dqmbmyrpalpudpumxwbq.supabase.co"
SUPABASE_KEY = "YOUR_SUPABASE_KEY"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

print("Fetching companies from Supabase...")
resp = requests.get(f"{SUPABASE_URL}/rest/v1/companies_json?select=company_id,short_json,full_json", headers=headers)
if resp.status_code != 200:
    print("Error fetching:", resp.text)
    exit(1)

companies = resp.json()
ddgs = DDGS()

for comp in companies:
    cid = comp["company_id"]
    name = comp.get("full_json", {}).get("name") or comp.get("short_json", {}).get("name") or "Unknown"
    fj = comp.get("full_json", {})
    if not fj: continue
    
    dp = fj.get("digital_presence", {})
    rr = fj.get("raw_research", {})
    
    website = dp.get("website") or rr.get("Website URL")
    linkedin = dp.get("linkedin") or rr.get("LinkedIn Profile URL")
    
    if website and linkedin and website != 'Not Found' and website != 'None' and website is not None:
        print(f"[{name}] Already has links, skipping.")
        continue
        
    print(f"[{name}] Missing links! Searching using DDG...")
    
    new_dp = {
        "website": "Not Found",
        "linkedin": "Not Found",
        "twitter": "Not Found",
        "facebook": "Not Found",
        "instagram": "Not Found"
    }
    
    # Search Website
    try:
        res = ddgs.text(f"{name} official website company", max_results=3)
        for r in res:
            if 'linkedin.com' not in r['href'] and 'facebook.com' not in r['href'] and 'twitter.com' not in r['href']:
                new_dp["website"] = r['href']
                break
    except Exception as e:
        print(" Error website:", e)
        
    time.sleep(1)
        
    # Search LinkedIn
    try:
        res = ddgs.text(f"{name} official company linkedin", max_results=2)
        for r in res:
            if 'linkedin.com/company' in r['href']:
                new_dp["linkedin"] = r['href']
                break
    except Exception as e:
        pass
        
    time.sleep(1)
        
    # Search Twitter
    try:
        res = ddgs.text(f"{name} official twitter account", max_results=2)
        for r in res:
            if 'twitter.com' in r['href'] or 'x.com' in r['href']:
                new_dp["twitter"] = r['href']
                break
    except Exception as e:
        pass
        
    time.sleep(1)
        
    fj["digital_presence"] = new_dp
    
    # Update Supabase
    patch_url = f"{SUPABASE_URL}/rest/v1/companies_json?company_id=eq.{cid}"
    patch_resp = requests.patch(patch_url, headers=headers, json={"full_json": fj})
    if patch_resp.status_code in [200, 204]:
        print(f"[{name}] Successfully updated in DB!")
    else:
        print(f"[{name}] Failed to update:", patch_resp.text)

print("Backfill complete.")
