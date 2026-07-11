from typing import Dict, Any
from app.core.state import AgentState
from app.core.schema_parser import get_validation_rules
from app.config.settings import settings
from app.core.logger import logger

def validation_node(state: AgentState) -> AgentState:
    logger.info("[Phase 3] VALIDATION SUITE: Validating raw data across all 3 LLMs")
    research_data = state["research_data"]
    validation_results = state.get("validation_results", {})
    rules = get_validation_rules(settings.SCHEMA_FILE)
    
    for param, rule in rules.items():
        # If it already passed in a previous iteration, skip it
        if validation_results.get(param, {}).get("status") == "PASS":
            continue
            
        param_validation = {"llm_1": None, "llm_2": None, "llm_3": None, "status": "FAIL"}
        valid_candidates = 0
        
        for llm_key in ["llm_1", "llm_2", "llm_3"]:
            val = research_data.get(llm_key, {}).get(param)
            is_valid = True
            
            if val is None or val == "null" or str(val).strip().lower() == "not found":
                is_valid = False
            else:
                ac_type = rule.get("type", "Atomic")
                if ac_type == "Atomic":
                    # Must be a single value (no semicolons unless it's just punctuation)
                    # We accept it as long as it's a non-null string
                    if not isinstance(val, str) or len(str(val).strip()) < 1:
                        is_valid = False
                elif ac_type == "Composite":
                    val_str = str(val)
                    items = [i.strip() for i in val_str.split(";") if i.strip()]
                    if len(items) < rule.get("min", 1) or len(items) > rule.get("max", 999):
                        is_valid = False
                        
            param_validation[llm_key] = {"value": val, "is_valid": is_valid}
            if is_valid:
                valid_candidates += 1
                
        if valid_candidates > 0:
            param_validation["status"] = "PASS"
            
        validation_results[param] = param_validation
        
    return {"validation_results": validation_results}
