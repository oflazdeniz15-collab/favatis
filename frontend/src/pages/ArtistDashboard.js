import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Music2, LogOut, Edit3, Send, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ArtistDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '', profile_image: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.user) {
      setUser(location.state.user);
      fetchProfile();
    } else {
      checkAuth();
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Not authenticated');
      
      const userData = await response.json();
      if (userData.role !== 'artist') {
        navigate('/');
        return;
      }
      setUser(userData);
      fetchProfile();
    } catch (error) {
      navigate('/login');
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/artist/profile`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const profileData = await response.json();
      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        bio: profileData.bio || '',
        profile_image: profileData.profile_image || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/artist/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/artist/submit`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to submit for review');

      toast.success('Profile submitted for review!');
      fetchProfile();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = () => {
    if (profile?.status === 'approved') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (profile?.status === 'pending') return <Clock className="h-5 w-5 text-yellow-600" />;
    if (profile?.status === 'rejected') return <XCircle className="h-5 w-5 text-red-600" />;
    return <Edit3 className="h-5 w-5 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (profile?.status === 'approved') return 'Approved & Live';
    if (profile?.status === 'pending') return 'Pending Review';
    if (profile?.status === 'rejected') return 'Rejected';
    return 'Draft';
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-2xl font-display font-bold text-primary">
              <Music2 className="h-8 w-8" />
              Favatis
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/artist/tiers">
                <Button variant="ghost" size="sm" data-testid="manage-tiers-btn">Tiers</Button>
              </Link>
              <Link to="/artist/content">
                <Button variant="ghost" size="sm" data-testid="manage-content-btn">Content</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-btn">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl md:text-5xl font-bold font-display text-primary" data-testid="artist-dashboard-title">
                Artist Dashboard
              </h1>
              <div className="flex items-center gap-2 text-sm" data-testid="profile-status">
                {getStatusIcon()}
                <span className="font-medium">{getStatusText()}</span>
              </div>
            </div>
            <p className="text-muted-foreground">Manage your artist profile and content</p>
          </div>

          {profile?.status === 'draft' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-yellow-900 mb-2">Complete Your Profile</h3>
              <p className="text-sm text-yellow-800 mb-4">
                Fill in your profile information and create at least one subscription tier, then submit for review.
              </p>
            </div>
          )}

          {profile?.status === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">Under Review</h3>
              <p className="text-sm text-blue-800">
                Your profile is being reviewed by our team. You'll be notified once it's approved.
              </p>
            </div>
          )}

          <div className="bg-white border border-border/50 rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold font-display text-primary">Profile Information</h2>
              {!editing && profile?.status === 'draft' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditing(true)}
                  data-testid="edit-profile-btn"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Artist Name</Label>
                  <Input 
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-11"
                    data-testid="name-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    rows={4}
                    placeholder="Tell fans about yourself..."
                    data-testid="bio-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile_image">Profile Image URL</Label>
                  <Input 
                    id="profile_image"
                    value={formData.profile_image}
                    onChange={(e) => setFormData({...formData, profile_image: e.target.value})}
                    className="h-11"
                    placeholder="https://..."
                    data-testid="image-url-input"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" data-testid="save-profile-btn">
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label className="text-muted-foreground">Artist Name</Label>
                  <p className="text-lg font-semibold text-foreground mt-1">{profile?.name}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Bio</Label>
                  <p className="text-foreground mt-1">{profile?.bio || 'No bio added yet'}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Profile Image</Label>
                  {profile?.profile_image ? (
                    <div className="mt-2">
                      <img src={profile.profile_image} alt="Profile" className="w-32 h-32 rounded-lg object-cover" />
                    </div>
                  ) : (
                    <p className="text-foreground mt-1">No image added yet</p>
                  )}
                </div>

                <div>
                  <Label className="text-muted-foreground">Spotify Link</Label>
                  <a href={profile?.spotify_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-1 block">
                    {profile?.spotify_link}
                  </a>
                </div>
              </div>
            )}
          </div>

          {profile?.status === 'draft' && !editing && (
            <div className="mt-8 text-center">
              <Button 
                onClick={handleSubmitForReview}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-10 rounded-full font-semibold"
                data-testid="submit-review-btn"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}