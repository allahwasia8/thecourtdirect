import requests
import json

GROQ_API_KEYS = [
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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",
    "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"
]

def test_keys():
    print(f"Testing {len(GROQ_API_KEYS)} keys...", flush=True)
    
    for key in GROQ_API_KEYS:
        print(f"\nKey: ...{key[-4:]}", flush=True)
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        data = {
            "model": "llama-3.3-70b-versatile",
            "messages": [{"role": "user", "content": "hi"}],
            "max_tokens": 5
        }
        
        try:
            response = requests.post("https://api.groq.com/openai/v1/chat/completions", json=data, headers=headers, timeout=5)
            print(f"  Status: {response.status_code}", flush=True)
            if response.status_code != 200:
                print(f"  Body: {response.text}", flush=True)
            else:
                print("  Success!", flush=True)
                
        except Exception as e:
            print(f"  Exception: {e}", flush=True)

if __name__ == "__main__":
    test_keys()
