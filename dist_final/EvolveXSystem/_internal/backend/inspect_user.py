from pymongo import MongoClient
from bson.objectid import ObjectId
import json

class MongoJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)

client = MongoClient('mongodb://localhost:27017/')
db = client['the_system']

def inspect():
    user = db.users.find_one({'username': 'kunal'})
    if not user:
        print("User 'kunal' not found.")
        return

    user_id = str(user['_id'])
    print(f"User ID: {user_id}")
    
    print("\n--- Custom Quests ---")
    c_quests = list(db.custom_quests.find({'user_id': user_id}))
    print(json.dumps(c_quests, indent=2, cls=MongoJSONEncoder))
    
    print("\n--- User Quests (Main) ---")
    u_quests = list(db.quests.find({'user_id': user_id}))
    print(json.dumps(u_quests, indent=2, cls=MongoJSONEncoder))

if __name__ == "__main__":
    inspect()
