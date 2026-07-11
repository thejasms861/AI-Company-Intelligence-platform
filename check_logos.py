import requests
SUPABASE_URL = 'https://dqmbmyrpalpudpumxwbq.supabase.co'
SUPABASE_KEY = 'YOUR_SUPABASE_KEY'
headers = {'apikey': SUPABASE_KEY, 'Authorization': f'Bearer {SUPABASE_KEY}', 'Content-Type': 'application/json'}

resp = requests.get(f'{SUPABASE_URL}/rest/v1/companies_json?select=short_json', headers=headers).json()
for c in resp:
    sj = c.get('short_json', {})
    name = sj.get('name')
    if name in ['Netflix', 'Pepsi']:
        print(f'{name}: {sj.get("logo_url")}')
