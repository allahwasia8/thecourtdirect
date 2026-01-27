import json
import base64
import hmac
import hashlib
import time
import urllib.request
import urllib.error

# Config provided by user
SECRET_KEY = '[^F[v0W6<:SIRyfFbc4Pj&#}XUze0K@WrCO);0uuyc((iRc,fM[nrQ]7pKLHIW7b'
WORDPRESS_URL = "https://thecourtdirect.com"

def base64url_encode(data):
    if isinstance(data, str):
        data = data.encode('utf-8')
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def sign_jwt():
    header = {
        "alg": "HS256",
        "typ": "JWT"
    }
    
    now = int(time.time())
    payload = {
        "iss": WORDPRESS_URL,
        "iat": now,
        "nbf": now,
        "exp": now + (60 * 60 * 24 * 7), # 7 days
        "data": {
            "user": {
                "id": 1 # Assuming Admin ID 1
            }
        }
    }
    
    encoded_header = base64url_encode(json.dumps(header))
    encoded_payload = base64url_encode(json.dumps(payload))
    
    signing_input = f"{encoded_header}.{encoded_payload}"
    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        signing_input.encode('utf-8'),
        hashlib.sha256
    ).digest()
    
    encoded_signature = base64url_encode(signature)
    
    token = f"{signing_input}.{encoded_signature}"
    return token

def test_token(token):
    url = f"{WORDPRESS_URL}/wp-json/wp/v2/users/me"
    headers = {
        "Authorization": f"Bearer {token}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Python/3.9",
        "Origin": WORDPRESS_URL
    }
    
    print(f"Testing token against: {url}")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                data = json.loads(response.read())
                # print(f"Response: {data}")
                print(f"SUCCESS! Authenticated.")
                return True
    except urllib.error.HTTPError as e:
        print(f"FAILED: {e.code} {e.reason}")
        try:
             body = e.read().decode('utf-8')
             print(f"Body: {body[:500]}") # Print first 500 chars
        except:
             pass
    except Exception as e:
        print(f"ERROR: {e}")
    return False

def main():
    print("Generating JWT token...")
    token = sign_jwt()
    # print(f"Token: {token}")
    
    print("\nVerifying token...")
    if test_token(token):
        print("\nSaving working token to 'jwt_token.txt'...")
        with open("jwt_token.txt", "w") as f:
            f.write(token)
    else:
        print("\nToken verification failed. The Secret Key might be incorrect, or the plugin uses a different payload structure.")

if __name__ == "__main__":
    main()
