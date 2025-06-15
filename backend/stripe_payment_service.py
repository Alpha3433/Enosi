import stripe
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

logger = logging.getLogger(__name__)

class StripePaymentService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.vendors_collection = db.vendors
        self.subscriptions_collection = db.vendor_subscriptions
        self.bookings_collection = db.bookings
        self.transactions_collection = db.transactions
        self.customers_collection = db.customers
        
        # Subscription tier configuration
        self.subscription_tiers = {
            "basic": {
                "name": "Basic Plan",
                "price": 29.99,
                "currency": "aud",
                "interval": "month",
                "features": [
                    "Basic vendor profile",
                    "Up to 5 portfolio images",
                    "Basic search visibility",
                    "Email support"
                ]
            },
            "premium": {
                "name": "Premium Plan", 
                "price": 79.99,
                "currency": "aud",
                "interval": "month",
                "features": [
                    "Enhanced vendor profile",
                    "Unlimited portfolio images",
                    "Priority search placement",
                    "Advanced analytics",
                    "Chat support",
                    "Featured vendor badge"
                ]
            },
            "pro": {
                "name": "Pro Plan",
                "price": 149.99,
                "currency": "aud", 
                "interval": "month",
                "features": [
                    "Premium vendor profile",
                    "Unlimited portfolio & videos",
                    "Top search placement",
                    "Advanced analytics & insights",
                    "Priority support",
                    "Premium vendor badge",
                    "Lead generation tools",
                    "Custom booking forms"
                ]
            }
        }
    
    async def create_stripe_prices(self):
        """Create Stripe price objects for subscription tiers"""
        try:
            for tier, config in self.subscription_tiers.items():
                # Check if price already exists
                prices = stripe.Price.list(active=True, lookup_keys=[f"vendor_{tier}"])
                
                if not prices.data:
                    # Create product first
                    product = stripe.Product.create(
                        name=config["name"],
                        description=f"Wedding marketplace vendor subscription - {config['name']}",
                        metadata={"tier": tier}
                    )
                    
                    # Create price
                    price = stripe.Price.create(
                        product=product.id,
                        unit_amount=int(config["price"] * 100),  # Convert to cents
                        currency=config["currency"],
                        recurring={"interval": config["interval"]},
                        lookup_key=f"vendor_{tier}",
                        metadata={"tier": tier}
                    )
                    
                    # Update our configuration with Stripe price ID
                    self.subscription_tiers[tier]["price_id"] = price.id
                    self.subscription_tiers[tier]["product_id"] = product.id
                    
                    logger.info(f"Created Stripe price for {tier}: {price.id}")
                else:
                    # Use existing price
                    self.subscription_tiers[tier]["price_id"] = prices.data[0].id
                    self.subscription_tiers[tier]["product_id"] = prices.data[0].product
                    
        except Exception as e:
            logger.error(f"Error creating Stripe prices: {e}")
            raise
    
    async def onboard_vendor(self, vendor_id: str, business_name: str, email: str) -> Dict[str, Any]:
        """Create Stripe Connect Express account for vendor"""
        try:
            # Check if vendor already has Stripe account
            vendor = await self.vendors_collection.find_one({"id": vendor_id})
            if vendor and vendor.get("stripe_account_id"):
                # Create new onboarding link for existing account
                account_link = stripe.AccountLink.create(
                    account=vendor["stripe_account_id"],
                    refresh_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/vendor/reauth",
                    return_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/vendor/dashboard",
                    type="account_onboarding"
                )
                return {
                    "account_id": vendor["stripe_account_id"],
                    "onboarding_url": account_link.url,
                    "vendor_id": vendor_id
                }
            
            # Create new Stripe Connect Express account
            account = stripe.Account.create(
                type="express",
                capabilities={
                    "card_payments": {"requested": True},
                    "transfers": {"requested": True}
                },
                business_profile={
                    "name": business_name,
                    "url": f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}"
                },
                email=email,
                metadata={"vendor_id": vendor_id}
            )
            
            # Create onboarding link
            account_link = stripe.AccountLink.create(
                account=account.id,
                refresh_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/vendor/reauth",
                return_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/vendor/dashboard",
                type="account_onboarding"
            )
            
            # Update vendor record with Stripe account ID
            await self.vendors_collection.update_one(
                {"id": vendor_id},
                {
                    "$set": {
                        "stripe_account_id": account.id,
                        "onboarding_complete": False,
                        "payments_enabled": False,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            return {
                "account_id": account.id,
                "onboarding_url": account_link.url,
                "vendor_id": vendor_id
            }
            
        except Exception as e:
            logger.error(f"Error onboarding vendor {vendor_id}: {e}")
            raise
    
    async def create_vendor_subscription(self, vendor_id: str, tier: str) -> Dict[str, Any]:
        """Create vendor subscription with Stripe"""
        try:
            # Ensure prices are created
            await self.create_stripe_prices()
            
            vendor = await self.vendors_collection.find_one({"id": vendor_id})
            if not vendor:
                raise ValueError("Vendor not found")
            
            tier_config = self.subscription_tiers.get(tier)
            if not tier_config:
                raise ValueError("Invalid subscription tier")
            
            # Create or get Stripe customer
            stripe_customer_id = vendor.get("stripe_customer_id")
            if not stripe_customer_id:
                customer = stripe.Customer.create(
                    email=vendor["email"],
                    name=f"{vendor.get('business_name', '')}",
                    metadata={"vendor_id": vendor_id, "user_type": "vendor"}
                )
                stripe_customer_id = customer.id
                
                # Update vendor with customer ID
                await self.vendors_collection.update_one(
                    {"id": vendor_id},
                    {"$set": {"stripe_customer_id": stripe_customer_id}}
                )
            
            # Create subscription
            subscription = stripe.Subscription.create(
                customer=stripe_customer_id,
                items=[{"price": tier_config["price_id"]}],
                payment_behavior="default_incomplete",
                payment_settings={"save_default_payment_method": "on_subscription"},
                expand=["latest_invoice.payment_intent"],
                metadata={"vendor_id": vendor_id, "tier": tier}
            )
            
            # Store subscription in database
            subscription_doc = {
                "id": f"sub_{vendor_id}_{int(datetime.utcnow().timestamp())}",
                "vendor_id": vendor_id,
                "stripe_subscription_id": subscription.id,
                "stripe_customer_id": stripe_customer_id,
                "tier": tier,
                "status": subscription.status,
                "current_period_start": datetime.fromtimestamp(subscription.current_period_start),
                "current_period_end": datetime.fromtimestamp(subscription.current_period_end),
                "amount": tier_config["price"],
                "currency": tier_config["currency"],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await self.subscriptions_collection.insert_one(subscription_doc)
            
            return {
                "subscription_id": subscription.id,
                "client_secret": subscription.latest_invoice.payment_intent.client_secret,
                "status": subscription.status,
                "tier": tier,
                "amount": tier_config["price"]
            }
            
        except Exception as e:
            logger.error(f"Error creating subscription for vendor {vendor_id}: {e}")
            raise
    
    async def create_booking_deposit(self, customer_id: str, vendor_id: str, amount: float, 
                                   service_date: str, service_description: str) -> Dict[str, Any]:
        """Create booking deposit payment with escrow functionality"""
        try:
            # Get vendor Stripe account
            vendor = await self.vendors_collection.find_one({"id": vendor_id})
            if not vendor or not vendor.get("stripe_account_id"):
                raise ValueError("Vendor not properly onboarded to Stripe")
            
            if not vendor.get("payments_enabled", False):
                raise ValueError("Vendor payments not enabled")
            
            # Calculate platform fee (10%)
            platform_fee = int(amount * 0.10 * 100)  # Convert to cents
            total_amount = int(amount * 100)  # Convert to cents
            
            # Create payment intent with application fee
            payment_intent = stripe.PaymentIntent.create(
                amount=total_amount,
                currency="aud",
                application_fee_amount=platform_fee,
                transfer_data={
                    "destination": vendor["stripe_account_id"]
                },
                metadata={
                    "customer_id": customer_id,
                    "vendor_id": vendor_id,
                    "service_date": service_date,
                    "type": "booking_deposit",
                    "service_description": service_description
                }
            )
            
            # Create booking record
            booking_doc = {
                "id": f"booking_{customer_id}_{vendor_id}_{int(datetime.utcnow().timestamp())}",
                "customer_id": customer_id,
                "vendor_id": vendor_id,
                "amount": amount,
                "platform_fee": amount * 0.10,
                "vendor_amount": amount * 0.90,
                "service_date": service_date,
                "service_description": service_description,
                "payment_intent_id": payment_intent.id,
                "status": "pending_payment",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await self.bookings_collection.insert_one(booking_doc)
            
            return {
                "booking_id": booking_doc["id"],
                "payment_intent_id": payment_intent.id,
                "client_secret": payment_intent.client_secret,
                "amount": amount,
                "platform_fee": amount * 0.10,
                "vendor_amount": amount * 0.90
            }
            
        except Exception as e:
            logger.error(f"Error creating booking deposit: {e}")
            raise
    
    async def create_customer_portal_session(self, customer_id: str) -> str:
        """Create Stripe customer portal session for subscription management"""
        try:
            # Get customer's Stripe customer ID
            vendor = await self.vendors_collection.find_one({"id": customer_id})
            if not vendor or not vendor.get("stripe_customer_id"):
                raise ValueError("Customer not found or no Stripe customer ID")
            
            session = stripe.billing_portal.Session.create(
                customer=vendor["stripe_customer_id"],
                return_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/vendor/dashboard"
            )
            
            return session.url
            
        except Exception as e:
            logger.error(f"Error creating customer portal session: {e}")
            raise
    
    async def handle_webhook_event(self, event_type: str, event_data: Dict[str, Any]) -> bool:
        """Handle Stripe webhook events"""
        try:
            if event_type == "payment_intent.succeeded":
                payment_intent = event_data["object"]
                await self._handle_payment_success(payment_intent)
                
            elif event_type == "invoice.payment_succeeded":
                invoice = event_data["object"]
                await self._handle_subscription_payment_success(invoice)
                
            elif event_type == "account.updated":
                account = event_data["object"]
                await self._handle_account_update(account)
                
            elif event_type == "customer.subscription.updated":
                subscription = event_data["object"]
                await self._handle_subscription_update(subscription)
                
            return True
            
        except Exception as e:
            logger.error(f"Error handling webhook event {event_type}: {e}")
            return False
    
    async def _handle_payment_success(self, payment_intent: Dict[str, Any]):
        """Handle successful payment intent"""
        # Update booking status
        await self.bookings_collection.update_one(
            {"payment_intent_id": payment_intent["id"]},
            {
                "$set": {
                    "status": "paid",
                    "paid_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Log transaction
        transaction_doc = {
            "id": f"txn_{int(datetime.utcnow().timestamp())}",
            "payment_intent_id": payment_intent["id"],
            "amount": payment_intent["amount"] / 100,
            "currency": payment_intent["currency"],
            "status": "completed",
            "metadata": payment_intent.get("metadata", {}),
            "processed_at": datetime.utcnow()
        }
        
        await self.transactions_collection.insert_one(transaction_doc)
    
    async def _handle_subscription_payment_success(self, invoice: Dict[str, Any]):
        """Handle successful subscription payment"""
        # Update subscription status
        await self.subscriptions_collection.update_one(
            {"stripe_subscription_id": invoice["subscription"]},
            {
                "$set": {
                    "status": "active",
                    "last_payment": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    async def _handle_account_update(self, account: Dict[str, Any]):
        """Handle Stripe account updates"""
        # Update vendor onboarding status
        if account.get("charges_enabled") and account.get("payouts_enabled"):
            await self.vendors_collection.update_one(
                {"stripe_account_id": account["id"]},
                {
                    "$set": {
                        "onboarding_complete": True,
                        "payments_enabled": True,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
    
    async def _handle_subscription_update(self, subscription: Dict[str, Any]):
        """Handle subscription updates"""
        await self.subscriptions_collection.update_one(
            {"stripe_subscription_id": subscription["id"]},
            {
                "$set": {
                    "status": subscription["status"],
                    "current_period_start": datetime.fromtimestamp(subscription["current_period_start"]),
                    "current_period_end": datetime.fromtimestamp(subscription["current_period_end"]),
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    async def get_vendor_subscription(self, vendor_id: str) -> Optional[Dict[str, Any]]:
        """Get vendor's current subscription"""
        return await self.subscriptions_collection.find_one(
            {"vendor_id": vendor_id},
            sort=[("created_at", -1)]
        )
    
    async def get_vendor_bookings(self, vendor_id: str) -> List[Dict[str, Any]]:
        """Get vendor's bookings"""
        cursor = self.bookings_collection.find({"vendor_id": vendor_id})
        return await cursor.to_list(length=None)
    
    async def get_customer_bookings(self, customer_id: str) -> List[Dict[str, Any]]:
        """Get customer's bookings"""
        cursor = self.bookings_collection.find({"customer_id": customer_id})
        return await cursor.to_list(length=None)