import requests
import json
import os

from dotenv import load_dotenv
load_dotenv(r"c:\Users\THEJAS M S\OneDrive\Desktop\Real Projeeeeet\Lang\.env")

api_key = os.environ.get("GOOGLE_API_KEY", "").split(",")[0].strip()

models_to_try = [
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.0-flash",
    "gemini-3.5-flash"
]

for model in models_to_try:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": "Hello, write a single word."}]}]
    }
    resp = requests.post(url, json=payload)
    print(f"Model: {model} | Status: {resp.status_code}")
    if resp.status_code == 200:
        text = resp.json().get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '').strip()
        print(f"  Response: {text}")
    else:
        print(f"  Response error: {resp.json().get('error', {}).get('message')}")
