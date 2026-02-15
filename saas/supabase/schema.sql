-- ============================================
-- FAVATIS SAAS DATABASE SCHEMA
-- Supabase PostgreSQL Database
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- Linked to Supabase Auth (auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    
    -- Role Management
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'artist', 'user')),
    
    -- Subscription Management
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'elite')),
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'past_due', 'canceled')),
    
    -- Artist-Specific Fields
    is_approved BOOLEAN DEFAULT FALSE,
    artist_bio TEXT,
    artist_portfolio_url TEXT,
    genre TEXT,
    
    -- Engagement Tracking
    online_time INTEGER DEFAULT 0,  -- Total minutes online
    last_seen_at TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX idx_profiles_is_approved ON public.profiles(is_approved);
CREATE INDEX idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Public can view approved artists (for discovery)
CREATE POLICY "Public can view approved artists"
    ON public.profiles
    FOR SELECT
    USING (role = 'artist' AND is_approved = TRUE);

-- ============================================
-- 4. AUTO-INSERT PROFILE ON USER SIGNUP (TRIGGER)
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to execute function on new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 5. AUTO-UPDATE UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 6. SUBSCRIPTION TIERS TABLE (Reference)
-- ============================================
CREATE TABLE public.subscription_tiers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2),
    stripe_price_id_monthly TEXT,
    stripe_price_id_yearly TEXT,
    features JSONB DEFAULT '[]'::JSONB,
    max_uploads INTEGER DEFAULT 10,
    max_subscribers INTEGER DEFAULT 100,
    analytics_enabled BOOLEAN DEFAULT FALSE,
    priority_support BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO public.subscription_tiers (id, name, description, price_monthly, price_yearly, features, max_uploads, max_subscribers, analytics_enabled, priority_support) VALUES
    ('free', 'Free', 'Get started with basic features', 0, 0, '["5 content uploads", "Basic analytics", "Community support"]', 5, 50, FALSE, FALSE),
    ('pro', 'Pro', 'Perfect for growing artists', 9.99, 99.99, '["50 content uploads", "Advanced analytics", "Email support", "Custom profile", "Early access features"]', 50, 500, TRUE, FALSE),
    ('elite', 'Elite', 'For professional artists', 29.99, 299.99, '["Unlimited uploads", "Full analytics suite", "Priority support", "Custom branding", "API access", "Dedicated account manager"]', -1, -1, TRUE, TRUE);

-- ============================================
-- 7. DISCOUNT CODES TABLE
-- ============================================
CREATE TABLE public.discount_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL,
    applicable_tiers TEXT[] DEFAULT ARRAY['pro', 'elite'],
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample discount codes
INSERT INTO public.discount_codes (code, description, discount_type, discount_value, max_uses, valid_until) VALUES
    ('LAUNCH25', 'Launch discount - 25% off', 'percentage', 25, 1000, NOW() + INTERVAL '3 months'),
    ('ARTIST50', 'Artist special - $5 off', 'fixed', 5, 500, NOW() + INTERVAL '1 month');

-- ============================================
-- 8. ARTIST APPLICATIONS TABLE
-- ============================================
CREATE TABLE public.artist_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    artist_name TEXT NOT NULL,
    genre TEXT,
    bio TEXT,
    portfolio_url TEXT,
    social_links JSONB DEFAULT '{}'::JSONB,
    sample_work_urls TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artist_applications_status ON public.artist_applications(status);
CREATE INDEX idx_artist_applications_user_id ON public.artist_applications(user_id);

-- ============================================
-- 9. ARTISTS TABLE
-- Stores artist-specific data and Stripe Connect info
-- ============================================
CREATE TABLE public.artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    stripe_account_id TEXT UNIQUE, -- Stripe Connect Account ID
    artist_name TEXT NOT NULL,
    bio TEXT,
    genre TEXT,
    portfolio_url TEXT,
    social_links JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_artists_profile_id ON public.artists(profile_id);
CREATE INDEX idx_artists_stripe_account_id ON public.artists(stripe_account_id);

-- Trigger for artists updated_at
CREATE TRIGGER update_artists_updated_at
    BEFORE UPDATE ON public.artists
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 10. HELPER FUNCTIONS
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = user_id AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's subscription tier
CREATE OR REPLACE FUNCTION public.get_user_tier(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    tier TEXT;
BEGIN
    SELECT subscription_tier INTO tier
    FROM public.profiles
    WHERE id = user_id;
    RETURN COALESCE(tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.subscription_tiers TO anon, authenticated;
GRANT SELECT ON public.discount_codes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.artist_applications TO authenticated;
