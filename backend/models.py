from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class UserType(str, Enum):
    COUPLE = "couple"
    VENDOR = "vendor"
    ADMIN = "admin"

class VendorCategory(str, Enum):
    PHOTOGRAPHER = "photographer"
    VENUE = "venue"
    CATERING = "catering"
    FLORIST = "florist"
    MUSIC = "music"
    MAKEUP = "makeup"
    DRESS = "dress"
    CAKE = "cake"
    TRANSPORT = "transport"
    VIDEOGRAPHY = "videography"

class QuoteStatus(str, Enum):
    PENDING = "pending"
    RESPONDED = "responded"
    ACCEPTED = "accepted"
    DECLINED = "declined"

class VendorStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    SUSPENDED = "suspended"

class SubscriptionPlan(str, Enum):
    STARTER = "starter"
    PROFESSIONAL = "professional"
    PREMIUM = "premium"

# User Models
class UserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    user_type: UserType

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

class UserInDB(UserResponse):
    hashed_password: str

# Admin Models
class AdminAction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    admin_id: str
    action_type: str  # "approve_vendor", "reject_vendor", "suspend_user", etc.
    target_id: str
    reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PlatformMetrics(BaseModel):
    total_vendors: int
    active_vendors: int
    pending_vendors: int
    total_couples: int
    active_couples: int
    total_quotes: int
    processed_quotes: int
    monthly_revenue: float
    date_generated: datetime = Field(default_factory=datetime.utcnow)

# Vendor Verification Models
class ABNValidation(BaseModel):
    abn: str
    business_name: str
    business_status: str
    gst_registered: bool
    validated_at: datetime = Field(default_factory=datetime.utcnow)

class VendorDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    document_type: str  # "business_license", "insurance", "portfolio"
    file_url: str
    file_name: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    verified: bool = False
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None

# Enhanced Vendor Models
class VendorProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    business_name: str
    category: VendorCategory
    description: str
    location: str
    service_areas: List[str] = []
    pricing_from: Optional[float] = None
    pricing_to: Optional[float] = None
    pricing_type: str = "from"
    gallery_images: List[str] = []
    website: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    years_experience: Optional[int] = None
    team_size: Optional[int] = None
    packages: List[Dict[str, Any]] = []
    reviews: List[Dict[str, Any]] = []
    average_rating: float = 0.0
    total_reviews: int = 0
    verified: bool = False
    featured: bool = False
    status: VendorStatus = VendorStatus.PENDING
    subscription_plan: Optional[SubscriptionPlan] = None
    subscription_active: bool = False
    subscription_expires: Optional[datetime] = None
    abn: Optional[str] = None
    abn_validated: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    approved_at: Optional[datetime] = None
    approved_by: Optional[str] = None

class VendorProfileCreate(BaseModel):
    business_name: str
    category: VendorCategory
    description: str
    location: str
    service_areas: List[str] = []
    pricing_from: Optional[float] = None
    pricing_to: Optional[float] = None
    pricing_type: str = "from"
    gallery_images: List[str] = []
    website: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    years_experience: Optional[int] = None
    team_size: Optional[int] = None
    packages: List[Dict[str, Any]] = []
    abn: Optional[str] = None

class VendorProfileUpdate(BaseModel):
    business_name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    service_areas: Optional[List[str]] = None
    pricing_from: Optional[float] = None
    pricing_to: Optional[float] = None
    pricing_type: Optional[str] = None
    gallery_images: Optional[List[str]] = None
    website: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    years_experience: Optional[int] = None
    team_size: Optional[int] = None
    packages: Optional[List[Dict[str, Any]]] = None

# Payment Models
class SubscriptionPayment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    stripe_subscription_id: str
    plan: SubscriptionPlan
    amount: float
    currency: str = "AUD"
    status: str  # "active", "past_due", "canceled", "unpaid"
    current_period_start: datetime
    current_period_end: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    stripe_payment_id: str
    amount: float
    currency: str = "AUD"
    description: str
    status: str  # "succeeded", "failed", "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Enhanced Quote Models
class QuoteRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    vendor_id: str
    wedding_date: Optional[datetime] = None
    guest_count: Optional[int] = None
    budget_range: Optional[str] = None
    event_details: str
    additional_notes: Optional[str] = None
    status: QuoteStatus = QuoteStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    responded_at: Optional[datetime] = None
    response_time_hours: Optional[float] = None

class QuoteResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quote_request_id: str
    vendor_id: str
    message: str
    price_estimate: Optional[float] = None
    packages_offered: List[Dict[str, Any]] = []
    availability_confirmed: bool = False
    valid_until: Optional[datetime] = None
    attachments: List[str] = []
    meeting_requested: bool = False
    meeting_times: List[datetime] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuoteRequestCreate(BaseModel):
    vendor_id: str
    wedding_date: Optional[datetime] = None
    guest_count: Optional[int] = None
    budget_range: Optional[str] = None
    event_details: str
    additional_notes: Optional[str] = None
    message: str
    price_estimate: Optional[float] = None
    packages_offered: List[Dict[str, Any]] = []
    availability_confirmed: bool = False
    valid_until: Optional[datetime] = None
    attachments: List[str] = []
    meeting_requested: bool = False
    meeting_times: List[datetime] = []

# Vendor Analytics Models
class VendorAnalytics(BaseModel):
    vendor_id: str
    period_start: datetime
    period_end: datetime
    profile_views: int = 0
    quote_requests_received: int = 0
    quotes_responded: int = 0
    quotes_accepted: int = 0
    response_time_avg_hours: float = 0.0
    conversion_rate: float = 0.0
    revenue_generated: float = 0.0
    gallery_clicks: int = 0
    contact_clicks: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# File Upload Models
class FileUpload(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    file_name: str
    file_url: str
    file_type: str
    file_size: int
    upload_purpose: str  # "vendor_gallery", "vendor_document", "quote_attachment"
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Keep existing models (Couple profiles, Planning tools, etc.)
class CoupleProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    partner_name: Optional[str] = None
    wedding_date: Optional[datetime] = None
    venue_location: Optional[str] = None
    guest_count: Optional[int] = None
    budget: Optional[float] = None
    style_preferences: List[str] = []
    favorite_vendors: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CoupleProfileCreate(BaseModel):
    partner_name: Optional[str] = None
    wedding_date: Optional[datetime] = None
    venue_location: Optional[str] = None
    guest_count: Optional[int] = None
    budget: Optional[float] = None
    style_preferences: List[str] = []

class CoupleProfileUpdate(BaseModel):
    partner_name: Optional[str] = None
    wedding_date: Optional[datetime] = None
    venue_location: Optional[str] = None
    guest_count: Optional[int] = None
    budget: Optional[float] = None
    style_preferences: Optional[List[str]] = None

# Planning Tools models (keep existing)
class BudgetItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    category: str
    item_name: str
    estimated_cost: float
    actual_cost: Optional[float] = None
    vendor_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BudgetItemCreate(BaseModel):
    category: str
    item_name: str
    estimated_cost: float
    actual_cost: Optional[float] = None
    vendor_id: Optional[str] = None
    notes: Optional[str] = None

class ChecklistItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: bool = False
    category: str
    priority: int = 1
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class ChecklistItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    category: str
    priority: int = 1

class ChecklistItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
    priority: Optional[int] = None

class TimelineEvent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    vendor_id: Optional[str] = None
    attendees: List[str] = []
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TimelineEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None
    vendor_id: Optional[str] = None
    attendees: List[str] = []
    notes: Optional[str] = None

class Guest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    relationship: Optional[str] = None
    rsvp_status: str = "pending"
    plus_one: bool = False
    dietary_requirements: Optional[str] = None
    table_assignment: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GuestCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    relationship: Optional[str] = None
    plus_one: bool = False
    dietary_requirements: Optional[str] = None
    notes: Optional[str] = None

class GuestUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    relationship: Optional[str] = None
    rsvp_status: Optional[str] = None
    plus_one: Optional[bool] = None
    dietary_requirements: Optional[str] = None
    table_assignment: Optional[str] = None
    notes: Optional[str] = None

# Authentication models
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str