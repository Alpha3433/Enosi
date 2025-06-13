import base64
import io
from PIL import Image
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from .models import *
import logging
import random

logger = logging.getLogger(__name__)

class ReviewService:
    """Service for managing vendor reviews and ratings"""
    
    @staticmethod
    async def create_review(db: AsyncIOMotorDatabase, review_data: ReviewCreate, couple_id: str) -> VendorReview:
        """Create a new vendor review"""
        try:
            # Process photos
            processed_photos = []
            for photo_base64 in review_data.photos:
                photo_id = str(uuid.uuid4())
                # In a real implementation, you'd save to file storage
                # For now, we'll store the base64 data
                processed_photos.append(ReviewPhoto(
                    id=photo_id,
                    url=f"data:image/jpeg;base64,{photo_base64}",
                    caption=""
                ))
            
            review = VendorReview(
                **review_data.dict(exclude={"photos"}),
                couple_id=couple_id,
                photos=processed_photos,
                verified=True  # Auto-verify for now
            )
            
            await db.vendor_reviews.insert_one(review.dict())
            
            # Update vendor's average rating
            await ReviewService._update_vendor_rating(db, review_data.vendor_id)
            
            return review
            
        except Exception as e:
            logger.error(f"Failed to create review: {str(e)}")
            raise ValueError(f"Review creation failed: {str(e)}")
    
    @staticmethod
    async def _update_vendor_rating(db: AsyncIOMotorDatabase, vendor_id: str):
        """Update vendor's average rating based on all reviews"""
        try:
            pipeline = [
                {"$match": {"vendor_id": vendor_id}},
                {"$group": {
                    "_id": None,
                    "avg_overall": {"$avg": "$overall_rating"},
                    "avg_quality": {"$avg": "$detailed_ratings.quality"},
                    "avg_communication": {"$avg": "$detailed_ratings.communication"},
                    "avg_value": {"$avg": "$detailed_ratings.value"},
                    "avg_professionalism": {"$avg": "$detailed_ratings.professionalism"},
                    "count": {"$sum": 1}
                }}
            ]
            
            result = await db.vendor_reviews.aggregate(pipeline).to_list(1)
            if result:
                stats = result[0]
                await db.vendor_profiles.update_one(
                    {"id": vendor_id},
                    {
                        "$set": {
                            "average_rating": round(stats["avg_overall"], 1),
                            "total_reviews": stats["count"],
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                
        except Exception as e:
            logger.error(f"Failed to update vendor rating: {str(e)}")

    @staticmethod
    async def get_vendor_reviews(db: AsyncIOMotorDatabase, vendor_id: str, limit: int = 10) -> List[VendorReview]:
        """Get reviews for a vendor"""
        try:
            reviews = await db.vendor_reviews.find({"vendor_id": vendor_id}).sort("created_at", -1).limit(limit).to_list(limit)
            return [VendorReview(**review) for review in reviews]
        except Exception as e:
            logger.error(f"Failed to get vendor reviews: {str(e)}")
            return []

class TrustScoreService:
    """Service for calculating and managing vendor trust scores"""
    
    @staticmethod
    async def calculate_trust_score(db: AsyncIOMotorDatabase, vendor_id: str) -> VendorTrustScore:
        """Calculate comprehensive trust score for a vendor"""
        try:
            vendor = await db.vendor_profiles.find_one({"id": vendor_id})
            if not vendor:
                raise ValueError("Vendor not found")
            
            # Get vendor analytics
            analytics = await db.vendor_analytics.find_one({"vendor_id": vendor_id})
            
            # Get reviews
            reviews = await db.vendor_reviews.find({"vendor_id": vendor_id}).to_list(100)
            
            # Calculate component scores
            verification_score = TrustScoreService._calculate_verification_score(vendor)
            performance_score = TrustScoreService._calculate_performance_score(analytics, vendor)
            satisfaction_score = TrustScoreService._calculate_satisfaction_score(reviews, vendor)
            
            # Calculate overall score (weighted average)
            overall_score = (
                verification_score * 0.3 +
                performance_score * 0.4 +
                satisfaction_score * 0.3
            )
            
            # Determine badges
            badges = TrustScoreService._determine_badges(vendor, analytics, reviews)
            
            trust_score = VendorTrustScore(
                vendor_id=vendor_id,
                overall_score=round(overall_score, 1),
                verification_score=round(verification_score, 1),
                performance_score=round(performance_score, 1),
                customer_satisfaction_score=round(satisfaction_score, 1),
                badges=badges
            )
            
            # Store in database
            await db.vendor_trust_scores.replace_one(
                {"vendor_id": vendor_id},
                trust_score.dict(),
                upsert=True
            )
            
            return trust_score
            
        except Exception as e:
            logger.error(f"Failed to calculate trust score: {str(e)}")
            raise
    
    @staticmethod
    def _calculate_verification_score(vendor: dict) -> float:
        """Calculate verification score based on vendor verification status"""
        score = 0
        
        if vendor.get("verified", False):
            score += 40
        if vendor.get("abn_validated", False):
            score += 30
        if vendor.get("status") == "approved":
            score += 30
        
        return min(score, 100)
    
    @staticmethod
    def _calculate_performance_score(analytics: dict, vendor: dict) -> float:
        """Calculate performance score based on vendor metrics"""
        if not analytics:
            return 50  # Default score for new vendors
        
        score = 0
        
        # Response time score (0-25 points)
        avg_response_time = analytics.get("response_time_avg_hours", 24)
        if avg_response_time <= 2:
            score += 25
        elif avg_response_time <= 6:
            score += 20
        elif avg_response_time <= 12:
            score += 15
        elif avg_response_time <= 24:
            score += 10
        
        # Response rate score (0-25 points)
        response_rate = analytics.get("quotes_responded", 0) / max(analytics.get("quote_requests_received", 1), 1) * 100
        score += min(response_rate * 0.25, 25)
        
        # Profile completeness (0-25 points)
        completeness = 0
        if vendor.get("description"):
            completeness += 5
        if vendor.get("gallery_images") and len(vendor.get("gallery_images", [])) >= 3:
            completeness += 10
        if vendor.get("packages") and len(vendor.get("packages", [])) >= 1:
            completeness += 5
        if vendor.get("website") or vendor.get("instagram"):
            completeness += 5
        score += completeness
        
        # Activity score (0-25 points)
        profile_views = analytics.get("profile_views", 0)
        if profile_views >= 100:
            score += 25
        elif profile_views >= 50:
            score += 20
        elif profile_views >= 20:
            score += 15
        elif profile_views >= 5:
            score += 10
        
        return min(score, 100)
    
    @staticmethod
    def _calculate_satisfaction_score(reviews: List[dict], vendor: dict) -> float:
        """Calculate customer satisfaction score"""
        if not reviews:
            return 70  # Default score for vendors without reviews
        
        # Average rating score (0-60 points)
        avg_rating = vendor.get("average_rating", 0)
        rating_score = (avg_rating / 5) * 60
        
        # Review count score (0-20 points)
        review_count = len(reviews)
        if review_count >= 20:
            count_score = 20
        elif review_count >= 10:
            count_score = 15
        elif review_count >= 5:
            count_score = 10
        else:
            count_score = review_count * 2
        
        # Recent reviews score (0-20 points)
        recent_reviews = [r for r in reviews if (datetime.utcnow() - r["created_at"]).days <= 180]
        recent_score = min(len(recent_reviews) * 2, 20)
        
        return min(rating_score + count_score + recent_score, 100)
    
    @staticmethod
    def _determine_badges(vendor: dict, analytics: dict, reviews: List[dict]) -> List[TrustBadge]:
        """Determine which badges a vendor should have"""
        badges = []
        
        if vendor.get("verified", False) and vendor.get("abn_validated", False):
            badges.append(TrustBadge.VERIFIED_BUSINESS)
        
        if analytics and analytics.get("response_time_avg_hours", 24) <= 4:
            badges.append(TrustBadge.QUICK_RESPONDER)
        
        if vendor.get("average_rating", 0) >= 4.8:
            badges.append(TrustBadge.HIGHLY_RATED)
        
        if len(reviews) >= 50:
            badges.append(TrustBadge.WEDDING_SPECIALIST)
        
        # Platform recommended (top 10% performers)
        if (vendor.get("average_rating", 0) >= 4.5 and 
            len(reviews) >= 10 and 
            analytics and analytics.get("response_time_avg_hours", 24) <= 8):
            badges.append(TrustBadge.PLATFORM_RECOMMENDED)
        
        return badges

class SeatingChartService:
    """Service for managing wedding seating charts"""
    
    @staticmethod
    async def create_seating_chart(db: AsyncIOMotorDatabase, couple_id: str, layout_name: str) -> SeatingChart:
        """Create a new seating chart"""
        try:
            seating_chart = SeatingChart(
                couple_id=couple_id,
                layout_name=layout_name
            )
            
            await db.seating_charts.insert_one(seating_chart.dict())
            return seating_chart
            
        except Exception as e:
            logger.error(f"Failed to create seating chart: {str(e)}")
            raise
    
    @staticmethod
    async def optimize_seating(db: AsyncIOMotorDatabase, seating_chart_id: str) -> Dict[str, Any]:
        """AI-powered seating optimization based on guest relationships"""
        try:
            # Get seating chart and guests
            chart = await db.seating_charts.find_one({"id": seating_chart_id})
            guests = await db.guests.find({"couple_id": chart["couple_id"]}).to_list(1000)
            
            # Simple optimization algorithm (in production, use more sophisticated AI)
            optimized_assignments = SeatingChartService._simple_optimize(guests, chart["tables"])
            
            # Update seating chart
            await db.seating_charts.update_one(
                {"id": seating_chart_id},
                {"$set": {"tables": optimized_assignments, "updated_at": datetime.utcnow()}}
            )
            
            return {"status": "optimized", "assignments": optimized_assignments}
            
        except Exception as e:
            logger.error(f"Failed to optimize seating: {str(e)}")
            raise
    
    @staticmethod
    def _simple_optimize(guests: List[dict], tables: List[dict]) -> List[dict]:
        """Simple seating optimization algorithm"""
        # Group guests by relationship
        family_groups = {}
        friend_groups = {}
        
        for guest in guests:
            relationship = guest.get("relationship", "other")
            if "family" in relationship.lower():
                family_groups.setdefault(relationship, []).append(guest)
            else:
                friend_groups.setdefault(relationship, []).append(guest)
        
        # Assign tables (simplified algorithm)
        optimized_tables = []
        table_index = 0
        
        for table in tables:
            optimized_table = table.copy()
            optimized_table["guests"] = []
            
            # Fill table with guests from same group when possible
            seats_filled = 0
            seat_capacity = table.get("seat_count", 8)
            
            # Try to fill from family groups first
            for group_name, group_guests in family_groups.items():
                while group_guests and seats_filled < seat_capacity:
                    guest = group_guests.pop(0)
                    optimized_table["guests"].append(guest["id"])
                    seats_filled += 1
            
            # Fill remaining seats with friends
            for group_name, group_guests in friend_groups.items():
                while group_guests and seats_filled < seat_capacity:
                    guest = group_guests.pop(0)
                    optimized_table["guests"].append(guest["id"])
                    seats_filled += 1
            
            optimized_tables.append(optimized_table)
        
        return optimized_tables

class RSVPService:
    """Service for managing RSVP and wedding websites"""
    
    @staticmethod
    async def create_wedding_website(db: AsyncIOMotorDatabase, couple_id: str, website_data: dict) -> WeddingWebsite:
        """Create a wedding website with RSVP functionality"""
        try:
            # Generate unique URL slug
            base_slug = website_data.get("url_slug", "our-wedding")
            url_slug = await RSVPService._generate_unique_slug(db, base_slug)
            
            website = WeddingWebsite(
                **website_data,
                couple_id=couple_id,
                url_slug=url_slug
            )
            
            await db.wedding_websites.insert_one(website.dict())
            return website
            
        except Exception as e:
            logger.error(f"Failed to create wedding website: {str(e)}")
            raise
    
    @staticmethod
    async def _generate_unique_slug(db: AsyncIOMotorDatabase, base_slug: str) -> str:
        """Generate a unique URL slug"""
        slug = base_slug.lower().replace(" ", "-")
        counter = 1
        
        while await db.wedding_websites.find_one({"url_slug": slug}):
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    @staticmethod
    async def process_rsvp(db: AsyncIOMotorDatabase, website_slug: str, guest_data: dict) -> dict:
        """Process an RSVP response"""
        try:
            website = await db.wedding_websites.find_one({"url_slug": website_slug})
            if not website:
                raise ValueError("Wedding website not found")
            
            # Update guest RSVP
            result = await db.guests.update_one(
                {
                    "couple_id": website["couple_id"],
                    "email": guest_data["email"]
                },
                {
                    "$set": {
                        "rsvp_status": guest_data["rsvp_status"],
                        "dietary_requirements": guest_data.get("dietary_requirements"),
                        "rsvp_date": datetime.utcnow()
                    }
                }
            )
            
            if result.matched_count == 0:
                raise ValueError("Guest not found")
            
            return {"status": "success", "message": "RSVP recorded successfully"}
            
        except Exception as e:
            logger.error(f"Failed to process RSVP: {str(e)}")
            raise

class VendorCalendarService:
    """Service for vendor availability and pricing management"""
    
    @staticmethod
    async def set_availability(db: AsyncIOMotorDatabase, vendor_id: str, availability_data: List[dict]) -> bool:
        """Set vendor availability for multiple dates"""
        try:
            # Remove existing availability for the dates
            dates = [item["date"] for item in availability_data]
            await db.vendor_availability.delete_many({
                "vendor_id": vendor_id,
                "date": {"$in": dates}
            })
            
            # Insert new availability records
            availability_records = [
                VendorAvailability(vendor_id=vendor_id, **data).dict()
                for data in availability_data
            ]
            
            await db.vendor_availability.insert_many(availability_records)
            return True
            
        except Exception as e:
            logger.error(f"Failed to set vendor availability: {str(e)}")
            return False
    
    @staticmethod
    async def get_availability(db: AsyncIOMotorDatabase, vendor_id: str, start_date: datetime, end_date: datetime) -> List[VendorAvailability]:
        """Get vendor availability for a date range"""
        try:
            availability = await db.vendor_availability.find({
                "vendor_id": vendor_id,
                "date": {"$gte": start_date, "$lte": end_date}
            }).to_list(1000)
            
            return [VendorAvailability(**record) for record in availability]
            
        except Exception as e:
            logger.error(f"Failed to get vendor availability: {str(e)}")
            return []

class DecisionSupportService:
    """Service for vendor comparison and budget optimization"""
    
    @staticmethod
    async def create_vendor_comparison(db: AsyncIOMotorDatabase, couple_id: str, vendor_ids: List[str]) -> VendorComparison:
        """Create a vendor comparison"""
        try:
            comparison = VendorComparison(
                couple_id=couple_id,
                vendors=vendor_ids,
                comparison_criteria=["price", "rating", "availability", "style", "response_time"]
            )
            
            await db.vendor_comparisons.insert_one(comparison.dict())
            return comparison
            
        except Exception as e:
            logger.error(f"Failed to create vendor comparison: {str(e)}")
            raise
    
    @staticmethod
    async def optimize_budget(db: AsyncIOMotorDatabase, couple_id: str, total_budget: float) -> BudgetOptimization:
        """Generate budget optimization recommendations"""
        try:
            # Get current budget items
            budget_items = await db.budget_items.find({"couple_id": couple_id}).to_list(1000)
            
            # Calculate current total
            current_total = sum(item.get("estimated_cost", 0) for item in budget_items)
            
            recommendations = []
            savings_opportunities = []
            
            if current_total > total_budget:
                # Generate savings recommendations
                overage = current_total - total_budget
                savings_opportunities = DecisionSupportService._generate_savings_recommendations(budget_items, overage)
            else:
                # Generate upgrade recommendations
                surplus = total_budget - current_total
                recommendations = DecisionSupportService._generate_upgrade_recommendations(budget_items, surplus)
            
            optimization = BudgetOptimization(
                couple_id=couple_id,
                total_budget=total_budget,
                recommendations=recommendations,
                savings_opportunities=savings_opportunities
            )
            
            return optimization
            
        except Exception as e:
            logger.error(f"Failed to optimize budget: {str(e)}")
            raise
    
    @staticmethod
    def _generate_savings_recommendations(budget_items: List[dict], target_savings: float) -> List[Dict[str, Any]]:
        """Generate recommendations to reduce budget"""
        recommendations = []
        
        # Sort by cost (highest first) for potential savings
        sorted_items = sorted(budget_items, key=lambda x: x.get("estimated_cost", 0), reverse=True)
        
        for item in sorted_items[:5]:  # Top 5 expensive items
            potential_savings = item.get("estimated_cost", 0) * 0.2  # 20% reduction
            recommendations.append({
                "category": item.get("category"),
                "item": item.get("item_name"),
                "current_cost": item.get("estimated_cost"),
                "suggested_cost": item.get("estimated_cost", 0) - potential_savings,
                "savings": potential_savings,
                "suggestion": f"Consider alternative options for {item.get('item_name')} to save ${potential_savings:.0f}"
            })
        
        return recommendations
    
    @staticmethod
    def _generate_upgrade_recommendations(budget_items: List[dict], available_budget: float) -> List[Dict[str, Any]]:
        """Generate recommendations to enhance the wedding with surplus budget"""
        recommendations = []
        
        upgrade_suggestions = [
            {"category": "Photography", "upgrade": "Add engagement session", "cost": 500},
            {"category": "Flowers", "upgrade": "Premium floral arrangements", "cost": 800},
            {"category": "Catering", "upgrade": "Premium bar package", "cost": 1200},
            {"category": "Music", "upgrade": "Live band upgrade", "cost": 1500},
            {"category": "Transportation", "upgrade": "Luxury car service", "cost": 600}
        ]
        
        for suggestion in upgrade_suggestions:
            if suggestion["cost"] <= available_budget:
                recommendations.append({
                    "category": suggestion["category"],
                    "upgrade": suggestion["upgrade"],
                    "cost": suggestion["cost"],
                    "description": f"Enhance your {suggestion['category'].lower()} with {suggestion['upgrade'].lower()}"
                })
        
        return recommendations[:3]  # Top 3 recommendations