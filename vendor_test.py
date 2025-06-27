import requests
import json

def test_vendor_endpoints():
    """Test vendor endpoints for photo gallery functionality"""
    base_url = "https://4665e1cb-57c5-4afa-8c28-cdcf53af8f7d.preview.emergentagent.com/api"
    
    print("\n🚀 Testing Vendor Endpoints for Photo Gallery")
    print("=" * 80)
    
    # Test 1: Get all vendors
    print("\n🔍 Testing GET /vendors")
    try:
        response = requests.get(f"{base_url}/vendors")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            vendors = response.json()
            print(f"Found {len(vendors)} vendors")
            if len(vendors) > 0:
                vendor_id = vendors[0]['id']
                print(f"First vendor ID: {vendor_id}")
                
                # Test 2: Get vendor by ID
                print(f"\n🔍 Testing GET /vendors/{vendor_id}")
                vendor_response = requests.get(f"{base_url}/vendors/{vendor_id}")
                print(f"Status Code: {vendor_response.status_code}")
                if vendor_response.status_code == 200:
                    vendor = vendor_response.json()
                    print(f"Vendor Name: {vendor.get('business_name', 'N/A')}")
                    print(f"Gallery Images: {vendor.get('gallery_images', [])}")
                else:
                    print(f"Failed to get vendor details: {vendor_response.text}")
        else:
            print(f"Failed to get vendors: {response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")
    
    # Test 3: Test enhanced search
    print("\n🔍 Testing POST /search/vendors/enhanced")
    try:
        search_data = {
            "location": "Sydney",
            "category": "photographer",
            "price_min": 1000,
            "price_max": 5000
        }
        search_response = requests.post(f"{base_url}/search/vendors/enhanced", json=search_data)
        print(f"Status Code: {search_response.status_code}")
        if search_response.status_code == 200:
            search_results = search_response.json()
            print(f"Search Results: {json.dumps(search_results, indent=2)}")
        else:
            print(f"Failed to search vendors: {search_response.text}")
    except Exception as e:
        print(f"Error: {str(e)}")
    
    print("\n" + "=" * 80)

if __name__ == "__main__":
    test_vendor_endpoints()