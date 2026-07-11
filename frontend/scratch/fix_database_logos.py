import requests
import os
import re
from dotenv import load_dotenv

load_dotenv('campus-compass-main/campus-compass-main/.env')
sb_url = os.environ.get('VITE_SUPABASE_URL')
sb_key = os.environ.get('VITE_SUPABASE_ANON_KEY')

headers = {
    'apikey': sb_key,
    'Authorization': f'Bearer {sb_key}',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
}

# Fetch all companies
url = f'{sb_url}/rest/v1/companies_json'
resp = requests.get(url, headers=headers)
companies = resp.json()

fixed_count = 0

for c in companies:
    json_id = c.get('json_id')
    short_json = c.get('short_json')
    full_json = c.get('full_json')
    
    if not short_json or not json_id:
        continue
        
    logo_url = short_json.get('logo_url')
    name = short_json.get('name')
    
    # Check if logo_url is not a string
    needs_update = False
    if logo_url is not None and not isinstance(logo_url, str):
        print(f"Fixing logo_url for {name}: was {logo_url} ({type(logo_url).__name__})")
        clean_name = re.sub(r'[^a-z0-9]', '', name.lower().split(' ')[0])
        short_json['logo_url'] = f'https://logo.uplead.com/{clean_name}.com'
        needs_update = True
        
    # Also check full_json logo_url
    if full_json and 'logo_url' in full_json:
        full_logo = full_json.get('logo_url')
        if full_logo is not None and not isinstance(full_logo, str):
            clean_name = re.sub(r'[^a-z0-9]', '', name.lower().split(' ')[0])
            full_json['logo_url'] = f'https://logo.uplead.com/{clean_name}.com'
            needs_update = True
            
    if needs_update:
        # Save updates back to database
        update_url = f'{url}?json_id=eq.{json_id}'
        up_resp = requests.patch(update_url, headers=headers, json={
            'short_json': short_json,
            'full_json': full_json
        })
        if up_resp.status_code in [200, 201, 204]:
            print(f"Successfully updated {name} in Supabase.")
            fixed_count += 1
        else:
            print(f"Failed to update {name}: {up_resp.status_code} - {up_resp.text}")

print(f"Completed! Fixed {fixed_count} companies.")
