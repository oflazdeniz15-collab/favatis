import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Music2, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ArtistContent() {
  const navigate = useNavigate();
  const [content, setContent] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'text',
    content_text: '',
    external_link: '',
    tier_ids: []
  });

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    try {
      const authRes = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: 'include'
      });
      
      if (!authRes.ok) {
        navigate('/login');
        return;
      }

      const user = await authRes.json();
      if (user.role !== 'artist') {
        navigate('/');
        return;
      }

      const [contentRes, tiersRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/artist/content`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/artist/tiers`, { credentials: 'include' })
      ]);

      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setContent(contentData);
      }

      if (tiersRes.ok) {
        const tiersData = await tiersRes.json();
        setTiers(tiersData);
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async (e) => {
    e.preventDefault();

    if (!formData.title || formData.tier_ids.length === 0) {
      toast.error('Please fill in title and select at least one tier');
      return;
    }

    if (formData.content_type === 'text' && !formData.content_text) {
      toast.error('Please add text content');
      return;
    }

    if (formData.content_type === 'link' && !formData.external_link) {
      toast.error('Please add external link');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/artist/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create content');

      toast.success('Content created successfully');
      setDialogOpen(false);
      setFormData({
        title: '',
        content_type: 'text',
        content_text: '',
        external_link: '',
        tier_ids: []
      });
      checkAuthAndFetchData();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleTier = (tierId) => {
    setFormData(prev => ({
      ...prev,
      tier_ids: prev.tier_ids.includes(tierId)
        ? prev.tier_ids.filter(id => id !== tierId)
        : [...prev.tier_ids, tierId]
    }));
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
              <Link to="/artist/dashboard">
                <Button variant="ghost" size="sm" data-testid="back-dashboard-btn">Dashboard</Button>
              </Link>
              <Link to="/artist/tiers">
                <Button variant="ghost" size="sm">Tiers</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-2" data-testid="content-page-title">
                Gated Content
              </h1>
              <p className="text-muted-foreground">Share exclusive content with your subscribers</p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                  disabled={tiers.length === 0}
                  data-testid="add-content-btn"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Gated Content</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateContent} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Content title"
                      data-testid="content-title-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content-type">Content Type</Label>
                    <Select value={formData.content_type} onValueChange={(value) => setFormData({...formData, content_type: value})}>
                      <SelectTrigger data-testid="content-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Content</SelectItem>
                        <SelectItem value="link">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.content_type === 'text' && (
                    <div className="space-y-2">
                      <Label htmlFor="content-text">Content</Label>
                      <Textarea 
                        id="content-text"
                        value={formData.content_text}
                        onChange={(e) => setFormData({...formData, content_text: e.target.value})}
                        rows={6}
                        placeholder="Write your exclusive content here..."
                        data-testid="content-text-input"
                      />
                    </div>
                  )}

                  {formData.content_type === 'link' && (
                    <div className="space-y-2">
                      <Label htmlFor="external-link">External Link</Label>
                      <Input 
                        id="external-link"
                        type="url"
                        value={formData.external_link}
                        onChange={(e) => setFormData({...formData, external_link: e.target.value})}
                        placeholder="https://..."
                        data-testid="external-link-input"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label>Available to Tiers</Label>
                    {tiers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Please create subscription tiers first</p>
                    ) : (
                      <div className="space-y-2">
                        {tiers.map((tier) => (
                          <div key={tier.tier_id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={tier.tier_id}
                              checked={formData.tier_ids.includes(tier.tier_id)}
                              onCheckedChange={() => toggleTier(tier.tier_id)}
                              data-testid={`tier-checkbox-${tier.tier_id}`}
                            />
                            <Label htmlFor={tier.tier_id} className="cursor-pointer">
                              {tier.name} (${tier.price}/mo)
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full" data-testid="create-content-btn">
                    Create Content
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {tiers.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-yellow-900 mb-2">Create Tiers First</h3>
              <p className="text-sm text-yellow-800 mb-4">
                You need to create subscription tiers before you can add gated content.
              </p>
              <Link to="/artist/tiers">
                <Button size="sm">Go to Tiers</Button>
              </Link>
            </div>
          )}

          {content.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-xl" data-testid="no-content-message">
              <FileText className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold font-display mb-2">No Content Yet</h3>
              <p className="text-muted-foreground">Start sharing exclusive content with your subscribers</p>
            </div>
          ) : (
            <div className="space-y-6" data-testid="content-list">
              {content.map((item) => {
                const itemTiers = tiers.filter(t => item.tier_ids.includes(t.tier_id));
                
                return (
                  <div 
                    key={item.content_id}
                    className="bg-white border border-border/50 rounded-xl p-6 shadow-sm"
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
                      <div className="mb-4">
                        <p className="text-foreground whitespace-pre-wrap line-clamp-3">{item.content_text}</p>
                      </div>
                    )}

                    {item.external_link && (
                      <div className="mb-4">
                        <a href={item.external_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                          {item.external_link}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-muted-foreground">Available to:</span>
                      {itemTiers.map((tier) => (
                        <span key={tier.tier_id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                          {tier.name}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                      Posted on {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}