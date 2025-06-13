from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import timedelta, datetime

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
from .services import AdminService, NotificationService, VendorAnalyticsService, PaymentService

# Import Stripe integration
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

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

# Initialize services
stripe_checkout = StripeCheckout(api_key=os.getenv("STRIPE_SECRET_KEY"))

# Helper function to check admin access
async def get_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    current_user = await get_current_user(credentials, db)
    if current_user.user_type != UserType.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

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
    
    # Track profile view for analytics
    await VendorAnalyticsService.track_profile_view(db, vendor_id)
    
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

# Quote response routes
@api_router.post("/quotes/{quote_id}/respond", response_model=QuoteResponse)
async def respond_to_quote(
    quote_id: str,
    response_data: QuoteResponseCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Vendor responds to a quote request"""
    current_user = await get_current_user(credentials, db)
    if current_user.user_type != UserType.VENDOR:
        raise HTTPException(status_code=403, detail="Only vendors can respond to quotes")
    
    # Get vendor profile
    vendor_profile = await db.vendor_profiles.find_one({"user_id": current_user.id})
    if not vendor_profile:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    
    # Get the quote request
    quote_request = await db.quote_requests.find_one({"id": quote_id})
    if not quote_request:
        raise HTTPException(status_code=404, detail="Quote request not found")
    
    # Check if this is the vendor's quote
    if quote_request["vendor_id"] != vendor_profile["id"]:
        raise HTTPException(status_code=403, detail="You can only respond to your own quotes")
    
    # Calculate response time
    created_at = quote_request["created_at"]
    now = datetime.utcnow()
    response_time_hours = (now - created_at).total_seconds() / 3600
    
    # Create quote response
    quote_response = QuoteResponse(**response_data.dict(), 
                                 quote_request_id=quote_id, 
                                 vendor_id=vendor_profile["id"])
    
    await db.quote_responses.insert_one(quote_response.dict())
    
    # Update quote request status
    await db.quote_requests.update_one(
        {"id": quote_id},
        {
            "$set": {
                "status": QuoteStatus.RESPONDED,
                "responded_at": now,
                "response_time_hours": response_time_hours,
                "updated_at": now
            }
        }
    )
    
    # Track analytics
    await VendorAnalyticsService.track_quote_response(db, vendor_profile["id"], response_time_hours)
    
    # Send notification to couple
    couple_profile = await db.couple_profiles.find_one({"id": quote_request["couple_id"]})
    if couple_profile:
        couple_user = await db.users.find_one({"id": couple_profile["user_id"]})
        if couple_user:
            await NotificationService.send_quote_notification_email(
                couple_user["email"], 
                vendor_profile["business_name"], 
                quote_id
            )
    
    return quote_response

@api_router.get("/quotes/responses", response_model=List[QuoteResponse])
async def get_quote_responses(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get quote responses for current user"""
    current_user = await get_current_user(credentials, db)
    
    if current_user.user_type == UserType.VENDOR:
        vendor_profile = await db.vendor_profiles.find_one({"user_id": current_user.id})
        query = {"vendor_id": vendor_profile["id"]}
    else:
        # For couples, get responses to their quote requests
        couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
        # Get all quote request IDs from this couple
        quote_requests = await db.quote_requests.find({"couple_id": couple_profile["id"]}).to_list(100)
        quote_request_ids = [q["id"] for q in quote_requests]
        query = {"quote_request_id": {"$in": quote_request_ids}}
    
    responses = await db.quote_responses.find(query).to_list(100)
    return [QuoteResponse(**response) for response in responses]

@api_router.get("/quotes/{quote_id}/responses", response_model=List[QuoteResponse])
async def get_responses_for_quote(
    quote_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all responses for a specific quote request"""
    current_user = await get_current_user(credentials, db)
    
    # Verify user has access to this quote
    quote_request = await db.quote_requests.find_one({"id": quote_id})
    if not quote_request:
        raise HTTPException(status_code=404, detail="Quote request not found")
    
    if current_user.user_type == UserType.COUPLE:
        couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
        if quote_request["couple_id"] != couple_profile["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.user_type == UserType.VENDOR:
        vendor_profile = await db.vendor_profiles.find_one({"user_id": current_user.id})
        if quote_request["vendor_id"] != vendor_profile["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
    
    responses = await db.quote_responses.find({"quote_request_id": quote_id}).to_list(100)
    return [QuoteResponse(**response) for response in responses]

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

# Admin routes
@api_router.get("/admin/metrics")
async def get_platform_metrics(
    admin_user: UserResponse = Depends(get_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get platform-wide metrics for admin dashboard"""
    metrics = await AdminService.get_platform_metrics(db)
    return metrics

@api_router.get("/admin/vendors/pending", response_model=List[VendorProfile])
async def get_pending_vendors(
    admin_user: UserResponse = Depends(get_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all vendors awaiting approval"""
    vendors = await db.vendor_profiles.find({"status": VendorStatus.PENDING}).to_list(100)
    return [VendorProfile(**vendor) for vendor in vendors]

@api_router.get("/admin/vendors", response_model=List[VendorProfile])
async def get_all_vendors_admin(
    status: Optional[VendorStatus] = None,
    admin_user: UserResponse = Depends(get_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all vendors with optional status filter"""
    query = {}
    if status:
        query["status"] = status
    
    vendors = await db.vendor_profiles.find(query).to_list(1000)
    return [VendorProfile(**vendor) for vendor in vendors]

@api_router.post("/admin/vendors/{vendor_id}/approve")
async def approve_vendor(
    vendor_id: str,
    admin_user: UserResponse = Depends(get_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Approve vendor application"""
    success = await AdminService.approve_vendor(db, vendor_id, admin_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # Send approval email
    vendor = await db.vendor_profiles.find_one({"id": vendor_id})
    if vendor:
        user = await db.users.find_one({"id": vendor["user_id"]})
        if user:
            await NotificationService.send_vendor_approval_email(
                user["email"], vendor["business_name"], True
            )
    
    return {"message": "Vendor approved successfully"}

@api_router.post("/admin/vendors/{vendor_id}/reject")
async def reject_vendor(
    vendor_id: str,
    reason: str = "Application does not meet requirements",
    admin_user: UserResponse = Depends(get_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Reject vendor application"""
    success = await AdminService.reject_vendor(db, vendor_id, admin_user.id, reason)
    if not success:
        raise HTTPException(status_code=404, detail="Vendor not found")
    
    # Send rejection email
    vendor = await db.vendor_profiles.find_one({"id": vendor_id})
    if vendor:
        user = await db.users.find_one({"id": vendor["user_id"]})
        if user:
            await NotificationService.send_vendor_approval_email(
                user["email"], vendor["business_name"], False
            )
    
    return {"message": "Vendor rejected successfully"}

@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(
    user_type: Optional[UserType] = None,
    admin_user: UserResponse = Depends(get_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all users with optional type filter"""
    query = {}
    if user_type:
        query["user_type"] = user_type
    
    users = await db.users.find(query).to_list(1000)
    return [UserResponse(**user) for user in users]

# Payment routes
@api_router.post("/payments/checkout/session")
async def create_checkout_session(
    request: Request,
    checkout_request: CheckoutSessionRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create Stripe checkout session for vendor subscription"""
    current_user = await get_current_user(credentials, db)
    
    # Get host URL from request
    host_url = str(request.base_url).rstrip('/')
    
    # Build success and cancel URLs
    success_url = f"{host_url}/payment-success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{host_url}/vendor-dashboard"
    
    # Override the URLs in the request
    checkout_request.success_url = success_url
    checkout_request.cancel_url = cancel_url
    
    # Add metadata
    if not checkout_request.metadata:
        checkout_request.metadata = {}
    checkout_request.metadata.update({
        "user_id": current_user.id,
        "user_email": current_user.email,
        "source": "vendor_subscription"
    })
    
    try:
        # Create checkout session
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Store payment transaction record
        payment_transaction = {
            "session_id": session.session_id,
            "user_id": current_user.id,
            "user_email": current_user.email,
            "amount": checkout_request.amount,
            "currency": checkout_request.currency,
            "payment_status": "initiated",
            "status": "pending",
            "metadata": checkout_request.metadata,
            "created_at": datetime.utcnow()
        }
        await db.payment_transactions.insert_one(payment_transaction)
        
        return {"url": session.url, "session_id": session.session_id}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create checkout session: {str(e)}")

@api_router.get("/payments/checkout/status/{session_id}")
async def get_checkout_status(
    session_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get checkout session status"""
    current_user = await get_current_user(credentials, db)
    
    try:
        # Get status from Stripe
        checkout_status = await stripe_checkout.get_checkout_status(session_id)
        
        # Update our database
        update_data = {
            "status": checkout_status.status,
            "payment_status": checkout_status.payment_status,
            "updated_at": datetime.utcnow()
        }
        
        # Only process successful payments once
        existing_transaction = await db.payment_transactions.find_one({"session_id": session_id})
        if existing_transaction and checkout_status.payment_status == "paid" and existing_transaction.get("payment_status") != "paid":
            # Activate vendor subscription
            vendor_profile = await db.vendor_profiles.find_one({"user_id": current_user.id})
            if vendor_profile:
                await db.vendor_profiles.update_one(
                    {"user_id": current_user.id},
                    {
                        "$set": {
                            "subscription_active": True,
                            "subscription_expires": datetime.utcnow() + timedelta(days=30),
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
        
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
        
        return checkout_status
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get checkout status: {str(e)}")

# Vendor subscription plans endpoint
@api_router.get("/payments/plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    return {
        "plans": [
            {
                "id": "starter",
                "name": "Starter",
                "price": 79.00,
                "currency": "AUD",
                "features": [
                    "10 quote requests per month",
                    "Basic profile listing",
                    "Email support",
                    "Basic analytics"
                ]
            },
            {
                "id": "professional", 
                "name": "Professional",
                "price": 149.00,
                "currency": "AUD",
                "features": [
                    "25 quote requests per month",
                    "Featured listing (2 per month)",
                    "Priority email support",
                    "Advanced analytics",
                    "Custom portfolio gallery"
                ]
            },
            {
                "id": "premium",
                "name": "Premium", 
                "price": 299.00,
                "currency": "AUD",
                "features": [
                    "50 quote requests per month",
                    "Featured listing (5 per month)",
                    "Priority phone support",
                    "Premium analytics",
                    "Unlimited portfolio gallery",
                    "Lead management tools"
                ]
            }
        ]
    }

# Vendor analytics routes
@api_router.get("/vendors/analytics", response_model=VendorAnalytics)
async def get_vendor_analytics(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get analytics for current vendor"""
    current_user = await get_current_user(credentials, db)
    if current_user.user_type != UserType.VENDOR:
        raise HTTPException(status_code=403, detail="Vendor access required")
    
    vendor_profile = await db.vendor_profiles.find_one({"user_id": current_user.id})
    if not vendor_profile:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    
    analytics = await VendorAnalyticsService.get_vendor_analytics(db, vendor_profile["id"])
    if not analytics:
        # Return empty analytics
        return VendorAnalytics(
            vendor_id=vendor_profile["id"],
            period_start=datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0),
            period_end=datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0) + timedelta(days=32)
        )
    
    return analytics

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