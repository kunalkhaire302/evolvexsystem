import requests
import json

username = "test_user_7044" 
password = "password123"

url = "https://evolvexsystem-tcz2.onrender.com/api/auth/login"
payload = {
    "username": username,
    "password": password
}

print(f"Logging in {username}...")
try:
    resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
    print(f"Status Code: {resp.status_code}")
    print("Response JSON:")
    print(json.dumps(resp.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
