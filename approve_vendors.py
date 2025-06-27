import requests
import json
import sys

def test_login(email, password):
    """Test login with provided credentials"""
    url = "https://5e432144-ca53-4700-9713-f8894bf9e665.preview.emergentagent.com/api/auth/login"
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

def get_pending_vendors(token):
    """Get pending vendor profiles"""
    url = "https://5e432144-ca53-4700-9713-f8894bf9e665.preview.emergentagent.com/api/admin/vendors/pending"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    print(f"\n🔍 Getting pending vendor profiles")
    
    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Got pending vendor profiles! Status code: {response.status_code}")
            try:
                response_data = response.json()
                print(f"Found {len(response_data)} pending vendor profiles")
                return True, response_data
            except:
                print(f"Response parsing error: {response.text}")
                return True, {}
        else:
            print(f"❌ Failed to get pending vendor profiles. Status code: {response.status_code}")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, {}
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, {}

def approve_vendor(token, vendor_id):
    """Approve a vendor profile"""
    url = f"https://5e432144-ca53-4700-9713-f8894bf9e665.preview.emergentagent.com/api/admin/vendors/{vendor_id}/approve"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }
    
    print(f"\n🔍 Approving vendor profile with ID: {vendor_id}")
    
    try:
        response = requests.post(url, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Vendor profile approved! Status code: {response.status_code}")
            try:
                response_data = response.json()
                print(f"Response: {response_data}")
                return True, response_data
            except:
                print(f"Response parsing error: {response.text}")
                return True, {}
        else:
            print(f"❌ Failed to approve vendor profile. Status code: {response.status_code}")
            try:
                print(f"Error: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, {}
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False, {}

def main():
    """Main function to approve vendor profiles"""
    # Login as admin
    admin_user = {"email": "admin@enosi.com", "password": "admin123"}
    
    print("=== Approving Vendor Profiles ===")
    
    # Login as admin
    success, response = test_login(admin_user["email"], admin_user["password"])
    if not success or 'access_token' not in response:
        print("❌ Failed to login as admin. Cannot approve vendor profiles.")
        return
    
    token = response['access_token']
    
    # Get pending vendor profiles
    success, vendors = get_pending_vendors(token)
    if not success or not vendors:
        print("❌ No pending vendor profiles found.")
        return
    
    # Approve each vendor profile
    for vendor in vendors:
        vendor_id = vendor.get('id')
        if vendor_id:
            approve_vendor(token, vendor_id)
    
    print("\n=== VENDOR PROFILE APPROVAL COMPLETE ===")
    print("All pending vendor profiles have been approved.")

if __name__ == "__main__":
    main()