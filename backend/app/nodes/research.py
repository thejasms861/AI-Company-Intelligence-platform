from app.core.state import AgentState
from app.pipeline.engine import run_parallel_research_engine
from app.core.logger import logger
from duckduckgo_search import DDGS
import asyncio

async def fetch_live_context(company_name: str) -> str:
    """Fetches real-time internet search context for the given company."""
    logger.info(f"🔍 Executing Live Web Search for: {company_name}")
    try:
        query = f"{company_name} company overview hiring recent news 2024"
        # DDGS is synchronous, so we run it in a thread pool to avoid blocking async loop
        def search():
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=5))
                return results
                
        results = await asyncio.to_thread(search)
        
        if not results:
            return "No recent web data fetched."
            
        context_str = "\n".join([f"- {r['title']}: {r['body']}" for r in results])
        return context_str
    except Exception as e:
        logger.error(f"Failed to fetch live context for {company_name}: {e}")
        return "No recent web data fetched."

async def research_node(state: AgentState) -> AgentState:
    retry_count = state.get('retry_count', 0)
    failed_params = state.get("failed_parameters", [])
    company_name = state.get("company_name", "Unknown Company")
    
    logger.info(f"[Phase 2] RESEARCH NODE: Fetching {len(failed_params)} parameters (Attempt {retry_count + 1})")
    
    if not failed_params:
        return state
        
    # Pre-fetch live data from the internet
    live_context = await fetch_live_context(company_name)
        
    # Execute the batched async producer/consumer engine with live context
    new_data = await run_parallel_research_engine(company_name, failed_params, live_context)
    
    # Merge newly fetched data with any existing valid research data in the state
    current_data = state.get("research_data", {"llm_1": {}, "llm_2": {}, "llm_3": {}})
    for llm in ["llm_1", "llm_2", "llm_3"]:
        current_data.setdefault(llm, {}).update(new_data.get(llm, {}))
        
    return {"research_data": current_data}
