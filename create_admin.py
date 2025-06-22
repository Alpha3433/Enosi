import asyncio
import motor.motor_asyncio
from passlib.context import CryptContext
import uuid
from datetime import datetime

# Configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def connect_to_mongo():
    """Create database connection"""
    mongo_url = 'mongodb://localhost:27017'
    db_name = 'enosi_db'
    
    client = motor.motor_asyncio.AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    return client, db

async def create_admin_user(db):
    """Create an admin user"""
    # Check if admin user already exists
    existing_admin = await db.users.find_one({"email": "admin@enosi.com"})
    if existing_admin:
        print(f"Admin user already exists with ID: {existing_admin.get('id')}")
        return existing_admin.get('id')
    
    # Create new admin user
    hashed_password = pwd_context.hash("admin123")
    
    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "email": "admin@enosi.com",
        "first_name": "Admin",
        "last_name": "User",
        "phone": "1234567890",
        "user_type": "admin",
        "created_at": datetime.utcnow(),
        "is_active": True,
        "hashed_password": hashed_password
    }
    
    await db.users.insert_one(user_data)
    
    print(f"Created admin user with ID: {user_id}")
    return user_id

async def main():
    """Main function to create admin user"""
    client, db = await connect_to_mongo()
    
    try:
        await create_admin_user(db)
        print("Admin user creation complete.")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())