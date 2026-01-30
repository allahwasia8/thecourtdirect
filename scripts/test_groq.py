import requests
import json

API_KEY = "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"
URL = "https://api.groq.com/openai/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "model": "llama3-8b-8192",
    "messages": [
        {"role": "user", "content": "Say hello"}
    ],
    "max_tokens": 10
}

print("Sending request...", flush=True)
try:
    response = requests.post(URL, json=payload, headers=headers, timeout=10)
    print(f"Status: {response.status_code}", flush=True)
    print(response.text, flush=True)
except Exception as e:
    print(f"Error: {e}", flush=True)
