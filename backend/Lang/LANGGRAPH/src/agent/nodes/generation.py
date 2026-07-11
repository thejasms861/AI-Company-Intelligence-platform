from src.agent.state import AgentState
from src.agent.models.search_context import get_search_context
from src.agent.models.gemini import research_with_gemini
from src.agent.models.groq import research_with_groq
from src.agent.models.openrouter import research_with_openrouter
from src.agent.config import ALL_PARAMETERS
import asyncio

def research_agent_node(state: AgentState) -> AgentState:
    """
    Phase 2 - Research Agent (3 LLMs in Parallel)
    Each LLM independently researches all 163 parameters simultaneously.
    If in regeneration loop, only researches failed parameters.
    """
    company_name = state.get("company_name", "")
    failed_params = state.get("failed_parameters", [])
    
    # If no failed params, it's a fresh run (all 163 fields). 
    fields_to_research = failed_params if failed_params else ALL_PARAMETERS
    
    # Step 1: Fetch common search context to ground the LLMs
    search_context = get_search_context(company_name, fields_to_research)
    
    # Step 2: In a real implementation using async frameworks:
    # llm1_output, llm2_output, llm3_output = await asyncio.gather(
    #     research_with_gemini_async(company_name, fields_to_research, search_context),
    #     research_with_groq_async(company_name, fields_to_research, search_context),
    #     research_with_openrouter_async(company_name, fields_to_research, search_context)
    # )
    
    # For the structural implementation, we'll execute them synchronously
    llm1_output = research_with_gemini(company_name, fields_to_research, search_context)
    llm2_output = research_with_groq(company_name, fields_to_research, search_context)
    llm3_output = research_with_openrouter(company_name, fields_to_research, search_context)
            
    # Step 3: If this is a regeneration, merge new answers with existing raw data.
    if failed_params:
        llm1_raw = state.get("llm1_raw", {})
        llm2_raw = state.get("llm2_raw", {})
        llm3_raw = state.get("llm3_raw", {})
        llm1_output = {**llm1_raw, **llm1_output}
        llm2_output = {**llm2_raw, **llm2_output}
        llm3_output = {**llm3_raw, **llm3_output}
        
    return {
        **state,
        "llm1_raw": llm1_output,
        "llm2_raw": llm2_output,
        "llm3_raw": llm3_output,
    }
