from typing import Dict, Any, List
from src.agent.validation_engine import validate_record_fields

def apply_metadata_rules(raw_output: Dict[str, Any]) -> Dict[str, Any]:
    """
    Phase 3 - Validation Suite Check (Replaces Metadata Rules)
    Applies the full validation suite to the LLM raw output independently.
    """
    # Using the validation suite directly instead of a separate metadata rule check
    return validate_record_fields(raw_output)

def score_and_merge(llm_outputs: List[Dict[str, Any]], compliance_reports: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Phase 4 - Consolidation Agent
    Scores candidates based on Data Freshness (~35%), Research Accuracy (~45%), Rule Compliance (~20%).
    Outputs one authoritative golden record.
    """
    golden_record = {}
    
    if not llm_outputs:
        return golden_record
        
    all_fields = set()
    for output in llm_outputs:
        all_fields.update(output.keys())
        
    for field in all_fields:
        candidates = []
        for i, output in enumerate(llm_outputs):
            if field in output:
                val = output[field]
                compliance = compliance_reports[i].get(field, "fail")
                
                # Mock scoring
                freshness_score = 0.85 * 0.35
                accuracy_score = 0.90 * 0.45
                compliance_score = (1.0 if compliance == "pass" else 0.0) * 0.20
                total_score = freshness_score + accuracy_score + compliance_score
                
                candidates.append({"value": val, "score": total_score, "source": f"LLM_{i+1}"})
                
        # Select highest-scoring candidate
        if candidates:
            best_candidate = max(candidates, key=lambda x: x["score"])
            golden_record[field] = best_candidate["value"]
            
    return golden_record
