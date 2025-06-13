#!/usr/bin/env python3
"""
Script to create an admin user for the ENOSI Wedding Marketplace
Usage: python create_admin.py
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
import uuid
from datetime import datetime

# Load environment variables
load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin_user():
    """Create an admin user"""
    
    # Get database connection
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'enosi_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Admin user details
    admin_email = "admin@enosi.com"
    admin_password = "admin123"  # Change this in production!
    
    # Check if admin already exists
    existing_admin = await db.users.find_one({"email": admin_email})
    if existing_admin:
        print(f"Admin user {admin_email} already exists!")
        return
    
    # Create admin user
    hashed_password = pwd_context.hash(admin_password)
    
    admin_user = {
        "id": str(uuid.uuid4()),
        "email": admin_email,
        "first_name": "Admin",
        "last_name": "User",
        "phone": "+61400000000",
        "user_type": "admin",
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    
    await db.users.insert_one(admin_user)
    
    print(f"✅ Admin user created successfully!")
    print(f"📧 Email: {admin_email}")
    print(f"🔐 Password: {admin_password}")
    print(f"⚠️  Please change the password after first login!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())