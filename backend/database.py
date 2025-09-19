from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, Any
from config import config

class Database:
    def __init__(self):
        self.client = None
        self.db = None

    async def connect(self):
        """Connect to MongoDB"""
        self.client = AsyncIOMotorClient(config.MONGO_URL)
        self.db = self.client[config.DB_NAME]

    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()

    def get_collection(self, collection_name: str):
        """Get a collection from the database"""
        return self.db[collection_name]

# Global database instance
db = Database()