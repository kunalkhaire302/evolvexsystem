import requests
import json
import random

username = f"test_user_{random.randint(1000, 9999)}"
email = f"{username}@test.com"
password = "password123"

url = "https://evolvexsystem-tcz2.onrender.com/api/auth/register"
payload = {
    "username": username,
    "email": email,
    "password": password
}

print(f"Registering {username}...")
try:
    resp = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
    print(f"Status Code: {resp.status_code}")
    print("Response JSON:")
    print(json.dumps(resp.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
    try:
        print("Raw content:", resp.text)
    except:
        pass
