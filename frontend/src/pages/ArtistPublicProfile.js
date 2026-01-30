import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Music2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ArtistPublicProfile() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtistData();
  }, [artistId]);

  const fetchArtistData = async () => {
    try {
      const [artistRes, tiersRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/artist/${artistId}`),
        fetch(`${BACKEND_URL}/api/artist/${artistId}/tiers`)
      ]);

      if (!artistRes.ok) throw new Error('Artist not found');
      
      const artistData = await artistRes.json();
      const tiersData = await tiersRes.json();
      
      setArtist(artistData);
      setTiers(tiersData);
    } catch (error) {
      toast.error(error.message);
      navigate('/artists');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (tierId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: 'include'
      });

      if (!response.ok) {
        navigate('/login');
        return;
      }

      const user = await response.json();
      if (user.role !== 'fan') {
        toast.error('Only fans can subscribe');
        return;
      }

      const checkoutResponse = await fetch(`${BACKEND_URL}/api/subscribe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tier_id: tierId,
          origin_url: window.location.origin
        })
      });

      if (!checkoutResponse.ok) throw new Error('Failed to create checkout');

      const { checkout_url } = await checkoutResponse.json();
      window.location.href = checkout_url;
    } catch (error) {
      toast.error(error.message);
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

  if (!artist) return null;

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-2xl font-display font-bold text-primary">
              <Music2 className="h-8 w-8" />
              Favatis
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/artists" className="text-foreground hover:text-primary transition-colors font-medium">Back to Artists</Link>
              <Link to="/login">
                <Button size="sm" data-testid="login-btn">Log In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-1">
              <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-lg">
                {artist.profile_image ? (
                  <img src={artist.profile_image} alt={artist.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                    <Music2 className="h-24 w-24 text-primary/40" />
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <div>
                <h1 className="text-5xl font-bold font-display text-primary mb-4" data-testid="artist-name">
                  {artist.name}
                </h1>
                {artist.bio && (
                  <p className="text-base text-muted-foreground leading-relaxed" data-testid="artist-bio">
                    {artist.bio}
                  </p>
                )}
              </div>

              {artist.spotify_link && (
                <div>
                  <a 
                    href={artist.spotify_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    data-testid="spotify-link"
                  >
                    <Music2 className="h-4 w-4" />
                    Listen on Spotify
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold font-display text-primary mb-2">Subscription Tiers</h2>
              <p className="text-muted-foreground">Choose your level of support</p>
            </div>

            {tiers.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl">
                <p className="text-muted-foreground">No subscription tiers available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="subscription-tiers">
                {tiers.map((tier) => (
                  <div 
                    key={tier.tier_id}
                    className="bg-white border-2 border-border/50 rounded-xl p-6 shadow-sm hover:border-primary/50 hover:shadow-md transition-all duration-300"
                    data-testid={`tier-card-${tier.tier_id}`}
                  >
                    <h3 className="text-2xl font-bold font-display text-primary mb-2">
                      {tier.name}
                    </h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-primary">${tier.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {tier.benefits.map((benefit, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={() => handleSubscribe(tier.tier_id)}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-full font-medium transition-all duration-300"
                      data-testid={`subscribe-btn-${tier.tier_id}`}
                    >
                      Subscribe
                    </Button>
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