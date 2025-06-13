import requests
import sys
import json
import uuid
from datetime import datetime

class EnosiAPITester:
    def __init__(self, base_url="https://d250d48b-5e76-4caf-a964-617b53fc810c.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.couple_user = None
        self.vendor_user = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test the health check endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "health",
            200
        )

    def test_register_couple(self):
        """Test couple registration"""
        unique_id = str(uuid.uuid4())[:8]
        email = f"couple_{unique_id}@test.com"
        
        data = {
            "email": email,
            "password": "Password123!",
            "first_name": "Test",
            "last_name": "Couple",
            "phone": "1234567890",
            "user_type": "couple"
        }
        
        success, response = self.run_test(
            "Register Couple",
            "POST",
            "auth/register",
            200,
            data=data
        )
        
        if success:
            self.couple_user = {
                "email": email,
                "password": "Password123!"
            }
            print(f"Created couple user: {email}")
        
        return success, response

    def test_register_vendor(self):
        """Test vendor registration"""
        unique_id = str(uuid.uuid4())[:8]
        email = f"vendor_{unique_id}@test.com"
        
        data = {
            "email": email,
            "password": "Password123!",
            "first_name": "Test",
            "last_name": "Vendor",
            "phone": "1234567890",
            "user_type": "vendor"
        }
        
        success, response = self.run_test(
            "Register Vendor",
            "POST",
            "auth/register",
            200,
            data=data
        )
        
        if success:
            self.vendor_user = {
                "email": email,
                "password": "Password123!"
            }
            print(f"Created vendor user: {email}")
        
        return success, response

    def test_login(self, user_type="couple"):
        """Test login functionality"""
        user = self.couple_user if user_type == "couple" else self.vendor_user
        
        if not user:
            print(f"❌ No {user_type} user available for login test")
            return False, {}
        
        success, response = self.run_test(
            f"Login as {user_type}",
            "POST",
            "auth/login",
            200,
            data=user
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"Successfully logged in as {user_type}")
            return True, response
        
        return False, {}

    def test_get_user_profile(self):
        """Test getting the current user profile"""
        return self.run_test(
            "Get User Profile",
            "GET",
            "users/me",
            200
        )

    def test_create_vendor_profile(self):
        """Test creating a vendor profile"""
        data = {
            "business_name": "Test Wedding Photography",
            "category": "photographer",
            "description": "Professional wedding photography services",
            "location": "Sydney, NSW",
            "service_areas": ["Sydney", "Blue Mountains", "Central Coast"],
            "pricing_from": 1500,
            "pricing_to": 3000,
            "pricing_type": "range",
            "years_experience": 5,
            "team_size": 2
        }
        
        return self.run_test(
            "Create Vendor Profile",
            "POST",
            "vendors/profile",
            200,
            data=data
        )

    def test_get_vendor_profile(self):
        """Test getting vendor profile"""
        return self.run_test(
            "Get Vendor Profile",
            "GET",
            "vendors/profile",
            200
        )

    def test_update_vendor_profile(self):
        """Test updating vendor profile"""
        data = {
            "description": "Updated description for wedding photography services",
            "pricing_from": 2000
        }
        
        return self.run_test(
            "Update Vendor Profile",
            "PUT",
            "vendors/profile",
            200,
            data=data
        )

    def test_search_vendors(self):
        """Test searching for vendors"""
        params = {
            "category": "photographer",
            "limit": 10
        }
        
        return self.run_test(
            "Search Vendors",
            "GET",
            "vendors",
            200,
            params=params
        )

    def test_get_couple_profile(self):
        """Test getting couple profile"""
        return self.run_test(
            "Get Couple Profile",
            "GET",
            "couples/profile",
            200
        )

    def test_update_couple_profile(self):
        """Test updating couple profile"""
        data = {
            "partner_name": "Partner Name",
            "wedding_date": "2025-06-15T00:00:00.000Z",
            "venue_location": "Sydney Opera House",
            "guest_count": 150,
            "budget": 30000,
            "style_preferences": ["Modern", "Elegant", "Romantic"]
        }
        
        return self.run_test(
            "Update Couple Profile",
            "PUT",
            "couples/profile",
            200,
            data=data
        )

    def test_create_budget_item(self):
        """Test creating a budget item"""
        data = {
            "category": "Photography",
            "item_name": "Wedding Photographer",
            "estimated_cost": 2500,
            "notes": "Need to book 6 months in advance"
        }
        
        return self.run_test(
            "Create Budget Item",
            "POST",
            "planning/budget",
            200,
            data=data
        )

    def test_get_budget_items(self):
        """Test getting budget items"""
        return self.run_test(
            "Get Budget Items",
            "GET",
            "planning/budget",
            200
        )

    def test_create_checklist_item(self):
        """Test creating a checklist item"""
        data = {
            "title": "Book Photographer",
            "description": "Find and book wedding photographer",
            "due_date": "2024-12-01T00:00:00.000Z",
            "category": "Photography",
            "priority": 2
        }
        
        return self.run_test(
            "Create Checklist Item",
            "POST",
            "planning/checklist",
            200,
            data=data
        )

    def test_get_checklist_items(self):
        """Test getting checklist items"""
        return self.run_test(
            "Get Checklist Items",
            "GET",
            "planning/checklist",
            200
        )

    def test_update_checklist_item(self, item_id):
        """Test updating a checklist item"""
        data = {
            "completed": True,
            "priority": 1
        }
        
        return self.run_test(
            "Update Checklist Item",
            "PUT",
            f"planning/checklist/{item_id}",
            200,
            data=data
        )

    def test_create_quote_request(self, vendor_id):
        """Test creating a quote request"""
        data = {
            "vendor_id": vendor_id,
            "wedding_date": "2025-06-15T00:00:00.000Z",
            "guest_count": 150,
            "budget_range": "$2000-$3000",
            "event_details": "Full day wedding photography",
            "additional_notes": "Looking for candid style photography"
        }
        
        return self.run_test(
            "Create Quote Request",
            "POST",
            "quotes/request",
            200,
            data=data
        )

    def test_get_quote_requests(self):
        """Test getting quote requests"""
        return self.run_test(
            "Get Quote Requests",
            "GET",
            "quotes/requests",
            200
        )

def main():
    # Setup
    tester = EnosiAPITester()
    
    # Test basic endpoints
    tester.test_health_check()
    
    # Test authentication
    tester.test_register_couple()
    tester.test_register_vendor()
    
    # Test couple flows
    tester.test_login("couple")
    tester.test_get_user_profile()
    tester.test_get_couple_profile()
    tester.test_update_couple_profile()
    
    # Test planning tools
    tester.test_create_budget_item()
    tester.test_get_budget_items()
    success, response = tester.test_create_checklist_item()
    tester.test_get_checklist_items()
    
    if success and response and 'id' in response:
        tester.test_update_checklist_item(response['id'])
    
    # Test vendor flows
    tester.test_login("vendor")
    tester.test_get_user_profile()
    tester.test_create_vendor_profile()
    tester.test_get_vendor_profile()
    tester.test_update_vendor_profile()
    
    # Test vendor search
    success, vendors = tester.test_search_vendors()
    
    # Test quote requests
    if success and vendors and len(vendors) > 0:
        vendor_id = vendors[0]['id']
        tester.test_login("couple")
        tester.test_create_quote_request(vendor_id)
        tester.test_get_quote_requests()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
