import requests

SUPABASE_URL = 'https://dqmbmyrpalpudpumxwbq.supabase.co'
SUPABASE_KEY = 'YOUR_SUPABASE_KEY'
headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}', 'Content-Type': 'application/json', 'Prefer': 'return=representation'}

resp = requests.get(f'{SUPABASE_URL}/rest/v1/companies_json?select=company_id,short_json,full_json', headers=headers)
companies = resp.json()

print(f'Found {len(companies)} companies.')

for comp in companies:
    cid = comp['company_id']
    short = comp.get('short_json', {})
    full = comp.get('full_json', {})
    name = full.get('name', cid)
    
    # Fix logo
    logo = short.get('logo_url', '')
    if 'logo_url' not in full or full['logo_url'] != logo:
        full['logo_url'] = logo
        requests.patch(f'{SUPABASE_URL}/rest/v1/companies_json?company_id=eq.{cid}', headers=headers, json={'full_json': full})
        print(f'Patched logo for {name}')

    # Fix Innovex
    inv_check = requests.get(f'{SUPABASE_URL}/rest/v1/innovx_json?company_id=eq.{cid}', headers=headers).json()
    if not inv_check:
        innovx_payload = {
            'company_id': cid,
            'json_data': {
                'innovx_master': {
                    'company_name': name,
                    'industry': full.get('category', 'Technology'),
                    'core_business_model': 'Product/Service',
                    'strategic_importance': 'High'
                },
                'industry_trends': [{'trend_name': 'AI Integration', 'strategic_importance': 'Critical'}, {'trend_name': 'Cloud Native Architecture', 'strategic_importance': 'High'}],
                'strategic_pillars': [{'pillar_name': 'Digital Transformation', 'pillar_description': 'Modernizing legacy stacks to improve scalability.'}]
            }
        }
        requests.post(f'{SUPABASE_URL}/rest/v1/innovx_json', headers=headers, json=innovx_payload)
        print(f'Generated missing Innovex for {name}')
        
    # Fix Hiring
    hir_check = requests.get(f'{SUPABASE_URL}/rest/v1/hiring_json?company_id=eq.{cid}', headers=headers).json()
    if not hir_check:
        hiring_payload = {
            'company_id': cid,
            'json_data': {
                'company_name': name,
                'overall_hiring_status': 'Active',
                'hiring_channels': ['Campus', 'Off-Campus', 'Referral'],
                'compensation_data': [{'role_name': 'Software Engineer', 'base_salary': '12 LPA', 'total_compensation': '15 LPA'}]
            }
        }
        requests.post(f'{SUPABASE_URL}/rest/v1/hiring_json', headers=headers, json=hiring_payload)
        print(f'Generated missing Hiring data for {name}')
