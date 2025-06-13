import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import numpy as np
from collections import defaultdict

from .models import SearchFilter, WishlistItem, RecentlyViewed, VendorProfile

logger = logging.getLogger(__name__)

class AISearchService:
    """Enhanced search service with AI-powered recommendations and filtering"""
    
    @staticmethod
    async def enhanced_vendor_search(
        db: AsyncIOMotorDatabase,
        search_filter: SearchFilter,
        user_id: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Enhanced vendor search with dynamic filtering and AI recommendations"""
        
        try:
            # Build base query
            query = {"status": "approved"}
            
            # Location filtering
            if search_filter.location:
                query["$or"] = [
                    {"location": {"$regex": search_filter.location, "$options": "i"}},
                    {"service_areas": {"$in": [search_filter.location]}}
                ]
            
            # Category filtering
            if search_filter.category:
                query["category"] = search_filter.category
            
            # Price filtering (dynamic based on real vendor data)
            if search_filter.price_min is not None or search_filter.price_max is not None:
                price_query = {}
                if search_filter.price_min is not None:
                    price_query["$gte"] = search_filter.price_min
                if search_filter.price_max is not None:
                    price_query["$lte"] = search_filter.price_max
                query["pricing_from"] = price_query
            
            # Rating filtering
            if search_filter.rating_min:
                query["average_rating"] = {"$gte": search_filter.rating_min}
            
            # Verified only filtering
            if search_filter.verified_only:
                query["verified"] = True
            
            # Style tags filtering
            if search_filter.style_tags:
                query["style_tags"] = {"$in": search_filter.style_tags}
            
            # Availability filtering (if date provided)
            availability_vendors = None
            if search_filter.availability_date:
                availability_vendors = await AISearchService._filter_by_availability(
                    db, search_filter.availability_date
                )
                if availability_vendors is not None:
                    query["id"] = {"$in": availability_vendors}
            
            # Execute search with pagination
            cursor = db.vendor_profiles.find(query).sort([
                ("average_rating", -1),
                ("total_reviews", -1),
                ("created_at", -1)
            ]).skip(offset).limit(limit)
            
            vendors = await cursor.to_list(length=limit)
            total_count = await db.vendor_profiles.count_documents(query)
            
            # Get enhanced data for each vendor
            enhanced_vendors = []
            for vendor in vendors:
                enhanced_vendor = await AISearchService._enhance_vendor_data(db, vendor, user_id)
                enhanced_vendors.append(enhanced_vendor)
            
            # Get AI recommendations if user is logged in
            recommendations = []
            if user_id:
                recommendations = await AISearchService.get_ai_recommendations(
                    db, user_id, exclude_vendor_ids=[v["id"] for v in enhanced_vendors]
                )
            
            # Get trending vendors
            trending_vendors = await AISearchService.get_trending_vendors(db, limit=5)
            
            return {
                "vendors": enhanced_vendors,
                "total_count": total_count,
                "has_more": offset + len(enhanced_vendors) < total_count,
                "recommendations": recommendations,
                "trending": trending_vendors,
                "search_metadata": {
                    "filters_applied": search_filter.dict(exclude_none=True),
                    "availability_filtered": availability_vendors is not None,
                    "total_available": len(availability_vendors) if availability_vendors else None
                }
            }
            
        except Exception as e:
            logger.error(f"Enhanced search failed: {str(e)}")
            return {
                "vendors": [],
                "total_count": 0,
                "has_more": False,
                "recommendations": [],
                "trending": [],
                "error": str(e)
            }
    
    @staticmethod
    async def _filter_by_availability(db: AsyncIOMotorDatabase, date: datetime) -> List[str]:
        """Filter vendors by availability on a specific date"""
        try:
            # Check vendor availability for the given date
            date_str = date.date()
            available_vendors = []
            
            # Get all vendor availability records for the date
            availability_records = await db.vendor_availability.find({
                "date": {
                    "$gte": datetime.combine(date_str, datetime.min.time()),
                    "$lt": datetime.combine(date_str, datetime.max.time())
                },
                "is_available": True,
                "is_booked": False
            }).to_list(1000)
            
            for record in availability_records:
                available_vendors.append(record["vendor_id"])
            
            return available_vendors
            
        except Exception as e:
            logger.error(f"Availability filtering failed: {str(e)}")
            return None
    
    @staticmethod
    async def _enhance_vendor_data(db: AsyncIOMotorDatabase, vendor: Dict[str, Any], user_id: str = None) -> Dict[str, Any]:
        """Enhance vendor data with additional information"""
        try:
            # Add social proof indicators
            vendor["social_proof"] = await AISearchService._get_social_proof(db, vendor["id"])
            
            # Add trust score
            trust_score = await db.vendor_trust_scores.find_one({"vendor_id": vendor["id"]})
            vendor["trust_score"] = trust_score.get("overall_score", 0) if trust_score else 0
            
            # Add wishlist status for logged-in users
            if user_id:
                wishlist_item = await db.wishlist_items.find_one({
                    "user_id": user_id,
                    "vendor_id": vendor["id"]
                })
                vendor["in_wishlist"] = wishlist_item is not None
            else:
                vendor["in_wishlist"] = False
            
            # Add recent activity indicators
            recent_reviews = await db.vendor_reviews.find({
                "vendor_id": vendor["id"]
            }).sort("created_at", -1).limit(3).to_list(3)
            
            vendor["recent_activity"] = {
                "recent_reviews_count": len(recent_reviews),
                "last_review_date": recent_reviews[0]["created_at"] if recent_reviews else None
            }
            
            return vendor
            
        except Exception as e:
            logger.error(f"Vendor data enhancement failed: {str(e)}")
            return vendor
    
    @staticmethod
    async def _get_social_proof(db: AsyncIOMotorDatabase, vendor_id: str) -> Dict[str, Any]:
        """Get social proof indicators for a vendor"""
        try:
            # Recent bookings count (last 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_bookings = await db.quote_requests.count_documents({
                "vendor_id": vendor_id,
                "status": "accepted",
                "created_at": {"$gte": thirty_days_ago}
            })
            
            # Profile views (last 7 days)
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            recent_views = await db.recently_viewed.count_documents({
                "vendor_id": vendor_id,
                "viewed_at": {"$gte": seven_days_ago}
            })
            
            return {
                "recent_bookings": recent_bookings,
                "recent_views": recent_views,
                "popularity_score": min(100, (recent_bookings * 10) + (recent_views * 2))
            }
            
        except Exception as e:
            logger.error(f"Social proof calculation failed: {str(e)}")
            return {"recent_bookings": 0, "recent_views": 0, "popularity_score": 0}
    
    @staticmethod
    async def get_ai_recommendations(
        db: AsyncIOMotorDatabase,
        user_id: str,
        exclude_vendor_ids: List[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Get AI-powered vendor recommendations for a user"""
        try:
            # Get user's viewing history
            recently_viewed = await db.recently_viewed.find({
                "user_id": user_id
            }).sort("viewed_at", -1).limit(20).to_list(20)
            
            # Get user's wishlist
            wishlist = await db.wishlist_items.find({
                "user_id": user_id
            }).to_list(100)
            
            # Get user's couple profile for preferences
            couple_profile = await db.couple_profiles.find_one({"user_id": user_id})
            
            # Build recommendation based on collaborative filtering
            recommended_vendors = await AISearchService._collaborative_filtering(
                db, user_id, recently_viewed, wishlist, couple_profile
            )
            
            # Exclude already shown vendors
            if exclude_vendor_ids:
                recommended_vendors = [
                    v for v in recommended_vendors 
                    if v["id"] not in exclude_vendor_ids
                ]
            
            return recommended_vendors[:limit]
            
        except Exception as e:
            logger.error(f"AI recommendations failed: {str(e)}")
            return []
    
    @staticmethod
    async def _collaborative_filtering(
        db: AsyncIOMotorDatabase,
        user_id: str,
        recently_viewed: List[Dict],
        wishlist: List[Dict],
        couple_profile: Dict
    ) -> List[Dict[str, Any]]:
        """Simple collaborative filtering algorithm"""
        try:
            # Get categories and styles user has shown interest in
            interested_categories = set()
            interested_styles = set()
            
            # From recently viewed
            for view in recently_viewed:
                vendor = await db.vendor_profiles.find_one({"id": view["vendor_id"]})
                if vendor:
                    interested_categories.add(vendor.get("category"))
                    interested_styles.update(vendor.get("style_tags", []))
            
            # From wishlist
            for wish in wishlist:
                vendor = await db.vendor_profiles.find_one({"id": wish["vendor_id"]})
                if vendor:
                    interested_categories.add(vendor.get("category"))
                    interested_styles.update(vendor.get("style_tags", []))
            
            # From couple profile preferences
            if couple_profile:
                interested_styles.update(couple_profile.get("style_preferences", []))
            
            # Find similar vendors
            query = {"status": "approved"}
            if interested_categories:
                query["category"] = {"$in": list(interested_categories)}
            
            if interested_styles:
                query["style_tags"] = {"$in": list(interested_styles)}
            
            # Get vendors and score them
            similar_vendors = await db.vendor_profiles.find(query).limit(50).to_list(50)
            
            # Score vendors based on similarity
            scored_vendors = []
            for vendor in similar_vendors:
                score = AISearchService._calculate_similarity_score(
                    vendor, interested_categories, interested_styles
                )
                vendor["recommendation_score"] = score
                scored_vendors.append(vendor)
            
            # Sort by score and return top vendors
            scored_vendors.sort(key=lambda x: x["recommendation_score"], reverse=True)
            return scored_vendors
            
        except Exception as e:
            logger.error(f"Collaborative filtering failed: {str(e)}")
            return []
    
    @staticmethod
    def _calculate_similarity_score(vendor: Dict, interested_categories: set, interested_styles: set) -> float:
        """Calculate similarity score for a vendor"""
        score = 0.0
        
        # Category match
        if vendor.get("category") in interested_categories:
            score += 0.4
        
        # Style match
        vendor_styles = set(vendor.get("style_tags", []))
        style_intersection = interested_styles.intersection(vendor_styles)
        if style_intersection:
            score += 0.3 * (len(style_intersection) / len(interested_styles.union(vendor_styles)))
        
        # Rating boost
        rating = vendor.get("average_rating", 0)
        score += 0.2 * (rating / 5.0)
        
        # Review count boost
        review_count = vendor.get("total_reviews", 0)
        score += 0.1 * min(1.0, review_count / 20.0)
        
        return score
    
    @staticmethod
    async def get_trending_vendors(db: AsyncIOMotorDatabase, limit: int = 5) -> List[Dict[str, Any]]:
        """Get trending vendors based on recent activity"""
        try:
            # Calculate trending score based on recent views, reviews, and bookings
            seven_days_ago = datetime.utcnow() - timedelta(days=7)
            
            # Aggregate recent activity
            pipeline = [
                {
                    "$lookup": {
                        "from": "recently_viewed",
                        "localField": "id",
                        "foreignField": "vendor_id",
                        "as": "recent_views"
                    }
                },
                {
                    "$lookup": {
                        "from": "vendor_reviews",
                        "localField": "id",
                        "foreignField": "vendor_id",
                        "as": "recent_reviews"
                    }
                },
                {
                    "$addFields": {
                        "trending_score": {
                            "$add": [
                                {"$size": "$recent_views"},
                                {"$multiply": [{"$size": "$recent_reviews"}, 5]},
                                {"$multiply": ["$average_rating", 2]}
                            ]
                        }
                    }
                },
                {
                    "$match": {
                        "status": "approved",
                        "trending_score": {"$gt": 0}
                    }
                },
                {
                    "$sort": {"trending_score": -1}
                },
                {
                    "$limit": limit
                }
            ]
            
            trending = await db.vendor_profiles.aggregate(pipeline).to_list(limit)
            return trending
            
        except Exception as e:
            logger.error(f"Trending vendors calculation failed: {str(e)}")
            return []

class WishlistService:
    """Service for managing user wishlists"""
    
    @staticmethod
    async def add_to_wishlist(db: AsyncIOMotorDatabase, user_id: str, vendor_id: str, notes: str = None) -> WishlistItem:
        """Add vendor to user's wishlist"""
        try:
            # Check if already in wishlist
            existing = await db.wishlist_items.find_one({
                "user_id": user_id,
                "vendor_id": vendor_id
            })
            
            if existing:
                return WishlistItem(**existing)
            
            # Add to wishlist
            wishlist_item = WishlistItem(
                user_id=user_id,
                vendor_id=vendor_id,
                notes=notes
            )
            
            await db.wishlist_items.insert_one(wishlist_item.dict())
            return wishlist_item
            
        except Exception as e:
            logger.error(f"Add to wishlist failed: {str(e)}")
            raise
    
    @staticmethod
    async def remove_from_wishlist(db: AsyncIOMotorDatabase, user_id: str, vendor_id: str) -> bool:
        """Remove vendor from user's wishlist"""
        try:
            result = await db.wishlist_items.delete_one({
                "user_id": user_id,
                "vendor_id": vendor_id
            })
            return result.deleted_count > 0
            
        except Exception as e:
            logger.error(f"Remove from wishlist failed: {str(e)}")
            return False
    
    @staticmethod
    async def get_user_wishlist(db: AsyncIOMotorDatabase, user_id: str) -> List[Dict[str, Any]]:
        """Get user's complete wishlist with vendor details"""
        try:
            # Get wishlist items
            wishlist_items = await db.wishlist_items.find({
                "user_id": user_id
            }).sort("added_at", -1).to_list(100)
            
            # Get vendor details for each item
            enriched_wishlist = []
            for item in wishlist_items:
                vendor = await db.vendor_profiles.find_one({"id": item["vendor_id"]})
                if vendor:
                    item["vendor"] = vendor
                    enriched_wishlist.append(item)
            
            return enriched_wishlist
            
        except Exception as e:
            logger.error(f"Get wishlist failed: {str(e)}")
            return []

class ViewTrackingService:
    """Service for tracking vendor profile views"""
    
    @staticmethod
    async def track_vendor_view(db: AsyncIOMotorDatabase, user_id: str, vendor_id: str, time_spent: int = None):
        """Track a vendor profile view"""
        try:
            # Remove old view record if exists (keep only latest)
            await db.recently_viewed.delete_many({
                "user_id": user_id,
                "vendor_id": vendor_id
            })
            
            # Add new view record
            view_record = RecentlyViewed(
                user_id=user_id,
                vendor_id=vendor_id,
                time_spent_seconds=time_spent
            )
            
            await db.recently_viewed.insert_one(view_record.dict())
            
            # Clean up old records (keep only last 50 views per user)
            user_views = await db.recently_viewed.find({
                "user_id": user_id
            }).sort("viewed_at", -1).skip(50).to_list(1000)
            
            if user_views:
                old_view_ids = [view["id"] for view in user_views]
                await db.recently_viewed.delete_many({
                    "id": {"$in": old_view_ids}
                })
                
        except Exception as e:
            logger.error(f"View tracking failed: {str(e)}")
    
    @staticmethod
    async def get_recently_viewed(db: AsyncIOMotorDatabase, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get user's recently viewed vendors"""
        try:
            recent_views = await db.recently_viewed.find({
                "user_id": user_id
            }).sort("viewed_at", -1).limit(limit).to_list(limit)
            
            # Get vendor details
            enriched_views = []
            for view in recent_views:
                vendor = await db.vendor_profiles.find_one({"id": view["vendor_id"]})
                if vendor:
                    view["vendor"] = vendor
                    enriched_views.append(view)
            
            return enriched_views
            
        except Exception as e:
            logger.error(f"Get recently viewed failed: {str(e)}")
            return []