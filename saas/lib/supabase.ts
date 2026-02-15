import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Types for the database
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string | null;
                    full_name: string | null;
                    avatar_url: string | null;
                    role: 'admin' | 'artist' | 'user';
                    subscription_tier: 'free' | 'pro' | 'elite';
                    stripe_customer_id: string | null;
                    stripe_subscription_id: string | null;
                    subscription_status: 'active' | 'inactive' | 'past_due' | 'canceled';
                    is_approved: boolean;
                    artist_bio: string | null;
                    artist_portfolio_url: string | null;
                    genre: string | null;
                    online_time: number;
                    last_seen_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    role?: 'admin' | 'artist' | 'user';
                    subscription_tier?: 'free' | 'pro' | 'elite';
                    stripe_customer_id?: string | null;
                    stripe_subscription_id?: string | null;
                    subscription_status?: 'active' | 'inactive' | 'past_due' | 'canceled';
                    is_approved?: boolean;
                    artist_bio?: string | null;
                    artist_portfolio_url?: string | null;
                    genre?: string | null;
                    online_time?: number;
                    last_seen_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string | null;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    role?: 'admin' | 'artist' | 'user';
                    subscription_tier?: 'free' | 'pro' | 'elite';
                    stripe_customer_id?: string | null;
                    stripe_subscription_id?: string | null;
                    subscription_status?: 'active' | 'inactive' | 'past_due' | 'canceled';
                    is_approved?: boolean;
                    artist_bio?: string | null;
                    artist_portfolio_url?: string | null;
                    genre?: string | null;
                    online_time?: number;
                    last_seen_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            subscription_tiers: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    price_monthly: number;
                    price_yearly: number | null;
                    stripe_price_id_monthly: string | null;
                    stripe_price_id_yearly: string | null;
                    features: string[];
                    max_uploads: number;
                    max_subscribers: number;
                    analytics_enabled: boolean;
                    priority_support: boolean;
                    created_at: string;
                };
                Insert: {
                    id: string;
                    name: string;
                    description?: string | null;
                    price_monthly: number;
                    price_yearly?: number | null;
                    stripe_price_id_monthly?: string | null;
                    stripe_price_id_yearly?: string | null;
                    features?: string[];
                    max_uploads?: number;
                    max_subscribers?: number;
                    analytics_enabled?: boolean;
                    priority_support?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    price_monthly?: number;
                    price_yearly?: number | null;
                    stripe_price_id_monthly?: string | null;
                    stripe_price_id_yearly?: string | null;
                    features?: string[];
                    max_uploads?: number;
                    max_subscribers?: number;
                    analytics_enabled?: boolean;
                    priority_support?: boolean;
                    created_at?: string;
                };
            };
            discount_codes: {
                Row: {
                    id: string;
                    code: string;
                    description: string | null;
                    discount_type: 'percentage' | 'fixed';
                    discount_value: number;
                    applicable_tiers: string[];
                    max_uses: number | null;
                    current_uses: number;
                    valid_from: string;
                    valid_until: string | null;
                    is_active: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    code: string;
                    description?: string | null;
                    discount_type: 'percentage' | 'fixed';
                    discount_value: number;
                    applicable_tiers?: string[];
                    max_uses?: number | null;
                    current_uses?: number;
                    valid_from?: string;
                    valid_until?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    code?: string;
                    description?: string | null;
                    discount_type?: 'percentage' | 'fixed';
                    discount_value?: number;
                    applicable_tiers?: string[];
                    max_uses?: number | null;
                    current_uses?: number;
                    valid_from?: string;
                    valid_until?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                };
            };
            artist_applications: {
                Row: {
                    id: string;
                    user_id: string;
                    artist_name: string;
                    genre: string | null;
                    bio: string | null;
                    portfolio_url: string | null;
                    social_links: Record<string, string>;
                    sample_work_urls: string[];
                    status: 'pending' | 'approved' | 'rejected';
                    reviewed_by: string | null;
                    reviewed_at: string | null;
                    rejection_reason: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    artist_name: string;
                    genre?: string | null;
                    bio?: string | null;
                    portfolio_url?: string | null;
                    social_links?: Record<string, string>;
                    sample_work_urls?: string[];
                    status?: 'pending' | 'approved' | 'rejected';
                    reviewed_by?: string | null;
                    reviewed_at?: string | null;
                    rejection_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    artist_name?: string;
                    genre?: string | null;
                    bio?: string | null;
                    portfolio_url?: string | null;
                    social_links?: Record<string, string>;
                    sample_work_urls?: string[];
                    status?: 'pending' | 'approved' | 'rejected';
                    reviewed_by?: string | null;
                    reviewed_at?: string | null;
                    rejection_reason?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            artists: {
                Row: {
                    id: string;
                    profile_id: string;
                    stripe_account_id: string | null;
                    artist_name: string;
                    bio: string | null;
                    genre: string | null;
                    portfolio_url: string | null;
                    social_links: Record<string, string>;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    profile_id: string;
                    stripe_account_id?: string | null;
                    artist_name: string;
                    bio?: string | null;
                    genre?: string | null;
                    portfolio_url?: string | null;
                    social_links?: Record<string, string>;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    profile_id?: string;
                    stripe_account_id?: string | null;
                    artist_name?: string;
                    bio?: string | null;
                    genre?: string | null;
                    portfolio_url?: string | null;
                    social_links?: Record<string, string>;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
    };
}

// Client-side Supabase client (for React components)
export const createBrowserClient = () => {
    return createClientComponentClient<Database>();
};

// Server-side Supabase client (for API routes)
export const createServerClient = () => {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};

// Admin Supabase client (for server-side operations that bypass RLS)
export const createAdminClient = () => {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
};

// Export types for use in components
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type SubscriptionTier = Database['public']['Tables']['subscription_tiers']['Row'];
export type DiscountCode = Database['public']['Tables']['discount_codes']['Row'];
export type ArtistApplication = Database['public']['Tables']['artist_applications']['Row'];
export type Artist = Database['public']['Tables']['artists']['Row'];
