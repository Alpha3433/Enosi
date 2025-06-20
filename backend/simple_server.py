from fastapi import FastAPI, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from datetime import datetime
import os
import uuid
import logging
from email_service import email_service

# Simple FastAPI app for handling registration
app = FastAPI(title="Enosi Registration API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Database connection
client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None

# Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str = None
    user_type: str
    business_name: str = None  # For vendor accounts

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: str = None
    user_type: str
    business_name: str = None
    created_at: datetime
    is_active: bool = True
    is_approved: bool = None  # For vendor accounts

# Helper functions
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Database connection
@app.on_event("startup")
async def startup_db_client():
    global client, db
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'enosi_db')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Create indexes
    await db.users.create_index("email", unique=True)
    
    logging.info("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()

# Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.post("/api/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, background_tasks: BackgroundTasks):
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Validate business name for vendor accounts
        if user_data.user_type == "vendor" and not user_data.business_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Business name is required for vendor accounts"
            )
        
        # Create user
        user_id = str(uuid.uuid4())
        hashed_password = get_password_hash(user_data.password)
        
        # Set approval status based on user type
        is_approved = True if user_data.user_type == "couple" else False  # Vendors need approval
        
        user_doc = {
            "id": user_id,
            "email": user_data.email,
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "phone": user_data.phone,
            "user_type": user_data.user_type,
            "business_name": user_data.business_name,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow(),
            "is_active": True,
            "is_approved": is_approved
        }
        
        await db.users.insert_one(user_doc)
        
        # Create profile based on user type
        if user_data.user_type == "couple":
            couple_profile = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "partner_name": None,
                "wedding_date": None,
                "venue_location": None,
                "guest_count": None,
                "budget": None,
                "style_preferences": [],
                "favorite_vendors": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.couple_profiles.insert_one(couple_profile)
        elif user_data.user_type == "vendor":
            # Create vendor profile (pending approval)
            vendor_profile = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "business_name": user_data.business_name,
                "status": "pending",  # pending, approved, rejected
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db.vendor_profiles.insert_one(vendor_profile)
            
            # Send email notification to admin (in background)
            vendor_notification_data = {
                "id": user_id,
                "business_name": user_data.business_name,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "email": user_data.email,
                "phone": user_data.phone,
                "created_at": datetime.utcnow().isoformat()
            }
            background_tasks.add_task(
                email_service.send_vendor_registration_notification,
                vendor_notification_data
            )
        
        # Return user response (without password)
        return UserResponse(
            id=user_id,
            email=user_data.email,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone,
            user_type=user_data.user_type,
            business_name=user_data.business_name,
            created_at=datetime.utcnow(),
            is_approved=is_approved
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@app.post("/api/auth/login")
async def login_user(login_data: LoginRequest):
    try:
        # Find user
        user = await db.users.find_one({"email": login_data.email})
        if not user or not verify_password(login_data.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        # Check if vendor is approved
        if user["user_type"] == "vendor" and not user.get("is_approved", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your vendor account is pending approval. Please wait for admin review."
            )
        
        # For now, return a simple token (in production, use JWT)
        return {
            "access_token": f"token_{user['id']}",
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "user_type": user["user_type"],
                "business_name": user.get("business_name"),
                "is_approved": user.get("is_approved", True)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )

# Admin endpoints for vendor approval
@app.get("/api/admin/pending-vendors")
async def get_pending_vendors():
    """Get all pending vendor registrations"""
    try:
        # Find users who are vendors and not approved
        pending_vendors = await db.users.find({
            "user_type": "vendor",
            "is_approved": False
        }).to_list(None)
        
        # Remove passwords from response
        for vendor in pending_vendors:
            vendor.pop("hashed_password", None)
            
        return {"vendors": pending_vendors}
        
    except Exception as e:
        logging.error(f"Error fetching pending vendors: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch pending vendors"
        )

@app.post("/api/admin/approve-vendor/{vendor_id}")
async def approve_vendor(vendor_id: str, background_tasks: BackgroundTasks):
    """Approve a vendor account"""
    try:
        # Update user approval status
        result = await db.users.update_one(
            {"id": vendor_id, "user_type": "vendor"},
            {"$set": {"is_approved": True, "updated_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor not found"
            )
        
        # Update vendor profile status
        await db.vendor_profiles.update_one(
            {"user_id": vendor_id},
            {"$set": {"status": "approved", "updated_at": datetime.utcnow()}}
        )
        
        # Get vendor details for email
        vendor = await db.users.find_one({"id": vendor_id})
        if vendor:
            vendor_name = f"{vendor['first_name']} {vendor['last_name']}"
            background_tasks.add_task(
                email_service.send_vendor_approval_notification,
                vendor["email"],
                vendor_name,
                True
            )
        
        return {"message": "Vendor approved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error approving vendor: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to approve vendor"
        )

@app.post("/api/admin/reject-vendor/{vendor_id}")
async def reject_vendor(vendor_id: str, background_tasks: BackgroundTasks):
    """Reject a vendor account"""
    try:
        # Update vendor profile status
        await db.vendor_profiles.update_one(
            {"user_id": vendor_id},
            {"$set": {"status": "rejected", "updated_at": datetime.utcnow()}}
        )
        
        # Get vendor details for email
        vendor = await db.users.find_one({"id": vendor_id})
        if vendor:
            vendor_name = f"{vendor['first_name']} {vendor['last_name']}"
            background_tasks.add_task(
                email_service.send_vendor_approval_notification,
                vendor["email"],
                vendor_name,
                False
            )
        
        # Delete the user account (optional - you might want to keep for records)
        await db.users.delete_one({"id": vendor_id})
        
        return {"message": "Vendor rejected successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error rejecting vendor: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to reject vendor"
        )

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)