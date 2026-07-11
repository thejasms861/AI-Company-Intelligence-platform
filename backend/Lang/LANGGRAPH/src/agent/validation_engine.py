import sys
import os
from typing import Dict, Any, Tuple, List

# Ensure we can import from validation_suite
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from validation_suite.validators import (
    validate_company_name,
    validate_not_null,
    validate_positive_number,
    validate_https_url,
    validate_revenue,
    validate_year
)

def validate_record_fields(record: Dict[str, Any]) -> Dict[str, str]:
    """
    Applies the validation suite to a record and returns a field-level compliance report.
    Returns Dict[str, str] where values are 'pass' or 'fail'.
    """
    compliance_report = {}
    
    # Check all fields, default to pass, then override if fail
    for field, value in record.items():
        compliance_report[field] = 'pass'
        
    # 1. Company Name validation
    if 'company_name' in record:
        is_valid, msg = validate_company_name(record['company_name'])
        if not is_valid:
            compliance_report['company_name'] = 'fail'
            
    # 2. Revenue validation
    if 'revenue' in record:
        is_valid, msg = validate_revenue(record['revenue'])
        if not is_valid:
            compliance_report['revenue'] = 'fail'
            
    # 3. Founded Year validation
    if 'founded_year' in record:
        is_valid, msg = validate_year(record['founded_year'])
        if not is_valid:
            compliance_report['founded_year'] = 'fail'
            
    # 4. Website validation
    if 'website' in record:
        is_valid, msg = validate_https_url(record['website'])
        if not is_valid:
            compliance_report['website'] = 'fail'

    # Generic check: Validate that required fields are not null
    for field, value in record.items():
        if field not in ['company_name', 'revenue', 'founded_year', 'website']:
            is_valid, msg = validate_not_null(value, field)
            if not is_valid:
                compliance_report[field] = 'fail'
                
    return compliance_report

def run_validation_suite(record: Dict[str, Any]) -> Tuple[str, List[str]]:
    """
    Runs the full validation suite against the 163 parameters of the golden record.
    Returns (status: 'pass' or 'fail', failed_parameters: List[str])
    """
    compliance_report = validate_record_fields(record)
    failed_params = [field for field, status in compliance_report.items() if status == 'fail']
    
    if failed_params:
        return "fail", failed_params
    
    return "pass", []
