import os
import sys
import asyncio
import json
import requests
from dotenv import load_dotenv

# Ensure we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.nodes.intelligence import run_innovex_analysis, run_hiring_analysis
from app.config.settings import settings

# Load Supabase keys
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "campus-compass-main", "campus-compass-main", ".env"))
sb_url = os.environ.get("VITE_SUPABASE_URL")
sb_key = os.environ.get("VITE_SUPABASE_ANON_KEY")

headers = {
    "apikey": sb_key,
    "Authorization": f"Bearer {sb_key}",
    "Content-Type": "application/json"
}

async def migrate():
    if not sb_url or not sb_key:
        print("[ERROR] Supabase credentials not found in env!")
        return

    print("Fetching generated companies from Supabase...")
    # Fetch all short_json entries
    resp = requests.get(f"{sb_url}/rest/v1/companies_json", headers=headers)
    if resp.status_code != 200:
        print(f"Failed to fetch companies_json: {resp.status_code} {resp.text}")
        return

    companies = resp.json()
    generated_companies = []
    
    for c in companies:
        sj = c.get("short_json", {})
        cid = sj.get("company_id")
        
        # Skip seed companies (ids 1 to 22)
        if cid and int(cid) > 22:
            generated_companies.append({
                "company_id": cid,
                "name": sj.get("name", "Unknown"),
                "category": sj.get("category", "Technology"),
                "nature": "Product" if "product" in sj.get("category", "").lower() else "Service"
            })

    print(f"Found {len(generated_companies)} generated companies to migrate.")
    
    for i, company in enumerate(generated_companies):
        cid = company["company_id"]
        name = company["name"]
        cat = company["category"]
        nature = company["nature"]
        
        print(f"\n[{i+1}/{len(generated_companies)}] Researching & generating data for {name} (ID: {cid})...")
        
        # 1. Innovex Data
        print(f"  -> Generating Innovex data...")
        innovex_data = await run_innovex_analysis(name, cat, nature)
        if "innovx_master" in innovex_data:
            innovex_data["innovx_master"]["company_name"] = name
            
        # Post/Upsert to innovx_json
        # Check if already exists to decide PUT/POST or simply delete & re-insert
        requests.delete(f"{sb_url}/rest/v1/innovx_json?company_id=eq.{cid}", headers=headers)
        
        innovx_payload = {
            "company_id": cid,
            "name": name,
            "json_data": innovex_data
        }
        iresp = requests.post(f"{sb_url}/rest/v1/innovx_json", headers=headers, json=innovx_payload)
        if iresp.status_code in [200, 201]:
            print(f"  [OK] Saved Innovex data successfully.")
        else:
            print(f"  [FAIL] Failed to save Innovex data: {iresp.text}")
            
        # 2. Hiring Data
        print(f"  -> Generating Hiring data...")
        hiring_data = await run_hiring_analysis(name, cat, "Medium")
        hiring_data["company_name"] = name
        
        requests.delete(f"{sb_url}/rest/v1/job_role_details_json?company_id=eq.{cid}", headers=headers)
        
        hiring_payload = {
            "company_id": cid,
            "company_name": name,
            "job_role_json": hiring_data
        }
        hresp = requests.post(f"{sb_url}/rest/v1/job_role_details_json", headers=headers, json=hiring_payload)
        if hresp.status_code in [200, 201]:
            print(f"  [OK] Saved Hiring data successfully.")
        else:
            print(f"  [FAIL] Failed to save Hiring data: {hresp.text}")
            
        # Sleep briefly to be nice to rate limits
        await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(migrate())
