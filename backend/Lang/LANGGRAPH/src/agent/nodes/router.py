from src.agent.state import AgentState

def route_validation(state: AgentState) -> str:
    """
    Phase 7 - Regeneration Loop Routing
    Decides whether to finish, retry failed parameters, or flag for manual review.
    """
    status = state.get("validation_status", "fail")
    retry_count = state.get("retry_count", 0)
    max_retries = 3
    
    if status == "pass":
        return "pass"
    elif status == "fail" and retry_count < max_retries:
        return "regenerate"
    else:
        # If we failed and reached max retries, we flag for review (ends pipeline)
        return "review"
