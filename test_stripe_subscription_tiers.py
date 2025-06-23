import requests
import json
import sys

def test_stripe_payment_system():
    """Test the Stripe payment system implementation"""
    base_url = "https://232cf5b1-b2b3-4423-9728-8803f6e29464.preview.emergentagent.com/api"
    tests_passed = 0
    tests_run = 0
    
    # 1. Test Subscription Tier Information
    print("\n💳 Testing Subscription Tier Information")
    print("-" * 80)
    
    tests_run += 1
    url = f"{base_url}/payments/subscription-tiers"
    print(f"Testing GET {url}")
    
    try:
        response = requests.get(url)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
            tests_passed += 1
            data = response.json()
            print(f"Response data: {json.dumps(data, indent=2)}")
            
            # Verify the tiers
            if 'tiers' in data:
                tiers = data['tiers']
                print(f"Found {len(tiers)} subscription tiers")
                
                # Check for expected tiers
                expected_tiers = ['basic', 'premium', 'pro']
                found_tiers = list(tiers.keys())
                
                for tier in expected_tiers:
                    if tier in found_tiers:
                        print(f"✅ Found expected tier: {tier}")
                    else:
                        print(f"❌ Missing expected tier: {tier}")
                
                # Check tier details
                for tier_name, tier_data in tiers.items():
                    print(f"\nTier: {tier_name}")
                    print(f"  Name: {tier_data.get('name')}")
                    print(f"  Price: {tier_data.get('price')}")
                    print(f"  Features: {len(tier_data.get('features', []))} items")
            else:
                print("❌ No tiers found in response")
        else:
            print(f"❌ Failed with status code: {response.status_code}")
            print(f"Response: {response.text}")
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    # Print results
    print("\n📊 Tests passed: {}/{}".format(tests_passed, tests_run))
    print("=" * 80)
    
    return tests_passed, tests_run

if __name__ == "__main__":
    passed, total = test_stripe_payment_system()
    sys.exit(0 if passed == total else 1)