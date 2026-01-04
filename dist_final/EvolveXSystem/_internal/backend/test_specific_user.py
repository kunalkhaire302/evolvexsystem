import requests
import sys
from pymongo import MongoClient
import bcrypt

BASE_URL = 'http://127.0.0.1:5000/api'
MONGO_URI = 'mongodb://localhost:27017/'

def run_test():
    try:
        # 1. Reset password for user 'kunal'
        client = MongoClient(MONGO_URI)
        db = client['the_system']
        username = "kunal"
        password = "newpassword123"
        
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        res = db.users.update_one(
            {'username': username},
            {'$set': {'password_hash': hashed}}
        )
        
        if res.matched_count == 0:
            print(f"User {username} not found in DB.")
            return
            
        print(f"Password reset for {username}.")
        
        # 2. Login
        print(f"Attempting to login as {username}...")
        resp = requests.post(f"{BASE_URL}/auth/login", json={'username': username, 'password': password})
        
        if resp.status_code != 200:
            print(f"Login failed: {resp.status_code} - {resp.text}")
            return

        token = resp.json()['access_token']
        print("Got token.")
        
        # 3. Get Quests
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
