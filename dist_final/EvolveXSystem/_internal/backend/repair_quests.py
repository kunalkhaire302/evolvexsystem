from pymongo import MongoClient
from bson.objectid import ObjectId
import datetime

client = MongoClient('mongodb://localhost:27017/')
db = client['the_system']

def repair():
    print("Repairing quests...")
    
    # Repair Custom Quests
    count = 0
    for q in db.custom_quests.find():
        updates = {}
        
        # Fix missing quest_id
        if 'quest_id' not in q or not q['quest_id']:
            updates['quest_id'] = str(q['_id'])
            
        # Fix datetime objects (convert to ISO format string)
        for key, val in q.items():
            if isinstance(val, (datetime.date, datetime.datetime)):
                updates[key] = val.isoformat()
                
        if updates:
            db.custom_quests.update_one({'_id': q['_id']}, {'$set': updates})
            count += 1
            print(f"Fixed custom quest {q['_id']}: {updates.keys()}")
            
    print(f"Repaired {count} custom quests.")

    # Repair System Quests
    count = 0
    for q in db.quests.find():
        updates = {}
        if 'quest_id' not in q or not q['quest_id']:
            updates['quest_id'] = str(q['_id'])
            
        for key, val in q.items():
            if isinstance(val, (datetime.date, datetime.datetime)):
                updates[key] = val.isoformat()

        if updates:
            db.quests.update_one({'_id': q['_id']}, {'$set': updates})
            count += 1
            print(f"Fixed quest {q['_id']}: {updates.keys()}")

    print(f"Repaired {count} system quests.")

if __name__ == "__main__":
    repair()
