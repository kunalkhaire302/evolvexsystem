import requests
import json
try:
    resp = requests.get('http://localhost:8088/', headers={'Expo-Platform': 'android', 'Accept': 'application/expo+json,application/json'})
    print(json.dumps(resp.json(), indent=2))
except Exception as e:
    print(e)
