from typing import TypedDict, Dict, Any, List

class AgentState(TypedDict):
    company_name: str
    research_data: Dict[str, Any]       # Raw output from 3 LLMs mapped by provider
    validation_results: Dict[str, Any]  # Output after validation layer
    golden_record: Dict[str, Any]       # Consolidated parameters
    intelligence_data: Dict[str, Any]   # Company categorization and hiring badges
    layoffs_data: Dict[str, Any]        # Historical layoff data
    roadmap_data: Dict[str, Any]        # Skill roadmap data
    failed_parameters: List[str]        # Fields requiring regeneration
    retry_count: int                    # Regeneration loops (max 3)
    innovex_data: Dict[str, Any]        # Deep-tech innovation mapping
    hiring_data: Dict[str, Any]         # Job role details and round-by-round info
