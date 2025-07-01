import requests
import json
import sys
import uuid
from datetime import datetime

def test_login(email, password):
    """Test login with provided credentials"""
    url = "https://4c0e1cae-d13a-41b5-a0eb-333416e55eed.preview.emergentagent.com/api/auth/login"
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

def create_vendor_profile(token):
    """Create a vendor profile"""
    url = "https://4c0e1cae-d13a-41b5-a0eb-333416e55eed.preview.emergentagent.com/api/vendors/profile"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
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
    
    print(f"\n🔍 Creating vendor profile")
    
    try:
        response = requests.post(url, json=data, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Vendor profile created successfully! Status code: {response.status_code}")
            try:
                response_data = response.json()
                print(f"Vendor ID: {response_data.get('id', '')}")
                return True, response_data
            except:
                print(f"Response parsing error: {response.text}")
                return True, {}
        else:
            print(f"❌ Vendor profile creation failed. Status code: {response.status_code}")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, {}
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, {}

def main():
    """Main function to create vendor profiles"""
    # Test with vendor users
    vendor_users = [
        {"email": "vendor_94886ffc@example.com", "password": "Password123!"},
        {"email": "vendor_1750573225@example.com", "password": "Password123!"},
        {"email": "lumenaustralia@gmail.com", "password": "Password123!"},
        {"email": "test_vendor_730a0661@example.com", "password": "Password123!"}
    ]
    
    print("=== Creating Vendor Profiles ===")
    for user in vendor_users:
        success, response = test_login(user["email"], user["password"])
        if success and 'access_token' in response:
            # Create vendor profile
            create_vendor_profile(response['access_token'])
    
    print("\n=== VENDOR PROFILE CREATION COMPLETE ===")
    print("Vendor profiles have been created for the following accounts:")
    for user in vendor_users:
        print(f"- {user['email']}")

if __name__ == "__main__":
    main()