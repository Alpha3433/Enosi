import requests
import sys
import json
import uuid
import base64
import os
from datetime import datetime, timedelta

class StreamChatAPITester:
    def __init__(self, base_url="https://4c0e1cae-d13a-41b5-a0eb-333416e55eed.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.couple_user = None
        self.vendor_user = None
        self.vendor_id = None
        self.stream_token = None
        self.stream_api_key = None
        self.channel_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None, files=None):
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
                if files:
                    # For multipart/form-data requests (file uploads)
                    headers.pop('Content-Type', None)  # Let requests set the correct Content-Type
                    response = requests.post(url, headers=headers, data=data, files=files)
                else:
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

    def test_register_user(self, user_type="vendor"):
        """Test user registration"""
        unique_id = str(uuid.uuid4())[:8]
        
        if user_type == "vendor":
            email = f"vendor_{unique_id}@example.com"
        else:
            email = f"couple_{unique_id}@example.com"
        
        data = {
            "email": email,
            "password": "Password123!",
            "first_name": "Test",
            "last_name": user_type.capitalize(),
            "phone": "1234567890",
            "user_type": user_type
        }
        
        success, response = self.run_test(
            f"Register {user_type.capitalize()}",
            "POST",
            "auth/register",
            200,
            data=data
        )
        
        if success:
            if user_type == "vendor":
                self.vendor_user = {
                    "email": email,
                    "password": "Password123!"
                }
                print(f"Created vendor user: {email}")
            else:
                self.couple_user = {
                    "email": email,
                    "password": "Password123!"
                }
                print(f"Created couple user: {email}")
        
        return success, response

    def test_login(self, user_type="vendor"):
        """Test login functionality"""
        if user_type == "vendor":
            if not self.vendor_user:
                # Use the provided test credentials
                self.vendor_user = {
                    "email": "vendor_94886ffc@example.com",
                    "password": "Password123!"
                }
            user = self.vendor_user
        else:
            if not self.couple_user:
                # Register a couple user if none exists
                self.test_register_user(user_type="couple")
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
            
            # If vendor, store the vendor ID
            if user_type == "vendor" and 'user' in response and 'id' in response['user']:
                self.vendor_id = response['user']['id']
                print(f"Vendor ID: {self.vendor_id}")
                
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

    # Stream Chat API Tests
    def test_stream_chat_auth_token(self):
        """Test getting Stream Chat authentication token"""
        success, response = self.run_test(
            "Get Stream Chat Auth Token",
            "POST",
            "chat/auth-token",
            200
        )
        
        if success and response:
            if 'token' in response and 'api_key' in response:
                self.stream_token = response['token']
                self.stream_api_key = response['api_key']
                print(f"Stream Chat Token: {self.stream_token[:20]}...")
                print(f"Stream Chat API Key: {self.stream_api_key}")
                return True, response
            else:
                print("❌ Missing token or API key in response")
        
        return success, response

    def test_create_channel(self):
        """Test creating a Stream Chat channel"""
        if not self.vendor_id:
            print("❌ No vendor ID available for channel creation test")
            return False, {}
            
        # Create a unique channel ID
        channel_id = f"test_channel_{uuid.uuid4()}"
        self.channel_id = channel_id
        
        data = {
            "channel_type": "messaging",
            "channel_id": channel_id,
            "members": [self.vendor_id],
            "name": "Test Channel"
        }
        
        success, response = self.run_test(
            "Create Stream Chat Channel",
            "POST",
            "chat/create-channel",
            200,
            data=data
        )
        
        if success and response:
            print(f"Created channel with ID: {channel_id}")
        
        return success, response

    def test_upload_file(self, file_type="image"):
        """Test uploading a file for chat"""
        if file_type == "image":
            # Create a simple base64 image for testing
            sample_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
            image_bytes = base64.b64decode(sample_image)
            
            # Create a temporary file
            with open("test_image.png", "wb") as f:
                f.write(image_bytes)
            
            files = {
                'file': ('test_image.png', open('test_image.png', 'rb'), 'image/png')
            }
            file_path = "test_image.png"
            content_type = 'image/png'
            
        elif file_type == "document":
            # Create a simple text document
            with open("test_document.txt", "w") as f:
                f.write("This is a test document for upload testing.")
            
            files = {
                'file': ('test_document.txt', open('test_document.txt', 'rb'), 'text/plain')
            }
            file_path = "test_document.txt"
            content_type = 'text/plain'
            
        elif file_type == "large_file":
            # Create a file larger than 10MB to test size limit
            with open("large_file.bin", "wb") as f:
                f.write(b'0' * (11 * 1024 * 1024))  # 11MB
            
            files = {
                'file': ('large_file.bin', open('large_file.bin', 'rb'), 'application/octet-stream')
            }
            file_path = "large_file.bin"
            content_type = 'application/octet-stream'
            
        else:
            print(f"❌ Unsupported file type: {file_type}")
            return False, {}
        
        try:
            url = f"{self.base_url}/chat/upload-file"
            headers = {'Authorization': f'Bearer {self.token}'}
            
            self.tests_run += 1
            print(f"\n🔍 Testing Upload {file_type.capitalize()} File...")
            
            response = requests.post(url, headers=headers, files=files)
            
            # For large file test, we expect a 400 error
            expected_status = 400 if file_type == "large_file" else 200
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
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
        finally:
            # Clean up temporary file
            if os.path.exists(file_path):
                os.remove(file_path)

    def test_get_user_channels(self):
        """Test getting user's chat channels"""
        return self.run_test(
            "Get User Channels",
            "GET",
            "chat/channels",
            200
        )

    def test_start_conversation(self):
        """Test starting a conversation with a vendor"""
        if not self.vendor_id:
            print("❌ No vendor ID available for conversation test")
            return False, {}
            
        success, response = self.run_test(
            "Start Conversation with Vendor",
            "POST",
            f"chat/start-conversation?vendor_id={self.vendor_id}",
            200
        )
        
        if success and response and 'channel_id' in response:
            print(f"Started conversation with channel ID: {response['channel_id']}")
        
        return success, response

def test_stream_chat_api():
    """Test the Stream Chat API integration"""
    print("\n🚀 Starting Stream Chat API Tests")
    print("=" * 80)
    
    # Setup
    tester = StreamChatAPITester()
    
    # 1. Test Authentication Token Generation
    print("\n🔑 Testing Stream Chat Authentication")
    print("-" * 80)
    
    # Login as vendor using provided test credentials
    success, _ = tester.test_login("vendor")
    if success:
        # Get user profile to verify authentication
        tester.test_get_user_profile()
        
        # Test getting Stream Chat token
        tester.test_stream_chat_auth_token()
    else:
        print("❌ Login failed, cannot proceed with Stream Chat tests")
        return tester.tests_passed, tester.tests_run
    
    # 2. Test Channel Creation
    print("\n📢 Testing Channel Creation")
    print("-" * 80)
    
    tester.test_create_channel()
    
    # 3. Test File Upload
    print("\n📁 Testing File Upload")
    print("-" * 80)
    
    # Test uploading an image
    tester.test_upload_file("image")
    
    # Test uploading a document
    tester.test_upload_file("document")
    
    # Test uploading a file that's too large (should fail with 400)
    tester.test_upload_file("large_file")
    
    # 4. Test Getting User Channels
    print("\n📋 Testing User Channels")
    print("-" * 80)
    
    tester.test_get_user_channels()
    
    # 5. Test Starting a Conversation
    print("\n💬 Testing Start Conversation")
    print("-" * 80)
    
    # Login as couple to start a conversation with the vendor
    tester.test_login("couple")
    tester.test_start_conversation()
    
    # Get channels again to verify the new conversation appears
    tester.test_get_user_channels()
    
    # Print results
    print("\n📊 Tests passed: {}/{}".format(tester.tests_passed, tester.tests_run))
    print("=" * 80)
    
    return tester.tests_passed, tester.tests_run

if __name__ == "__main__":
    passed, total = test_stream_chat_api()
    sys.exit(0 if passed == total else 1)