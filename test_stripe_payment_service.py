import unittest
from unittest.mock import patch, MagicMock
import json
import sys
import os

# Add the app directory to the path
sys.path.append('/app')

# Mock the Stripe API
class MockStripe:
    def __init__(self):
        self.api_key = "sk_test_mock"
        self.Account = MagicMock()
        self.AccountLink = MagicMock()
        self.Customer = MagicMock()
        self.Subscription = MagicMock()
        self.PaymentIntent = MagicMock()
        self.Price = MagicMock()
        self.Product = MagicMock()
        self.Webhook = MagicMock()
        self.billing_portal = MagicMock()
        
        # Setup mock responses
        self.Account.create.return_value = MagicMock(id="acct_mock123")
        self.AccountLink.create.return_value = MagicMock(url="https://connect.stripe.com/mock")
        self.Customer.create.return_value = MagicMock(id="cus_mock123")
        self.Subscription.create.return_value = MagicMock(
            id="sub_mock123",
            status="active",
            current_period_start=1623456789,
            current_period_end=1626048789,
            latest_invoice=MagicMock(payment_intent=MagicMock(client_secret="pi_mock_secret"))
        )
        self.PaymentIntent.create.return_value = MagicMock(
            id="pi_mock123",
            client_secret="pi_mock_secret",
            amount=50000,
            currency="aud"
        )
        self.billing_portal.Session.create.return_value = MagicMock(url="https://billing.stripe.com/mock")
        
        # Setup mock webhook verification
        self.Webhook.construct_event.side_effect = Exception("Invalid signature")

# Test the Stripe payment system implementation
class TestStripePaymentSystem(unittest.TestCase):
    def setUp(self):
        # Mock the Stripe module
        self.stripe_patcher = patch('backend.stripe_payment_service.stripe', MockStripe())
        self.mock_stripe = self.stripe_patcher.start()
        
        # Import the StripePaymentService
        from backend.stripe_payment_service import StripePaymentService
        
        # Create a mock database
        self.mock_db = MagicMock()
        self.mock_db.vendors = MagicMock()
        self.mock_db.subscriptions_collection = MagicMock()
        self.mock_db.bookings_collection = MagicMock()
        self.mock_db.transactions_collection = MagicMock()
        self.mock_db.customers_collection = MagicMock()
        
        # Create the payment service
        self.payment_service = StripePaymentService(db=self.mock_db)
    
    def tearDown(self):
        self.stripe_patcher.stop()
    
    def test_subscription_tiers(self):
        """Test the subscription tiers"""
        tiers = self.payment_service.subscription_tiers
        
        # Check if all expected tiers are present
        self.assertIn('basic', tiers)
        self.assertIn('premium', tiers)
        self.assertIn('pro', tiers)
        
        # Check tier details
        basic_tier = tiers['basic']
        self.assertEqual(basic_tier['name'], "Basic Plan")
        self.assertEqual(basic_tier['price'], 29.99)
        self.assertEqual(basic_tier['currency'], "aud")
        self.assertGreater(len(basic_tier['features']), 0)
        
        premium_tier = tiers['premium']
        self.assertEqual(premium_tier['name'], "Premium Plan")
        self.assertEqual(premium_tier['price'], 79.99)
        self.assertEqual(premium_tier['currency'], "aud")
        self.assertGreater(len(premium_tier['features']), 0)
        
        pro_tier = tiers['pro']
        self.assertEqual(pro_tier['name'], "Pro Plan")
        self.assertEqual(pro_tier['price'], 149.99)
        self.assertEqual(pro_tier['currency'], "aud")
        self.assertGreater(len(pro_tier['features']), 0)
        
        print("✅ Subscription tiers test passed")
    
    def test_vendor_onboarding(self):
        """Test vendor onboarding"""
        # Setup mock vendor
        self.mock_db.vendors_collection.find_one.return_value = None
        
        # Test onboarding
        result = self.payment_service.onboard_vendor(
            vendor_id="test_vendor_123",
            business_name="Test Wedding Photography",
            email="vendor@example.com"
        )
        
        # Check result
        self.assertIn('account_id', result)
        self.assertIn('onboarding_url', result)
        self.assertIn('vendor_id', result)
        self.assertEqual(result['vendor_id'], "test_vendor_123")
        
        print("✅ Vendor onboarding test passed")
    
    def test_create_vendor_subscription(self):
        """Test creating a vendor subscription"""
        # Setup mock vendor
        self.mock_db.vendors_collection.find_one.return_value = {
            "id": "test_vendor_123",
            "email": "vendor@example.com",
            "business_name": "Test Wedding Photography"
        }
        
        # Test subscription creation
        result = self.payment_service.create_vendor_subscription(
            vendor_id="test_vendor_123",
            tier="premium"
        )
        
        # Check result
        self.assertIn('subscription_id', result)
        self.assertIn('client_secret', result)
        self.assertIn('status', result)
        self.assertIn('tier', result)
        self.assertEqual(result['tier'], "premium")
        
        print("✅ Vendor subscription creation test passed")
    
    def test_create_booking_deposit(self):
        """Test creating a booking deposit"""
        # Setup mock vendor
        self.mock_db.vendors_collection.find_one.return_value = {
            "id": "test_vendor_123",
            "stripe_account_id": "acct_mock123",
            "payments_enabled": True
        }
        
        # Test booking deposit creation
        result = self.payment_service.create_booking_deposit(
            customer_id="test_customer_123",
            vendor_id="test_vendor_123",
            amount=500.00,
            service_date="2025-08-15",
            service_description="Wedding Photography Package"
        )
        
        # Check result
        self.assertIn('booking_id', result)
        self.assertIn('payment_intent_id', result)
        self.assertIn('client_secret', result)
        self.assertIn('amount', result)
        self.assertEqual(result['amount'], 500.00)
        
        print("✅ Booking deposit creation test passed")
    
    def test_customer_portal(self):
        """Test customer portal creation"""
        # Setup mock vendor
        self.mock_db.vendors_collection.find_one.return_value = {
            "id": "test_vendor_123",
            "stripe_customer_id": "cus_mock123"
        }
        
        # Test customer portal creation
        result = self.payment_service.create_customer_portal_session(
            customer_id="test_vendor_123"
        )
        
        # Check result
        self.assertEqual(result, "https://billing.stripe.com/mock")
        
        print("✅ Customer portal creation test passed")
    
    def test_webhook_handler(self):
        """Test webhook handler"""
        # Test payment intent succeeded event
        event_data = {
            "object": {
                "id": "pi_mock123",
                "amount": 50000,
                "currency": "aud",
                "status": "succeeded",
                "metadata": {
                    "customer_id": "test_customer_123",
                    "vendor_id": "test_vendor_123",
                    "type": "booking_deposit"
                }
            }
        }
        
        result = self.payment_service.handle_webhook_event(
            event_type="payment_intent.succeeded",
            event_data=event_data
        )
        
        self.assertTrue(result)
        
        print("✅ Webhook handler test passed")

if __name__ == "__main__":
    # Run the tests
    test_suite = unittest.TestLoader().loadTestsFromTestCase(TestStripePaymentSystem)
    test_result = unittest.TextTestRunner(verbosity=2).run(test_suite)
    
    # Print summary
    print("\n📊 Test Summary:")
    print(f"Ran {test_result.testsRun} tests")
    print(f"Passed: {test_result.testsRun - len(test_result.errors) - len(test_result.failures)}")
    print(f"Failed: {len(test_result.failures)}")
    print(f"Errors: {len(test_result.errors)}")
    
    # Exit with appropriate code
    sys.exit(0 if test_result.wasSuccessful() else 1)