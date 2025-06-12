from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import timedelta

# Import our modules
from .database import connect_to_mongo, close_mongo_connection, get_database
from .models import *
from .auth import (
    authenticate_user, 
    create_access_token, 
    get_current_user, 
    get_current_active_user,
    get_password_hash,
    security,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(title="Enosi Wedding Marketplace API", version="1.0.0")

# Create API router
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database dependency
async def get_db():
    return await get_database()

# Authentication routes
@api_router.post("/auth/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    del user_dict["password"]
    
    user_in_db = UserInDB(**user_dict, hashed_password=hashed_password)
    await db.users.insert_one(user_in_db.dict())
    
    # Create profile based on user type
    if user_data.user_type == UserType.COUPLE:
        couple_profile = CoupleProfile(user_id=user_in_db.id)
        await db.couple_profiles.insert_one(couple_profile.dict())
    
    return UserResponse(**user_in_db.dict())

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return Token(
        access_token=access_token, 
        token_type="bearer", 
        user=UserResponse(**user.dict())
    )

# User routes
@api_router.get("/users/me", response_model=UserResponse)
async def read_users_me(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    return UserResponse(**current_user.dict())

# Vendor routes
@api_router.post("/vendors/profile", response_model=VendorProfile)
async def create_vendor_profile(
    profile_data: VendorProfileCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    if current_user.user_type != UserType.VENDOR:
        raise HTTPException(status_code=403, detail="Only vendors can create vendor profiles")
    
    # Check if profile already exists
    existing_profile = await db.vendor_profiles.find_one({"user_id": current_user.id})
    if existing_profile:
        raise HTTPException(status_code=400, detail="Vendor profile already exists")
    
    vendor_profile = VendorProfile(**profile_data.dict(), user_id=current_user.id)
    await db.vendor_profiles.insert_one(vendor_profile.dict())
    return vendor_profile

@api_router.get("/vendors/profile", response_model=VendorProfile)
async def get_vendor_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    profile = await db.vendor_profiles.find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    return VendorProfile(**profile)

@api_router.put("/vendors/profile", response_model=VendorProfile)
async def update_vendor_profile(
    profile_update: VendorProfileUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    
    # Update profile
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.vendor_profiles.update_one(
        {"user_id": current_user.id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    
    updated_profile = await db.vendor_profiles.find_one({"user_id": current_user.id})
    return VendorProfile(**updated_profile)

@api_router.get("/vendors", response_model=List[VendorProfile])
async def search_vendors(
    category: Optional[VendorCategory] = None,
    location: Optional[str] = None,
    min_rating: Optional[float] = None,
    featured_only: Optional[bool] = False,
    limit: int = 20,
    skip: int = 0,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    # Build query
    query = {}
    if category:
        query["category"] = category
    if location:
        query["$or"] = [
            {"location": {"$regex": location, "$options": "i"}},
            {"service_areas": {"$regex": location, "$options": "i"}}
        ]
    if min_rating:
        query["average_rating"] = {"$gte": min_rating}
    if featured_only:
        query["featured"] = True
    
    # Execute query
    vendors = await db.vendor_profiles.find(query).skip(skip).limit(limit).to_list(limit)
    return [VendorProfile(**vendor) for vendor in vendors]

@api_router.get("/vendors/{vendor_id}", response_model=VendorProfile)
async def get_vendor_by_id(vendor_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    vendor = await db.vendor_profiles.find_one({"id": vendor_id})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return VendorProfile(**vendor)

# Couple profile routes
@api_router.get("/couples/profile", response_model=CoupleProfile)
async def get_couple_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    return CoupleProfile(**profile)

@api_router.put("/couples/profile", response_model=CoupleProfile)
async def update_couple_profile(
    profile_update: CoupleProfileUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    
    update_data = {k: v for k, v in profile_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.couple_profiles.update_one(
        {"user_id": current_user.id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    updated_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    return CoupleProfile(**updated_profile)

# Quote request routes
@api_router.post("/quotes/request", response_model=QuoteRequest)
async def create_quote_request(
    quote_data: QuoteRequestCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    if current_user.user_type != UserType.COUPLE:
        raise HTTPException(status_code=403, detail="Only couples can request quotes")
    
    # Get couple profile to get couple_id
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    quote_request = QuoteRequest(**quote_data.dict(), couple_id=couple_profile["id"])
    await db.quote_requests.insert_one(quote_request.dict())
    return quote_request

@api_router.get("/quotes/requests", response_model=List[QuoteRequest])
async def get_quote_requests(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    
    if current_user.user_type == UserType.COUPLE:
        couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
        query = {"couple_id": couple_profile["id"]}
    else:
        vendor_profile = await db.vendor_profiles.find_one({"user_id": current_user.id})
        query = {"vendor_id": vendor_profile["id"]}
    
    quotes = await db.quote_requests.find(query).to_list(100)
    return [QuoteRequest(**quote) for quote in quotes]

# Planning tools routes
@api_router.post("/planning/budget", response_model=BudgetItem)
async def create_budget_item(
    budget_data: BudgetItemCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    budget_item = BudgetItem(**budget_data.dict(), couple_id=couple_profile["id"])
    await db.budget_items.insert_one(budget_item.dict())
    return budget_item

@api_router.get("/planning/budget", response_model=List[BudgetItem])
async def get_budget_items(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    items = await db.budget_items.find({"couple_id": couple_profile["id"]}).to_list(100)
    return [BudgetItem(**item) for item in items]

@api_router.post("/planning/checklist", response_model=ChecklistItem)
async def create_checklist_item(
    checklist_data: ChecklistItemCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    checklist_item = ChecklistItem(**checklist_data.dict(), couple_id=couple_profile["id"])
    await db.checklist_items.insert_one(checklist_item.dict())
    return checklist_item

@api_router.get("/planning/checklist", response_model=List[ChecklistItem])
async def get_checklist_items(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    items = await db.checklist_items.find({"couple_id": couple_profile["id"]}).to_list(100)
    return [ChecklistItem(**item) for item in items]

@api_router.put("/planning/checklist/{item_id}", response_model=ChecklistItem)
async def update_checklist_item(
    item_id: str,
    item_update: ChecklistItemUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    
    update_data = {k: v for k, v in item_update.dict().items() if v is not None}
    if item_update.completed:
        update_data["completed_at"] = datetime.utcnow()
    
    result = await db.checklist_items.update_one(
        {"id": item_id, "couple_id": couple_profile["id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    
    updated_item = await db.checklist_items.find_one({"id": item_id})
    return ChecklistItem(**updated_item)

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "Enosi Wedding Marketplace API"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

# Event handlers
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)