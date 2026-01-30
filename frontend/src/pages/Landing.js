import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music2, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full backdrop-blur-xl bg-white/70 border-b border-border/50 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-2xl font-display font-bold text-primary">
              <Music2 className="h-8 w-8" />
              Favatis
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="nav-home">Home</Link>
              <Link to="/artists" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="nav-artists">Artists</Link>
              <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="nav-contact">Contact</Link>
              <Link to="/login" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="nav-login">Log In</Link>
              <Link to="/artists">
                <Button variant="ghost" size="icon" data-testid="nav-search-btn">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} data-testid="mobile-menu-btn">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border/50 bg-white" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-3">
              <Link to="/" className="block text-foreground hover:text-primary transition-colors font-medium">Home</Link>
              <Link to="/artists" className="block text-foreground hover:text-primary transition-colors font-medium">Artists</Link>
              <Link to="/contact" className="block text-foreground hover:text-primary transition-colors font-medium">Contact</Link>
              <Link to="/login" className="block text-foreground hover:text-primary transition-colors font-medium">Log In</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none font-display text-primary" data-testid="hero-title">
                  Connect with Your Favorite Artists
                </h1>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground font-sans max-w-2xl">
                  Support musicians directly through exclusive subscriptions. Get access to behind-the-scenes content, early releases, and connect with artists like never before.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/artists">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-full font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 w-full sm:w-auto" data-testid="explore-artists-btn">
                    Explore Artists
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white h-11 px-8 rounded-full font-medium transition-all duration-300 w-full sm:w-auto" data-testid="get-started-btn">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1761959154680-81d4b58fb31e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxtdXNpY2lhbiUyMHBlcmZvcm1pbmclMjBzdGFnZSUyMGNvbmNlcnQlMjBsaWdodHN8ZW58MHx8fHwxNzY5Nzk4NDYyfDA&ixlib=rb-4.1.0&q=85" 
                  alt="Musician performing" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight font-display text-primary mb-4">
              Why Favatis?
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground font-sans max-w-2xl mx-auto">
              The platform built for genuine artist-fan connections
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden p-8 hover:-translate-y-1 group" data-testid="feature-card-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Music2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-medium font-display mb-3">Exclusive Content</h3>
              <p className="text-base leading-relaxed text-muted-foreground">Access behind-the-scenes footage, early releases, and exclusive music from your favorite artists.</p>
            </div>

            <div className="bg-white border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden p-8 hover:-translate-y-1 group" data-testid="feature-card-2">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Music2 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-2xl md:text-3xl font-medium font-display mb-3">Direct Support</h3>
              <p className="text-base leading-relaxed text-muted-foreground">Your subscription goes directly to artists, helping them create more of what you love.</p>
            </div>

            <div className="bg-white border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden p-8 hover:-translate-y-1 group" data-testid="feature-card-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Music2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-medium font-display mb-3">Flexible Tiers</h3>
              <p className="text-base leading-relaxed text-muted-foreground">Choose the subscription level that works for you, with options for every budget.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-primary via-[#570A57] to-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight font-display mb-6">
            Are you an artist?
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-8 opacity-90">
            Join Favatis and start monetizing your music. Build your fanbase and share exclusive content with your biggest supporters.
          </p>
          <Link to="/artist-signup">
            <Button className="bg-white text-primary hover:bg-white/90 h-12 px-10 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl" data-testid="artist-signup-cta-btn">
              Apply as Artist
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-2xl font-display font-bold mb-4">
              <Music2 className="h-6 w-6" />
              Favatis
            </div>
            <p className="text-slate-400">&copy; 2026 Favatis. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}