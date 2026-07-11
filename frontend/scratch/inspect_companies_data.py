import requests
import os
from dotenv import load_dotenv

load_dotenv('campus-compass-main/campus-compass-main/.env')
sb_url = os.environ.get('VITE_SUPABASE_URL')
sb_key = os.environ.get('VITE_SUPABASE_ANON_KEY')

headers = {
    'apikey': sb_key,
    'Authorization': f'Bearer {sb_key}'
}

resp = requests.get(f'{sb_url}/rest/v1/companies_json', headers=headers)
companies = resp.json()

for idx, c in enumerate(companies):
    sj = c.get('short_json')
    if sj and sj.get('company_id') == 616178:
        print(sj)
