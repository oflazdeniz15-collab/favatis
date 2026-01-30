import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Music2, ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function FanContent() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetchContent();
  }, [artistId]);

  const checkAuthAndFetchContent = async () => {
    try {
      const authRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: 'include'
      });
      
      if (!authRes.ok) {
        navigate('/login');
        return;
      }

      const [contentRes, artistRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/fan/content/${artistId}`, {
          credentials: 'include'
        }),
        fetch(`${BACKEND_URL}/api/artist/${artistId}`)
      ]);

      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setContent(contentData);
      }

      if (artistRes.ok) {
        const artistData = await artistRes.json();
        setArtist(artistData);
      }
    } catch (error) {
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading content...</p>
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
            <Link to="/fan/dashboard">
              <Button variant="ghost" size="sm" data-testid="back-dashboard-btn">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-2" data-testid="content-page-title">
              {artist?.name || 'Artist'} Content
            </h1>
            <p className="text-muted-foreground">Exclusive content for subscribers</p>
          </div>

          {content.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-xl" data-testid="no-content-message">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold font-display mb-2">No Content Yet</h3>
              <p className="text-muted-foreground">The artist hasn't posted any exclusive content yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6" data-testid="content-list">
              {content.map((item) => (
                <div 
                  key={item.content_id}
                  className="bg-white border border-border/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                  data-testid={`content-item-${item.content_id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold font-display text-primary mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.content_type === 'text' ? 'Text Content' : 'External Link'}
                      </p>
                    </div>
                  </div>

                  {item.content_text && (
                    <div className="prose prose-sm max-w-none mb-4">
                      <p className="text-foreground whitespace-pre-wrap">{item.content_text}</p>
                    </div>
                  )}

                  {item.external_link && (
                    <div className="mt-4">
                      <a 
                        href={item.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
                        data-testid={`external-link-${item.content_id}`}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open Link
                      </a>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                    Posted on {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}