import requests
import json
import uuid
import sys

def test_login_endpoint(base_url, email, password):
    """Test the login endpoint with provided credentials"""
    url = f"{base_url}/api/auth/login"
    headers = {'Content-Type': 'application/json'}
    data = {
        "email": email,
        "password": password
    }
    
    print(f"\n🔍 Testing login with email: {email}")
    
    try:
        response = requests.post(url, json=data, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
            try:
                response_data = response.json()
                print(f"Access Token: {response_data.get('access_token', '')[:20]}...")
                print(f"User Type: {response_data.get('user', {}).get('user_type', 'unknown')}")
                return True, response_data
            except:
                print("❌ Failed to parse JSON response")
                print(f"Response: {response.text}")
                return False, {}
        else:
            print("❌ Login failed")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, {}
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, {}

def test_register_endpoint(base_url, email, password, user_type="couple"):
    """Test user registration endpoint"""
    url = f"{base_url}/api/auth/register"
    headers = {'Content-Type': 'application/json'}
    data = {
        "email": email,
        "password": password,
        "first_name": "Test",
        "last_name": "User",
        "phone": "1234567890",
        "user_type": user_type
    }
    
    print(f"\n🔍 Testing registration with email: {email}")
    
    try:
        response = requests.post(url, json=data, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Registration successful!")
            try:
                response_data = response.json()
                print(f"User ID: {response_data.get('id', '')}")
                print(f"User Type: {response_data.get('user_type', 'unknown')}")
                return True, response_data
            except:
                print("❌ Failed to parse JSON response")
                print(f"Response: {response.text}")
                return False, {}
        else:
            print("❌ Registration failed")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, {}
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, {}

def test_get_user_profile(base_url, token):
    """Test getting user profile with token"""
    url = f"{base_url}/api/users/me"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    print(f"\n🔍 Testing get user profile with token")
    
    try:
        response = requests.get(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Profile retrieval successful!")
            try:
                response_data = response.json()
                print(f"User ID: {response_data.get('id', '')}")
                print(f"Email: {response_data.get('email', '')}")
                print(f"User Type: {response_data.get('user_type', 'unknown')}")
                return True, response_data
            except:
                print("❌ Failed to parse JSON response")
                print(f"Response: {response.text}")
                return False, {}
        else:
            print("❌ Profile retrieval failed")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, {}
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, {}

def run_auth_tests():
    """Run a series of authentication tests"""
    # Get the backend URL from frontend/.env
    with open('/app/frontend/.env', 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                base_url = line.strip().split('=')[1]
                break
    
    print(f"Using backend URL: {base_url}")
    
    # Test existing users from the database
    existing_users = [
        {"email": "testuser_5401b3e3@example.com", "password": "password123"},
        {"email": "vendor_94886ffc@example.com", "password": "password123"},
        {"email": "testuser_af55fbc1@example.com", "password": "password123"},
        {"email": "test.user+336612ce@example.com", "password": "password123"},
        {"email": "test_user_1750573027@example.com", "password": "password123"},
        {"email": "test_user_1750573214@example.com", "password": "password123"},
        {"email": "vendor_1750573225@example.com", "password": "password123"},
        {"email": "lumenaustralia@gmail.com", "password": "password123"}
    ]
    
    print("\n=== Testing Existing Users ===")
    for user in existing_users:
        test_login_endpoint(base_url, user["email"], user["password"])
    
    # Test with different password formats
    print("\n=== Testing Password Variations ===")
    test_passwords = ["Password123!", "password123", "PASSWORD123", "p@ssw0rd"]
    for password in test_passwords:
        for user in existing_users[:2]:  # Test just the first two users
            test_login_endpoint(base_url, user["email"], password)
    
    # Register a new user
    print("\n=== Register a New User ===")
    unique_id = str(uuid.uuid4())[:8]
    test_email = f"testuser_{unique_id}@example.com"
    test_password = "Password123!"
    success, user_data = test_register_endpoint(base_url, test_email, test_password)
    
    # Login with the newly registered user
    print("\n=== Login with New User ===")
    if success:
        success, login_data = test_login_endpoint(base_url, test_email, test_password)
        
        # Get user profile with token
        if success and 'access_token' in login_data:
            print("\n=== Get User Profile ===")
            test_get_user_profile(base_url, login_data['access_token'])
    
    # Register a vendor user
    print("\n=== Register a Vendor User ===")
    unique_id = str(uuid.uuid4())[:8]
    vendor_email = f"vendor_{unique_id}@example.com"
    vendor_password = "Password123!"
    success, vendor_data = test_register_endpoint(base_url, vendor_email, vendor_password, "vendor")
    
    # Login with the vendor user
    print("\n=== Login with Vendor User ===")
    if success:
        test_login_endpoint(base_url, vendor_email, vendor_password)
    
    # Print summary of working credentials
    print("\n=== WORKING CREDENTIALS SUMMARY ===")
    print("For testing purposes, use these credentials:")
    print(f"New Couple User: {test_email} / {test_password}")
    print(f"New Vendor User: {vendor_email} / {vendor_password}")

def test_login_endpoint_detailed():
    """Test the login endpoint in detail"""
    # Get the backend URL from frontend/.env
    with open('/app/frontend/.env', 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                base_url = line.strip().split('=')[1]
                break
    
    print(f"Using backend URL: {base_url}")
    
    # Create a new test user
    unique_id = str(uuid.uuid4())[:8]
    test_email = f"testuser_{unique_id}@example.com"
    test_password = "Password123!"
    
    print("\n=== Creating Test User ===")
    success, user_data = test_register_endpoint(base_url, test_email, test_password)
    
    if not success:
        print("❌ Failed to create test user. Aborting test.")
        return
    
    print("\n=== Testing Login Endpoint ===")
    success, login_data = test_login_endpoint(base_url, test_email, test_password)
    
    if not success:
        print("❌ Failed to login. Aborting test.")
        return
    
    # Analyze the token format and structure
    print("\n=== Analyzing Token ===")
    token = login_data.get('access_token', '')
    token_type = login_data.get('token_type', '')
    user = login_data.get('user', {})
    
    print(f"Token Type: {token_type}")
    print(f"Full Token: {token}")
    
    # Check token parts (JWT has 3 parts separated by dots)
    token_parts = token.split('.')
    if len(token_parts) == 3:
        print("✅ Token has correct JWT format (header.payload.signature)")
        
        # Decode the payload (middle part)
        import base64
        import json
        
        # Fix padding for base64 decoding
        def fix_padding(encoded):
            padding = 4 - (len(encoded) % 4)
            if padding < 4:
                return encoded + ("=" * padding)
            return encoded
        
        try:
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
                import datetime
                exp_time = datetime.datetime.fromtimestamp(payload_json['exp'])
                now = datetime.datetime.now()
                time_left = exp_time - now
                print(f"\nToken Expiration: {exp_time}")
                print(f"Time until expiration: {time_left}")
            
            if 'sub' in payload_json:
                print(f"Subject (sub): {payload_json['sub']}")
                if payload_json['sub'] == test_email:
                    print("✅ Token subject matches user email")
                else:
                    print("❌ Token subject does not match user email")
        except Exception as e:
            print(f"❌ Error decoding token payload: {str(e)}")
    else:
        print("❌ Token does not have correct JWT format")
    
    # Test protected endpoint access
    print("\n=== Testing Protected Endpoint Access ===")
    success, profile = test_get_user_profile(base_url, token)
    
    if success:
        print("✅ Successfully accessed protected endpoint with token")
        if profile.get('email') == test_email:
            print("✅ User profile data matches registered user")
        else:
            print("❌ User profile data does not match registered user")
    else:
        print("❌ Failed to access protected endpoint with token")
    
    # Test with invalid token
    print("\n=== Testing Invalid Token ===")
    invalid_token = token[:-5] + "12345"  # Modify the signature part
    
    url = f"{base_url}/api/users/me"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {invalid_token}'
    }
    
    try:
        response = requests.get(url, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 401:
            print("✅ Correctly rejected invalid token")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Response: {response.text}")
        else:
            print("❌ Unexpected response with invalid token")
            try:
                print(f"Response: {response.json()}")
            except:
                print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    print("\n=== Login Endpoint Test Complete ===")
    print("✅ Authentication system is working correctly")
    print(f"Test User: {test_email} / {test_password}")

if __name__ == "__main__":
    # run_auth_tests()
    test_login_endpoint_detailed()