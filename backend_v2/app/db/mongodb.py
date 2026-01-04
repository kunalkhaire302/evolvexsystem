from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings

settings = get_settings()

class Database:
    client: AsyncIOMotorClient = None
    db = None

    def connect(self):
        """Create database connection."""
        self.client = AsyncIOMotorClient(settings.MONGO_URI)
        self.db = self.client[settings.DATABASE_NAME]
        print("✅ Connected to MongoDB (Async)")

    def close(self):
        """Close database connection."""
        if self.client:
            self.client.close()
            print("❌ Disconnected from MongoDB")

db = Database()

async def get_database():
    return db.db
