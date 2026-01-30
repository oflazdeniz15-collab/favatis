import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Music2, LogOut, CheckCircle, XCircle, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.user) {
      setUser(location.state.user);
      fetchData();
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
      if (userData.role !== 'admin') {
        navigate('/');
        return;
      }
      setUser(userData);
      fetchData();
    } catch (error) {
      navigate('/login');
    }
  };

  const fetchData = async () => {
    try {
      const [applicationsRes, analyticsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/applications`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/admin/analytics`, { credentials: 'include' })
      ]);

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json();
        setApplications(applicationsData);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (artistId, approved) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/artist/${artistId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ approved })
      });

      if (!response.ok) throw new Error('Failed to process approval');

      toast.success(approved ? 'Artist approved!' : 'Artist rejected');
      fetchData();
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

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-2xl font-display font-bold text-primary">
              <Music2 className="h-8 w-8" />
              Favatis Admin
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-btn">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-2" data-testid="admin-dashboard-title">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage artists and platform analytics</p>
          </div>

          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12" data-testid="analytics-cards">
              <div className="bg-white border border-border/50 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Music2 className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Total Artists</p>
                </div>
                <p className="text-3xl font-bold text-primary">{analytics.total_artists}</p>
              </div>

              <div className="bg-white border border-border/50 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground">Total Fans</p>
                </div>
                <p className="text-3xl font-bold text-primary">{analytics.total_fans}</p>
              </div>

              <div className="bg-white border border-border/50 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Subscriptions</p>
                </div>
                <p className="text-3xl font-bold text-primary">{analytics.total_subscriptions}</p>
              </div>

              <div className="bg-white border border-border/50 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Music2 className="h-5 w-5 text-yellow-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <p className="text-3xl font-bold text-primary">{analytics.pending_applications}</p>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold font-display text-primary mb-6">Pending Artist Applications</h2>
            
            {applications.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-xl" data-testid="no-applications-message">
                <Music2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold font-display mb-2">No Pending Applications</h3>
                <p className="text-muted-foreground">All caught up! No artists waiting for review.</p>
              </div>
            ) : (
              <div className="space-y-6" data-testid="applications-list">
                {applications.map((artist) => (
                  <div 
                    key={artist.artist_id}
                    className="bg-white border border-border/50 rounded-xl p-6 shadow-sm"
                    data-testid={`application-${artist.artist_id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold font-display text-primary mb-2">
                          {artist.name}
                        </h3>
                        {artist.bio && (
                          <p className="text-sm text-muted-foreground mb-3">{artist.bio}</p>
                        )}
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Spotify:</span>{' '}
                            <a href={artist.spotify_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" data-testid={`spotify-link-${artist.artist_id}`}>
                              {artist.spotify_link}
                            </a>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {new Date(artist.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          onClick={() => handleApproval(artist.artist_id, true)}
                          className="bg-green-600 text-white hover:bg-green-700 rounded-full"
                          size="sm"
                          data-testid={`approve-btn-${artist.artist_id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleApproval(artist.artist_id, false)}
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50 rounded-full"
                          size="sm"
                          data-testid={`reject-btn-${artist.artist_id}`}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}