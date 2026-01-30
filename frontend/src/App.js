import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

import Landing from './pages/Landing';
import Login from './pages/Login';
import ArtistSignup from './pages/ArtistSignup';
import Artists from './pages/Artists';
import ArtistPublicProfile from './pages/ArtistPublicProfile';
import Contact from './pages/Contact';
import AuthCallback from './pages/AuthCallback';
import FanDashboard from './pages/FanDashboard';
import FanContent from './pages/FanContent';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import ArtistDashboard from './pages/ArtistDashboard';
import ArtistTiers from './pages/ArtistTiers';
import ArtistContent from './pages/ArtistContent';
import AdminDashboard from './pages/AdminDashboard';

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/artist-signup" element={<ArtistSignup />} />
      <Route path="/artists" element={<Artists />} />
      <Route path="/artist/:artistId" element={<ArtistPublicProfile />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/fan/dashboard" element={<FanDashboard />} />
      <Route path="/fan/content/:artistId" element={<FanContent />} />
      <Route path="/fan/subscription-success" element={<SubscriptionSuccess />} />
      <Route path="/artist/dashboard" element={<ArtistDashboard />} />
      <Route path="/artist/tiers" element={<ArtistTiers />} />
      <Route path="/artist/content" element={<ArtistContent />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;