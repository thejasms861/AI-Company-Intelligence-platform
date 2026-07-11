import json
import re

with open('supabase_dump_all.json', encoding='utf-8-sig') as f:
    data = json.load(f)

def clean_link(url, label):
    if not url or url == 'Not Found' or url == 'N/A' or url == '': return None
    rawUrl = url[0] if isinstance(url, list) else str(url)
    rawUrl = re.sub(r'[\n\r]', '', rawUrl.strip())
    
    mdMatch = re.search(r'\]\((https?:\/\/[^\)]+)\)', rawUrl)
    if mdMatch: rawUrl = mdMatch.group(1)
    
    rawUrl = re.sub(r'[.,;]$', '', rawUrl)
    if not rawUrl or rawUrl == 'Not Found' or rawUrl.lower() == 'n/a': return None
    
    href = rawUrl
    if not href.startswith('http'):
        if label == 'Twitter':
            href = f'https://twitter.com/{href.replace("@", "")}'
        else:
            href = f'https://{href}'
    return href

print(f'Checking {len(data)} companies...')
for row in data:
    fj = row.get('full_json', {})
    if not fj: continue
    name = fj.get('name', 'Unknown')
    rr = fj.get('raw_research', {})
    
    links = {
        'Website': rr.get('Website URL'),
        'LinkedIn': rr.get('LinkedIn Profile URL'),
        'Twitter': rr.get('Twitter (X) Handle'),
        'Facebook': rr.get('Facebook Page URL'),
        'Instagram': rr.get('Instagram Page URL')
    }
    
    issues = []
    for platform, raw_url in links.items():
        if raw_url:
            cleaned = clean_link(raw_url, platform)
            if cleaned:
                if ' ' in cleaned or '<' in cleaned:
                    issues.append(f'{platform}: {cleaned}')
            else:
                pass # it parsed to None securely
    
    if issues:
        print(f'\n[!] Issues in {name}:')
        for iss in issues:
            print('  -', iss)

print('\nDone checking.')
