import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    const sessionIdMatch = hash.match(/session_id=([^&]+)/);

    if (!sessionIdMatch) {
      navigate('/login');
      return;
    }

    const sessionId = sessionIdMatch[1];

    fetch(`${BACKEND_URL}/api/auth/google-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ session_id: sessionId })
    })
      .then(res => res.json())
      .then(user => {
        if (user.role === 'fan') {
          navigate('/fan/dashboard', { state: { user } });
        } else if (user.role === 'artist') {
          navigate('/artist/dashboard', { state: { user } });
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard', { state: { user } });
        } else {
          navigate('/');
        }
      })
      .catch(err => {
        console.error('Auth callback error:', err);
        navigate('/login');
      });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  );
}