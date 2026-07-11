from app.core.state import AgentState
from app.core.logger import logger
from app.config.settings import settings

def regeneration_router(state: AgentState) -> str:
    """
    Phase 5: Regeneration Routing (Conditional Edge)
    """
    failed = state.get("failed_parameters", [])
    retry_count = state.get("retry_count", 0)
    
    logger.info(f"[Phase 5] ROUTER CHECK: {len(failed)} failed parameters. Retry count is {retry_count}/{settings.MAX_RETRIES}.")
    
    if len(failed) > 0 and retry_count < settings.MAX_RETRIES:
        logger.info(">> Action: Routing to REGENERATE (incrementing retry).")
        return "regenerate"
    elif len(failed) > 0:
        logger.info(">> Action: Max retries reached. Routing to SAVE.")
        return "save"
    else:
        logger.info(">> Action: All parameters PASS. Routing to SAVE.")
        return "save"

def increment_retry_node(state: AgentState) -> AgentState:
    """Helper node to increment retry counter before looping back."""
    return {"retry_count": state.get("retry_count", 0) + 1}
