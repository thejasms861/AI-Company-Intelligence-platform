import os
import re

for root, dirs, files in os.walk('.'):
    for d in ['node_modules', 'venv', '.git']:
        if d in dirs:
            dirs.remove(d)
    for f in files:
        if f.endswith(('.py', '.json', '.env')):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                new_content = re.sub(r'sb_publishable_[A-Za-z0-9_-]+', 'YOUR_SUPABASE_KEY', content)
                new_content = re.sub(r'gsk_[A-Za-z0-9]+', 'YOUR_GROQ_API_KEY', new_content)
                new_content = re.sub(r'AIzaSy[A-Za-z0-9_-]+', 'YOUR_GOOGLE_API_KEY', new_content)
                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as file:
                        file.write(new_content)
            except Exception as e:
                pass
