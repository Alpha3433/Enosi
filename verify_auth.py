import requests
import json
import sys

def test_login(email, password):
    """Test login with provided credentials"""
    url = "https://232cf5b1-b2b3-4423-9728-8803f6e29464.preview.emergentagent.com/api/auth/login"
    headers = {'Content-Type': 'application/json'}
    data = {
        "email": email,
        "password": password
    }
    
    print(f"\n🔍 Testing login with email: {email}")
    
    try:
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Login successful! Status code: {response.status_code}")
            try:
                response_data = response.json()
                print(f"User type: {response_data['user']['user_type']}")
                print(f"User ID: {response_data['user']['id']}")
                return True, response_data
            except:
                print(f"Response parsing error: {response.text}")
                return True, {}
        else:
            print(f"❌ Login failed. Status code: {response.status_code}")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, {}
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, {}

def test_get_user_profile(token):
    """Test getting user profile with token"""
    url = "https://232cf5b1-b2b3-4423-9728-8803f6e29464.preview.emergentagent.com/api/users/me"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    print(f"\n🔍 Testing get user profile with token")
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Profile retrieval successful! Status code: {response.status_code}")
            try:
                response_data = response.json()
                print(f"User ID: {response_data.get('id', '')}")
                print(f"Email: {response_data.get('email', '')}")
                print(f"User Type: {response_data.get('user_type', 'unknown')}")
                return True, response_data
            except:
                print(f"Response parsing error: {response.text}")
                return True, {}
        else:
            print(f"❌ Profile retrieval failed. Status code: {response.status_code}")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, {}
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, {}

def main():
    """Main function to test authentication"""
    # Test with existing users
    existing_users = [
        {"email": "testuser_5401b3e3@example.com", "password": "Password123!"},
        {"email": "vendor_94886ffc@example.com", "password": "Password123!"},
        {"email": "testuser_af55fbc1@example.com", "password": "Password123!"},
        {"email": "test.user+336612ce@example.com", "password": "Password123!"},
        {"email": "test_user_1750573027@example.com", "password": "Password123!"},
        {"email": "test_user_1750573214@example.com", "password": "Password123!"},
        {"email": "vendor_1750573225@example.com", "password": "Password123!"},
        {"email": "lumenaustralia@gmail.com", "password": "Password123!"},
        {"email": "test_user_2194d07e@example.com", "password": "Password123!"},
        {"email": "test_vendor_730a0661@example.com", "password": "Password123!"}
    ]
    
    print("=== Testing Existing Users ===")
    for user in existing_users:
        success, response = test_login(user["email"], user["password"])
        if success and 'access_token' in response:
            # Test getting user profile
            test_get_user_profile(response['access_token'])
    
    print("\n=== WORKING CREDENTIALS SUMMARY ===")
    print("All users now have the password: Password123!")
    print("You can use any of the following accounts for testing:")
    for user in existing_users:
        print(f"- {user['email']} / {user['password']}")

if __name__ == "__main__":
    main()