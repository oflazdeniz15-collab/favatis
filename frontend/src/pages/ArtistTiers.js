import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Music2, Plus, DollarSign, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ArtistTiers() {
  const navigate = useNavigate();
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', benefits: [''] });

  useEffect(() => {
    checkAuthAndFetchTiers();
  }, []);

  const checkAuthAndFetchTiers = async () => {
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

      const tiersRes = await fetch(`${BACKEND_URL}/api/artist/tiers`, {
        credentials: 'include'
      });

      if (tiersRes.ok) {
        const tiersData = await tiersRes.json();
        setTiers(tiersData);
      }
    } catch (error) {
      toast.error('Failed to load tiers');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBenefit = () => {
    setFormData({
      ...formData,
      benefits: [...formData.benefits, '']
    });
  };

  const handleRemoveBenefit = (index) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleCreateTier = async (e) => {
    e.preventDefault();

    const filteredBenefits = formData.benefits.filter(b => b.trim() !== '');
    if (!formData.name || !formData.price || filteredBenefits.length === 0) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/artist/tiers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          benefits: filteredBenefits
        })
      });

      if (!response.ok) throw new Error('Failed to create tier');

      toast.success('Tier created successfully');
      setDialogOpen(false);
      setFormData({ name: '', price: '', benefits: [''] });
      checkAuthAndFetchTiers();
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
              <Link to="/artist/content">
                <Button variant="ghost" size="sm">Content</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-primary mb-2" data-testid="tiers-page-title">
                Subscription Tiers
              </h1>
              <p className="text-muted-foreground">Create tiers for your fans to subscribe to</p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full" data-testid="add-tier-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Subscription Tier</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTier} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="tier-name">Tier Name</Label>
                    <Input 
                      id="tier-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g., Bronze, Silver, Gold"
                      data-testid="tier-name-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tier-price">Monthly Price (USD)</Label>
                    <Input 
                      id="tier-price"
                      type="number"
                      step="0.01"
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="9.99"
                      data-testid="tier-price-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Benefits</Label>
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2">
                        <Input 
                          value={benefit}
                          onChange={(e) => handleBenefitChange(index, e.target.value)}
                          placeholder="e.g., Early access to new releases"
                          data-testid={`benefit-input-${index}`}
                        />
                        {formData.benefits.length > 1 && (
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleRemoveBenefit(index)}
                            data-testid={`remove-benefit-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddBenefit}
                      data-testid="add-benefit-btn"
                    >
                      <Plus className="h-3 w-3 mr-2" />
                      Add Benefit
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" data-testid="create-tier-btn">
                    Create Tier
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {tiers.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-xl" data-testid="no-tiers-message">
              <DollarSign className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold font-display mb-2">No Tiers Yet</h3>
              <p className="text-muted-foreground mb-6">Create your first subscription tier to start monetizing your content</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="tiers-grid">
              {tiers.map((tier) => (
                <div 
                  key={tier.tier_id}
                  className="bg-white border-2 border-border/50 rounded-xl p-6 shadow-sm"
                  data-testid={`tier-card-${tier.tier_id}`}
                >
                  <h3 className="text-2xl font-bold font-display text-primary mb-2">
                    {tier.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-primary">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Benefits:</p>
                    {tier.benefits.map((benefit, idx) => (
                      <div key={idx} className="text-sm text-foreground">
                        • {benefit}
                      </div>
                    ))}
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