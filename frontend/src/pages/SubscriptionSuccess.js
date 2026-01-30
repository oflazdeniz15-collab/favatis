import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Music2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function SubscriptionSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking');
  const [attempts, setAttempts] = useState(0);
  const pollingRef = useRef(null);
  const maxAttempts = 5;

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      toast.error('Invalid session');
      return;
    }

    pollPaymentStatus(sessionId);

    return () => {
      if (pollingRef.current) {
        clearTimeout(pollingRef.current);
      }
    };
  }, [searchParams]);

  const pollPaymentStatus = async (sessionId, currentAttempt = 0) => {
    if (currentAttempt >= maxAttempts) {
      setStatus('timeout');
      toast.error('Payment verification timed out. Please check your dashboard.');
      return;
    }

    setAttempts(currentAttempt + 1);

    try {
      const response = await fetch(`${BACKEND_URL}/api/subscribe/status/${sessionId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();

      if (data.payment_status === 'paid') {
        setStatus('success');
        toast.success('Subscription activated!');
        return;
      } else if (data.status === 'expired') {
        setStatus('error');
        toast.error('Payment session expired');
        return;
      }

      pollingRef.current = setTimeout(() => {
        pollPaymentStatus(sessionId, currentAttempt + 1);
      }, 2000);
    } catch (error) {
      console.error('Payment status check error:', error);
      setStatus('error');
      toast.error('Failed to verify payment');
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
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          {status === 'checking' && (
            <div data-testid="checking-status">
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-6" />
              <h2 className="text-3xl font-bold font-display text-primary mb-3">
                Verifying Payment
              </h2>
              <p className="text-muted-foreground mb-2">
                Please wait while we confirm your subscription...
              </p>
              <p className="text-sm text-muted-foreground">
                Attempt {attempts} of {maxAttempts}
              </p>
            </div>
          )}

          {status === 'success' && (
            <div data-testid="success-status">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold font-display text-primary mb-3">
                Subscription Active!
              </h2>
              <p className="text-muted-foreground mb-8">
                You now have access to exclusive content from this artist.
              </p>
              <div className="space-y-3">
                <Link to="/fan/dashboard">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-full" data-testid="go-dashboard-btn">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to="/artists">
                  <Button variant="outline" className="w-full h-11 rounded-full">
                    Explore More Artists
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {(status === 'error' || status === 'timeout') && (
            <div data-testid="error-status">
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold font-display text-primary mb-3">
                {status === 'timeout' ? 'Verification Timeout' : 'Payment Failed'}
              </h2>
              <p className="text-muted-foreground mb-8">
                {status === 'timeout' 
                  ? 'We\'re still processing your payment. Please check your dashboard in a few minutes.'
                  : 'There was an issue with your payment. Please try again.'}
              </p>
              <div className="space-y-3">
                <Link to="/fan/dashboard">
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-full">
                    Go to Dashboard
                  </Button>
                </Link>
                <Link to="/artists">
                  <Button variant="outline" className="w-full h-11 rounded-full">
                    Back to Artists
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}