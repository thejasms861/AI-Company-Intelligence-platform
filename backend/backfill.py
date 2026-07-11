import json
import asyncio
from app.nodes.intelligence import run_intelligence

async def main():
    print("Loading temp_companies.json...")
    path = "../campus-compass-main/campus-compass-main/temp_companies.json"
    with open(path, "r", encoding="utf-8") as f:
        companies = json.load(f)
        
    updated_companies = []
    print(f"Processing {len(companies)} companies with Gemini 2.5 Flash...")
    
    for i, c in enumerate(companies):
        company_name = c["full_json"].get("name", "Unknown")
        print(f"[{i+1}/{len(companies)}] Generating AI Intelligence for {company_name}...")
        
        # Call the actual intelligence node
        intel = await run_intelligence(c["full_json"], company_name)
        
        c["full_json"]["intelligence_data"] = intel
        updated_companies.append(c)
        
    out_path = "../campus-compass-main/campus-compass-main/updated_companies.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(updated_companies, f, indent=2)
        
    print(f"Successfully generated real AI data for {len(updated_companies)} companies.")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(main())
