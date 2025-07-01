import requests
import json
import sys
from datetime import datetime

# Get the backend URL from the frontend .env file
BACKEND_URL = "https://b542ea48-edd1-4904-8d51-48ed0469b0b3.preview.emergentagent.com/api"

def test_vendors_endpoint():
    """Test the GET /api/vendors endpoint with various query parameters"""
    print("\n🔍 Testing GET /api/vendors endpoint...")
    
    # Test cases with different query parameters
    test_cases = [
        {"name": "No parameters (default)", "params": {}},
        {"name": "With category", "params": {"category": "photographer"}},
        {"name": "With location", "params": {"location": "Sydney"}},
        {"name": "With limit and skip", "params": {"limit": 5, "skip": 0}},
        {"name": "With multiple parameters", "params": {"category": "venue", "location": "Melbourne", "limit": 3}}
    ]
    
    for test_case in test_cases:
        print(f"\n  Testing: {test_case['name']}")
        try:
            response = requests.get(f"{BACKEND_URL}/vendors", params=test_case['params'])
            
            if response.status_code == 200:
                vendors = response.json()
                print(f"  ✅ Success - Status: {response.status_code}")
                print(f"  📊 Found {len(vendors)} vendors")
                
                # Print sample vendor data
                if vendors:
                    sample = vendors[0]
                    print(f"  📋 Sample vendor: {sample.get('business_name', 'N/A')} ({sample.get('category', 'N/A')})")
                    print(f"  📍 Location: {sample.get('location', 'N/A')}")
                    print(f"  💰 Price range: ${sample.get('pricing_from', 'N/A')} - ${sample.get('pricing_to', 'N/A')}")
                    print(f"  ⭐ Rating: {sample.get('average_rating', 'N/A')}")
            else:
                print(f"  ❌ Failed - Status: {response.status_code}")
                print(f"  Response: {response.text}")
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
    
    return True

def test_vendor_detail_endpoint():
    """Test the GET /api/vendors/{vendor_id} endpoint"""
    print("\n🔍 Testing GET /api/vendors/{vendor_id} endpoint...")
    
    # First, get a list of vendors to find a valid ID
    try:
        response = requests.get(f"{BACKEND_URL}/vendors", params={"limit": 5})
        
        if response.status_code == 200:
            vendors = response.json()
            
            if not vendors:
                print("  ⚠️ No vendors found to test detail endpoint")
                return False
            
            # Test with the first vendor ID
            vendor_id = vendors[0]['id']
            print(f"  Testing with vendor ID: {vendor_id}")
            
            detail_response = requests.get(f"{BACKEND_URL}/vendors/{vendor_id}")
            
            if detail_response.status_code == 200:
                vendor = detail_response.json()
                print(f"  ✅ Success - Status: {detail_response.status_code}")
                print(f"  📋 Vendor: {vendor.get('business_name', 'N/A')}")
                print(f"  📝 Description: {vendor.get('description', 'N/A')[:100]}...")
                print(f"  📍 Location: {vendor.get('location', 'N/A')}")
                print(f"  💰 Price range: ${vendor.get('pricing_from', 'N/A')} - ${vendor.get('pricing_to', 'N/A')}")
                print(f"  ⭐ Rating: {vendor.get('average_rating', 'N/A')}")
                
                # Check if the response contains all fields expected by the frontend
                expected_fields = [
                    'id', 'business_name', 'category', 'description', 'location', 
                    'service_areas', 'pricing_from', 'pricing_to', 'pricing_type', 
                    'years_experience', 'average_rating', 'total_reviews'
                ]
                
                missing_fields = [field for field in expected_fields if field not in vendor]
                
                if missing_fields:
                    print(f"  ⚠️ Warning: Missing expected fields: {', '.join(missing_fields)}")
                else:
                    print(f"  ✅ All expected fields are present in the response")
                
                return True
            else:
                print(f"  ❌ Failed - Status: {detail_response.status_code}")
                print(f"  Response: {detail_response.text}")
        else:
            print(f"  ❌ Failed to get vendors list - Status: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
    
    return False

def test_invalid_vendor_id():
    """Test the GET /api/vendors/{vendor_id} endpoint with an invalid ID"""
    print("\n🔍 Testing GET /api/vendors/{vendor_id} with invalid ID...")
    
    invalid_id = "invalid_vendor_id_12345"
    
    try:
        response = requests.get(f"{BACKEND_URL}/vendors/{invalid_id}")
        
        if response.status_code == 404:
            print(f"  ✅ Success - Correctly returned 404 for invalid vendor ID")
            return True
        else:
            print(f"  ❌ Failed - Expected 404, got {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
    
    return False

def check_database_vendors():
    """Check if there are any vendors in the database"""
    print("\n🔍 Checking for vendors in the database...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/vendors")
        
        if response.status_code == 200:
            vendors = response.json()
            
            if vendors:
                print(f"  ✅ Success - Found {len(vendors)} vendors in the database")
                return True
            else:
                print(f"  ⚠️ Warning - No vendors found in the database")
                return False
        else:
            print(f"  ❌ Failed - Status: {response.status_code}")
            print(f"  Response: {response.text}")
    except Exception as e:
        print(f"  ❌ Error: {str(e)}")
    
    return False

def run_all_tests():
    """Run all vendor API tests"""
    print("🚀 Starting Vendor API Tests")
    print("=" * 80)
    
    tests = [
        {"name": "Vendors Endpoint", "function": test_vendors_endpoint},
        {"name": "Vendor Detail Endpoint", "function": test_vendor_detail_endpoint},
        {"name": "Invalid Vendor ID", "function": test_invalid_vendor_id},
        {"name": "Database Vendors Check", "function": check_database_vendors}
    ]
    
    results = []
    
    for test in tests:
        print(f"\n📋 Running Test: {test['name']}")
        print("-" * 80)
        
        start_time = datetime.now()
        success = test["function"]()
        end_time = datetime.now()
        
        duration = (end_time - start_time).total_seconds()
        
        results.append({
            "name": test["name"],
            "success": success,
            "duration": duration
        })
    
    # Print summary
    print("\n📊 Test Results Summary")
    print("=" * 80)
    
    passed = sum(1 for result in results if result["success"])
    total = len(results)
    
    print(f"Tests Passed: {passed}/{total} ({passed/total*100:.1f}%)")
    print("-" * 80)
    
    for result in results:
        status = "✅ PASSED" if result["success"] else "❌ FAILED"
        print(f"{status} - {result['name']} ({result['duration']:.2f}s)")
    
    print("=" * 80)
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)