import requests
import json

sb_url = "https://dqmbmyrpalpudpumxwbq.supabase.co"
sb_key = "sb_publishable_h_-GeJyuvZjVeca34MWIyw_4iLlWxVm"

headers = {
    "apikey": sb_key,
    "Authorization": f"Bearer {sb_key}",
    "Content-Type": "application/json"
}

print("--- innovx_json for Pepsi (850933) ---")
resp = requests.get(f"{sb_url}/rest/v1/innovx_json?company_id=eq.850933", headers=headers)
if resp.status_code == 200:
    rows = resp.json()
    if rows:
        print(json.dumps(rows[0], indent=2))
else:
    print(f"Failed: {resp.text}")

print("\n--- job_role_details_json for Pepsi (850933) ---")
resp = requests.get(f"{sb_url}/rest/v1/job_role_details_json?company_id=eq.850933", headers=headers)
if resp.status_code == 200:
    rows = resp.json()
    if rows:
        print(json.dumps(rows[0], indent=2))
else:
    print(f"Failed: {resp.text}")
