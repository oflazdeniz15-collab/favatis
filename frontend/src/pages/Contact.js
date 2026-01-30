import { Link } from 'react-router-dom';
import { Music2, Mail, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Contact() {
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
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">Home</Link>
              <Link to="/artists" className="text-foreground hover:text-primary transition-colors font-medium">Artists</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold font-display text-primary mb-4" data-testid="contact-page-title">
              Get in Touch
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Have questions? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-border/50 rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold font-display mb-2">Email Us</h3>
              <p className="text-muted-foreground mb-4">Reach out to our support team</p>
              <a href="mailto:support@favatis.com" className="text-primary font-medium hover:underline" data-testid="support-email-link">
                support@favatis.com
              </a>
            </div>

            <div className="bg-white border border-border/50 rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold font-display mb-2">For Artists</h3>
              <p className="text-muted-foreground mb-4">Questions about joining Favatis?</p>
              <a href="mailto:artists@favatis.com" className="text-primary font-medium hover:underline" data-testid="artists-email-link">
                artists@favatis.com
              </a>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary via-[#570A57] to-accent text-white rounded-xl p-12 text-center">
            <Send className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold font-display mb-4">Looking for immediate help?</h2>
            <p className="text-base mb-6 opacity-90">Check out our FAQ or reach out directly</p>
            <Button className="bg-white text-primary hover:bg-white/90 h-11 px-8 rounded-full font-medium" data-testid="view-faq-btn">
              View FAQ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}