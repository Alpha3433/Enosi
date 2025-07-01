import requests
import json
import sys

def test_login(email, password):
    """Test login with provided credentials"""
    url = "https://b542ea48-edd1-4904-8d51-48ed0469b0b3.preview.emergentagent.com/api/auth/login"
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

def get_vendor_profile(token):
    """Get vendor profile"""
    url = "https://b542ea48-edd1-4904-8d51-48ed0469b0b3.preview.emergentagent.com/api/vendors/profile"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    print(f"\n🔍 Getting vendor profile")
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Got vendor profile! Status code: {response.status_code}")
            try:
                response_data = response.json()
                print(f"Vendor ID: {response_data.get('id')}")
                print(f"Business Name: {response_data.get('business_name')}")
                print(f"Status: {response_data.get('status')}")
                return True, response_data
            except:
                print(f"Response parsing error: {response.text}")
                return True, {}
        else:
            print(f"❌ Failed to get vendor profile. Status code: {response.status_code}")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, {}
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, {}

def main():
    """Main function to provide working credentials"""
    # Test with existing users
    couple_users = [
        {"email": "testuser_5401b3e3@example.com", "password": "Password123!"},
        {"email": "testuser_af55fbc1@example.com", "password": "Password123!"},
        {"email": "test.user+336612ce@example.com", "password": "Password123!"},
        {"email": "test_user_1750573027@example.com", "password": "Password123!"},
        {"email": "test_user_1750573214@example.com", "password": "Password123!"},
        {"email": "test_user_2194d07e@example.com", "password": "Password123!"}
    ]
    
    vendor_users = [
        {"email": "vendor_94886ffc@example.com", "password": "Password123!"},
        {"email": "vendor_1750573225@example.com", "password": "Password123!"},
        {"email": "lumenaustralia@gmail.com", "password": "Password123!"},
        {"email": "test_vendor_730a0661@example.com", "password": "Password123!"}
    ]
    
    admin_user = {"email": "admin@enosi.com", "password": "admin123"}
    
    print("=== Testing Couple Users ===")
    working_couple_users = []
    for user in couple_users:
        success, response = test_login(user["email"], user["password"])
        if success:
            working_couple_users.append(user)
    
    print("\n=== Testing Vendor Users ===")
    working_vendor_users = []
    for user in vendor_users:
        success, response = test_login(user["email"], user["password"])
        if success:
            working_vendor_users.append(user)
            # Get vendor profile
            if 'access_token' in response:
                get_vendor_profile(response['access_token'])
    
    print("\n=== Testing Admin User ===")
    success, response = test_login(admin_user["email"], admin_user["password"])
    
    print("\n=== WORKING CREDENTIALS SUMMARY ===")
    print("All users have the password: Password123!")
    
    print("\nCouple Users:")
    for user in working_couple_users:
        print(f"- {user['email']} / {user['password']}")
    
    print("\nVendor Users:")
    for user in working_vendor_users:
        print(f"- {user['email']} / {user['password']}")
    
    print("\nAdmin User:")
    print(f"- {admin_user['email']} / {admin_user['password']}")
    
    print("\nRecommended Test Credentials:")
    print(f"Couple User: {working_couple_users[0]['email']} / {working_couple_users[0]['password']}")
    print(f"Vendor User: {working_vendor_users[0]['email']} / {working_vendor_users[0]['password']}")
    print(f"Admin User: {admin_user['email']} / {admin_user['password']}")

if __name__ == "__main__":
    main()