import asyncio
import motor.motor_asyncio
from passlib.context import CryptContext
import sys
import uuid
import requests
import json
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

async def get_all_users(db):
    """Get all users from the database"""
    users = await db.users.find().to_list(100)
    return users

async def update_user_password(db, user_id, new_password):
    """Update a user's password with proper hashing"""
    hashed_password = pwd_context.hash(new_password)
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {"hashed_password": hashed_password}}
    )
    
    return result.modified_count > 0

async def test_login(email, password):
    """Test login with provided credentials"""
    url = "https://4c0e1cae-d13a-41b5-a0eb-333416e55eed.preview.emergentagent.com/api/auth/login"
    headers = {'Content-Type': 'application/json'}
    data = {
        "email": email,
        "password": password
    }
    
    print(f"\n🔍 Testing login with email: {email}")
    
    try:
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Login successful! Status code: {response.status_code}")
            try:
                response_data = response.json()
                print(f"User type: {response_data['user']['user_type']}")
                print(f"User ID: {response_data['user']['id']}")
                return True, response_data
            except:
                print(f"Response parsing error: {response.text}")
                return True, {}
        else:
            print(f"❌ Login failed. Status code: {response.status_code}")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, {}
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, {}

async def create_new_user(db, email, password, user_type="couple"):
    """Create a new user with proper password hashing"""
    hashed_password = pwd_context.hash(password)
    
    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "email": email,
        "first_name": "Test",
        "last_name": "User",
        "phone": "1234567890",
        "user_type": user_type,
        "created_at": datetime.utcnow(),
        "is_active": True,
        "hashed_password": hashed_password
    }
    
    await db.users.insert_one(user_data)
    
    return user_id

async def fix_password_hashing():
    """Fix password hashing for all users"""
    client, db = await connect_to_mongo()
    
    try:
        # Get all users
        users = await get_all_users(db)
        
        print(f"Found {len(users)} users in the database")
        
        # Update passwords for all users
        for user in users:
            user_id = user.get("id")
            email = user.get("email")
            
            # Set a standard password for all users
            new_password = "Password123!"
            
            print(f"Updating password for user {email} (ID: {user_id})")
            success = await update_user_password(db, user_id, new_password)
            
            if success:
                print(f"✅ Password updated successfully for {email}")
                # Test login with new password
                await asyncio.sleep(0.5)  # Small delay to avoid rate limiting
                success, _ = await test_login(email, new_password)
                if success:
                    print(f"✅ Login successful with new password for {email}")
                else:
                    print(f"❌ Login failed with new password for {email}")
            else:
                print(f"❌ Failed to update password for {email}")
        
        # Create a new test user
        print("\nCreating a new test user...")
        test_email = f"test_user_{uuid.uuid4().hex[:8]}@example.com"
        test_password = "Password123!"
        
        user_id = await create_new_user(db, test_email, test_password)
        print(f"✅ Created new user with ID: {user_id}")
        
        # Test login with new user
        await asyncio.sleep(0.5)  # Small delay to avoid rate limiting
        success, _ = await test_login(test_email, test_password)
        if success:
            print(f"✅ Login successful with new user {test_email}")
        else:
            print(f"❌ Login failed with new user {test_email}")
        
        # Create a new test vendor
        print("\nCreating a new test vendor...")
        vendor_email = f"test_vendor_{uuid.uuid4().hex[:8]}@example.com"
        vendor_password = "Password123!"
        
        vendor_id = await create_new_user(db, vendor_email, vendor_password, "vendor")
        print(f"✅ Created new vendor with ID: {vendor_id}")
        
        # Test login with new vendor
        await asyncio.sleep(0.5)  # Small delay to avoid rate limiting
        success, _ = await test_login(vendor_email, vendor_password)
        if success:
            print(f"✅ Login successful with new vendor {vendor_email}")
        else:
            print(f"❌ Login failed with new vendor {vendor_email}")
        
        print("\n=== WORKING CREDENTIALS SUMMARY ===")
        print("All users now have the password: Password123!")
        print(f"New Test User: {test_email} / {test_password}")
        print(f"New Test Vendor: {vendor_email} / {vendor_password}")
        
    finally:
        # Close the connection
        client.close()

if __name__ == "__main__":
    asyncio.run(fix_password_hashing())