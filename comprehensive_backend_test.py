import requests
import sys
import json
import uuid
from datetime import datetime, timedelta

class ComprehensiveBackendTester:
    def __init__(self, base_url="https://b542ea48-edd1-4904-8d51-48ed0469b0b3.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.couple_user = None
        self.vendor_user = None
        self.vendor_id = None
        self.quote_id = None
        self.notification_id = None

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

    def register_couple(self):
        """Register a couple user"""
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

    def register_vendor(self):
        """Register a vendor user"""
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

    def login(self, user_type="couple"):
        """Login as a user"""
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

    def get_user_profile(self):
        """Test getting the current user profile"""
        return self.run_test(
            "Get User Profile",
            "GET",
            "users/me",
            200
        )

    def create_vendor_profile(self):
        """Create a vendor profile"""
        data = {
            "business_name": "Comprehensive Test Photography",
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
        
        success, response = self.run_test(
            "Create Vendor Profile",
            "POST",
            "vendors/profile",
            200,
            data=data
        )
        
        if success and response and 'id' in response:
            self.vendor_id = response['id']
            print(f"Created vendor profile with ID: {self.vendor_id}")
        
        return success, response

    def get_vendor_profile(self):
        """Test getting vendor profile"""
        return self.run_test(
            "Get Vendor Profile",
            "GET",
            "vendors/profile",
            200
        )

    def search_vendors(self):
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

    def get_vendor_by_id(self):
        """Test getting a specific vendor by ID"""
        if not self.vendor_id:
            print("❌ No vendor ID available for retrieval")
            return False, {}
            
        return self.run_test(
            "Get Vendor by ID",
            "GET",
            f"vendors/{self.vendor_id}",
            200
        )

    def create_quote_request(self):
        """Create a quote request"""
        if not self.vendor_id:
            print("❌ No vendor ID available for quote request")
            return False, {}
            
        data = {
            "vendor_id": self.vendor_id,
            "wedding_date": "2025-06-15T00:00:00.000Z",
            "guest_count": 150,
            "budget_range": "$2000-$3000",
            "event_details": "Full day wedding photography",
            "additional_notes": "Looking for candid style photography",
            "message": "I'm interested in your photography services for my wedding"
        }
        
        success, response = self.run_test(
            "Create Quote Request",
            "POST",
            "quotes/request",
            200,
            data=data
        )
        
        if success and response and 'id' in response:
            self.quote_id = response['id']
            print(f"Created quote request with ID: {self.quote_id}")
        
        return success, response

    def get_quote_requests(self):
        """Test getting quote requests"""
        return self.run_test(
            "Get Quote Requests",
            "GET",
            "quotes/requests",
            200
        )

    def respond_to_quote(self):
        """Respond to a quote request"""
        if not self.quote_id:
            print("❌ No quote ID available for response")
            return False, {}
            
        data = {
            "message": "Thank you for your interest in our services. We'd be delighted to photograph your wedding.",
            "price_estimate": 2500,
            "packages_offered": [
                {
                    "name": "Basic Package",
                    "description": "8 hours coverage, 1 photographer",
                    "price": 2500
                },
                {
                    "name": "Premium Package",
                    "description": "10 hours coverage, 2 photographers, engagement shoot",
                    "price": 3500
                }
            ],
            "availability_confirmed": True,
            "valid_until": (datetime.utcnow() + timedelta(days=14)).isoformat(),
            "meeting_requested": True,
            "meeting_times": [
                (datetime.utcnow() + timedelta(days=3)).isoformat(),
                (datetime.utcnow() + timedelta(days=5)).isoformat()
            ]
        }
        
        return self.run_test(
            "Respond to Quote",
            "POST",
            f"quotes/{self.quote_id}/respond",
            200,
            data=data
        )

    def get_quote_responses(self):
        """Test getting quote responses"""
        return self.run_test(
            "Get Quote Responses",
            "GET",
            "quotes/responses",
            200
        )

    def get_notifications(self):
        """Get user notifications"""
        success, response = self.run_test(
            "Get Notifications",
            "GET",
            "notifications",
            200
        )
        
        if success and response and 'notifications' in response and len(response['notifications']) > 0:
            self.notification_id = response['notifications'][0]['id']
            print(f"Found notification with ID: {self.notification_id}")
        
        return success, response

    def get_unread_notifications_count(self):
        """Get unread notifications count"""
        return self.run_test(
            "Get Unread Notifications Count",
            "GET",
            "notifications/unread-count",
            200
        )

def run_comprehensive_backend_tests():
    """Run comprehensive backend tests"""
    print("\n🚀 Running Comprehensive Backend Tests")
    print("=" * 80)
    
    tester = ComprehensiveBackendTester()
    
    # 1. Backend Health Check
    print("\n🏥 Testing Backend Health")
    print("-" * 80)
    tester.test_health_check()
    
    # 2. Authentication Endpoints
    print("\n🔐 Testing Authentication Endpoints")
    print("-" * 80)
    
    # Register users
    tester.register_couple()
    tester.register_vendor()
    
    # Test login for couple
    tester.login("couple")
    tester.get_user_profile()
    
    # Test login for vendor
    tester.login("vendor")
    tester.get_user_profile()
    
    # 3. Vendor API Endpoints
    print("\n🏢 Testing Vendor API Endpoints")
    print("-" * 80)
    
    # Create vendor profile
    tester.create_vendor_profile()
    tester.get_vendor_profile()
    
    # Test vendor search and retrieval
    tester.login("couple")
    tester.search_vendors()
    tester.get_vendor_by_id()
    
    # 4. Quote Request and Response Flow
    print("\n📝 Testing Quote Request and Response Flow")
    print("-" * 80)
    
    # Create a quote request as couple
    tester.create_quote_request()
    tester.get_quote_requests()
    
    # Login as vendor to respond to quote
    tester.login("vendor")
    tester.get_quote_requests()
    tester.respond_to_quote()
    tester.get_quote_responses()
    
    # Login as couple to check responses
    tester.login("couple")
    tester.get_quote_responses()
    
    # 5. Notification System
    print("\n🔔 Testing Notification System")
    print("-" * 80)
    
    # Check notifications
    tester.get_notifications()
    tester.get_unread_notifications_count()
    
    # Print results
    print("\n📊 Tests passed: {}/{}".format(tester.tests_passed, tester.tests_run))
    print("=" * 80)
    
    return tester.tests_passed, tester.tests_run

if __name__ == "__main__":
    passed, total = run_comprehensive_backend_tests()
    sys.exit(0 if passed > 0 else 1)