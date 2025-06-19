import os
import re
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
import base64

logger = logging.getLogger(__name__)

class EnhancedReviewService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.reviews_collection = db.reviews
        self.vendors_collection = db.vendors
        self.users_collection = db.users
        self.review_analytics_collection = db.review_analytics
        self.quality_scores_collection = db.quality_scores
        
        # Sentiment analysis keywords (simple implementation)
        self.positive_keywords = [
            'excellent', 'amazing', 'fantastic', 'wonderful', 'perfect', 'outstanding', 
            'incredible', 'awesome', 'brilliant', 'exceptional', 'superb', 'magnificent',
            'beautiful', 'stunning', 'gorgeous', 'lovely', 'delightful', 'charming',
            'professional', 'responsive', 'helpful', 'friendly', 'accommodating',
            'creative', 'talented', 'skilled', 'experienced', 'knowledgeable',
            'punctual', 'reliable', 'organized', 'efficient', 'thorough',
            'recommend', 'loved', 'satisfied', 'pleased', 'impressed', 'exceeded'
        ]
        
        self.negative_keywords = [
            'terrible', 'awful', 'horrible', 'worst', 'disappointing', 'unprofessional',
            'rude', 'late', 'delayed', 'cancelled', 'expensive', 'overpriced',
            'poor', 'bad', 'unsatisfied', 'unhappy', 'frustrated', 'angry',
            'disorganized', 'unreliable', 'unresponsive', 'difficult', 'stressful',
            'mistake', 'error', 'problem', 'issue', 'complaint', 'regret',
            'avoid', 'never', 'waste', 'money', 'time'
        ]
    
    async def create_review(self, customer_id: str, review_data: dict) -> dict:
        """Create a new review with sentiment analysis and photo processing"""
        try:
            review_id = f"review_{uuid.uuid4().hex[:12]}"
            
            # Process photos if provided
            processed_photos = []
            if review_data.get('photos'):
                processed_photos = await self._process_review_photos(review_data['photos'])
            
            # Analyze sentiment
            sentiment_data = await self._analyze_sentiment(
                review_data.get('title', '') + ' ' + review_data.get('content', '')
            )
            
            # Create review document
            review_doc = {
                'id': review_id,
                'vendor_id': review_data['vendor_id'],
                'customer_id': customer_id,
                'rating': review_data['rating'],
                'title': review_data['title'],
                'content': review_data['content'],
                'category_ratings': review_data.get('category_ratings', []),
                'photos': processed_photos,
                'service_date': review_data.get('service_date'),
                'would_recommend': review_data.get('would_recommend', True),
                'anonymous': review_data.get('anonymous', False),
                'status': 'pending',  # Will be verified later
                'sentiment': sentiment_data['sentiment'],
                'sentiment_score': sentiment_data['score'],
                'verified': False,
                'helpful_votes': 0,
                'total_votes': 0,
                'vendor_response': None,
                'vendor_response_date': None,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            
            # Insert review
            await self.reviews_collection.insert_one(review_doc)
            
            # Update vendor ratings
            await self._update_vendor_ratings(review_data['vendor_id'])
            
            # Update analytics
            await self._update_review_analytics(review_data['vendor_id'])
            
            # Calculate quality score
            await self._calculate_quality_score(review_data['vendor_id'])
            
            return {
                'review_id': review_id,
                'status': 'created',
                'sentiment': sentiment_data['sentiment'],
                'needs_verification': True
            }
            
        except Exception as e:
            logger.error(f"Error creating review: {e}")
            raise
    
    async def _process_review_photos(self, photos: List[str]) -> List[dict]:
        """Process and store review photos"""
        processed_photos = []
        
        for photo_base64 in photos:
            try:
                # Generate unique photo ID
                photo_id = f"photo_{uuid.uuid4().hex[:12]}"
                
                # In a real implementation, you would:
                # 1. Decode base64 image
                # 2. Validate image format and size
                # 3. Upload to cloud storage (S3, Supabase, etc.)
                # 4. Generate public URL
                
                # For now, we'll simulate this
                photo_doc = {
                    'photo_id': photo_id,
                    'photo_url': f"https://storage.example.com/reviews/{photo_id}.jpg",
                    'caption': None,
                    'verified': False
                }
                
                processed_photos.append(photo_doc)
                
            except Exception as e:
                logger.error(f"Error processing photo: {e}")
                continue
        
        return processed_photos
    
    async def _analyze_sentiment(self, text: str) -> dict:
        """Analyze sentiment of review text"""
        try:
            # Clean and normalize text
            text_clean = re.sub(r'[^\w\s]', '', text.lower())
            words = text_clean.split()
            
            positive_count = sum(1 for word in words if word in self.positive_keywords)
            negative_count = sum(1 for word in words if word in self.negative_keywords)
            
            # Calculate sentiment score (-1 to 1)
            total_sentiment_words = positive_count + negative_count
            if total_sentiment_words == 0:
                sentiment_score = 0
                sentiment = 'neutral'
            else:
                sentiment_score = (positive_count - negative_count) / total_sentiment_words
                
                if sentiment_score > 0.2:
                    sentiment = 'positive'
                elif sentiment_score < -0.2:
                    sentiment = 'negative'
                else:
                    sentiment = 'neutral'
            
            return {
                'sentiment': sentiment,
                'score': sentiment_score,
                'positive_words': positive_count,
                'negative_words': negative_count
            }
            
        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return {'sentiment': 'neutral', 'score': 0}
    
    async def _update_vendor_ratings(self, vendor_id: str):
        """Update vendor's overall rating and review count"""
        try:
            # Get all verified reviews for vendor
            reviews_cursor = self.reviews_collection.find({
                'vendor_id': vendor_id,
                'status': {'$in': ['verified', 'pending']}
            })
            reviews = await reviews_cursor.to_list(length=None)
            
            if not reviews:
                return
            
            # Calculate overall rating
            total_rating = sum(review['rating'] for review in reviews)
            average_rating = total_rating / len(reviews)
            
            # Calculate category averages
            category_totals = {}
            category_counts = {}
            
            for review in reviews:
                for cat_rating in review.get('category_ratings', []):
                    category = cat_rating['category']
                    rating = cat_rating['rating']
                    
                    if category not in category_totals:
                        category_totals[category] = 0
                        category_counts[category] = 0
                    
                    category_totals[category] += rating
                    category_counts[category] += 1
            
            category_averages = {
                cat: category_totals[cat] / category_counts[cat]
                for cat in category_totals
            }
            
            # Update vendor record
            await self.vendors_collection.update_one(
                {'id': vendor_id},
                {
                    '$set': {
                        'average_rating': round(average_rating, 2),
                        'review_count': len(reviews),
                        'category_ratings': category_averages,
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
        except Exception as e:
            logger.error(f"Error updating vendor ratings: {e}")
    
    async def _update_review_analytics(self, vendor_id: str):
        """Update comprehensive review analytics for vendor"""
        try:
            # Get all reviews for vendor
            reviews_cursor = self.reviews_collection.find({'vendor_id': vendor_id})
            reviews = await reviews_cursor.to_list(length=None)
            
            if not reviews:
                return
            
            # Calculate analytics
            total_reviews = len(reviews)
            ratings = [review['rating'] for review in reviews]
            average_rating = sum(ratings) / len(ratings)
            
            # Rating distribution
            rating_distribution = {}
            for i in range(1, 6):
                rating_distribution[str(i)] = sum(1 for r in ratings if int(r) == i)
            
            # Category averages
            category_totals = {}
            category_counts = {}
            
            for review in reviews:
                for cat_rating in review.get('category_ratings', []):
                    category = cat_rating['category']
                    rating = cat_rating['rating']
                    
                    if category not in category_totals:
                        category_totals[category] = 0
                        category_counts[category] = 0
                    
                    category_totals[category] += rating
                    category_counts[category] += 1
            
            category_averages = {
                cat: category_totals[cat] / category_counts[cat]
                for cat in category_totals
            }
            
            # Sentiment breakdown
            sentiment_breakdown = {
                'positive': sum(1 for r in reviews if r.get('sentiment') == 'positive'),
                'neutral': sum(1 for r in reviews if r.get('sentiment') == 'neutral'),
                'negative': sum(1 for r in reviews if r.get('sentiment') == 'negative')
            }
            
            # Recent trend (last 30 days vs previous 30 days)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            sixty_days_ago = datetime.utcnow() - timedelta(days=60)
            
            recent_reviews = [r for r in reviews if r['created_at'] > thirty_days_ago]
            previous_reviews = [r for r in reviews if sixty_days_ago < r['created_at'] <= thirty_days_ago]
            
            recent_avg = sum(r['rating'] for r in recent_reviews) / len(recent_reviews) if recent_reviews else 0
            previous_avg = sum(r['rating'] for r in previous_reviews) / len(previous_reviews) if previous_reviews else 0
            
            if recent_avg > previous_avg + 0.2:
                trend = 'improving'
            elif recent_avg < previous_avg - 0.2:
                trend = 'declining'
            else:
                trend = 'stable'
            
            # Recommendation rate
            recommend_count = sum(1 for r in reviews if r.get('would_recommend', True))
            recommendation_rate = recommend_count / total_reviews if total_reviews > 0 else 0
            
            # Verified review percentage
            verified_count = sum(1 for r in reviews if r.get('verified', False))
            verified_percentage = verified_count / total_reviews if total_reviews > 0 else 0
            
            # Create analytics document
            analytics_doc = {
                'vendor_id': vendor_id,
                'total_reviews': total_reviews,
                'average_rating': round(average_rating, 2),
                'rating_distribution': rating_distribution,
                'category_averages': category_averages,
                'sentiment_breakdown': sentiment_breakdown,
                'recent_trend': trend,
                'recommendation_rate': round(recommendation_rate, 2),
                'verified_review_percentage': round(verified_percentage, 2),
                'updated_at': datetime.utcnow()
            }
            
            # Upsert analytics
            await self.review_analytics_collection.update_one(
                {'vendor_id': vendor_id},
                {'$set': analytics_doc},
                upsert=True
            )
            
        except Exception as e:
            logger.error(f"Error updating review analytics: {e}")
    
    async def _calculate_quality_score(self, vendor_id: str):
        """Calculate comprehensive quality score for vendor"""
        try:
            # Get vendor data and reviews
            vendor = await self.vendors_collection.find_one({'id': vendor_id})
            reviews_cursor = self.reviews_collection.find({'vendor_id': vendor_id})
            reviews = await reviews_cursor.to_list(length=None)
            
            if not vendor or not reviews:
                return
            
            # Component scores (0-100 scale)
            
            # 1. Rating Score (40% weight)
            avg_rating = vendor.get('average_rating', 0)
            rating_score = (avg_rating / 5.0) * 100
            
            # 2. Review Volume Score (20% weight)
            review_count = len(reviews)
            volume_score = min(review_count * 5, 100)  # 5 points per review, max 100
            
            # 3. Response Rate Score (15% weight)
            responses = sum(1 for r in reviews if r.get('vendor_response'))
            response_rate = responses / review_count if review_count > 0 else 0
            response_rate_score = response_rate * 100
            
            # 4. Sentiment Score (10% weight)
            positive_reviews = sum(1 for r in reviews if r.get('sentiment') == 'positive')
            sentiment_score = (positive_reviews / review_count) * 100 if review_count > 0 else 0
            
            # 5. Verification Score (10% weight)
            verified_reviews = sum(1 for r in reviews if r.get('verified', False))
            verification_score = (verified_reviews / review_count) * 100 if review_count > 0 else 0
            
            # 6. Trend Score (5% weight)
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)
            recent_reviews = [r for r in reviews if r['created_at'] > thirty_days_ago]
            
            if recent_reviews:
                recent_avg = sum(r['rating'] for r in recent_reviews) / len(recent_reviews)
                trend_score = (recent_avg / 5.0) * 100
            else:
                trend_score = rating_score  # Use overall rating if no recent reviews
            
            # Calculate weighted overall score
            overall_score = (
                rating_score * 0.40 +
                volume_score * 0.20 +
                response_rate_score * 0.15 +
                sentiment_score * 0.10 +
                verification_score * 0.10 +
                trend_score * 0.05
            )
            
            # Create quality score document
            quality_doc = {
                'vendor_id': vendor_id,
                'overall_score': round(overall_score, 2),
                'rating_score': round(rating_score, 2),
                'review_volume_score': round(volume_score, 2),
                'response_rate_score': round(response_rate_score, 2),
                'sentiment_score': round(sentiment_score, 2),
                'verification_score': round(verification_score, 2),
                'trend_score': round(trend_score, 2),
                'last_calculated': datetime.utcnow()
            }
            
            # Upsert quality score
            await self.quality_scores_collection.update_one(
                {'vendor_id': vendor_id},
                {'$set': quality_doc},
                upsert=True
            )
            
            # Update vendor with quality score
            await self.vendors_collection.update_one(
                {'id': vendor_id},
                {'$set': {'quality_score': round(overall_score, 2)}}
            )
            
        except Exception as e:
            logger.error(f"Error calculating quality score: {e}")
    
    async def add_vendor_response(self, vendor_id: str, review_id: str, response: str) -> bool:
        """Add vendor response to a review"""
        try:
            result = await self.reviews_collection.update_one(
                {
                    'id': review_id,
                    'vendor_id': vendor_id
                },
                {
                    '$set': {
                        'vendor_response': response,
                        'vendor_response_date': datetime.utcnow(),
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                # Recalculate quality score (response rate improved)
                await self._calculate_quality_score(vendor_id)
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error adding vendor response: {e}")
            return False
    
    async def verify_review(self, review_id: str, verified: bool = True) -> bool:
        """Verify or unverify a review"""
        try:
            result = await self.reviews_collection.update_one(
                {'id': review_id},
                {
                    '$set': {
                        'verified': verified,
                        'status': 'verified' if verified else 'pending',
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                # Get vendor_id and update scores
                review = await self.reviews_collection.find_one({'id': review_id})
                if review:
                    await self._update_review_analytics(review['vendor_id'])
                    await self._calculate_quality_score(review['vendor_id'])
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error verifying review: {e}")
            return False
    
    async def get_vendor_reviews(self, vendor_id: str, limit: int = 20, offset: int = 0) -> List[dict]:
        """Get reviews for a vendor with pagination"""
        try:
            cursor = self.reviews_collection.find(
                {'vendor_id': vendor_id, 'status': {'$ne': 'rejected'}}
            ).sort('created_at', -1).skip(offset).limit(limit)
            
            reviews = await cursor.to_list(length=limit)
            
            # Add customer names (if not anonymous)
            for review in reviews:
                if not review.get('anonymous', False):
                    customer = await self.users_collection.find_one({'id': review['customer_id']})
                    if customer:
                        review['customer_name'] = f"{customer.get('first_name', '')} {customer.get('last_name', '')}"
                else:
                    review['customer_name'] = 'Anonymous'
            
            return reviews
            
        except Exception as e:
            logger.error(f"Error getting vendor reviews: {e}")
            return []
    
    async def get_review_analytics(self, vendor_id: str) -> Optional[dict]:
        """Get comprehensive review analytics for vendor"""
        try:
            analytics = await self.review_analytics_collection.find_one({'vendor_id': vendor_id})
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting review analytics: {e}")
            return None
    
    async def get_quality_score(self, vendor_id: str) -> Optional[dict]:
        """Get quality score for vendor"""
        try:
            quality_score = await self.quality_scores_collection.find_one({'vendor_id': vendor_id})
            return quality_score
            
        except Exception as e:
            logger.error(f"Error getting quality score: {e}")
            return None
    
    async def flag_review(self, review_id: str, reason: str) -> bool:
        """Flag a review for moderation"""
        try:
            result = await self.reviews_collection.update_one(
                {'id': review_id},
                {
                    '$set': {
                        'status': 'flagged',
                        'flag_reason': reason,
                        'flagged_at': datetime.utcnow(),
                        'updated_at': datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error flagging review: {e}")
            return False
    
    async def vote_helpful(self, review_id: str, helpful: bool) -> bool:
        """Vote on review helpfulness"""
        try:
            if helpful:
                result = await self.reviews_collection.update_one(
                    {'id': review_id},
                    {
                        '$inc': {
                            'helpful_votes': 1,
                            'total_votes': 1
                        },
                        '$set': {'updated_at': datetime.utcnow()}
                    }
                )
            else:
                result = await self.reviews_collection.update_one(
                    {'id': review_id},
                    {
                        '$inc': {'total_votes': 1},
                        '$set': {'updated_at': datetime.utcnow()}
                    }
                )
            
            return result.modified_count > 0
            
        except Exception as e:
            logger.error(f"Error voting on review: {e}")
            return False