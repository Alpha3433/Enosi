import logging
import os
import uuid
from datetime import datetime

from fastapi import BackgroundTasks, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import email service
import sys
sys.path.append('/app/backend')
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

@app.post("/api/test-email")
async def test_email():
    """Test endpoint to verify email functionality"""
    try:
        # Test email sending
        test_data = {
            "id": "test-123",
            "business_name": "Test Business",
            "first_name": "Test",
            "last_name": "User",
            "email": "test@example.com",
            "phone": "1234567890",
            "created_at": datetime.utcnow().isoformat()
        }
        
        success = email_service.send_vendor_registration_notification(test_data)
        
        return {
            "email_sent": success,
            "api_key_configured": bool(email_service.api_key),
            "sender_email": email_service.sender_email,
            "admin_email": email_service.admin_email
        }
    except Exception as e:
        logging.error(f"Email test error: {str(e)}")
        return {
            "error": str(e),
            "email_sent": False,
            "api_key_configured": bool(email_service.api_key)
        }

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
            
            # Log that we're adding the email task
            logging.info(f"Adding vendor registration email task for: {user_data.business_name}")
            
            # Send admin notification
            background_tasks.add_task(
                email_service.send_vendor_registration_notification,
                vendor_notification_data
            )
            
            # Send vendor confirmation email
            vendor_name = f"{user_data.first_name} {user_data.last_name}"
            background_tasks.add_task(
                email_service.send_vendor_registration_confirmation,
                user_data.email,
                vendor_name,
                user_data.business_name
            )
            
            logging.info(f"Vendor registration email tasks added successfully")
        
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

class VendorProfileCreate(BaseModel):
    # Step 1: Basic Info
    business_name: str
    category: str
    subcategory: str = None
    abn: str = None
    business_description: str = None
    
    # Step 2: Services & Pricing
    services: list = []
    pricing_packages: list = []
    service_specialties: list = []
    
    # Step 3: Location & Coverage
    business_address: str = None
    coverage_areas: list = []
    latitude: float = None
    longitude: float = None
    
    # Step 4: Portfolio
    portfolio_description: str = None
    gallery_images: list = []
    featured_image: str = None
    
    # Additional Info
    website: str = None
    social_media: dict = {}
    years_experience: int = None
    team_size: int = None
    
class VendorProfileUpdate(BaseModel):
    business_name: str = None
    category: str = None
    subcategory: str = None
    abn: str = None
    business_description: str = None
    services: list = None
    pricing_packages: list = None
    service_specialties: list = None
    business_address: str = None
    coverage_areas: list = None
    latitude: float = None
    longitude: float = None
    portfolio_description: str = None
    gallery_images: list = None
    featured_image: str = None
    website: str = None
    social_media: dict = None
    years_experience: int = None
    team_size: int = None

class VendorProfileResponse(BaseModel):
    id: str
    user_id: str
    business_name: str
    category: str = None
    subcategory: str = None
    abn: str = None
    business_description: str = None
    services: list = []
    pricing_packages: list = []
    service_specialties: list = []
    business_address: str = None
    coverage_areas: list = []
    latitude: float = None
    longitude: float = None
    portfolio_description: str = None
    gallery_images: list = []
    featured_image: str = None
    website: str = None
    social_media: dict = {}
    years_experience: int = None
    team_size: int = None
    profile_status: str = "incomplete"  # incomplete, pending_review, live, changes_pending
    completion_percentage: int = 0
    is_live: bool = False
    admin_notes: str = None
    created_at: datetime
    updated_at: datetime
    
class ProfileStatusUpdate(BaseModel):
    status: str  # pending_review, live, changes_pending, rejected
    admin_notes: str = None

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
        
        # Remove passwords and convert MongoDB ObjectId to string
        for vendor in pending_vendors:
            vendor.pop("hashed_password", None)
            # Convert ObjectId to string if present
            if "_id" in vendor:
                vendor["_id"] = str(vendor["_id"])
            
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

# Helper function to calculate profile completion percentage
def calculate_completion_percentage(profile_data):
    """Calculate profile completion percentage based on filled fields"""
    required_fields = [
        'business_name', 'category', 'business_description', 'business_address',
        'services', 'pricing_packages', 'portfolio_description', 'gallery_images'
    ]
    
    optional_fields = [
        'subcategory', 'abn', 'service_specialties', 'coverage_areas',
        'featured_image', 'website', 'social_media', 'years_experience', 'team_size'
    ]
    
    total_fields = len(required_fields) + len(optional_fields)
    completed_fields = 0
    
    # Check required fields (worth more)
    for field in required_fields:
        value = profile_data.get(field)
        if value and (not isinstance(value, list) or len(value) > 0):
            completed_fields += 2  # Required fields count double
    
    # Check optional fields
    for field in optional_fields:
        value = profile_data.get(field)
        if value and (not isinstance(value, list) or len(value) > 0):
            completed_fields += 1
    
    # Calculate percentage (required fields worth double)
    max_points = len(required_fields) * 2 + len(optional_fields)
    percentage = min(100, int((completed_fields / max_points) * 100))
    
    return percentage

# Vendor Profile Management Endpoints
@app.post("/api/vendor/profile", response_model=VendorProfileResponse)
async def create_vendor_profile(profile_data: VendorProfileCreate, background_tasks: BackgroundTasks):
    """Create or update vendor profile"""
    try:
        # In a real app, you'd get user_id from JWT token
        # For now, we'll use a placeholder
        user_id = "current_user_id"  # This should come from authentication
        
        profile_id = str(uuid.uuid4())
        completion_percentage = calculate_completion_percentage(profile_data.dict())
        
        # Determine initial status based on completion
        if completion_percentage >= 80:
            profile_status = "pending_review"
        else:
            profile_status = "incomplete"
        
        profile_doc = {
            "id": profile_id,
            "user_id": user_id,
            **profile_data.dict(),
            "profile_status": profile_status,
            "completion_percentage": completion_percentage,
            "is_live": False,
            "admin_notes": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Check if profile already exists
        existing_profile = await db.vendor_profiles.find_one({"user_id": user_id})
        if existing_profile:
            # Update existing profile
            await db.vendor_profiles.update_one(
                {"user_id": user_id},
                {"$set": profile_doc}
            )
        else:
            # Create new profile
            await db.vendor_profiles.insert_one(profile_doc)
        
        # Send notification if profile is ready for review
        if profile_status == "pending_review":
            # Add email notification task here
            logging.info(f"Vendor profile ready for review: {profile_data.business_name}")
        
        return VendorProfileResponse(**profile_doc)
        
    except Exception as e:
        logging.error(f"Error creating vendor profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create vendor profile"
        )

@app.get("/api/vendor/profile/{user_id}", response_model=VendorProfileResponse)
async def get_vendor_profile(user_id: str):
    """Get vendor profile by user ID"""
    try:
        profile = await db.vendor_profiles.find_one({"user_id": user_id})
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor profile not found"
            )
        
        return VendorProfileResponse(**profile)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching vendor profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch vendor profile"
        )

@app.put("/api/vendor/profile/{user_id}", response_model=VendorProfileResponse)
async def update_vendor_profile(user_id: str, profile_data: VendorProfileUpdate, background_tasks: BackgroundTasks):
    """Update vendor profile"""
    try:
        # Get existing profile
        existing_profile = await db.vendor_profiles.find_one({"user_id": user_id})
        if not existing_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor profile not found"
            )
        
        # Prepare update data (only include non-None fields)
        update_data = {k: v for k, v in profile_data.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        # Merge with existing data for completion calculation
        merged_data = {**existing_profile, **update_data}
        completion_percentage = calculate_completion_percentage(merged_data)
        update_data["completion_percentage"] = completion_percentage
        
        # Update status if needed
        current_status = existing_profile.get("profile_status", "incomplete")
        if completion_percentage >= 80 and current_status == "incomplete":
            update_data["profile_status"] = "pending_review"
            # Send notification
            logging.info(f"Vendor profile ready for review: {merged_data.get('business_name')}")
        elif current_status == "live" and completion_percentage < 80:
            update_data["profile_status"] = "changes_pending"
        
        # Update profile
        await db.vendor_profiles.update_one(
            {"user_id": user_id},
            {"$set": update_data}
        )
        
        # Get updated profile
        updated_profile = await db.vendor_profiles.find_one({"user_id": user_id})
        return VendorProfileResponse(**updated_profile)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating vendor profile: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update vendor profile"
        )

# Admin Profile Management
@app.get("/api/admin/vendor-profiles")
async def get_vendor_profiles_for_admin(status: str = None, limit: int = 50, skip: int = 0):
    """Get vendor profiles for admin review"""
    try:
        # Build query
        query = {}
        if status:
            query["profile_status"] = status
        
        # Get profiles with pagination
        profiles = await db.vendor_profiles.find(query).skip(skip).limit(limit).to_list(None)
        
        # Get total count
        total_count = await db.vendor_profiles.count_documents(query)
        
        # Get user details for each profile
        for profile in profiles:
            user = await db.users.find_one({"id": profile["user_id"]})
            if user:
                profile["user_email"] = user["email"]
                profile["user_name"] = f"{user['first_name']} {user['last_name']}"
        
        return {
            "profiles": profiles,
            "total_count": total_count,
            "page": skip // limit + 1,
            "total_pages": (total_count + limit - 1) // limit
        }
        
    except Exception as e:
        logging.error(f"Error fetching vendor profiles for admin: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch vendor profiles"
        )

@app.post("/api/admin/vendor-profile/{profile_id}/status")
async def update_profile_status(profile_id: str, status_update: ProfileStatusUpdate, background_tasks: BackgroundTasks):
    """Update vendor profile status (admin only)"""
    try:
        # Update profile status
        update_data = {
            "profile_status": status_update.status,
            "admin_notes": status_update.admin_notes,
            "updated_at": datetime.utcnow()
        }
        
        if status_update.status == "live":
            update_data["is_live"] = True
        else:
            update_data["is_live"] = False
        
        result = await db.vendor_profiles.update_one(
            {"id": profile_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor profile not found"
            )
        
        # Get profile and user details for notification
        profile = await db.vendor_profiles.find_one({"id": profile_id})
        user = await db.users.find_one({"id": profile["user_id"]})
        
        if user and profile:
            # Send notification email
            vendor_name = f"{user['first_name']} {user['last_name']}"
            business_name = profile.get('business_name', 'Your Business')
            
            if status_update.status == "live":
                # Send profile approved notification
                logging.info(f"Sending profile approval notification to {user['email']}")
                # Add email task here
            elif status_update.status == "rejected":
                # Send profile rejected notification
                logging.info(f"Sending profile rejection notification to {user['email']}")
                # Add email task here
        
        return {"message": f"Profile status updated to {status_update.status}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating profile status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile status"
        )