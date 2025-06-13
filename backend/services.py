import stripe
import boto3
import requests
import os
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from .models import VendorProfile, VendorStatus, SubscriptionPlan, ABNValidation, VendorAnalytics
import logging

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Configure AWS S3
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION", "ap-southeast-2")
)

class ABNValidationService:
    """Service for validating Australian Business Numbers"""
    
    @staticmethod
    async def validate_abn(abn: str) -> ABNValidation:
        """Validate ABN using Australian Business Register API"""
        try:
            # Remove spaces and validate format
            clean_abn = abn.replace(" ", "").replace("-", "")
            
            if len(clean_abn) != 11 or not clean_abn.isdigit():
                raise ValueError("Invalid ABN format")
            
            # Mock implementation - in production, use actual ABR API
            # ABR API requires registration: https://abr.business.gov.au/Tools/WebServices
            
            # For now, return mock validation for demo purposes
            return ABNValidation(
                abn=clean_abn,
                business_name=f"Mock Business for ABN {clean_abn}",
                business_status="Active",
                gst_registered=True
            )
            
        except Exception as e:
            logger.error(f"ABN validation failed for {abn}: {str(e)}")
            raise ValueError(f"ABN validation failed: {str(e)}")

class FileUploadService:
    """Service for handling file uploads to S3"""
    
    @staticmethod
    async def upload_file(file_content: bytes, file_name: str, content_type: str, 
                         upload_purpose: str) -> Dict[str, str]:
        """Upload file to S3 and return URL"""
        try:
            bucket_name = os.getenv("S3_BUCKET_NAME", "enosi-uploads")
            
            # Generate unique file name
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            safe_filename = f"{upload_purpose}/{timestamp}_{file_name}"
            
            # Upload to S3
            s3_client.put_object(
                Bucket=bucket_name,
                Key=safe_filename,
                Body=file_content,
                ContentType=content_type,
                ACL='public-read'
            )
            
            # Generate public URL
            file_url = f"https://{bucket_name}.s3.{os.getenv('AWS_REGION', 'ap-southeast-2')}.amazonaws.com/{safe_filename}"
            
            return {
                "file_url": file_url,
                "file_name": safe_filename,
                "bucket": bucket_name
            }
            
        except Exception as e:
            logger.error(f"File upload failed: {str(e)}")
            raise ValueError(f"File upload failed: {str(e)}")

class PaymentService:
    """Service for handling Stripe payments and subscriptions"""
    
    SUBSCRIPTION_PRICES = {
        SubscriptionPlan.STARTER: {"price": 79, "quotes": 10, "featured": 0},
        SubscriptionPlan.PROFESSIONAL: {"price": 149, "quotes": 25, "featured": 2},
        SubscriptionPlan.PREMIUM: {"price": 299, "quotes": 50, "featured": 5}
    }
    
    @staticmethod
    async def create_customer(email: str, name: str) -> str:
        """Create Stripe customer"""
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name
            )
            return customer.id
        except Exception as e:
            logger.error(f"Failed to create Stripe customer: {str(e)}")
            raise ValueError(f"Payment setup failed: {str(e)}")
    
    @staticmethod
    async def create_subscription(customer_id: str, plan: SubscriptionPlan) -> Dict[str, Any]:
        """Create Stripe subscription for vendor"""
        try:
            # In production, these would be actual Stripe Price IDs
            price_id = f"price_{plan.value}_monthly"  # Mock price ID
            
            subscription = stripe.Subscription.create(
                customer=customer_id,
                items=[{"price": price_id}],
                payment_behavior="default_incomplete",
                expand=["latest_invoice.payment_intent"]
            )
            
            return {
                "subscription_id": subscription.id,
                "client_secret": subscription.latest_invoice.payment_intent.client_secret,
                "status": subscription.status
            }
        except Exception as e:
            logger.error(f"Failed to create subscription: {str(e)}")
            raise ValueError(f"Subscription creation failed: {str(e)}")
    
    @staticmethod
    async def cancel_subscription(subscription_id: str) -> bool:
        """Cancel Stripe subscription"""
        try:
            stripe.Subscription.delete(subscription_id)
            return True
        except Exception as e:
            logger.error(f"Failed to cancel subscription: {str(e)}")
            return False

class VendorAnalyticsService:
    """Service for tracking vendor analytics"""
    
    @staticmethod
    async def track_profile_view(db: AsyncIOMotorDatabase, vendor_id: str):
        """Track when vendor profile is viewed"""
        try:
            # Get current month analytics
            now = datetime.utcnow()
            period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            await db.vendor_analytics.update_one(
                {
                    "vendor_id": vendor_id,
                    "period_start": period_start
                },
                {
                    "$inc": {"profile_views": 1},
                    "$set": {
                        "period_end": period_start + timedelta(days=32),
                        "updated_at": now
                    }
                },
                upsert=True
            )
        except Exception as e:
            logger.error(f"Failed to track profile view: {str(e)}")
    
    @staticmethod
    async def track_quote_request(db: AsyncIOMotorDatabase, vendor_id: str):
        """Track when vendor receives quote request"""
        try:
            now = datetime.utcnow()
            period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            await db.vendor_analytics.update_one(
                {
                    "vendor_id": vendor_id,
                    "period_start": period_start
                },
                {
                    "$inc": {"quote_requests_received": 1},
                    "$set": {
                        "period_end": period_start + timedelta(days=32),
                        "updated_at": now
                    }
                },
                upsert=True
            )
        except Exception as e:
            logger.error(f"Failed to track quote request: {str(e)}")
    
    @staticmethod
    async def track_quote_response(db: AsyncIOMotorDatabase, vendor_id: str, response_time_hours: float):
        """Track when vendor responds to quote"""
        try:
            now = datetime.utcnow()
            period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            # Get current analytics to calculate new average
            current = await db.vendor_analytics.find_one({
                "vendor_id": vendor_id,
                "period_start": period_start
            })
            
            if current:
                # Calculate new average response time
                total_responses = current.get("quotes_responded", 0) + 1
                current_avg = current.get("response_time_avg_hours", 0)
                new_avg = ((current_avg * (total_responses - 1)) + response_time_hours) / total_responses
            else:
                new_avg = response_time_hours
                total_responses = 1
            
            await db.vendor_analytics.update_one(
                {
                    "vendor_id": vendor_id,
                    "period_start": period_start
                },
                {
                    "$inc": {"quotes_responded": 1},
                    "$set": {
                        "response_time_avg_hours": new_avg,
                        "period_end": period_start + timedelta(days=32),
                        "updated_at": now
                    }
                },
                upsert=True
            )
        except Exception as e:
            logger.error(f"Failed to track quote response: {str(e)}")
    
    @staticmethod
    async def get_vendor_analytics(db: AsyncIOMotorDatabase, vendor_id: str, 
                                 period_start: Optional[datetime] = None) -> Optional[VendorAnalytics]:
        """Get vendor analytics for specified period"""
        try:
            if not period_start:
                # Default to current month
                now = datetime.utcnow()
                period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            analytics = await db.vendor_analytics.find_one({
                "vendor_id": vendor_id,
                "period_start": period_start
            })
            
            if analytics:
                return VendorAnalytics(**analytics)
            return None
            
        except Exception as e:
            logger.error(f"Failed to get vendor analytics: {str(e)}")
            return None

class NotificationService:
    """Service for sending email notifications"""
    
    @staticmethod
    async def send_vendor_approval_email(email: str, business_name: str, approved: bool):
        """Send vendor approval/rejection email"""
        try:
            # In production, use SendGrid or similar email service
            # For now, just log the notification
            status = "approved" if approved else "rejected"
            logger.info(f"Email notification: Vendor {business_name} ({email}) has been {status}")
            
            # TODO: Implement actual email sending
            # sendgrid_client.send_email(...)
            
        except Exception as e:
            logger.error(f"Failed to send email notification: {str(e)}")
    
    @staticmethod
    async def send_quote_notification_email(email: str, vendor_name: str, quote_id: str):
        """Send quote response notification to couple"""
        try:
            logger.info(f"Email notification: Quote response from {vendor_name} for quote {quote_id} sent to {email}")
            
            # TODO: Implement actual email sending
            
        except Exception as e:
            logger.error(f"Failed to send quote notification: {str(e)}")

class AdminService:
    """Service for admin operations"""
    
    @staticmethod
    async def get_platform_metrics(db: AsyncIOMotorDatabase) -> Dict[str, Any]:
        """Get platform-wide metrics for admin dashboard"""
        try:
            # Get vendor counts
            total_vendors = await db.vendor_profiles.count_documents({})
            active_vendors = await db.vendor_profiles.count_documents({"status": VendorStatus.APPROVED})
            pending_vendors = await db.vendor_profiles.count_documents({"status": VendorStatus.PENDING})
            
            # Get couple counts
            total_couples = await db.users.count_documents({"user_type": "couple"})
            active_couples = await db.users.count_documents({
                "user_type": "couple", 
                "is_active": True
            })
            
            # Get quote counts
            total_quotes = await db.quote_requests.count_documents({})
            processed_quotes = await db.quote_requests.count_documents({
                "status": {"$ne": "pending"}
            })
            
            # Calculate revenue (mock for now)
            monthly_revenue = active_vendors * 149  # Assume average plan
            
            return {
                "total_vendors": total_vendors,
                "active_vendors": active_vendors,
                "pending_vendors": pending_vendors,
                "total_couples": total_couples,
                "active_couples": active_couples,
                "total_quotes": total_quotes,
                "processed_quotes": processed_quotes,
                "monthly_revenue": monthly_revenue,
                "conversion_rate": (processed_quotes / total_quotes * 100) if total_quotes > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Failed to get platform metrics: {str(e)}")
            return {}
    
    @staticmethod
    async def approve_vendor(db: AsyncIOMotorDatabase, vendor_id: str, admin_id: str) -> bool:
        """Approve vendor application"""
        try:
            result = await db.vendor_profiles.update_one(
                {"id": vendor_id},
                {
                    "$set": {
                        "status": VendorStatus.APPROVED,
                        "verified": True,
                        "approved_at": datetime.utcnow(),
                        "approved_by": admin_id,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                # Log admin action
                await db.admin_actions.insert_one({
                    "admin_id": admin_id,
                    "action_type": "approve_vendor",
                    "target_id": vendor_id,
                    "created_at": datetime.utcnow()
                })
                return True
            return False
            
        except Exception as e:
            logger.error(f"Failed to approve vendor: {str(e)}")
            return False
    
    @staticmethod
    async def reject_vendor(db: AsyncIOMotorDatabase, vendor_id: str, admin_id: str, reason: str) -> bool:
        """Reject vendor application"""
        try:
            result = await db.vendor_profiles.update_one(
                {"id": vendor_id},
                {
                    "$set": {
                        "status": VendorStatus.REJECTED,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                # Log admin action
                await db.admin_actions.insert_one({
                    "admin_id": admin_id,
                    "action_type": "reject_vendor",
                    "target_id": vendor_id,
                    "reason": reason,
                    "created_at": datetime.utcnow()
                })
                return True
            return False
            
        except Exception as e:
            logger.error(f"Failed to reject vendor: {str(e)}")
            return False