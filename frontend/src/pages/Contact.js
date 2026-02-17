import { Link } from 'react-router-dom';
import { Music2, Mail, MessageSquare, Send, MapPin, Clock, Phone } from 'lucide-react';
import SecureContactForm from '@/components/SecureContactForm';
import TrustBadges from '@/components/TrustBadges';

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-2xl font-display font-bold text-primary">
              <Music2 className="h-8 w-8" />
              Favatis
            </Link>
            <div className="flex items-center gap-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">Home</Link>
              <Link to="/artists" className="text-foreground hover:text-primary transition-colors font-medium">Artists</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-primary mb-4" data-testid="contact-page-title">
              Get in Touch
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Our team typically responds within 24 hours.
            </p>
          </div>

          {/* Trust Badges */}
          <div className="mb-12">
            <TrustBadges variant="compact" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold font-display mb-2">Email Us</h3>
                <p className="text-muted-foreground text-sm mb-3">Reach out to our support team</p>
                <a href="mailto:support@favatis.com" className="text-primary font-medium hover:underline" data-testid="support-email-link">
                  support@favatis.com
                </a>
              </div>

              <div className="bg-white border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold font-display mb-2">For Artists</h3>
                <p className="text-muted-foreground text-sm mb-3">Questions about joining Favatis?</p>
                <a href="mailto:artists@favatis.com" className="text-primary font-medium hover:underline" data-testid="artists-email-link">
                  artists@favatis.com
                </a>
              </div>

              <div className="bg-white border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold font-display mb-2">Response Time</h3>
                <p className="text-muted-foreground text-sm mb-1">Monday - Friday</p>
                <p className="text-gray-800 font-medium">Within 24 hours</p>
              </div>

              <div className="bg-white border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold font-display mb-2">Headquarters</h3>
                <p className="text-muted-foreground text-sm">
                  San Francisco, CA<br />
                  United States
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-border/50 rounded-2xl p-6 md:p-8 shadow-lg">
                <h2 className="text-2xl font-bold font-display mb-6">Send us a message</h2>
                <SecureContactForm />
              </div>
            </div>
          </div>

          {/* FAQ CTA */}
          <div className="mt-16 bg-gradient-to-br from-primary via-[#570A57] to-accent text-white rounded-2xl p-10 md:p-12 text-center">
            <Send className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">Looking for quick answers?</h2>
            <p className="text-base mb-6 opacity-90 max-w-xl mx-auto">
              Check out our comprehensive FAQ section for instant answers to common questions.
            </p>
            <button
              className="bg-white text-primary hover:bg-white/90 h-11 px-8 rounded-full font-medium transition-all hover:scale-105 active:scale-95"
              data-testid="view-faq-btn"
            >
              View FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}