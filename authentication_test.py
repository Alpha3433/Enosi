import requests
import json
import uuid
import base64
from datetime import datetime, timedelta

class AuthenticationTester:
    def __init__(self, base_url="http://0.0.0.0:8001/api"):
        self.base_url = base_url
        self.couple_user = None
        self.vendor_user = None
        self.admin_user = {"email": "admin@enosi.com", "password": "admin123"}
        self.couple_token = None
        self.vendor_token = None
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if not headers:
            headers = {'Content-Type': 'application/json'}
        
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
            print(f"User ID: {response.get('id')}")
            print(f"User Type: {response.get('user_type')}")
        
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
            print(f"User ID: {response.get('id')}")
            print(f"User Type: {response.get('user_type')}")
        
        return success, response

    def test_register_validation(self):
        """Test registration validation"""
        # Test with missing required fields
        data = {
            "email": "test@example.com",
            "password": "Password123!"
            # Missing first_name, last_name, user_type
        }
        
        self.run_test(
            "Register with Missing Fields",
            "POST",
            "auth/register",
            422,  # Validation error
            data=data
        )
        
        # Test with invalid email
        data = {
            "email": "invalid-email",
            "password": "Password123!",
            "first_name": "Test",
            "last_name": "User",
            "phone": "1234567890",
            "user_type": "couple"
        }
        
        self.run_test(
            "Register with Invalid Email",
            "POST",
            "auth/register",
            422,  # Validation error
            data=data
        )
        
        # Test with duplicate email
        if self.couple_user:
            data = {
                "email": self.couple_user["email"],
                "password": "Password123!",
                "first_name": "Test",
                "last_name": "User",
                "phone": "1234567890",
                "user_type": "couple"
            }
            
            self.run_test(
                "Register with Duplicate Email",
                "POST",
                "auth/register",
                400,  # Bad request
                data=data
            )
        
        return True, {}

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
            if user_type == "admin":
                self.admin_token = response['access_token']
            elif user_type == "vendor":
                self.vendor_token = response['access_token']
            else:
                self.couple_token = response['access_token']
                
            print(f"Successfully logged in as {user_type}")
            print(f"Token: {response['access_token'][:20]}...")
            print(f"User ID: {response.get('user', {}).get('id')}")
            print(f"User Type: {response.get('user', {}).get('user_type')}")
            return True, response
        
        return False, {}

    def test_login_validation(self):
        """Test login validation"""
        # Test with invalid credentials
        data = {
            "email": "nonexistent@example.com",
            "password": "WrongPassword123!"
        }
        
        self.run_test(
            "Login with Invalid Credentials",
            "POST",
            "auth/login",
            401,  # Unauthorized
            data=data
        )
        
        # Test with missing fields
        data = {
            "email": "test@example.com"
            # Missing password
        }
        
        self.run_test(
            "Login with Missing Fields",
            "POST",
            "auth/login",
            422,  # Validation error
            data=data
        )
        
        return True, {}

    def test_get_user_profile(self, user_type="couple"):
        """Test getting the current user profile"""
        token = None
        if user_type == "admin":
            token = self.admin_token
        elif user_type == "vendor":
            token = self.vendor_token
        else:
            token = self.couple_token
            
        if not token:
            print(f"❌ No {user_type} token available for profile test")
            return False, {}
            
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {token}'
        }
        
        success, response = self.run_test(
            f"Get {user_type.capitalize()} Profile",
            "GET",
            "users/me",
            200,
            headers=headers
        )
        
        if success:
            print(f"User ID: {response.get('id')}")
            print(f"User Email: {response.get('email')}")
            print(f"User Type: {response.get('user_type')}")
        
        return success, response

    def test_protected_route_access(self):
        """Test access to protected routes with and without token"""
        if not self.couple_token:
            print("❌ No token available for protected route test")
            return False, {}
            
        # Test with token
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.couple_token}'
        }
        
        self.run_test(
            "Access Protected Route with Token",
            "GET",
            "users/me",
            200,
            headers=headers
        )
        
        # Test with invalid token
        invalid_token = self.couple_token[:-5] + "12345"  # Modify the signature part
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {invalid_token}'
        }
        
        self.run_test(
            "Access Protected Route with Invalid Token",
            "GET",
            "users/me",
            401,  # Unauthorized
            headers=headers
        )
        
        # Test without token
        headers = {'Content-Type': 'application/json'}
        
        self.run_test(
            "Access Protected Route without Token",
            "GET",
            "users/me",
            401,  # Unauthorized
            headers=headers
        )
        
        return True, {}

    def test_token_validation(self):
        """Test JWT token validation"""
        if not self.couple_token:
            print("❌ No token available for token validation test")
            return False, {}
            
        token = self.couple_token
        print(f"\n🔍 Testing JWT Token Validation...")
        
        # Check token format (JWT has 3 parts separated by dots)
        token_parts = token.split('.')
        if len(token_parts) == 3:
            print("✅ Token has correct JWT format (header.payload.signature)")
            
            # Decode the payload (middle part)
            try:
                # Fix padding for base64 decoding
                def fix_padding(encoded):
                    padding = 4 - (len(encoded) % 4)
                    if padding < 4:
                        return encoded + ("=" * padding)
                    return encoded
                
                # JWT payload is base64url encoded
                payload = token_parts[1]
                # Convert base64url to base64 by replacing chars
                payload = payload.replace('-', '+').replace('_', '/')
                # Fix padding
                payload = fix_padding(payload)
                # Decode
                decoded_payload = base64.b64decode(payload)
                payload_json = json.loads(decoded_payload)
                
                print("\nToken Payload:")
                print(json.dumps(payload_json, indent=2))
                
                # Check for standard JWT claims
                if 'exp' in payload_json:
                    exp_time = datetime.fromtimestamp(payload_json['exp'])
                    now = datetime.now()
                    time_left = exp_time - now
                    print(f"\nToken Expiration: {exp_time}")
                    print(f"Time until expiration: {time_left}")
                    print("✅ Token includes expiration claim")
                    self.tests_passed += 1
                else:
                    print("❌ Token missing expiration claim")
                
                if 'sub' in payload_json:
                    print(f"Subject (sub): {payload_json['sub']}")
                    if payload_json['sub'] == self.couple_user["email"]:
                        print("✅ Token subject matches user email")
                        self.tests_passed += 1
                    else:
                        print("❌ Token subject does not match user email")
                else:
                    print("❌ Token missing subject claim")
                
                self.tests_run += 2  # For exp and sub checks
                return True, payload_json
            except Exception as e:
                print(f"❌ Error decoding token payload: {str(e)}")
                return False, {}
        else:
            print("❌ Token does not have correct JWT format")
            return False, {}

    def test_vendor_approval_workflow(self):
        """Test vendor approval workflow"""
        # First, ensure we have a vendor user
        if not self.vendor_user:
            self.test_register_vendor()
        
        # Login as admin
        success, _ = self.test_login("admin")
        if not success:
            print("❌ Admin login failed. Skipping vendor approval test.")
            return False, {}
        
        # Get pending vendors
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        success, vendors = self.run_test(
            "Get Pending Vendors",
            "GET",
            "admin/vendors/pending",
            200,
            headers=headers
        )
        
        if success and vendors and len(vendors) > 0:
            vendor_id = vendors[0].get('id')
            
            # Approve vendor
            success, response = self.run_test(
                "Approve Vendor",
                "POST",
                f"admin/vendors/{vendor_id}/approve",
                200,
                headers=headers
            )
            
            if success:
                print(f"Successfully approved vendor with ID: {vendor_id}")
                
                # Login as vendor to verify approval
                self.test_login("vendor")
                
                # Get vendor profile
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {self.vendor_token}'
                }
                
                success, profile = self.run_test(
                    "Get Vendor Profile After Approval",
                    "GET",
                    "vendors/profile",
                    200,
                    headers=headers
                )
                
                if success:
                    print(f"Vendor status: {profile.get('status')}")
                    if profile.get('status') == 'approved':
                        print("✅ Vendor status correctly updated to approved")
                    else:
                        print("❌ Vendor status not updated to approved")
        else:
            print("ℹ️ No pending vendors found to test approval workflow")
        
        return True, {}

    def run_all_tests(self):
        """Run all authentication tests"""
        print("\n🔒 Starting Authentication Tests")
        print("=" * 80)
        
        # 1. Health Check
        print("\n🏥 Testing Backend Health")
        print("-" * 80)
        self.test_health_check()
        
        # 2. Registration Tests
        print("\n📝 Testing Registration")
        print("-" * 80)
        self.test_register_couple()
        self.test_register_vendor()
        self.test_register_validation()
        
        # 3. Login Tests
        print("\n🔑 Testing Login")
        print("-" * 80)
        self.test_login("couple")
        self.test_login("vendor")
        self.test_login_validation()
        
        # 4. Token Validation
        print("\n🔒 Testing JWT Token")
        print("-" * 80)
        self.test_token_validation()
        
        # 5. Protected Routes Tests
        print("\n🔐 Testing Protected Routes")
        print("-" * 80)
        self.test_get_user_profile("couple")
        self.test_get_user_profile("vendor")
        self.test_protected_route_access()
        
        # 6. Vendor Approval Workflow
        print("\n✅ Testing Vendor Approval Workflow")
        print("-" * 80)
        self.test_vendor_approval_workflow()
        
        # Print results
        print("\n📊 Authentication Tests Summary")
        print("=" * 80)
        print(f"Tests passed: {self.tests_passed}/{self.tests_run} ({self.tests_passed/self.tests_run*100:.1f}%)")
        
        if self.couple_user:
            print(f"\nCouple User: {self.couple_user['email']} / {self.couple_user['password']}")
        if self.vendor_user:
            print(f"Vendor User: {self.vendor_user['email']} / {self.vendor_user['password']}")
        
        return self.tests_passed, self.tests_run

if __name__ == "__main__":
    tester = AuthenticationTester()
    tester.run_all_tests()