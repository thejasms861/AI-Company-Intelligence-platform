from typing import TypedDict, List, Dict, Any

class AgentState(TypedDict):
    company_name: str
    llm1_raw: Dict[str, Any]
    llm2_raw: Dict[str, Any]
    llm3_raw: Dict[str, Any]
    metadata_compliance: Dict[str, Any]
    consolidated_record: Dict[str, Any]
    failed_parameters: List[str]
    retry_count: int
    validation_status: str
    final_record: Dict[str, Any]
