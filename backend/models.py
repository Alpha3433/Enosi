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

class SubscriptionTier(str, Enum):
    BASIC = "basic"
    PREMIUM = "premium"
    PRO = "pro"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"

class BookingStatus(str, Enum):
    PENDING_PAYMENT = "pending_payment"
    PAID = "paid"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    DISPUTED = "disputed"

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

class QuoteResponseCreate(BaseModel):
    message: str
    price_estimate: Optional[float] = None
    packages_offered: List[Dict[str, Any]] = []
    availability_confirmed: bool = False
    valid_until: Optional[datetime] = None
    attachments: List[str] = []
    meeting_requested: bool = False
    meeting_times: List[datetime] = []

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

# Enhanced Review System Models
class ReviewRating(BaseModel):
    quality: float = Field(ge=1, le=5)
    communication: float = Field(ge=1, le=5)
    value: float = Field(ge=1, le=5)
    professionalism: float = Field(ge=1, le=5)

class ReviewPhoto(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    url: str
    caption: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)

class VendorReview(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    couple_id: str
    wedding_date: datetime
    overall_rating: float = Field(ge=1, le=5)
    detailed_ratings: ReviewRating
    review_text: str
    photos: List[ReviewPhoto] = []
    verified: bool = False
    helpful_votes: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    vendor_response: Optional[str] = None
    vendor_response_date: Optional[datetime] = None

class ReviewCreate(BaseModel):
    vendor_id: str
    wedding_date: datetime
    overall_rating: float = Field(ge=1, le=5)
    detailed_ratings: ReviewRating
    review_text: str
    photos: List[str] = []  # Base64 encoded images

# Trust Score & Badge Models
class TrustBadge(str, Enum):
    VERIFIED_BUSINESS = "verified_business"
    QUICK_RESPONDER = "quick_responder"
    HIGHLY_RATED = "highly_rated"
    WEDDING_SPECIALIST = "wedding_specialist"
    CUSTOMER_FAVORITE = "customer_favorite"
    PLATFORM_RECOMMENDED = "platform_recommended"

class VendorTrustScore(BaseModel):
    vendor_id: str
    overall_score: float = Field(ge=0, le=100)
    verification_score: float = Field(ge=0, le=100)
    performance_score: float = Field(ge=0, le=100)
    customer_satisfaction_score: float = Field(ge=0, le=100)
    badges: List[TrustBadge] = []
    last_calculated: datetime = Field(default_factory=datetime.utcnow)

# Seating Chart Models
class TableArrangement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    table_number: int
    table_shape: str = "round"  # round, rectangular, etc.
    seat_count: int
    position_x: float
    position_y: float
    guests: List[str] = []  # Guest IDs

class SeatingChart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    layout_name: str
    venue_layout: str = "ballroom"  # ballroom, garden, etc.
    tables: List[TableArrangement] = []
    unassigned_guests: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Enhanced Guest Model with RSVP
class Guest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    relationship: Optional[str] = None
    rsvp_status: str = "pending"  # pending, attending, declined
    plus_one: bool = False
    plus_one_name: Optional[str] = None
    plus_one_rsvp: str = "pending"
    dietary_requirements: Optional[str] = None
    accessibility_needs: Optional[str] = None
    table_assignment: Optional[str] = None
    rsvp_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# RSVP Website Models
class WeddingWebsite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    url_slug: str = Field(unique=True)
    title: str
    welcome_message: str
    wedding_date: datetime
    venue_name: str
    venue_address: str
    dress_code: Optional[str] = None
    gift_registry_links: List[str] = []
    custom_sections: List[Dict[str, Any]] = []
    rsvp_deadline: datetime
    is_published: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Vendor Calendar & Pricing Models
class VendorAvailability(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    date: datetime
    is_available: bool = True
    is_booked: bool = False
    pricing_tier: str = "standard"  # standard, peak, off_peak
    notes: Optional[str] = None

class SeasonalPricing(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    season_name: str
    start_date: datetime
    end_date: datetime
    price_multiplier: float = 1.0
    description: Optional[str] = None

class VendorPackage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    name: str
    description: str
    base_price: float
    inclusions: List[str] = []
    duration_hours: Optional[int] = None
    max_guests: Optional[int] = None
    is_customizable: bool = True
    add_ons: List[Dict[str, Any]] = []

# Decision Support Models
class VendorComparison(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    vendors: List[str] = []  # vendor IDs
    comparison_criteria: List[str] = []
    notes: Dict[str, str] = {}  # vendor_id -> notes
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BudgetOptimization(BaseModel):
    couple_id: str
    total_budget: float
    recommendations: List[Dict[str, Any]] = []
    savings_opportunities: List[Dict[str, Any]] = []
    priority_adjustments: List[Dict[str, Any]] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)

# Phase 3: File Management Models
class FileMetadata(BaseModel):
    file_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    original_name: str
    file_path: str
    file_type: str  # image, video, document
    mime_type: str
    size: int
    original_size: Optional[int] = None
    user_id: str
    vendor_id: Optional[str] = None
    category: Optional[str] = None  # portfolio, contract, review_photo, chat_attachment, document_verification
    tags: List[str] = []
    optimization_metadata: Dict[str, Any] = {}
    thumbnail_path: Optional[str] = None
    upload_date: datetime = Field(default_factory=datetime.utcnow)

# Phase 3: Search Enhancement Models
class SearchFilter(BaseModel):
    location: Optional[str] = None
    category: Optional[str] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    availability_date: Optional[datetime] = None
    rating_min: Optional[float] = None
    style_tags: List[str] = []
    verified_only: bool = False

class WishlistItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    vendor_id: str
    notes: Optional[str] = None
    priority: int = 0  # 0-5 priority level
    added_at: datetime = Field(default_factory=datetime.utcnow)

class RecentlyViewed(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    vendor_id: str
    viewed_at: datetime = Field(default_factory=datetime.utcnow)
    time_spent_seconds: Optional[int] = None

# Phase 3: Real-time Communication Models
class ChatRoom(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    vendor_id: str
    quote_id: Optional[str] = None
    status: str = "active"  # active, archived, blocked
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_message_at: Optional[datetime] = None

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    room_id: str
    sender_id: str
    sender_type: str  # couple, vendor
    message_type: str = "text"  # text, file, image, quote_update
    content: str
    attachments: List[str] = []  # file IDs
    read_by: List[str] = []  # user IDs who have read this message
    created_at: datetime = Field(default_factory=datetime.utcnow)
    edited_at: Optional[datetime] = None

class NotificationPreferences(BaseModel):
    user_id: str
    email_notifications: bool = True
    push_notifications: bool = True
    sms_notifications: bool = False
    notification_types: List[str] = ["messages", "quotes", "reviews", "bookings"]

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    notification_type: str  # message, quote, review, booking, system
    related_id: Optional[str] = None  # related object ID
    read: bool = False
    sent_via: List[str] = []  # email, push, sms
    created_at: datetime = Field(default_factory=datetime.utcnow)
    read_at: Optional[datetime] = None

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