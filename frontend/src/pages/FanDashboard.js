import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Music2, LogOut, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function FanDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [artistsMap, setArtistsMap] = useState({});
  const [tiersMap, setTiersMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.state?.user) {
      setUser(location.state.user);
      fetchSubscriptions();
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
      if (userData.role !== 'fan') {
        navigate('/');
        return;
      }
      setUser(userData);
      fetchSubscriptions();
    } catch (error) {
      navigate('/login');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/fan/subscriptions`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to fetch subscriptions');
      
      const subs = await response.json();
      setSubscriptions(subs);

      const artistIds = [...new Set(subs.map(s => s.artist_id))];
      const tierIds = [...new Set(subs.map(s => s.tier_id))];

      const artistsData = {};
      const tiersData = {};

      for (const artistId of artistIds) {
        try {
          const res = await fetch(`${BACKEND_URL}/api/artist/${artistId}`);
          if (res.ok) {
            artistsData[artistId] = await res.json();
            
            const tiersRes = await fetch(`${BACKEND_URL}/api/artist/${artistId}/tiers`);
            if (tiersRes.ok) {
              const tiers = await tiersRes.json();
              tiers.forEach(tier => {
                tiersData[tier.tier_id] = tier;
              });
            }
          }
        } catch (err) {
          console.error(`Failed to fetch artist ${artistId}:`, err);
        }
      }

      setArtistsMap(artistsData);
      setTiersMap(tiersData);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
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
              Favatis
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/artists">
                <Button variant="ghost" size="sm">Browse Artists</Button>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-2" data-testid="fan-dashboard-title">
              Welcome, {user?.name}!
            </h1>
            <p className="text-muted-foreground">Manage your subscriptions and access exclusive content</p>
          </div>

          {subscriptions.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-xl" data-testid="no-subscriptions-message">
              <Music2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold font-display mb-2">No Active Subscriptions</h3>
              <p className="text-muted-foreground mb-6">Start supporting your favorite artists today!</p>
              <Link to="/artists">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-full">
                  Explore Artists
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold font-display text-primary mb-4">Your Subscriptions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="subscriptions-grid">
                  {subscriptions.map((sub) => {
                    const artist = artistsMap[sub.artist_id];
                    const tier = tiersMap[sub.tier_id];
                    
                    return (
                      <div 
                        key={sub.subscription_id}
                        className="bg-white border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                        data-testid={`subscription-card-${sub.subscription_id}`}
                      >
                        {artist && (
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                              <Music2 className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold font-display text-primary truncate">{artist.name}</h3>
                              <p className="text-sm text-muted-foreground">{tier?.name || 'Tier'}</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <span className={`font-medium ${sub.status === 'active' ? 'text-green-600' : 'text-muted-foreground'}`}>
                              {sub.status}
                            </span>
                          </div>
                          
                          {tier && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Price</span>
                              <span className="font-semibold text-primary">${tier.price}/mo</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-border">
                          <Link to={`/fan/content/${sub.artist_id}`}>
                            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-full" data-testid={`view-content-btn-${sub.artist_id}`}>
                              View Content
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}