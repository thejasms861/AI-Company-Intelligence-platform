from typing import TypedDict, Dict, Any, List

class AgentState(TypedDict):
    company_name: str
    research_data: Dict[str, Any]       # Raw output from 3 LLMs mapped by provider
    validation_results: Dict[str, Any]  # Output after validation layer
    golden_record: Dict[str, Any]       # Consolidated parameters
    failed_parameters: List[str]        # Fields requiring regeneration
    retry_count: int                    # Regeneration loops (max 3)
