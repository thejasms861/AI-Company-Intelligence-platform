from src.agent.state import AgentState
from src.agent.validation_engine import run_validation_suite

def validation_node(state: AgentState) -> AgentState:
    """
    Phase 5 - Validation Suite
    Full QA check across all 163 golden record parameters.
    """
    consolidated = state.get("consolidated_record", {})
    
    # Run the validation suite against the consolidated record
    validation_status, failed_parameters = run_validation_suite(consolidated)
    
    retry_count = state.get("retry_count", 0)
    if validation_status == "fail":
        retry_count += 1
        
    return {
        **state,
        "validation_status": validation_status,
        "failed_parameters": failed_parameters,
        "retry_count": retry_count,
        "final_record": consolidated if validation_status == "pass" else {}
    }
