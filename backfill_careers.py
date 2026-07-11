import json
import time
import requests

SUPABASE_URL = "https://dqmbmyrpalpudpumxwbq.supabase.co"
SUPABASE_KEY = "YOUR_SUPABASE_KEY"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Known career page URLs for major companies
KNOWN_CAREERS = {
    "google": "https://careers.google.com",
    "meta": "https://www.metacareers.com",
    "microsoft": "https://careers.microsoft.com",
    "amazon": "https://www.amazon.jobs",
    "aws": "https://www.amazon.jobs",
    "apple": "https://jobs.apple.com",
    "netflix": "https://jobs.netflix.com",
    "nvidia": "https://www.nvidia.com/en-us/about-nvidia/careers/",
    "amd": "https://www.amd.com/en/corporate/careers",
    "intel": "https://jobs.intel.com",
    "infosys": "https://www.infosys.com/careers/",
    "tcs": "https://www.tcs.com/careers",
    "wipro": "https://careers.wipro.com",
    "cognizant": "https://careers.cognizant.com",
    "capgemini": "https://www.capgemini.com/careers/",
    "flipkart": "https://www.flipkartcareers.com",
    "zomato": "https://www.zomato.com/careers",
    "blinkit": "https://blinkit.com/careers",
    "nike": "https://jobs.nike.com",
    "oracle": "https://www.oracle.com/careers/",
    "dell": "https://jobs.dell.com",
    "toyota": "https://www.toyota.com/careers",
    "pepsi": "https://www.pepsicojobs.com",
    "pepsico": "https://www.pepsicojobs.com",
    "qualcomm": "https://www.qualcomm.com/company/careers",
    "razorpay": "https://razorpay.com/careers/",
    "postman": "https://www.postman.com/company/careers/",
    "replit": "https://replit.com/site/careers",
    "red hat": "https://www.redhat.com/en/jobs",
    "publicis sapient": "https://www.publicissapient.com/careers",
    "publicis groupe": "https://www.publicisgroupe.com/en/the-groupe/about-publicis-groupe/careers",
    "nothing": "https://nothing.tech/pages/careers",
    "zenken": "https://www.zenken.co.jp/en/recruit/",
    "practo": "https://www.practo.com/company/careers",
    "redfin": "https://www.redfin.com/about/careers",
    "retool": "https://retool.com/careers",
    "revolut": "https://www.revolut.com/careers/",
    "redis": "https://redis.io/careers/",
    "rappi": "https://www.rappi.com/jobs",
    "proactively": "https://proactively.ai/careers",
    "preferred networks": "https://www.preferred.jp/en/careers/",
    "prodapt": "https://www.prodapt.com/careers/",
    "poe": "https://poe.com/about",
    "power bi": "https://careers.microsoft.com",
    "qicap": "https://www.qicap.com/careers",
    "quest global": "https://www.questglobal.com/careers/",
    "roppen": "https://www.rapido.bike/careers",
    "pricewaterhousecoopers": "https://www.pwc.in/careers.html",
}

# Fetch all companies
print("Fetching companies from Supabase...")
all_companies = []
offset = 0
while True:
    url = f"{SUPABASE_URL}/rest/v1/companies_json?select=company_id,full_json&offset={offset}&limit=20"
    resp = requests.get(url, headers=headers, timeout=30)
    if resp.status_code != 200:
        print("Error:", resp.status_code)
        break
    batch = resp.json()
    if not batch:
        break
    all_companies.extend(batch)
    offset += 20

print(f"Total companies: {len(all_companies)}")

updated = 0
skipped = 0

for comp in all_companies:
    cid = comp["company_id"]
    fj = comp.get("full_json")
    if not fj or not isinstance(fj, dict):
        continue

    name = fj.get("name", "Unknown")
    dp = fj.get("digital_presence", {})
    if not isinstance(dp, dict):
        dp = {}

    # Check if already has a REAL careers page (not "Not Found")
    existing = dp.get("careers_page", "")
    if existing and existing != "Not Found" and existing != "N/A" and existing.startswith("http") and "/careers" in existing.lower():
        print(f"[{name}] Already has valid careers page, skipping.")
        skipped += 1
        continue

    # Try to match against known careers URLs
    name_lower = name.lower()
    careers_url = None

    for key, url in KNOWN_CAREERS.items():
        if key in name_lower:
            careers_url = url
            break

    # Fallback: construct from website URL
    if not careers_url:
        website = dp.get("website", "")
        if isinstance(website, str) and website.startswith("http"):
            careers_url = website.rstrip("/") + "/careers"

    if not careers_url:
        print(f"[{name}] Could not determine careers URL, skipping.")
        continue

    # Update
    dp["careers_page"] = careers_url
    fj["digital_presence"] = dp

    patch_url = f"{SUPABASE_URL}/rest/v1/companies_json?company_id=eq.{cid}"
    try:
        patch_resp = requests.patch(patch_url, headers=headers, json={"full_json": fj}, timeout=15)
        if patch_resp.status_code in [200, 204]:
            print(f"  OK [{name}] -> {careers_url}")
            updated += 1
        else:
            print(f"  FAIL [{name}] Failed: {patch_resp.status_code}")
    except Exception as e:
        print(f"  FAIL [{name}] Error: {e}")

print(f"\nDone! Updated: {updated}, Skipped: {skipped}")
