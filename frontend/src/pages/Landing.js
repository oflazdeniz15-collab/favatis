import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music2, Search, Menu, X, Globe, Shield, Users, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import LanguageSelector from '@/components/LanguageSelector';
import TrustBadges, { StatsSection } from '@/components/TrustBadges';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Landing() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

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

            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="nav-home">{t('nav.home')}</Link>
              <Link to="/artists" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="nav-artists">{t('nav.artists')}</Link>
              <Link to="/contact" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="nav-contact">{t('nav.contact')}</Link>
              <Link to="/login" className="text-foreground hover:text-primary transition-colors font-medium" data-testid="nav-login">{t('nav.login')}</Link>
              <LanguageSelector variant="minimal" />
              <Link to="/artists">
                <Button variant="ghost" size="icon" data-testid="nav-search-btn">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-3 md:hidden">
              <LanguageSelector variant="minimal" />
              <button onClick={() => setMenuOpen(!menuOpen)} data-testid="mobile-menu-btn">
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border/50 bg-white" data-testid="mobile-menu">
            <div className="px-4 py-4 space-y-3">
              <Link to="/" className="block text-foreground hover:text-primary transition-colors font-medium">{t('nav.home')}</Link>
              <Link to="/artists" className="block text-foreground hover:text-primary transition-colors font-medium">{t('nav.artists')}</Link>
              <Link to="/contact" className="block text-foreground hover:text-primary transition-colors font-medium">{t('nav.contact')}</Link>
              <Link to="/login" className="block text-foreground hover:text-primary transition-colors font-medium">{t('nav.login')}</Link>
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
                {/* AI-Powered Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-medium text-purple-700">
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Artist Platform
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-none font-display text-primary" data-testid="hero-title">
                  {t('hero.title')}
                </h1>
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground font-sans max-w-2xl">
                  {t('hero.subtitle')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/artists">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8 rounded-full font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 w-full sm:w-auto" data-testid="explore-artists-btn">
                    {t('hero.exploreArtists')}
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white h-11 px-8 rounded-full font-medium transition-all duration-300 w-full sm:w-auto" data-testid="get-started-btn">
                    {t('hero.getStarted')}
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>50K+ Artists</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>100% to Artists</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1761959154680-81d4b58fb31e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwxfHxtdXNpY2lhbiUyMHBlcmZvcm1pbmclMjBzdGFnZSUyMGNvbmNlcnQlMjBsaWdodHN8ZW58MHx8fHwxNzY5Nzk4NDYyfDA&ixlib=rb-4.1.0&q=85"
                  alt="Musician performing"
                  className="w-full h-full object-cover"
                />
                {/* Floating Stats Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">$10M+</p>
                      <p className="text-xs text-gray-500">Paid to Artists</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200" />
                    <div>
                      <p className="text-2xl font-bold text-primary">190+</p>
                      <p className="text-xs text-gray-500">Countries</p>
                    </div>
                    <div className="w-px h-10 bg-gray-200" />
                    <div>
                      <p className="text-2xl font-bold text-primary">2M+</p>
                      <p className="text-xs text-gray-500">Happy Fans</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges Section */}
      <div className="bg-gray-50 py-6 border-y border-gray-100">
        <TrustBadges variant="horizontal" />
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight font-display text-primary mb-4">
              {t('features.title')}
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground font-sans max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden p-8 hover:-translate-y-1 group" data-testid="feature-card-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Music2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-medium font-display mb-3">{t('features.exclusiveContent')}</h3>
              <p className="text-base leading-relaxed text-muted-foreground">{t('features.exclusiveContentDesc')}</p>
            </div>

            <div className="bg-white border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden p-8 hover:-translate-y-1 group" data-testid="feature-card-2">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Music2 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-2xl md:text-3xl font-medium font-display mb-3">{t('features.directSupport')}</h3>
              <p className="text-base leading-relaxed text-muted-foreground">{t('features.directSupportDesc')}</p>
            </div>

            <div className="bg-white border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden p-8 hover:-translate-y-1 group" data-testid="feature-card-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Music2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-medium font-display mb-3">{t('features.flexibleTiers')}</h3>
              <p className="text-base leading-relaxed text-muted-foreground">{t('features.flexibleTiersDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <StatsSection />

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-primary via-[#570A57] to-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight font-display mb-6">
            {t('cta.artistTitle')}
          </h2>
          <p className="text-base md:text-lg leading-relaxed mb-8 opacity-90">
            {t('cta.artistSubtitle')}
          </p>
          <Link to="/artist-signup">
            <Button className="bg-white text-primary hover:bg-white/90 h-12 px-10 rounded-full font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl" data-testid="artist-signup-cta-btn">
              {t('cta.applyAsArtist')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 text-2xl font-display font-bold mb-4">
                <Music2 className="h-6 w-6" />
                Favatis
              </div>
              <p className="text-slate-400 text-sm max-w-sm">
                The platform built for genuine artist-fan connections. Support your favorite musicians directly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2">
                <Link to="/artists" className="block text-slate-400 hover:text-white transition-colors text-sm">Explore Artists</Link>
                <Link to="/artist-signup" className="block text-slate-400 hover:text-white transition-colors text-sm">Become an Artist</Link>
                <Link to="/contact" className="block text-slate-400 hover:text-white transition-colors text-sm">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">{t('footer.privacy')}</a>
                <a href="#" className="block text-slate-400 hover:text-white transition-colors text-sm">{t('footer.terms')}</a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}