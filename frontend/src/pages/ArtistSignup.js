import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Music2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ArtistSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    spotify_link: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.name || !formData.spotify_link) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/artist/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Application failed');
      }

      const result = await response.json();
      toast.success('Application submitted! You can now set up your profile.');
      
      document.cookie = `session_token=${result.session_token}; path=/; max-age=${7*24*60*60}; secure; samesite=none`;
      
      setTimeout(() => {
        navigate('/artist/dashboard');
      }, 1000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <nav className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-2xl font-display font-bold text-primary">
              <Music2 className="h-8 w-8" />
              Favatis
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" data-testid="back-home-btn">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-3" data-testid="artist-signup-title">
              Apply as an Artist
            </h1>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Join Favatis and start building your fanbase. Share exclusive content and monetize your music.
            </p>
          </div>

          <div className="bg-white border border-border/50 rounded-xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Artist Name *</Label>
                <Input 
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="h-11 rounded-lg"
                  placeholder="Your artist or band name"
                  data-testid="artist-name-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-11 rounded-lg"
                  placeholder="artist@example.com"
                  data-testid="artist-email-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spotify">Spotify Artist Profile Link *</Label>
                <Input 
                  id="spotify"
                  type="url"
                  value={formData.spotify_link}
                  onChange={(e) => setFormData({...formData, spotify_link: e.target.value})}
                  className="h-11 rounded-lg"
                  placeholder="https://open.spotify.com/artist/..."
                  data-testid="spotify-link-input"
                />
                <p className="text-sm text-muted-foreground">
                  We use this to verify your artist identity. Make sure the link follows this format.
                </p>
              </div>

              <div className="bg-slate-50 border border-border/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-sm">What happens next?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Create your artist profile and subscription tiers</li>
                  <li>• Submit your profile for review</li>
                  <li>• Our team verifies your Spotify profile</li>
                  <li>• Once approved, your profile goes live!</li>
                </ul>
              </div>

              <Button 
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                data-testid="submit-artist-application-btn"
              >
                Submit Application
              </Button>
            </form>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Already applied? <span className="font-semibold">Log in here</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}