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
            
    print(f"[SUCCESS] Golden Record saved to -> {json_filename}")
    print(f"[SUCCESS] Markdown Profile saved to -> {md_filename}")
    
    return state
