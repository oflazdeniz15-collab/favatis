import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Music2, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Artists() {
  const [artists, setArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/artists/public`);
      if (!response.ok) throw new Error('Failed to fetch artists');
      const data = await response.json();
      setArtists(data);
    } catch (error) {
      toast.error('Failed to load artists');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchArtists();
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/artists/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setArtists(data);
    } catch (error) {
      toast.error('Search failed');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-white/70 border-b border-border/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-2xl font-display font-bold text-primary">
              <Music2 className="h-8 w-8" />
              Favatis
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">Home</Link>
              <Link to="/artists" className="text-primary font-semibold">Artists</Link>
              <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium">Contact</Link>
              <Link to="/login" className="text-foreground hover:text-primary transition-colors font-medium">Log In</Link>
            </div>

            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold font-display text-primary mb-4" data-testid="artists-page-title">
              Discover Artists
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Find your favorite musicians and support them directly through exclusive subscriptions
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for artists..."
                className="h-12 pl-12 pr-4 rounded-full text-base"
                data-testid="artist-search-input"
              />
            </form>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading artists...</p>
            </div>
          ) : artists.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground" data-testid="no-artists-message">No artists found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="artists-grid">
              {artists.map((artist) => (
                <Link 
                  key={artist.artist_id} 
                  to={`/artist/${artist.artist_id}`}
                  className="group"
                  data-testid={`artist-card-${artist.artist_id}`}
                >
                  <div className="bg-white border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden hover:-translate-y-1">
                    <div className="aspect-square overflow-hidden bg-slate-100">
                      {artist.profile_image ? (
                        <img 
                          src={artist.profile_image} 
                          alt={artist.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          <Music2 className="h-16 w-16 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold font-display text-primary mb-2 group-hover:text-accent transition-colors">
                        {artist.name}
                      </h3>
                      {artist.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {artist.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}