from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class UserType(str, Enum):
    COUPLE = "couple"
    VENDOR = "vendor"

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

# Couple-specific models
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

# Vendor-specific models
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
    pricing_type: str = "from"  # "from", "range", "enquire"
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
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

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

# Quote models
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

class QuoteRequestCreate(BaseModel):
    vendor_id: str
    wedding_date: Optional[datetime] = None
    guest_count: Optional[int] = None
    budget_range: Optional[str] = None
    event_details: str
    additional_notes: Optional[str] = None

class QuoteResponse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quote_request_id: str
    vendor_id: str
    message: str
    price_estimate: Optional[float] = None
    packages_offered: List[Dict[str, Any]] = []
    valid_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuoteResponseCreate(BaseModel):
    message: str
    price_estimate: Optional[float] = None
    packages_offered: List[Dict[str, Any]] = []
    valid_until: Optional[datetime] = None

# Planning Tools models
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
    priority: int = 1  # 1-5 scale
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

# Timeline models
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

# Guest List models
class Guest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    couple_id: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    relationship: Optional[str] = None
    rsvp_status: str = "pending"  # pending, attending, not_attending
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