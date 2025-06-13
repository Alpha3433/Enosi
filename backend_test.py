import requests
import sys
import json
import uuid
import base64
import os
from datetime import datetime, timedelta

class EnosiAPITester:
    def __init__(self, base_url="https://d250d48b-5e76-4caf-a964-617b53fc810c.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.couple_user = None
        self.vendor_user = None
        self.admin_user = {"email": "admin@enosi.com", "password": "admin123"}
        self.vendor_id = None
        self.quote_id = None
        self.checklist_item_id = None
        self.review_id = None
        self.seating_chart_id = None
        self.wedding_website_slug = None
        self.guest_id = None
        self.vendor_package_id = None
        self.file_id = None
        self.chat_room_id = None
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
        if user_type == "admin":
            user = self.admin_user
        elif user_type == "vendor":
            user = self.vendor_user
        else:
            user = self.couple_user
        
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
        
        success, response = self.run_test(
            "Create Checklist Item",
            "POST",
            "planning/checklist",
            200,
            data=data
        )
        
        if success and response and 'id' in response:
            self.checklist_item_id = response['id']
        
        return success, response

    def test_get_checklist_items(self):
        """Test getting checklist items"""
        return self.run_test(
            "Get Checklist Items",
            "GET",
            "planning/checklist",
            200
        )

    def test_update_checklist_item(self):
        """Test updating a checklist item"""
        if not self.checklist_item_id:
            print("❌ No checklist item ID available for update test")
            return False, {}
            
        data = {
            "completed": True,
            "priority": 1
        }
        
        return self.run_test(
            "Update Checklist Item",
            "PUT",
            f"planning/checklist/{self.checklist_item_id}",
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

    def test_get_quote_requests(self):
        """Test getting quote requests"""
        return self.run_test(
            "Get Quote Requests",
            "GET",
            "quotes/requests",
            200
        )

    # Phase 1 Feature Tests

    # 1. Admin Dashboard Tests
    def test_admin_metrics(self):
        """Test admin metrics endpoint"""
        return self.run_test(
            "Admin Metrics",
            "GET",
            "admin/metrics",
            200
        )

    def test_admin_pending_vendors(self):
        """Test admin pending vendors endpoint"""
        return self.run_test(
            "Admin Pending Vendors",
            "GET",
            "admin/vendors/pending",
            200
        )

    def test_admin_all_vendors(self):
        """Test admin all vendors endpoint"""
        return self.run_test(
            "Admin All Vendors",
            "GET",
            "admin/vendors",
            200
        )

    def test_admin_all_users(self):
        """Test admin all users endpoint"""
        return self.run_test(
            "Admin All Users",
            "GET",
            "admin/users",
            200
        )

    def test_admin_approve_vendor(self, vendor_id):
        """Test admin vendor approval"""
        return self.run_test(
            "Admin Approve Vendor",
            "POST",
            f"admin/vendors/{vendor_id}/approve",
            200
        )

    def test_admin_reject_vendor(self, vendor_id):
        """Test admin vendor rejection"""
        data = {
            "reason": "Application does not meet our quality standards"
        }
        return self.run_test(
            "Admin Reject Vendor",
            "POST",
            f"admin/vendors/{vendor_id}/reject",
            200,
            data=data
        )

    # 2. Payment Integration Tests
    def test_get_subscription_plans(self):
        """Test getting subscription plans"""
        return self.run_test(
            "Get Subscription Plans",
            "GET",
            "payments/plans",
            200
        )

    def test_create_checkout_session(self):
        """Test creating a checkout session"""
        data = {
            "price_id": "price_professional_monthly",
            "mode": "subscription",
            "quantity": 1,
            "currency": "AUD",
            "amount": 149.00,
            "metadata": {
                "plan": "professional"
            }
        }
        
        return self.run_test(
            "Create Checkout Session",
            "POST",
            "payments/checkout/session",
            200,
            data=data
        )

    def test_checkout_status(self, session_id="cs_test_mock_session_id"):
        """Test checking checkout status"""
        return self.run_test(
            "Check Checkout Status",
            "GET",
            f"payments/checkout/status/{session_id}",
            200
        )

    # 3. Quote Response System Tests
    def test_respond_to_quote(self, quote_id):
        """Test responding to a quote"""
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
            f"quotes/{quote_id}/respond",
            200,
            data=data
        )

    def test_get_quote_responses(self):
        """Test getting quote responses"""
        return self.run_test(
            "Get Quote Responses",
            "GET",
            "quotes/responses",
            200
        )

    def test_get_responses_for_quote(self, quote_id):
        """Test getting responses for a specific quote"""
        return self.run_test(
            "Get Responses for Quote",
            "GET",
            f"quotes/{quote_id}/responses",
            200
        )

    # 4. Vendor Analytics Tests
    def test_get_vendor_analytics(self):
        """Test getting vendor analytics"""
        # First, get the vendor profile to see if it exists
        success, profile = self.run_test(
            "Get Vendor Profile (for analytics)",
            "GET",
            "vendors/profile",
            200
        )
        
        if success and profile:
            print(f"Vendor profile found with ID: {profile.get('id')}")
            
        # Now try to get analytics
        return self.run_test(
            "Get Vendor Analytics",
            "GET",
            "vendors/analytics",
            200
        )

    def test_view_vendor_profile(self, vendor_id):
        """Test viewing a vendor profile (should track view)"""
        return self.run_test(
            "View Vendor Profile",
            "GET",
            f"vendors/{vendor_id}",
            200
        )
    
    # Phase 2 Feature Tests
    
    # 1. Enhanced Review System Tests
    def test_create_review(self, vendor_id):
        """Test creating a vendor review with photo upload"""
        # Create a simple base64 image for testing
        sample_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
        
        data = {
            "vendor_id": vendor_id,
            "wedding_date": (datetime.utcnow() - timedelta(days=30)).isoformat(),
            "overall_rating": 4.5,
            "detailed_ratings": {
                "quality": 4.5,
                "communication": 4.0,
                "value": 4.5,
                "professionalism": 5.0
            },
            "review_text": "We had an amazing experience with this vendor. They were professional, responsive, and delivered beyond our expectations.",
            "photos": [sample_image]
        }
        
        success, response = self.run_test(
            "Create Vendor Review",
            "POST",
            "reviews",
            200,
            data=data
        )
        
        if success and response and 'id' in response:
            self.review_id = response['id']
            print(f"Created review with ID: {self.review_id}")
        
        return success, response
    
    def test_get_vendor_reviews(self, vendor_id):
        """Test getting vendor reviews"""
        return self.run_test(
            "Get Vendor Reviews",
            "GET",
            f"vendors/{vendor_id}/reviews",
            200
        )
    
    def test_respond_to_review(self, vendor_id, review_id):
        """Test vendor responding to a review"""
        # The endpoint expects a query parameter 'response'
        endpoint = f"vendors/{vendor_id}/reviews/{review_id}/respond?response=Thank%20you%20for%20your%20kind%20review!%20We%27re%20so%20glad%20you%20had%20a%20wonderful%20experience."
        
        return self.run_test(
            "Respond to Review",
            "POST",
            endpoint,
            200
        )
    
    # 2. Trust Score & Badge System Tests
    def test_get_vendor_trust_score(self, vendor_id):
        """Test getting vendor trust score"""
        return self.run_test(
            "Get Vendor Trust Score",
            "GET",
            f"vendors/{vendor_id}/trust-score",
            200
        )
    
    def test_recalculate_trust_score(self, vendor_id):
        """Test admin recalculation of trust score"""
        return self.run_test(
            "Recalculate Trust Score",
            "POST",
            f"vendors/{vendor_id}/calculate-trust-score",
            200
        )
    
    # 3. Enhanced Planning Tools - Seating Charts Tests
    def test_create_seating_chart(self):
        """Test creating a seating chart"""
        # The endpoint expects query parameters 'layout_name' and 'venue_layout'
        endpoint = "planning/seating-charts?layout_name=Reception%20Dinner&venue_layout=ballroom"
        
        success, response = self.run_test(
            "Create Seating Chart",
            "POST",
            endpoint,
            200
        )
        
        if success and response and 'id' in response:
            self.seating_chart_id = response['id']
            print(f"Created seating chart with ID: {self.seating_chart_id}")
        
        return success, response
    
    def test_get_seating_charts(self):
        """Test getting seating charts"""
        return self.run_test(
            "Get Seating Charts",
            "GET",
            "planning/seating-charts",
            200
        )
    
    def test_optimize_seating_chart(self, chart_id):
        """Test AI-powered seating optimization"""
        return self.run_test(
            "Optimize Seating Chart",
            "PUT",
            f"planning/seating-charts/{chart_id}/optimize",
            200
        )
    
    # 4. RSVP Management Tests
    def test_create_wedding_website(self):
        """Test creating a wedding website"""
        # Create a simpler data structure for the wedding website
        data = {
            "title": "Sarah & Michael's Wedding",
            "welcome_message": "We're excited to celebrate our special day with you!",
            "wedding_date": (datetime.utcnow() + timedelta(days=180)).isoformat(),
            "venue_name": "Grand Ballroom",
            "venue_address": "123 Wedding Lane, Sydney NSW 2000",
            "rsvp_deadline": (datetime.utcnow() + timedelta(days=150)).isoformat(),
            "is_published": True  # Make sure it's published for the get test
        }
        
        success, response = self.run_test(
            "Create Wedding Website",
            "POST",
            "planning/wedding-website",
            200,
            data=data
        )
        
        if success and response and 'url_slug' in response:
            self.wedding_website_slug = response['url_slug']
            print(f"Created wedding website with slug: {self.wedding_website_slug}")
        
        return success, response
    
    def test_get_wedding_website(self, website_slug):
        """Test getting wedding website (public)"""
        return self.run_test(
            "Get Wedding Website",
            "GET",
            f"rsvp/{website_slug}",
            200
        )
    
    def test_submit_rsvp(self, website_slug):
        """Test submitting RSVP response"""
        # First, we need to create a guest that we can update with RSVP
        self.test_login("couple")
        self.test_create_guest()
        
        # Get the guest we just created
        success, guests = self.test_get_guests()
        if not success or not guests or len(guests) == 0:
            print("❌ No guests available for RSVP test")
            return False, {}
        
        # Use the email of an existing guest
        guest_email = guests[0]["email"]
        
        data = {
            "email": guest_email,
            "rsvp_status": "attending",
            "dietary_requirements": "Vegetarian"
        }
        
        return self.run_test(
            "Submit RSVP",
            "POST",
            f"rsvp/{website_slug}/respond",
            200,
            data=data
        )
    
    # 5. Vendor Calendar & Pricing Management Tests
    def test_set_vendor_availability(self):
        """Test setting vendor availability"""
        data = [
            {
                "date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
                "is_available": True,
                "pricing_tier": "standard",
                "notes": "Available all day"
            },
            {
                "date": (datetime.utcnow() + timedelta(days=31)).isoformat(),
                "is_available": True,
                "pricing_tier": "peak",
                "notes": "Weekend premium pricing"
            },
            {
                "date": (datetime.utcnow() + timedelta(days=32)).isoformat(),
                "is_available": False,
                "notes": "Already booked"
            }
        ]
        
        return self.run_test(
            "Set Vendor Availability",
            "POST",
            "vendors/availability",
            200,
            data=data
        )
    
    def test_get_vendor_availability(self, vendor_id):
        """Test getting vendor availability"""
        params = {
            "start_date": datetime.utcnow().isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=60)).isoformat()
        }
        
        return self.run_test(
            "Get Vendor Availability",
            "GET",
            f"vendors/{vendor_id}/availability",
            200,
            params=params
        )
    
    def test_create_vendor_package(self):
        """Test creating a vendor package"""
        data = {
            "name": "Premium Wedding Package",
            "description": "Our most comprehensive wedding photography package",
            "base_price": 3500,
            "inclusions": [
                "10 hours of coverage",
                "2 photographers",
                "Engagement session",
                "Online gallery",
                "Wedding album"
            ],
            "duration_hours": 10,
            "max_guests": 200,
            "is_customizable": True,
            "add_ons": [
                {
                    "name": "Extra hour",
                    "price": 250,
                    "description": "Additional hour of photography coverage"
                },
                {
                    "name": "Photo booth",
                    "price": 500,
                    "description": "3 hours of photo booth with props and unlimited prints"
                }
            ]
        }
        
        success, response = self.run_test(
            "Create Vendor Package",
            "POST",
            "vendors/packages",
            200,
            data=data
        )
        
        if success and response and 'id' in response:
            self.vendor_package_id = response['id']
            print(f"Created vendor package with ID: {self.vendor_package_id}")
        
        return success, response
    
    def test_get_vendor_packages(self, vendor_id):
        """Test getting vendor packages"""
        return self.run_test(
            "Get Vendor Packages",
            "GET",
            f"vendors/{vendor_id}/packages",
            200
        )
    
    # 6. Decision Support Tools Tests
    def test_create_vendor_comparison(self, vendor_ids):
        """Test creating a vendor comparison"""
        return self.run_test(
            "Create Vendor Comparison",
            "POST",
            "planning/vendor-comparison",
            200,
            data=vendor_ids
        )
    
    def test_get_vendor_comparisons(self):
        """Test getting vendor comparisons"""
        return self.run_test(
            "Get Vendor Comparisons",
            "GET",
            "planning/vendor-comparisons",
            200
        )
    
    def test_optimize_budget(self):
        """Test budget optimization"""
        # The endpoint expects a query parameter 'total_budget'
        endpoint = "planning/budget-optimization?total_budget=30000"
        
        return self.run_test(
            "Optimize Budget",
            "POST",
            endpoint,
            200
        )
    
    # 7. Enhanced Guest Management Tests
    def test_create_guest(self):
        """Test creating a guest"""
        data = {
            "first_name": "Emma",
            "last_name": "Johnson",
            "email": f"emma.johnson.{str(uuid.uuid4())[:8]}@example.com",
            "phone": "0412345678",
            "address": "456 Guest Street, Melbourne VIC 3000",
            "relationship": "Family - Bride's Side",
            "plus_one": True,
            "dietary_requirements": "Gluten-free",
            "notes": "Childhood friend of the bride"
        }
        
        success, response = self.run_test(
            "Create Guest",
            "POST",
            "planning/guests",
            200,
            data=data
        )
        
        if success and response and 'id' in response:
            self.guest_id = response['id']
            print(f"Created guest with ID: {self.guest_id}")
        
        return success, response
    
    def test_get_guests(self):
        """Test getting guests"""
        return self.run_test(
            "Get Guests",
            "GET",
            "planning/guests",
            200
        )
    
    def test_update_guest(self, guest_id):
        """Test updating guest information"""
        data = {
            "rsvp_status": "attending",
            "dietary_requirements": "Gluten-free and dairy-free",
            "plus_one": True
        }
        
        return self.run_test(
            "Update Guest",
            "PUT",
            f"planning/guests/{guest_id}",
            200,
            data=data
        )

def test_phase1_features():
    """Test all Phase 1 features"""
    print("\n🚀 Starting Phase 1 Feature Tests")
    print("=" * 80)
    
    # Setup
    tester = EnosiAPITester()
    
    # Test basic health check
    tester.test_health_check()
    
    # 1. Test Admin Dashboard Features
    print("\n📊 Testing Admin Dashboard Features")
    print("-" * 80)
    
    # Login as admin
    success, _ = tester.test_login("admin")
    if success:
        tester.test_admin_metrics()
        tester.test_admin_pending_vendors()
        tester.test_admin_all_vendors()
        tester.test_admin_all_users()
    
    # 2. Test Payment Integration Features
    print("\n💳 Testing Payment Integration Features")
    print("-" * 80)
    
    # Test subscription plans (no auth required)
    success, plans = tester.test_get_subscription_plans()
    
    # Register and login as vendor
    tester.test_register_vendor()
    tester.test_login("vendor")
    tester.test_create_vendor_profile()
    
    # Test checkout session creation
    success, checkout = tester.test_create_checkout_session()
    
    # Test checkout status
    if success and checkout and 'session_id' in checkout:
        tester.test_checkout_status(checkout['session_id'])
    else:
        tester.test_checkout_status()
    
    # 3. Test Quote Response System
    print("\n📝 Testing Quote Response System")
    print("-" * 80)
    
    # Register and login as couple
    tester.test_register_couple()
    tester.test_login("couple")
    tester.test_update_couple_profile()
    
    # Create a quote request
    if tester.vendor_id:
        tester.test_create_quote_request(tester.vendor_id)
    else:
        # Search for vendors if we don't have a vendor ID
        success, vendors = tester.test_search_vendors()
        if success and vendors and len(vendors) > 0:
            tester.test_create_quote_request(vendors[0]['id'])
    
    # Login as vendor to respond to quote
    tester.test_login("vendor")
    
    # Respond to quote
    if tester.quote_id:
        tester.test_respond_to_quote(tester.quote_id)
        
        # Test getting quote responses
        tester.test_get_quote_responses()
        
        # Test getting responses for specific quote
        tester.test_get_responses_for_quote(tester.quote_id)
        
        # Login as couple to check responses
        tester.test_login("couple")
        tester.test_get_quote_responses()
        tester.test_get_responses_for_quote(tester.quote_id)
    
    # 4. Test Vendor Analytics
    print("\n📈 Testing Vendor Analytics")
    print("-" * 80)
    
    # Login as vendor
    tester.test_login("vendor")
    
    # Get vendor profile first to ensure we have the correct vendor ID
    success, vendor_profile = tester.test_get_vendor_profile()
    
    # Get vendor analytics
    if success and vendor_profile and 'id' in vendor_profile:
        # Ensure we have some analytics data by viewing the profile and creating a quote
        tester.test_login("couple")
        tester.test_view_vendor_profile(vendor_profile['id'])
        
        # Login back as vendor
        tester.test_login("vendor")
        tester.test_get_vendor_analytics()
    else:
        tester.test_get_vendor_analytics()
    
    # 5. Test Admin Vendor Approval/Rejection
    print("\n✅ Testing Admin Vendor Approval/Rejection")
    print("-" * 80)
    
    # Login as admin
    tester.test_login("admin")
    
    # Approve vendor
    if tester.vendor_id:
        tester.test_admin_approve_vendor(tester.vendor_id)
        
        # Check vendor status after approval
        tester.test_login("vendor")
        tester.test_get_vendor_profile()
    
    # Print results
    print("\n📊 Tests passed: {}/{}".format(tester.tests_passed, tester.tests_run))
    print("=" * 80)
    
    return tester.tests_passed, tester.tests_run

def test_phase2_features():
    """Test all Phase 2 features"""
    print("\n🚀 Starting Phase 2 Feature Tests")
    print("=" * 80)
    
    # Setup
    tester = EnosiAPITester()
    
    # Test basic health check
    tester.test_health_check()
    
    # Register and login as vendor
    tester.test_register_vendor()
    tester.test_login("vendor")
    success, vendor_profile = tester.test_create_vendor_profile()
    
    # Register and login as couple
    tester.test_register_couple()
    tester.test_login("couple")
    tester.test_update_couple_profile()
    
    # 1. Test Enhanced Review System
    print("\n⭐ Testing Enhanced Review System")
    print("-" * 80)
    
    # Create a review
    if tester.vendor_id:
        tester.test_create_review(tester.vendor_id)
    else:
        # Search for vendors if we don't have a vendor ID
        success, vendors = tester.test_search_vendors()
        if success and vendors and len(vendors) > 0:
            tester.test_create_review(vendors[0]['id'])
    
    # Get vendor reviews
    if tester.vendor_id:
        tester.test_get_vendor_reviews(tester.vendor_id)
    
    # Login as vendor to respond to review
    tester.test_login("vendor")
    
    # Respond to review
    if tester.vendor_id and tester.review_id:
        tester.test_respond_to_review(tester.vendor_id, tester.review_id)
    
    # 2. Test Trust Score & Badge System
    print("\n🏆 Testing Trust Score & Badge System")
    print("-" * 80)
    
    # Get vendor trust score
    if tester.vendor_id:
        tester.test_get_vendor_trust_score(tester.vendor_id)
    
    # Login as admin to recalculate trust score
    tester.test_login("admin")
    
    # Recalculate trust score
    if tester.vendor_id:
        tester.test_recalculate_trust_score(tester.vendor_id)
    
    # 3. Test Enhanced Planning Tools - Seating Charts
    print("\n🪑 Testing Seating Charts")
    print("-" * 80)
    
    # Login as couple
    tester.test_login("couple")
    
    # Create seating chart
    tester.test_create_seating_chart()
    
    # Get seating charts
    tester.test_get_seating_charts()
    
    # Optimize seating chart
    if tester.seating_chart_id:
        tester.test_optimize_seating_chart(tester.seating_chart_id)
    
    # 4. Test RSVP Management
    print("\n📨 Testing RSVP Management")
    print("-" * 80)
    
    # Create wedding website
    tester.test_create_wedding_website()
    
    # Get wedding website (public)
    if tester.wedding_website_slug:
        tester.test_get_wedding_website(tester.wedding_website_slug)
        
        # Submit RSVP
        tester.test_submit_rsvp(tester.wedding_website_slug)
    
    # 5. Test Vendor Calendar & Pricing Management
    print("\n📅 Testing Vendor Calendar & Pricing Management")
    print("-" * 80)
    
    # Login as vendor
    tester.test_login("vendor")
    
    # Set vendor availability
    tester.test_set_vendor_availability()
    
    # Get vendor availability
    if tester.vendor_id:
        tester.test_get_vendor_availability(tester.vendor_id)
    
    # Create vendor package
    tester.test_create_vendor_package()
    
    # Get vendor packages
    if tester.vendor_id:
        tester.test_get_vendor_packages(tester.vendor_id)
    
    # 6. Test Decision Support Tools
    print("\n🧠 Testing Decision Support Tools")
    print("-" * 80)
    
    # Login as couple
    tester.test_login("couple")
    
    # Create vendor comparison
    if tester.vendor_id:
        vendor_ids = [tester.vendor_id]
        # Search for more vendors
        success, vendors = tester.test_search_vendors()
        if success and vendors and len(vendors) > 0:
            for vendor in vendors[:2]:  # Add up to 2 more vendors
                if vendor['id'] != tester.vendor_id:
                    vendor_ids.append(vendor['id'])
        
        tester.test_create_vendor_comparison(vendor_ids)
    
    # Get vendor comparisons
    tester.test_get_vendor_comparisons()
    
    # Optimize budget
    tester.test_optimize_budget()
    
    # 7. Test Enhanced Guest Management
    print("\n👥 Testing Enhanced Guest Management")
    print("-" * 80)
    
    # Create guest
    tester.test_create_guest()
    
    # Get guests
    tester.test_get_guests()
    
    # Update guest
    if tester.guest_id:
        tester.test_update_guest(tester.guest_id)
    
    # Print results
    print("\n📊 Tests passed: {}/{}".format(tester.tests_passed, tester.tests_run))
    print("=" * 80)
    
    return tester.tests_passed, tester.tests_run

# Phase 3 Feature Tests
def test_phase3_features():
    """Test all Phase 3 features"""
    print("\n🚀 Starting Phase 3 Feature Tests")
    print("=" * 80)
    
    # Setup
    tester = EnosiAPITester()
    
    # Test basic health check
    tester.test_health_check()
    
    # Register and login as vendor
    tester.test_register_vendor()
    tester.test_login("vendor")
    success, vendor_profile = tester.test_create_vendor_profile()
    
    # Register and login as couple
    tester.test_register_couple()
    tester.test_login("couple")
    tester.test_update_couple_profile()
    
    # 1. Test File Upload & Media Management
    print("\n📁 Testing File Upload & Media Management")
    print("-" * 80)
    
    # Test file upload
    tester.test_upload_image()
    tester.test_upload_document()
    
    # Test getting user files
    tester.test_get_user_files("image")
    tester.test_get_user_files("document")
    
    # Test file deletion
    if tester.file_id:
        tester.test_delete_file(tester.file_id)
    
    # 2. Test Enhanced Search & Discovery
    print("\n🔍 Testing Enhanced Search & Discovery")
    print("-" * 80)
    
    # Test enhanced vendor search
    tester.test_enhanced_vendor_search()
    
    # Test wishlist functionality
    if tester.vendor_id:
        tester.test_add_to_wishlist(tester.vendor_id)
        tester.test_get_wishlist()
        tester.test_remove_from_wishlist(tester.vendor_id)
    
    # Test view tracking
    if tester.vendor_id:
        tester.test_track_vendor_view(tester.vendor_id)
        tester.test_get_recently_viewed()
    
    # 3. Test Real-time Communication System
    print("\n💬 Testing Real-time Communication System")
    print("-" * 80)
    
    # Test chat room creation
    if tester.vendor_id:
        tester.test_create_chat_room(tester.vendor_id)
    
    # Test getting chat rooms
    tester.test_get_chat_rooms()
    
    # Test sending and retrieving messages
    if tester.chat_room_id:
        tester.test_send_chat_message(tester.chat_room_id)
        tester.test_get_chat_messages(tester.chat_room_id)
        tester.test_mark_messages_read(tester.chat_room_id)
    
    # Test notifications
    tester.test_get_notifications()
    tester.test_get_unread_notifications_count()
    
    if tester.notification_id:
        tester.test_mark_notification_read(tester.notification_id)
    
    # Print results
    print("\n📊 Tests passed: {}/{}".format(tester.tests_passed, tester.tests_run))
    print("=" * 80)
    
    return tester.tests_passed, tester.tests_run

if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "phase2":
            passed, total = test_phase2_features()
        elif sys.argv[1] == "phase3":
            passed, total = test_phase3_features()
        else:
            passed, total = test_phase1_features()
    else:
        passed, total = test_phase1_features()
    sys.exit(0 if passed == total else 1)
