import re
import json
from typing import Dict, Any, List
from app.core.errors import ValidationError

def extract_json_robustly(content: str) -> Dict[str, Any]:
    """
    Safely extracts JSON from an LLM response, handling markdown blocks
    and conversational preamble.
    """
    content = content.strip()
    
    # Try finding markdown JSON block
    match = re.search(r'```(?:json)?\s*(.*?)\s*```', content, re.DOTALL | re.IGNORECASE)
    if match:
        json_str = match.group(1)
    else:
        # Fallback: find first { and last }
        start = content.find('{')
        end = content.rfind('}')
        if start != -1 and end != -1 and start < end:
            json_str = content[start:end+1]
        else:
            raise ValidationError(f"No JSON object found in LLM response. Content: {content[:100]}...")
            
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValidationError(f"Failed to decode JSON from LLM: {e}. Extracted string: {json_str[:100]}...")

def validate_response_keys(expected_keys: List[str], actual_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates that the JSON object contains all expected keys.
    Missing keys will be inserted with 'Not Found' instead of failing the whole batch,
    so partial retry logic can take over smoothly.
    """
    validated = dict(actual_data)
    for key in expected_keys:
        if key not in validated:
            validated[key] = "Not Found"
    return validated
