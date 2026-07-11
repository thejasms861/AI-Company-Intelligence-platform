import requests
import json

SUPABASE_URL = "https://dqmbmyrpalpudpumxwbq.supabase.co"
SUPABASE_KEY = "sb_publishable_h_-GeJyuvZjVeca34MWIyw_4iLlWxVm"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

# Fetch all entries from innovx_json
resp_i = requests.get(f"{SUPABASE_URL}/rest/v1/innovx_json", headers=headers).json()
print(f"Total rows in innovx_json: {len(resp_i)}")
for row in resp_i:
    cid = row.get("company_id")
    name = row.get("name")
    json_data = row.get("json_data", {})
    # Get first strategic pillar or project to check variation
    pillars = json_data.get("strategic_pillars", [])
    p_name = pillars[0].get("pillar_name") if pillars else "NONE"
    print(f"  ID: {cid} | Name: {name} | First Pillar: {p_name}")

# Fetch all entries from job_role_details_json
resp_h = requests.get(f"{SUPABASE_URL}/rest/v1/job_role_details_json", headers=headers).json()
print(f"\nTotal rows in job_role_details_json: {len(resp_h)}")
for row in resp_h:
    cid = row.get("company_id")
    name = row.get("company_name")
    job_json = row.get("job_role_json", {})
    roles = job_json.get("job_role_details", [])
    if not roles and "compensation_data" in job_json:
        # Maybe old format
        r_name = "OLD_FORMAT"
    else:
        r_name = roles[0].get("role_title") if roles else "NONE"
    print(f"  ID: {cid} | Name: {name} | First Role: {r_name}")
