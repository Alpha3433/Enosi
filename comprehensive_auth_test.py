import requests
import json
import uuid
import sys
import time

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

def test_token_expiration(base_url, email, password):
    """Test token expiration"""
    print("\n=== Testing Token Expiration ===")
    
    # First, login to get a token
    success, login_data = test_login_endpoint(base_url, email, password)
    
    if not success or 'access_token' not in login_data:
        print("❌ Failed to get token for expiration test")
        return False
    
    token = login_data['access_token']
    
    # Test the token immediately
    print("\n🔍 Testing token immediately after login")
    success, _ = test_get_user_profile(base_url, token)
    
    if not success:
        print("❌ Token should be valid immediately after login")
        return False
    
    # Wait for token to expire (this would be 30 minutes in a real test)
    # For this test, we'll just simulate with a short wait
    print("\n🔍 Token is valid. In a real scenario, we would wait for expiration.")
    print("   (Token expiration is set to 30 minutes)")
    
    # Instead of waiting, we'll test with an invalid token
    print("\n🔍 Testing with an invalid token")
    invalid_token = token[:-5] + "12345"  # Modify the token to make it invalid
    success, _ = test_get_user_profile(base_url, invalid_token)
    
    if success:
        print("❌ Invalid token should not work")
        return False
    
    print("✅ Token validation is working correctly")
    return True

def test_concurrent_logins(base_url, email, password):
    """Test concurrent logins with the same credentials"""
    print("\n=== Testing Concurrent Logins ===")
    
    # Login first time
    print("\n🔍 First login")
    success1, login_data1 = test_login_endpoint(base_url, email, password)
    
    if not success1 or 'access_token' not in login_data1:
        print("❌ First login failed")
        return False
    
    token1 = login_data1['access_token']
    
    # Login second time
    print("\n🔍 Second login (concurrent)")
    success2, login_data2 = test_login_endpoint(base_url, email, password)
    
    if not success2 or 'access_token' not in login_data2:
        print("❌ Second login failed")
        return False
    
    token2 = login_data2['access_token']
    
    # Check if both tokens are valid
    print("\n🔍 Testing first token")
    success_token1, _ = test_get_user_profile(base_url, token1)
    
    print("\n🔍 Testing second token")
    success_token2, _ = test_get_user_profile(base_url, token2)
    
    if success_token1 and success_token2:
        print("✅ Both tokens are valid - system allows concurrent logins")
        return True
    else:
        print("❌ At least one token is invalid - system may not allow concurrent logins")
        return False

def test_login_rate_limiting(base_url, email, password):
    """Test login rate limiting by making multiple rapid requests"""
    print("\n=== Testing Login Rate Limiting ===")
    
    # Make 5 rapid login attempts
    print("\n🔍 Making 5 rapid login attempts")
    
    results = []
    for i in range(5):
        print(f"\n🔍 Login attempt {i+1}")
        success, _ = test_login_endpoint(base_url, email, password)
        results.append(success)
        time.sleep(0.5)  # Small delay between requests
    
    # Check if all attempts were successful
    if all(results):
        print("✅ All login attempts were successful - no rate limiting detected")
    else:
        print("❌ Some login attempts failed - rate limiting may be in place")
    
    return True

def test_login_with_special_characters(base_url):
    """Test login with special characters in email and password"""
    print("\n=== Testing Login with Special Characters ===")
    
    # Register a user with special characters in email and password
    unique_id = str(uuid.uuid4())[:8]
    email = f"test.user+{unique_id}@example.com"  # Email with + character
    password = "P@ssw0rd!#$%^&*"  # Password with special characters
    
    # Register the user
    success, user_data = test_register_endpoint(base_url, email, password)
    
    if not success:
        print("❌ Failed to register user with special characters")
        return False
    
    # Try to login with the special characters
    success, _ = test_login_endpoint(base_url, email, password)
    
    if success:
        print("✅ Login with special characters successful")
        return True
    else:
        print("❌ Login with special characters failed")
        return False

def run_comprehensive_auth_tests():
    """Run a comprehensive series of authentication tests"""
    # Get the backend URL from frontend/.env
    with open('/app/frontend/.env', 'r') as f:
        for line in f:
            if line.startswith('REACT_APP_BACKEND_URL='):
                base_url = line.strip().split('=')[1]
                break
    
    print(f"Using backend URL: {base_url}")
    
    # Create test users
    unique_id = str(uuid.uuid4())[:8]
    test_email = f"testuser_{unique_id}@example.com"
    test_password = "Password123!"
    
    # Register a test user
    print("\n=== Test 1: Register a New User ===")
    success, user_data = test_register_endpoint(base_url, test_email, test_password)
    
    if not success:
        print("❌ Failed to register test user, cannot continue tests")
        return
    
    # Basic login test
    print("\n=== Test 2: Basic Login Test ===")
    success, login_data = test_login_endpoint(base_url, test_email, test_password)
    
    if not success:
        print("❌ Basic login failed, cannot continue tests")
        return
    
    # Get user profile
    if 'access_token' in login_data:
        print("\n=== Test 3: Get User Profile ===")
        test_get_user_profile(base_url, login_data['access_token'])
    
    # Test login with wrong password
    print("\n=== Test 4: Login with Wrong Password ===")
    test_login_endpoint(base_url, test_email, "WrongPassword123!")
    
    # Test login with non-existent user
    print("\n=== Test 5: Login with Non-existent User ===")
    test_login_endpoint(base_url, f"nonexistent_{unique_id}@example.com", test_password)
    
    # Test token validation
    print("\n=== Test 6: Token Validation ===")
    test_token_expiration(base_url, test_email, test_password)
    
    # Test concurrent logins
    print("\n=== Test 7: Concurrent Logins ===")
    test_concurrent_logins(base_url, test_email, test_password)
    
    # Test login rate limiting
    print("\n=== Test 8: Login Rate Limiting ===")
    test_login_rate_limiting(base_url, test_email, test_password)
    
    # Test login with special characters
    print("\n=== Test 9: Login with Special Characters ===")
    test_login_with_special_characters(base_url)
    
    print("\n=== Authentication Testing Complete ===")

if __name__ == "__main__":
    run_comprehensive_auth_tests()