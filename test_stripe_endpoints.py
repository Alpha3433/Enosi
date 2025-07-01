import requests
import json

def test_subscription_tiers():
    """Test the subscription tiers endpoint"""
    url = "https://4c0e1cae-d13a-41b5-a0eb-333416e55eed.preview.emergentagent.com/api/payments/subscription-tiers"
    
    print(f"Testing GET {url}")
    
    try:
        response = requests.get(url)
        print(f"Status code: {response.status_code}")
        
        if response.status_code == 200:
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

if __name__ == "__main__":
    test_subscription_tiers()