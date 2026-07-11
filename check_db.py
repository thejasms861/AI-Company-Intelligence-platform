import requests
SUPABASE_URL = 'https://dqmbmyrpalpudpumxwbq.supabase.co'
SUPABASE_KEY = 'YOUR_SUPABASE_KEY'
headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}', 'Content-Type': 'application/json'}

resp = requests.get(f'{SUPABASE_URL}/rest/v1/innovx_json?select=company_id', headers=headers).json()
print(f'Total Innovex records: {len(resp)}')

resp = requests.get(f'{SUPABASE_URL}/rest/v1/companies_json?select=company_id,short_json', headers=headers).json()
for c in resp:
    if c.get('short_json', {}).get('name') == 'Netflix':
        print(f'Netflix company_id in companies_json is: {c["company_id"]}')
