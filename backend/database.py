from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db = Database()

async def get_database() -> AsyncIOMotorDatabase:
    return db.db

async def connect_to_mongo():
    """Create database connection"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'enosi_db')
    
    db.client = AsyncIOMotorClient(mongo_url)
    db.db = db.client[db_name]
    
    # Create indexes
    await create_indexes()

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()

async def create_indexes():
    """Create database indexes for better performance"""
    
    # Users collection indexes
    await db.db.users.create_index("email", unique=True)
    await db.db.users.create_index("user_type")
    
    # Vendor profiles indexes
    await db.db.vendor_profiles.create_index("user_id", unique=True)
    await db.db.vendor_profiles.create_index("category")
    await db.db.vendor_profiles.create_index("location")
    await db.db.vendor_profiles.create_index("verified")
    await db.db.vendor_profiles.create_index("featured")
    await db.db.vendor_profiles.create_index("average_rating")
    
    # Couple profiles indexes
    await db.db.couple_profiles.create_index("user_id", unique=True)
    await db.db.couple_profiles.create_index("wedding_date")
    
    # Quote requests indexes
    await db.db.quote_requests.create_index("couple_id")
    await db.db.quote_requests.create_index("vendor_id")
    await db.db.quote_requests.create_index("status")
    await db.db.quote_requests.create_index("created_at")
    
    # Planning tools indexes
    await db.db.budget_items.create_index("couple_id")
    await db.db.checklist_items.create_index("couple_id")
    await db.db.timeline_events.create_index("couple_id")
    await db.db.guests.create_index("couple_id")