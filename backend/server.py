from fastapi import FastAPI, APIRouter, Depends, HTTPException, status, Request, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorDatabase
import os
import logging
import json
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
from .phase2_services import ReviewService, TrustScoreService, SeatingChartService, RSVPService, VendorCalendarService, DecisionSupportService
from .file_service import FileUploadService
from .search_service import AISearchService, WishlistService, ViewTrackingService
from .communication_service import ChatService, connection_manager, NotificationService as RealTimeNotificationService
from .supabase_client import create_bucket_if_not_exists
from .stripe_payment_service import StripePaymentService

# Import Stripe integration
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest
import stripe

# Stripe configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_placeholder")

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
    
    # Track quote request for vendor analytics
    await VendorAnalyticsService.track_quote_request(db, quote_request.vendor_id)
    
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
        # Return default analytics with current month period
        now = datetime.utcnow()
        period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        period_end = period_start + timedelta(days=32)
        
        analytics = VendorAnalytics(
            vendor_id=vendor_profile["id"],
            period_start=period_start,
            period_end=period_end,
            profile_views=0,
            quote_requests_received=0,
            quotes_responded=0,
            quotes_accepted=0,
            response_time_avg_hours=0.0,
            conversion_rate=0.0,
            revenue_generated=0.0,
            gallery_clicks=0,
            contact_clicks=0
        )
    
    return analytics

# Phase 2: Enhanced Review System
@api_router.post("/reviews", response_model=VendorReview)
async def create_review(
    review_data: ReviewCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a vendor review"""
    current_user = await get_current_user(credentials, db)
    if current_user.user_type != UserType.COUPLE:
        raise HTTPException(status_code=403, detail="Only couples can create reviews")
    
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    review = await ReviewService.create_review(db, review_data, couple_profile["id"])
    return review

@api_router.get("/vendors/{vendor_id}/reviews", response_model=List[VendorReview])
async def get_vendor_reviews(
    vendor_id: str,
    limit: int = 10,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get reviews for a vendor"""
    reviews = await ReviewService.get_vendor_reviews(db, vendor_id, limit)
    return reviews

@api_router.post("/vendors/{vendor_id}/reviews/{review_id}/respond")
async def respond_to_review(
    vendor_id: str,
    review_id: str,
    response: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Vendor responds to a review"""
    current_user = await get_current_user(credentials, db)
    if current_user.user_type != UserType.VENDOR:
        raise HTTPException(status_code=403, detail="Only vendors can respond to reviews")
    
    vendor_profile = await db.vendor_profiles.find_one({"user_id": current_user.id})
    if not vendor_profile or vendor_profile["id"] != vendor_id:
        raise HTTPException(status_code=403, detail="You can only respond to reviews for your business")
    
    result = await db.vendor_reviews.update_one(
        {"id": review_id, "vendor_id": vendor_id},
        {
            "$set": {
                "vendor_response": response,
                "vendor_response_date": datetime.utcnow()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return {"message": "Response added successfully"}

# Trust Score & Badge System
@api_router.get("/vendors/{vendor_id}/trust-score", response_model=VendorTrustScore)
async def get_vendor_trust_score(
    vendor_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get vendor trust score"""
    trust_score = await TrustScoreService.calculate_trust_score(db, vendor_id)
    return trust_score

@api_router.post("/vendors/{vendor_id}/calculate-trust-score")
async def recalculate_trust_score(
    vendor_id: str,
    admin_user: UserResponse = Depends(get_admin_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Recalculate vendor trust score (admin only)"""
    trust_score = await TrustScoreService.calculate_trust_score(db, vendor_id)
    return {"message": "Trust score recalculated", "score": trust_score.overall_score}

# Enhanced Planning Tools: Seating Charts
@api_router.post("/planning/seating-charts", response_model=SeatingChart)
async def create_seating_chart(
    layout_name: str,
    venue_layout: str = "ballroom",
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new seating chart"""
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    seating_chart = await SeatingChartService.create_seating_chart(
        db, couple_profile["id"], layout_name
    )
    return seating_chart

@api_router.get("/planning/seating-charts", response_model=List[SeatingChart])
async def get_seating_charts(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all seating charts for a couple"""
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    charts = await db.seating_charts.find({"couple_id": couple_profile["id"]}).to_list(100)
    return [SeatingChart(**chart) for chart in charts]

@api_router.put("/planning/seating-charts/{chart_id}/optimize")
async def optimize_seating_chart(
    chart_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """AI-powered seating optimization"""
    current_user = await get_current_user(credentials, db)
    
    # Verify ownership
    chart = await db.seating_charts.find_one({"id": chart_id})
    if not chart:
        raise HTTPException(status_code=404, detail="Seating chart not found")
    
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if chart["couple_id"] != couple_profile["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await SeatingChartService.optimize_seating(db, chart_id)
    return result

# RSVP Management
@api_router.post("/planning/wedding-website", response_model=WeddingWebsite)
async def create_wedding_website(
    website_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a wedding website with RSVP functionality"""
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    website = await RSVPService.create_wedding_website(db, couple_profile["id"], website_data)
    return website

@api_router.get("/rsvp/{website_slug}")
async def get_wedding_website(
    website_slug: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get wedding website for RSVP (public endpoint)"""
    website = await db.wedding_websites.find_one({"url_slug": website_slug})
    if not website or not website.get("is_published"):
        raise HTTPException(status_code=404, detail="Wedding website not found")
    
    return WeddingWebsite(**website)

@api_router.post("/rsvp/{website_slug}/respond")
async def submit_rsvp(
    website_slug: str,
    guest_data: dict,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Submit RSVP response"""
    result = await RSVPService.process_rsvp(db, website_slug, guest_data)
    return result

# Vendor Calendar & Pricing Management
@api_router.post("/vendors/availability")
async def set_vendor_availability(
    availability_data: List[dict],
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Set vendor availability for multiple dates"""
    current_user = await get_current_user(credentials, db)
    if current_user.user_type != UserType.VENDOR:
        raise HTTPException(status_code=403, detail="Only vendors can set availability")
    
    vendor_profile = await db.vendor_profiles.find_one({"user_id": current_user.id})
    if not vendor_profile:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    
    success = await VendorCalendarService.set_availability(
        db, vendor_profile["id"], availability_data
    )
    
    if success:
        return {"message": "Availability updated successfully"}
    else:
        raise HTTPException(status_code=400, detail="Failed to update availability")

@api_router.get("/vendors/{vendor_id}/availability")
async def get_vendor_availability(
    vendor_id: str,
    start_date: datetime,
    end_date: datetime,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get vendor availability for a date range"""
    availability = await VendorCalendarService.get_availability(
        db, vendor_id, start_date, end_date
    )
    return availability

@api_router.post("/vendors/packages", response_model=VendorPackage)
async def create_vendor_package(
    package_data: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a vendor package"""
    current_user = await get_current_user(credentials, db)
    if current_user.user_type != UserType.VENDOR:
        raise HTTPException(status_code=403, detail="Only vendors can create packages")
    
    vendor_profile = await db.vendor_profiles.find_one({"user_id": current_user.id})
    if not vendor_profile:
        raise HTTPException(status_code=404, detail="Vendor profile not found")
    
    package = VendorPackage(**package_data, vendor_id=vendor_profile["id"])
    await db.vendor_packages.insert_one(package.dict())
    return package

@api_router.get("/vendors/{vendor_id}/packages", response_model=List[VendorPackage])
async def get_vendor_packages(
    vendor_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all packages for a vendor"""
    packages = await db.vendor_packages.find({"vendor_id": vendor_id}).to_list(100)
    return [VendorPackage(**package) for package in packages]

# Decision Support Tools
@api_router.post("/planning/vendor-comparison", response_model=VendorComparison)
async def create_vendor_comparison(
    vendor_ids: List[str],
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a vendor comparison"""
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    comparison = await DecisionSupportService.create_vendor_comparison(
        db, couple_profile["id"], vendor_ids
    )
    return comparison

@api_router.get("/planning/vendor-comparisons", response_model=List[VendorComparison])
async def get_vendor_comparisons(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all vendor comparisons for a couple"""
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    comparisons = await db.vendor_comparisons.find({"couple_id": couple_profile["id"]}).to_list(100)
    return [VendorComparison(**comp) for comp in comparisons]

@api_router.post("/planning/budget-optimization", response_model=BudgetOptimization)
async def optimize_budget(
    total_budget: float,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get budget optimization recommendations"""
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    optimization = await DecisionSupportService.optimize_budget(
        db, couple_profile["id"], total_budget
    )
    return optimization

# Enhanced Guest Management
@api_router.post("/planning/guests", response_model=Guest)
async def create_guest(
    guest_data: GuestCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new guest"""
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    guest = Guest(**guest_data.dict(), couple_id=couple_profile["id"])
    await db.guests.insert_one(guest.dict())
    return guest

@api_router.get("/planning/guests", response_model=List[Guest])
async def get_guests(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all guests for a couple"""
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    guests = await db.guests.find({"couple_id": couple_profile["id"]}).to_list(1000)
    return [Guest(**guest) for guest in guests]

@api_router.put("/planning/guests/{guest_id}", response_model=Guest)
async def update_guest(
    guest_id: str,
    guest_update: GuestUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update guest information"""
    current_user = await get_current_user(credentials, db)
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    
    update_data = {k: v for k, v in guest_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.guests.update_one(
        {"id": guest_id, "couple_id": couple_profile["id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Guest not found")
    
    updated_guest = await db.guests.find_one({"id": guest_id})
    return Guest(**updated_guest)

# Phase 3: File Upload & Media Management
@api_router.post("/files/upload")
async def upload_file(
    file: UploadFile = File(...),
    file_category: str = "image",
    tags: str = "",
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Upload file to storage"""
    current_user = await get_current_user(credentials, db)
    
    # Parse tags
    tag_list = [tag.strip() for tag in tags.split(",") if tag.strip()] if tags else []
    
    file_data = await FileUploadService.upload_file(
        file=file,
        file_category=file_category,
        user_id=current_user.id,
        db=db,
        tags=tag_list
    )
    
    return file_data

@api_router.get("/files/user/{file_category}")
async def get_user_files(
    file_category: str,
    limit: int = 50,
    offset: int = 0,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get user's uploaded files"""
    current_user = await get_current_user(credentials, db)
    
    files = await FileUploadService.get_user_files(
        user_id=current_user.id,
        file_category=file_category,
        db=db,
        limit=limit,
        offset=offset
    )
    
    return {"files": files, "total": len(files)}

@api_router.delete("/files/{file_id}")
async def delete_file(
    file_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete file"""
    current_user = await get_current_user(credentials, db)
    
    # Verify file ownership
    file_metadata = await FileUploadService.get_file_metadata(file_id, db)
    if not file_metadata or file_metadata["user_id"] != current_user.id:
        raise HTTPException(status_code=404, detail="File not found")
    
    success = await FileUploadService.delete_file(file_id, db)
    if success:
        return {"message": "File deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete file")

# Phase 3: Enhanced Search & Discovery
@api_router.post("/search/vendors/enhanced")
async def enhanced_vendor_search(
    search_filter: SearchFilter,
    limit: int = 20,
    offset: int = 0,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Enhanced vendor search with AI recommendations"""
    current_user = await get_current_user(credentials, db)
    
    results = await AISearchService.enhanced_vendor_search(
        db=db,
        search_filter=search_filter,
        user_id=current_user.id,
        limit=limit,
        offset=offset
    )
    
    return results

@api_router.post("/wishlist/add/{vendor_id}")
async def add_to_wishlist(
    vendor_id: str,
    notes: str = "",
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Add vendor to wishlist"""
    current_user = await get_current_user(credentials, db)
    
    wishlist_item = await WishlistService.add_to_wishlist(
        db=db,
        user_id=current_user.id,
        vendor_id=vendor_id,
        notes=notes
    )
    
    return wishlist_item

@api_router.delete("/wishlist/remove/{vendor_id}")
async def remove_from_wishlist(
    vendor_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Remove vendor from wishlist"""
    current_user = await get_current_user(credentials, db)
    
    success = await WishlistService.remove_from_wishlist(
        db=db,
        user_id=current_user.id,
        vendor_id=vendor_id
    )
    
    if success:
        return {"message": "Removed from wishlist"}
    else:
        raise HTTPException(status_code=404, detail="Item not found in wishlist")

@api_router.get("/wishlist")
async def get_wishlist(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get user's wishlist"""
    current_user = await get_current_user(credentials, db)
    
    wishlist = await WishlistService.get_user_wishlist(db, current_user.id)
    return {"wishlist": wishlist}

@api_router.post("/tracking/view/{vendor_id}")
async def track_vendor_view(
    vendor_id: str,
    time_spent: int = 0,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Track vendor profile view"""
    current_user = await get_current_user(credentials, db)
    
    await ViewTrackingService.track_vendor_view(
        db=db,
        user_id=current_user.id,
        vendor_id=vendor_id,
        time_spent=time_spent
    )
    
    return {"message": "View tracked"}

@api_router.get("/tracking/recently-viewed")
async def get_recently_viewed(
    limit: int = 10,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get recently viewed vendors"""
    current_user = await get_current_user(credentials, db)
    
    recently_viewed = await ViewTrackingService.get_recently_viewed(
        db, current_user.id, limit
    )
    
    return {"recently_viewed": recently_viewed}

# Phase 3: Real-time Communication
@api_router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time communication"""
    await connection_manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message["type"] == "join_room":
                await connection_manager.join_room(user_id, message["room_id"])
            elif message["type"] == "leave_room":
                await connection_manager.leave_room(user_id, message["room_id"])
            elif message["type"] == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket, user_id)

@api_router.post("/chat/rooms")
async def create_chat_room(
    vendor_id: str,
    quote_id: str = None,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create chat room between couple and vendor"""
    current_user = await get_current_user(credentials, db)
    
    if current_user.user_type != UserType.COUPLE:
        raise HTTPException(status_code=403, detail="Only couples can create chat rooms")
    
    couple_profile = await db.couple_profiles.find_one({"user_id": current_user.id})
    if not couple_profile:
        raise HTTPException(status_code=404, detail="Couple profile not found")
    
    chat_room = await ChatService.create_chat_room(
        db=db,
        couple_id=couple_profile["id"],
        vendor_id=vendor_id,
        quote_id=quote_id
    )
    
    return chat_room

@api_router.get("/chat/rooms")
async def get_chat_rooms(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get user's chat rooms"""
    current_user = await get_current_user(credentials, db)
    
    rooms = await ChatService.get_user_chat_rooms(
        db=db,
        user_id=current_user.id,
        user_type=current_user.user_type
    )
    
    return {"rooms": rooms}

@api_router.post("/chat/rooms/{room_id}/messages")
async def send_chat_message(
    room_id: str,
    content: str,
    message_type: str = "text",
    attachments: List[str] = [],
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Send message in chat room"""
    current_user = await get_current_user(credentials, db)
    
    message = await ChatService.send_message(
        db=db,
        room_id=room_id,
        sender_id=current_user.id,
        sender_type=current_user.user_type,
        content=content,
        message_type=message_type,
        attachments=attachments
    )
    
    return message

@api_router.get("/chat/rooms/{room_id}/messages")
async def get_chat_messages(
    room_id: str,
    limit: int = 50,
    before_id: str = None,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get messages from chat room"""
    current_user = await get_current_user(credentials, db)
    
    messages = await ChatService.get_room_messages(
        db=db,
        room_id=room_id,
        user_id=current_user.id,
        limit=limit,
        before_id=before_id
    )
    
    return {"messages": messages}

@api_router.post("/chat/rooms/{room_id}/read")
async def mark_messages_read(
    room_id: str,
    message_ids: List[str] = None,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Mark messages as read"""
    current_user = await get_current_user(credentials, db)
    
    success = await ChatService.mark_messages_read(
        db=db,
        room_id=room_id,
        user_id=current_user.id,
        message_ids=message_ids
    )
    
    return {"success": success}

@api_router.get("/notifications")
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get user notifications"""
    current_user = await get_current_user(credentials, db)
    
    notifications = await RealTimeNotificationService.get_user_notifications(
        db=db,
        user_id=current_user.id,
        unread_only=unread_only,
        limit=limit
    )
    
    return {"notifications": notifications}

@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Mark notification as read"""
    current_user = await get_current_user(credentials, db)
    
    success = await RealTimeNotificationService.mark_notification_read(
        db=db,
        notification_id=notification_id,
        user_id=current_user.id
    )
    
    return {"success": success}

@api_router.get("/notifications/unread-count")
async def get_unread_notifications_count(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get unread notifications count"""
    current_user = await get_current_user(credentials, db)
    
    count = await RealTimeNotificationService.get_unread_count(
        db=db,
        user_id=current_user.id
    )
    
    return {"unread_count": count}

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
async def startup_event():
    await connect_to_mongo()
    await create_bucket_if_not_exists()
    logger.info("Application startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    logger.info("Application shutdown complete")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)