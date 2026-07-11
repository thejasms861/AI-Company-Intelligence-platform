import requests
import json

SUPABASE_URL = "https://dqmbmyrpalpudpumxwbq.supabase.co"
SUPABASE_KEY = "sb_publishable_h_-GeJyuvZjVeca34MWIyw_4iLlWxVm"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

# Fetch Pepsi (850933) and Nike (183951)
pepsi_i = requests.get(f"{SUPABASE_URL}/rest/v1/innovx_json?company_id=eq.850933", headers=headers).json()
nike_i = requests.get(f"{SUPABASE_URL}/rest/v1/innovx_json?company_id=eq.183951", headers=headers).json()

print("PEPSI INNOVX:")
print(json.dumps(pepsi_i[0] if pepsi_i else {}, indent=2))

print("\nNIKE INNOVX:")
print(json.dumps(nike_i[0] if nike_i else {}, indent=2))
