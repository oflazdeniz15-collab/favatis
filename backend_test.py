import requests
import sys
import json
from datetime import datetime

class FavatisAPITester:
    def __init__(self, base_url="https://musicsubhub.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = "admin_session_default"
        self.fan_token = None
        self.artist_token = None
        self.artist_id = None
        self.tier_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, cookies=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, cookies=cookies)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, cookies=cookies)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, cookies=cookies)

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
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_auth(self):
        """Test admin authentication"""
        success, response = self.run_test(
            "Admin Authentication",
            "GET",
            "auth/me",
            200,
            token=self.admin_token
        )
        if success and response.get('role') == 'admin':
            print(f"   Admin user: {response.get('email')}")
            return True
        return False

    def test_fan_email_signup(self):
        """Test fan email signup"""
        timestamp = datetime.now().strftime('%H%M%S')
        fan_data = {
            "email": f"testfan_{timestamp}@example.com",
            "name": f"Test Fan {timestamp}",
            "role": "fan"
        }
        
        success, response = self.run_test(
            "Fan Email Signup",
            "POST",
            "auth/email-signup",
            200,
            data=fan_data
        )
        
        if success and response.get('user_id'):
            print(f"   Fan created: {response.get('email')}")
            # Note: In real implementation, session token would be in httpOnly cookie
            # For testing, we'll use admin token to simulate fan actions
            return True
        return False

    def test_artist_application(self):
        """Test artist application"""
        timestamp = datetime.now().strftime('%H%M%S')
        artist_data = {
            "email": f"testartist_{timestamp}@example.com",
            "name": f"Test Artist {timestamp}",
            "spotify_link": "https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb"
        }
        
        success, response = self.run_test(
            "Artist Application",
            "POST",
            "artist/apply",
            200,
            data=artist_data
        )
        
        if success and response.get('session_token'):
            self.artist_token = response['session_token']
            print(f"   Artist application created with token: {self.artist_token[:20]}...")
            return True
        return False

    def test_artist_profile_operations(self):
        """Test artist profile get and update"""
        if not self.artist_token:
            print("❌ No artist token available")
            return False
            
        # Get artist profile
        success, profile = self.run_test(
            "Get Artist Profile",
            "GET",
            "artist/profile",
            200,
            token=self.artist_token
        )
        
        if success and profile.get('artist_id'):
            self.artist_id = profile['artist_id']
            print(f"   Artist ID: {self.artist_id}")
            
            # Update artist profile
            update_data = {
                "bio": "This is a test artist bio for testing purposes.",
                "profile_image": "https://via.placeholder.com/300"
            }
            
            success, updated = self.run_test(
                "Update Artist Profile",
                "PUT",
                "artist/profile",
                200,
                data=update_data,
                token=self.artist_token
            )
            
            if success:
                print(f"   Profile updated successfully")
                return True
        
        return False

    def test_artist_submission(self):
        """Test artist profile submission for review"""
        if not self.artist_token:
            print("❌ No artist token available")
            return False
            
        success, response = self.run_test(
            "Submit Artist Profile",
            "POST",
            "artist/submit",
            200,
            token=self.artist_token
        )
        
        if success:
            print(f"   Profile submitted for review")
            return True
        return False

    def test_admin_view_applications(self):
        """Test admin viewing pending applications"""
        success, applications = self.run_test(
            "Admin View Applications",
            "GET",
            "admin/applications",
            200,
            token=self.admin_token
        )
        
        if success:
            print(f"   Found {len(applications)} pending applications")
            return True
        return False

    def test_admin_approve_artist(self):
        """Test admin approving artist"""
        if not self.artist_id:
            print("❌ No artist ID available")
            return False
            
        approval_data = {"approved": True}
        
        success, response = self.run_test(
            "Admin Approve Artist",
            "POST",
            f"admin/artist/{self.artist_id}/approve",
            200,
            data=approval_data,
            token=self.admin_token
        )
        
        if success:
            print(f"   Artist approved successfully")
            return True
        return False

    def test_public_artists(self):
        """Test public artists listing"""
        success, artists = self.run_test(
            "Public Artists List",
            "GET",
            "artists/public",
            200
        )
        
        if success:
            print(f"   Found {len(artists)} approved artists")
            return True
        return False

    def test_artist_search(self):
        """Test artist search"""
        success, results = self.run_test(
            "Artist Search",
            "GET",
            "artists/search?q=Test",
            200
        )
        
        if success:
            print(f"   Search returned {len(results)} results")
            return True
        return False

    def test_subscription_tiers(self):
        """Test creating and getting subscription tiers"""
        if not self.artist_token:
            print("❌ No artist token available")
            return False
            
        tier_data = {
            "name": "Basic Tier",
            "price": 9.99,
            "benefits": ["Early access to songs", "Monthly behind-the-scenes content"]
        }
        
        success, tier = self.run_test(
            "Create Subscription Tier",
            "POST",
            "artist/tiers",
            200,
            data=tier_data,
            token=self.artist_token
        )
        
        if success and tier.get('tier_id'):
            self.tier_id = tier['tier_id']
            print(f"   Tier created: {tier['name']} - ${tier['price']}")
            
            # Get artist tiers
            success, tiers = self.run_test(
                "Get Artist Tiers",
                "GET",
                "artist/tiers",
                200,
                token=self.artist_token
            )
            
            if success:
                print(f"   Retrieved {len(tiers)} tiers")
                return True
        
        return False

    def test_gated_content(self):
        """Test creating and getting gated content"""
        if not self.artist_token or not self.tier_id:
            print("❌ No artist token or tier ID available")
            return False
            
        content_data = {
            "title": "Exclusive Song Preview",
            "content_type": "audio",
            "content_text": "This is an exclusive preview of my upcoming song!",
            "external_link": "https://soundcloud.com/example",
            "tier_ids": [self.tier_id]
        }
        
        success, content = self.run_test(
            "Create Gated Content",
            "POST",
            "artist/content",
            200,
            data=content_data,
            token=self.artist_token
        )
        
        if success:
            print(f"   Content created: {content.get('title')}")
            
            # Get artist content
            success, content_list = self.run_test(
                "Get Artist Content",
                "GET",
                "artist/content",
                200,
                token=self.artist_token
            )
            
            if success:
                print(f"   Retrieved {len(content_list)} content items")
                return True
        
        return False

    def test_admin_analytics(self):
        """Test admin analytics"""
        success, analytics = self.run_test(
            "Admin Analytics",
            "GET",
            "admin/analytics",
            200,
            token=self.admin_token
        )
        
        if success:
            print(f"   Analytics: {analytics}")
            return True
        return False

def main():
    print("🚀 Starting Favatis API Testing...")
    print("=" * 50)
    
    tester = FavatisAPITester()
    
    # Test sequence
    tests = [
        ("Admin Authentication", tester.test_admin_auth),
        ("Fan Email Signup", tester.test_fan_email_signup),
        ("Artist Application", tester.test_artist_application),
        ("Artist Profile Operations", tester.test_artist_profile_operations),
        ("Artist Submission", tester.test_artist_submission),
        ("Admin View Applications", tester.test_admin_view_applications),
        ("Admin Approve Artist", tester.test_admin_approve_artist),
        ("Public Artists", tester.test_public_artists),
        ("Artist Search", tester.test_artist_search),
        ("Subscription Tiers", tester.test_subscription_tiers),
        ("Gated Content", tester.test_gated_content),
        ("Admin Analytics", tester.test_admin_analytics),
    ]
    
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 80:
        print("🎉 Backend API testing completed successfully!")
        return 0
    else:
        print("⚠️  Backend API has significant issues that need attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())