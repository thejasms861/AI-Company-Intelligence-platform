from typing import Dict, Any, List
from app.core.state import AgentState
from app.core.logger import logger

def consolidation_node(state: AgentState) -> AgentState:
    logger.info("[Phase 4] CONSOLIDATION AGENT: Unifying Golden Record")
    val_results = state["validation_results"]
    golden_record = state.get("golden_record", {})
    failed_params = []
    
    for param, data in val_results.items():
        if data["status"] == "PASS":
            valid_values = [data[llm]["value"] for llm in ["llm_1", "llm_2", "llm_3"] if data[llm]["is_valid"]]
            # For this pipeline, we simply pick the first valid one. 
            # In an advanced version, you can pass 'valid_values' to an LLM to merge them.
            golden_record[param] = valid_values[0] if valid_values else "Not Found"
        else:
            failed_params.append(param)
            
    return {
        "golden_record": golden_record,
        "failed_parameters": failed_params
    }
