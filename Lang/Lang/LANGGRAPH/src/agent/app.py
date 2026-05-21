from src.agent.graph import create_pipeline

def run_pipeline(company_name: str):
    """
    Phase 1 - User Input
    Entry point for the Company Intelligence Platform agent pipeline.
    """
    print(f"Starting pipeline for {company_name}")
    
    pipeline = create_pipeline()
    
    initial_state = {
        "company_name": company_name,
        "llm1_raw": {},
        "llm2_raw": {},
        "llm3_raw": {},
        "metadata_compliance": {},
        "consolidated_record": {},
        "failed_parameters": [],
        "retry_count": 0,
        "validation_status": "pending",
        "final_record": {}
    }
    
    # Run the graph
    result = pipeline.invoke(initial_state)
    
    # Phase 6 - Supabase Write (mocked here, should happen after pipeline completes successfully)
    if result.get("validation_status") == "pass":
        print("Pipeline succeeded. Writing to Supabase (Mocked).")
        print("Final Record:", result.get("final_record"))
    else:
        print("Pipeline flagged for review or failed.")
        
    return result

if __name__ == "__main__":
    run_pipeline("Test Company Inc.")
