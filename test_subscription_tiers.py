import sys
import os

# Add the app directory to the path
sys.path.append('/app')

# Import the StripePaymentService
from backend.stripe_payment_service import StripePaymentService

def test_subscription_tiers():
    """Test the subscription tiers"""
    # Create a mock database
    class MockDB:
        def __init__(self):
            self.vendors = None
            self.subscriptions_collection = None
            self.bookings_collection = None
            self.transactions_collection = None
            self.customers_collection = None
    
    # Create the payment service
    payment_service = StripePaymentService(db=MockDB())
    
    # Get the subscription tiers
    tiers = payment_service.subscription_tiers
    
    # Check if all expected tiers are present
    assert 'basic' in tiers, "Basic tier not found"
    assert 'premium' in tiers, "Premium tier not found"
    assert 'pro' in tiers, "Pro tier not found"
    
    # Check tier details
    basic_tier = tiers['basic']
    assert basic_tier['name'] == "Basic Plan", f"Expected 'Basic Plan', got '{basic_tier['name']}'"
    assert basic_tier['price'] == 29.99, f"Expected 29.99, got {basic_tier['price']}"
    assert basic_tier['currency'] == "aud", f"Expected 'aud', got '{basic_tier['currency']}'"
    assert len(basic_tier['features']) > 0, "No features found for basic tier"
    
    premium_tier = tiers['premium']
    assert premium_tier['name'] == "Premium Plan", f"Expected 'Premium Plan', got '{premium_tier['name']}'"
    assert premium_tier['price'] == 79.99, f"Expected 79.99, got {premium_tier['price']}"
    assert premium_tier['currency'] == "aud", f"Expected 'aud', got '{premium_tier['currency']}'"
    assert len(premium_tier['features']) > 0, "No features found for premium tier"
    
    pro_tier = tiers['pro']
    assert pro_tier['name'] == "Pro Plan", f"Expected 'Pro Plan', got '{pro_tier['name']}'"
    assert pro_tier['price'] == 149.99, f"Expected 149.99, got {pro_tier['price']}"
    assert pro_tier['currency'] == "aud", f"Expected 'aud', got '{pro_tier['currency']}'"
    assert len(pro_tier['features']) > 0, "No features found for pro tier"
    
    print("✅ Subscription tiers test passed")
    
    # Print the tiers
    print("\nSubscription Tiers:")
    for tier_name, tier_data in tiers.items():
        print(f"\n{tier_name.upper()} TIER:")
        print(f"  Name: {tier_data['name']}")
        print(f"  Price: ${tier_data['price']} {tier_data['currency'].upper()}")
        print(f"  Features:")
        for feature in tier_data['features']:
            print(f"    - {feature}")
    
    return True

if __name__ == "__main__":
    try:
        success = test_subscription_tiers()
        print("\n📊 Test Summary:")
        print(f"Passed: {1 if success else 0}/1")
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        sys.exit(1)