from src.agent.state import AgentState
from src.agent.consolidation_rules import apply_metadata_rules, score_and_merge

def consolidation_node(state: AgentState) -> AgentState:
    """
    Phase 3 & 4 - Metadata Rule Check and Consolidation Agent
    Scores and merges the raw fields from the 3 LLMs into a single golden record.
    """
    llm1_raw = state.get("llm1_raw", {})
    llm2_raw = state.get("llm2_raw", {})
    llm3_raw = state.get("llm3_raw", {})
    
    # Phase 3
    comp1 = apply_metadata_rules(llm1_raw)
    comp2 = apply_metadata_rules(llm2_raw)
    comp3 = apply_metadata_rules(llm3_raw)
    
    metadata_compliance = {
        "llm1": comp1,
        "llm2": comp2,
        "llm3": comp3
    }
    
    # Phase 4
    consolidated_record = score_and_merge(
        [llm1_raw, llm2_raw, llm3_raw],
        [comp1, comp2, comp3]
    )
    
    return {
        **state,
        "metadata_compliance": metadata_compliance,
        "consolidated_record": consolidated_record
    }
