import csv
from typing import Dict, Any, List

def load_schema(filepath: str) -> List[Dict[str, Any]]:
    """Loads the schema from a TSV file."""
    schema = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f, delimiter='\t')
        for row in reader:
            schema.append(row)
    return schema

def get_validation_rules(filepath: str) -> Dict[str, Any]:
    """
    Parses the TSV and returns a dictionary of validation rules.
    Key: Parameter name
    Value: Dict with 'type' (Atomic/Composite), 'min', 'max'
    """
    schema = load_schema(filepath)
    rules = {}
    
    for row in schema:
        param = row['Parameter'].strip()
        ac_type = row['A/C'].strip()
        
        min_val_str = row['Composite elements - Minimum'].strip()
        max_val_str = row['Composite elements - Maximum'].strip()
        
        min_val = int(min_val_str) if min_val_str and min_val_str.isdigit() else 1
        max_val = int(max_val_str) if max_val_str and max_val_str.isdigit() else 999
        
        rules[param] = {
            "type": ac_type,
            "min": min_val,
            "max": max_val,
            "original_row": row
        }
    return rules

def get_all_parameters(filepath: str) -> List[str]:
    """Returns a list of all parameters needed for research."""
    rules = get_validation_rules(filepath)
    return list(rules.keys())
