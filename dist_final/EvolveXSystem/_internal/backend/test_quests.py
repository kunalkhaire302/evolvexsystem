import requests
import sys

BASE_URL = 'http://127.0.0.1:5000/api'

def run_test():
    try:
        # 1. Login (or register if fails)
        username = "test_debug_user"
        password = "password123"
        
        print(f"Attempting to login as {username}...")
        resp = requests.post(f"{BASE_URL}/auth/login", json={'username': username, 'password': password})
        
        if resp.status_code == 401:
            print("Login failed, trying direct registration...")
            resp = requests.post(f"{BASE_URL}/auth/register", json={
                'username': username,
                'email': f"{username}@example.com",
                'password': password
            })
        
        if resp.status_code not in [200, 201]:
            print(f"Auth failed: {resp.status_code} - {resp.text}")
            return

        token = resp.json()['access_token']
        print("Got token.")
        
        # 2. Get Quests
        print("Fetching quests...")
        headers = {'Authorization': f'Bearer {token}'}
        resp = requests.get(f"{BASE_URL}/quests/available", headers=headers)
        
        print(f"Status Code: {resp.status_code}")
        print("Response Body:")
        print(resp.text)

    except Exception as e:
        print(f"Test script error: {e}")

if __name__ == "__main__":
    run_test()
