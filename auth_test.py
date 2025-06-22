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
    
    # Test 1: Try login with invalid credentials
    print("\n=== Test 1: Login with Invalid Credentials ===")
    test_login_endpoint(base_url, "nonexistent@example.com", "wrongpassword")
    
    # Test 2: Register a new user
    print("\n=== Test 2: Register a New User ===")
    unique_id = str(uuid.uuid4())[:8]
    test_email = f"testuser_{unique_id}@example.com"
    test_password = "Password123!"
    success, user_data = test_register_endpoint(base_url, test_email, test_password)
    
    # Test 3: Login with the newly registered user
    print("\n=== Test 3: Login with New User ===")
    if success:
        success, login_data = test_login_endpoint(base_url, test_email, test_password)
        
        # Test 4: Get user profile with token
        if success and 'access_token' in login_data:
            print("\n=== Test 4: Get User Profile ===")
            test_get_user_profile(base_url, login_data['access_token'])
    
    # Test 5: Try login with wrong password for existing user
    print("\n=== Test 5: Login with Wrong Password ===")
    if success:
        test_login_endpoint(base_url, test_email, "WrongPassword123!")
    
    # Test 6: Register a vendor user
    print("\n=== Test 6: Register a Vendor User ===")
    unique_id = str(uuid.uuid4())[:8]
    vendor_email = f"vendor_{unique_id}@example.com"
    vendor_password = "Password123!"
    success, vendor_data = test_register_endpoint(base_url, vendor_email, vendor_password, "vendor")
    
    # Test 7: Login with the vendor user
    print("\n=== Test 7: Login with Vendor User ===")
    if success:
        test_login_endpoint(base_url, vendor_email, vendor_password)
    
    # Test 8: Try to login with a malformed request
    print("\n=== Test 8: Login with Malformed Request ===")
    url = f"{base_url}/api/auth/login"
    headers = {'Content-Type': 'application/json'}
    data = {
        "email": "malformed@example.com"
        # Missing password field
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {response.json()}")
        except:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    run_auth_tests()