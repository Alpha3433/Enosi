from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db = Database()

async def get_database() -> AsyncIOMotorDatabase:
    return db.db

async def connect_to_mongo():
    """Create database connection"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'enosi_db')
    
    db.client = AsyncIOMotorClient(mongo_url)
    db.db = db.client[db_name]
    
    # Create indexes
    await create_indexes()

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()

async def create_indexes():
    """Create database indexes for better performance"""
    
    # Users collection indexes
    await db.db.users.create_index("email", unique=True)
    await db.db.users.create_index("user_type")
    
    # Vendor profiles indexes
    await db.db.vendor_profiles.create_index("user_id", unique=True)
    await db.db.vendor_profiles.create_index("category")
    await db.db.vendor_profiles.create_index("location")
    await db.db.vendor_profiles.create_index("verified")
    await db.db.vendor_profiles.create_index("featured")
    await db.db.vendor_profiles.create_index("average_rating")
    
    # Couple profiles indexes
    await db.db.couple_profiles.create_index("user_id", unique=True)
    await db.db.couple_profiles.create_index("wedding_date")
    
    # Quote requests indexes
    await db.db.quote_requests.create_index("couple_id")
    await db.db.quote_requests.create_index("vendor_id")
    await db.db.quote_requests.create_index("status")
    await db.db.quote_requests.create_index("created_at")
    
    # Planning tools indexes
    await db.db.budget_items.create_index("couple_id")
    await db.db.checklist_items.create_index("couple_id")
    await db.db.timeline_events.create_index("couple_id")
    await db.db.guests.create_index("couple_id")
    
    # Payment transaction indexes
    await db.db.payment_transactions.create_index("session_id", unique=True)
    await db.db.payment_transactions.create_index("user_id")
    await db.db.payment_transactions.create_index("payment_status")
    await db.db.payment_transactions.create_index("created_at")
    
    # Quote response indexes
    await db.db.quote_responses.create_index("quote_request_id")
    await db.db.quote_responses.create_index("vendor_id")
    await db.db.quote_responses.create_index("created_at")
    
    # Vendor analytics indexes
    await db.db.vendor_analytics.create_index("vendor_id")
    await db.db.vendor_analytics.create_index("period_start")
    await db.db.vendor_analytics.create_index([("vendor_id", 1), ("period_start", 1)], unique=True)
    
    # Admin actions indexes
    await db.db.admin_actions.create_index("admin_id")
    await db.db.admin_actions.create_index("action_type")
    await db.db.admin_actions.create_index("target_id")
    await db.db.admin_actions.create_index("created_at")
    
    # Phase 2: Enhanced collections indexes
    
    # Vendor reviews indexes
    await db.db.vendor_reviews.create_index("vendor_id")
    await db.db.vendor_reviews.create_index("couple_id")
    await db.db.vendor_reviews.create_index("overall_rating")
    await db.db.vendor_reviews.create_index("created_at")
    await db.db.vendor_reviews.create_index("verified")
    
    # Trust scores indexes
    await db.db.vendor_trust_scores.create_index("vendor_id", unique=True)
    await db.db.vendor_trust_scores.create_index("overall_score")
    await db.db.vendor_trust_scores.create_index("last_calculated")
    
    # Seating charts indexes
    await db.db.seating_charts.create_index("couple_id")
    await db.db.seating_charts.create_index("created_at")
    
    # Wedding websites indexes
    await db.db.wedding_websites.create_index("couple_id")
    await db.db.wedding_websites.create_index("url_slug", unique=True)
    await db.db.wedding_websites.create_index("is_published")
    
    # Vendor availability indexes
    await db.db.vendor_availability.create_index("vendor_id")
    await db.db.vendor_availability.create_index("date")
    await db.db.vendor_availability.create_index([("vendor_id", 1), ("date", 1)], unique=True)
    await db.db.vendor_availability.create_index("is_available")
    
    # Vendor packages indexes
    await db.db.vendor_packages.create_index("vendor_id")
    await db.db.vendor_packages.create_index("base_price")
    
    # Vendor comparisons indexes
    await db.db.vendor_comparisons.create_index("couple_id")
    await db.db.vendor_comparisons.create_index("created_at")
    
    # Seasonal pricing indexes
    await db.db.seasonal_pricing.create_index("vendor_id")
    await db.db.seasonal_pricing.create_index("start_date")
    await db.db.seasonal_pricing.create_index("end_date")
    
    # Phase 3: File management indexes
    await db.db.file_uploads.create_index("file_id", unique=True)
    await db.db.file_uploads.create_index("user_id")
    await db.db.file_uploads.create_index("file_type")
    await db.db.file_uploads.create_index("category")
    await db.db.file_uploads.create_index("upload_date")
    await db.db.file_uploads.create_index("tags")
    
    # Phase 3: Enhanced search indexes
    await db.db.wishlist_items.create_index([("user_id", 1), ("vendor_id", 1)], unique=True)
    await db.db.wishlist_items.create_index("added_at")
    await db.db.recently_viewed.create_index([("user_id", 1), ("vendor_id", 1)], unique=True)
    await db.db.recently_viewed.create_index("viewed_at")
    await db.db.recently_viewed.create_index("user_id")
    
    # Phase 3: Communication indexes
    await db.db.chat_rooms.create_index([("couple_id", 1), ("vendor_id", 1)], unique=True)
    await db.db.chat_rooms.create_index("created_at")
    await db.db.chat_rooms.create_index("last_message_at")
    await db.db.chat_messages.create_index("room_id")
    await db.db.chat_messages.create_index("sender_id")
    await db.db.chat_messages.create_index("created_at")
    await db.db.chat_messages.create_index("read_by")
    
    # Phase 3: Notification indexes
    await db.db.notifications.create_index("user_id")
    await db.db.notifications.create_index("read")
    await db.db.notifications.create_index("notification_type")
    await db.db.notifications.create_index("created_at")
    await db.db.notification_preferences.create_index("user_id", unique=True)