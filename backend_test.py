import requests
import sys
import json
import os
from datetime import datetime
import tempfile
import io

class ResumeCleanerAPITester:
    def __init__(self, base_url="https://cvpolisher.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.resume_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
            
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        # Remove Content-Type for file uploads
        if files:
            test_headers.pop('Content-Type', None)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, data=data, headers=test_headers)
                else:
                    response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        test_user_data = {
            "username": f"testuser_{datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token received: {self.token[:20]}...")
            return True, test_user_data
        return False, {}

    def test_user_login(self, user_data):
        """Test user login"""
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   New token received: {self.token[:20]}...")
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if success and 'id' in response:
            self.user_id = response['id']
            print(f"   User ID: {self.user_id}")
            return True
        return False

    def test_resume_upload(self):
        """Test resume upload with a sample PDF"""
        # Create a simple test PDF content
        test_pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test Resume Content) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF"
        
        files = {
            'file': ('test_resume.pdf', io.BytesIO(test_pdf_content), 'application/pdf')
        }
        
        success, response = self.run_test(
            "Resume Upload",
            "POST",
            "resume/upload",
            200,
            files=files
        )
        
        if success and 'resume_id' in response:
            self.resume_id = response['resume_id']
            print(f"   Resume ID: {self.resume_id}")
            return True
        return False

    def test_resume_clean(self):
        """Test resume cleaning with AI"""
        if not self.resume_id:
            print("❌ No resume ID available for cleaning test")
            return False
            
        clean_data = {
            "resume_id": self.resume_id
        }
        
        success, response = self.run_test(
            "Resume Cleaning",
            "POST",
            "resume/clean",
            200,
            data=clean_data
        )
        
        if success and 'cleaned_text' in response:
            print(f"   Cleaned text preview: {response['cleaned_text'][:100]}...")
            return True
        return False

    def test_list_resumes(self):
        """Test listing user's resumes"""
        success, response = self.run_test(
            "List Resumes",
            "GET",
            "resume/list",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} resumes")
            return True
        return False

    def test_get_resume(self):
        """Test getting specific resume"""
        if not self.resume_id:
            print("❌ No resume ID available for get test")
            return False
            
        success, response = self.run_test(
            "Get Resume",
            "GET",
            f"resume/{self.resume_id}",
            200
        )
        
        if success and 'id' in response:
            print(f"   Retrieved resume: {response['id']}")
            return True
        return False

    def test_download_resume(self):
        """Test downloading cleaned resume as PDF"""
        if not self.resume_id:
            print("❌ No resume ID available for download test")
            return False
            
        url = f"{self.base_url}/resume/{self.resume_id}/download"
        headers = {}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing Resume Download...")
        print(f"   URL: {url}")
        
        try:
            response = requests.get(url, headers=headers)
            success = response.status_code == 200
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                print(f"   Content-Type: {response.headers.get('content-type')}")
                print(f"   Content-Length: {len(response.content)} bytes")
                return True
            else:
                print(f"❌ Failed - Expected 200, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False
        finally:
            self.tests_run += 1

def main():
    print("🚀 Starting Resume Cleaner API Tests")
    print("=" * 50)
    
    # Initialize tester
    tester = ResumeCleanerAPITester()
    
    # Test sequence
    print("\n📝 Testing Authentication Flow...")
    
    # 1. Test registration
    reg_success, user_data = tester.test_user_registration()
    if not reg_success:
        print("❌ Registration failed, stopping tests")
        return 1

    # 2. Test login
    login_success = tester.test_user_login(user_data)
    if not login_success:
        print("❌ Login failed, stopping tests")
        return 1

    # 3. Test get current user
    user_success = tester.test_get_current_user()
    if not user_success:
        print("❌ Get current user failed, stopping tests")
        return 1

    print("\n📄 Testing Resume Management Flow...")
    
    # 4. Test resume upload
    upload_success = tester.test_resume_upload()
    if not upload_success:
        print("❌ Resume upload failed, stopping tests")
        return 1

    # 5. Test resume cleaning
    clean_success = tester.test_resume_clean()
    if not clean_success:
        print("❌ Resume cleaning failed, continuing with other tests...")

    # 6. Test list resumes
    list_success = tester.test_list_resumes()
    if not list_success:
        print("❌ List resumes failed, continuing with other tests...")

    # 7. Test get specific resume
    get_success = tester.test_get_resume()
    if not get_success:
        print("❌ Get resume failed, continuing with other tests...")

    # 8. Test download resume (only if cleaning was successful)
    if clean_success:
        download_success = tester.test_download_resume()
        if not download_success:
            print("❌ Download resume failed")

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())