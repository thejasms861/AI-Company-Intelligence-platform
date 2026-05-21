from app.core.state import AgentState
from app.pipeline.engine import run_parallel_research_engine
from app.core.logger import logger

async def research_node(state: AgentState) -> AgentState:
    retry_count = state.get('retry_count', 0)
    failed_params = state.get("failed_parameters", [])
    
    logger.info(f"[Phase 2] RESEARCH NODE: Fetching {len(failed_params)} parameters (Attempt {retry_count + 1})")
    
    if not failed_params:
        return state
        
    # Execute the batched async producer/consumer engine
    new_data = await run_parallel_research_engine(state["company_name"], failed_params)
    
    # Merge newly fetched data with any existing valid research data in the state
    current_data = state.get("research_data", {"llm_1": {}, "llm_2": {}, "llm_3": {}})
    for llm in ["llm_1", "llm_2", "llm_3"]:
        current_data.setdefault(llm, {}).update(new_data.get(llm, {}))
        
    return {"research_data": current_data}
