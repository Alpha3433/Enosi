import requests
import sys
import json
import uuid
from datetime import datetime, timedelta

class NotificationTester:
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

    def register_users(self):
        """Register a couple and vendor user"""
        # Register couple
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
        
        # Register vendor
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

    def create_vendor_profile(self):
        """Create a vendor profile"""
        data = {
            "business_name": "Notification Test Photography",
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

    def mark_notification_read(self):
        """Mark a notification as read"""
        if not self.notification_id:
            print("❌ No notification ID available to mark as read")
            return False, {}
            
        return self.run_test(
            "Mark Notification Read",
            "POST",
            f"notifications/{self.notification_id}/read",
            200
        )

def test_notification_system():
    """Test the notification system integration"""
    print("\n🔔 Testing Notification System Integration")
    print("=" * 80)
    
    tester = NotificationTester()
    
    # Step 1: Register users
    print("\n👤 Setting up test users")
    print("-" * 80)
    tester.register_users()
    
    # Step 2: Login as vendor and create profile
    print("\n🏢 Setting up vendor profile")
    print("-" * 80)
    tester.login("vendor")
    tester.create_vendor_profile()
    
    # Step 3: Login as couple and create quote request
    print("\n📝 Creating quote request")
    print("-" * 80)
    tester.login("couple")
    tester.create_quote_request()
    
    # Step 4: Login as vendor and respond to quote
    print("\n✉️ Responding to quote request")
    print("-" * 80)
    tester.login("vendor")
    tester.respond_to_quote()
    
    # Step 5: Login as couple and check notifications
    print("\n🔔 Checking notifications")
    print("-" * 80)
    tester.login("couple")
    tester.get_notifications()
    tester.get_unread_notifications_count()
    
    # Step 6: Mark notification as read
    print("\n✓ Marking notification as read")
    print("-" * 80)
    tester.mark_notification_read()
    
    # Step 7: Check unread count again
    print("\n🔢 Checking unread count after marking as read")
    print("-" * 80)
    tester.get_unread_notifications_count()
    
    # Print results
    print("\n📊 Tests passed: {}/{}".format(tester.tests_passed, tester.tests_run))
    print("=" * 80)
    
    return tester.tests_passed, tester.tests_run

if __name__ == "__main__":
    passed, total = test_notification_system()
    sys.exit(0 if passed > 0 else 1)