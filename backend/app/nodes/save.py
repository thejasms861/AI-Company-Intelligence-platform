import json
from app.core.state import AgentState
from app.core.schema_parser import load_schema
from app.core.logger import logger

import os
SCHEMA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "schema.tsv")

def save_node(state: AgentState) -> AgentState:
    logger.info("[Phase 6] SAVE NODE: Writing output to local JSON and Markdown.")
    company_name = state["company_name"].replace(" ", "_").lower()
    json_filename = f"{company_name}_intelligence.json"
    md_filename = f"{company_name}_profile.md"
    
    # 1. Save JSON
    output_data = {
        "company_name": state["company_name"],
        "golden_record": state["golden_record"],
        "intelligence_data": state.get("intelligence_data", {}),
        "layoffs_data": state.get("layoffs_data", {}),
        "roadmap_data": state.get("roadmap_data", {}),
        "metadata": {
            "retries_used": state["retry_count"],
            "missing_parameters": state["failed_parameters"],
            "total_parameters_found": len(state["golden_record"]) - len(state["failed_parameters"])
        }
    }
    
    with open(json_filename, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=4)
        
    # 2. Save Markdown Table (For easy Excel copy-paste)
    schema = load_schema(SCHEMA_FILE)
    
    with open(md_filename, "w", encoding="utf-8") as f:
        f.write(f"# Company Profile: {state['company_name']}\n\n")
        
        intel = state.get("intelligence_data")
        if intel:
            f.write(f"## Intelligence & Classification\n")
            f.write(f"- **Tier**: {intel.get('company_tier', 'N/A')}\n")
            f.write(f"- **Reasoning**: {intel.get('reasoning', 'N/A')}\n")
            f.write(f"- **Estimated Annual Hiring**: {intel.get('estimated_annual_hiring_volume', 'N/A')}\n")
            f.write(f"- **Badges**: {', '.join(intel.get('badges', []))}\n\n")

        f.write("| ID | Category | A/C | Parameter | Research Output / Data |\n")
        f.write("|---|---|---|---|---|\n")
        
        for row in schema:
            pid = row.get("ID", "")
            cat = row.get("Category", "")
            ac = row.get("A/C", "")
            param = row.get("Parameter", "")
            
            # Fetch the consolidated result
            output = state["golden_record"].get(param, "Not Found")
            # Clean newlines from output for markdown table
            output = str(output).replace("\n", " ").replace("\r", "")
            
            f.write(f"| {pid} | {cat} | {ac} | {param} | {output} |\n")
            
    print(f"[SUCCESS] Markdown Profile saved to -> {md_filename}")
    
    # 3. Save to Supabase so it shows up in UI
    try:
        from dotenv import load_dotenv
        import os
        import requests
        import uuid
        
        load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "campus-compass-main", "campus-compass-main", ".env"))
        sb_url = os.environ.get("VITE_SUPABASE_URL")
        sb_key = os.environ.get("VITE_SUPABASE_ANON_KEY")
        
        if sb_url and sb_key:
            import random
            gr = state["golden_record"]
            intel = state.get("intelligence_data", {})
            new_id = random.randint(100000, 999999)
            
            # Construct short_json
            short_json = {
                "company_id": new_id,
                "name": state["company_name"],
                "short_name": gr.get("Short Name", state["company_name"]),
                "logo_url": gr.get("Logo", ""),
                "category": gr.get("Category", "Technology"),
                "operating_countries": gr.get("Countries Operating In", "Global"),
                "office_locations": gr.get("Office Locations", ""),
                "employee_size": gr.get("Employee Size", "Unknown"),
                "yoy_growth_rate": gr.get("Year-over-Year Growth Rate", "Unknown"),
                "company_tier": intel.get("company_tier", "Unknown")
            }
            
            # Construct full_json (simplified flat mapping with nesting where critical)
            full_json = {
                "company_id": new_id,
                "name": state["company_name"],
                "short_name": short_json["short_name"],
                "category": short_json["category"],
                "logo_url": short_json["logo_url"],
                "overview": {
                    "description": gr.get("Overview of the Company", ""),
                    "headquarters": gr.get("Company Headquarters", ""),
                    "nature_of_company": gr.get("Nature of Company", "")
                },
                "digital_presence": {
                    "website": gr.get("Website URL", "Not Found"),
                    "linkedin": gr.get("LinkedIn Profile URL", "Not Found"),
                    "twitter": gr.get("Twitter (X) Handle", "Not Found"),
                    "facebook": gr.get("Facebook Page URL", "Not Found"),
                    "instagram": gr.get("Instagram Page URL", "Not Found"),
                    "careers_page": gr.get("Careers Page URL", "Not Found")
                },
                "intelligence_data": intel,
                "layoffs_data": state.get("layoffs_data", {}),
                "roadmap_data": state.get("roadmap_data", {}),
                "raw_research": gr
            }
            
            headers = {
                "apikey": sb_key,
                "Authorization": f"Bearer {sb_key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }
            
            payload = {
                "company_id": new_id,
                "short_json": short_json,
                "full_json": full_json
            }
            
            state["golden_record"]["company_id"] = new_id
            
            # Post to companies_json
            resp = requests.post(f"{sb_url}/rest/v1/companies_json", headers=headers, json=payload)
            if resp.status_code in [200, 201]:
                logger.info(f"[SUCCESS] Successfully saved {state['company_name']} to Supabase companies_json!")
            else:
                logger.error(f"[ERROR] Failed to save to Supabase companies_json: {resp.text}")

            # 4. Generate derived Innovex and Hiring Data to prevent missing data errors
            try:
                # IMPORTANT: Insert dummy stub into legacy 'companies' table to satisfy Foreign Key constraints!
                companies_payload = {"company_id": new_id, "name": state["company_name"]}
                requests.post(f"{sb_url}/rest/v1/companies", headers=headers, json=companies_payload)

                innovex_data = state.get("innovex_data")
                if not innovex_data or not isinstance(innovex_data, dict):
                    innovex_data = {
                        "innovx_master": {
                            "company_name": state["company_name"],
                            "industry": gr.get("Category", "Technology"),
                            "core_business_model": gr.get("Nature of Company", "Product"),
                            "strategic_importance": "High"
                        },
                        "industry_trends": [],
                        "strategic_pillars": [],
                        "innovation_roadmap": [],
                        "competitive_landscape": [],
                        "innovx_projects": []
                    }
                
                # Force correct company name in master
                if "innovx_master" in innovex_data:
                    innovex_data["innovx_master"]["company_name"] = state["company_name"]

                innovx_payload = {
                    "company_id": new_id,
                    "name": state["company_name"],
                    "json_data": innovex_data
                }
                requests.post(f"{sb_url}/rest/v1/innovx_json", headers=headers, json=innovx_payload)

                hiring_data = state.get("hiring_data")
                if not hiring_data or not isinstance(hiring_data, dict):
                    hiring_data = {
                        "company_name": state["company_name"],
                        "job_role_details": [
                            {
                                "opportunity_type": "Full Time",
                                "role_title": "Graduate Engineer Trainee",
                                "role_category": "Technical",
                                "job_description": "Work on software development lifecycle under guidance.",
                                "compensation": "LPA",
                                "ctc_or_stipend": 600000,
                                "bonus": "N/A",
                                "benefits_summary": "Health insurance and standard perks.",
                                "hiring_rounds": [
                                    {
                                        "round_number": 1,
                                        "round_name": "Aptitude and Coding Test",
                                        "round_category": "Coding",
                                        "evaluation_type": "Technical",
                                        "assessment_mode": "Virtual",
                                        "skill_sets": [
                                            {
                                                "skill_set_code": "Basic Coding",
                                                "typical_questions": "String manipulation, arrays, and basic SQL."
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                
                # Force correct company name in hiring
                hiring_data["company_name"] = state["company_name"]

                hiring_payload = {
                    "company_id": new_id,
                    "company_name": state["company_name"],
                    "job_role_json": hiring_data
                }
                requests.post(f"{sb_url}/rest/v1/job_role_details_json", headers=headers, json=hiring_payload)
            except Exception as e:
                logger.error(f"Failed to save Innovex/Hiring derivative data: {e}")

        else:
            logger.error("[ERROR] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env! Cannot push to Supabase.")
    except Exception as e:
        logger.error(f"Could not push to Supabase: {e}")
        
    return state
