-- ============================================
-- FAVATIS PROSPECTIVE ADMIN & USER SETUP
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Manually confirm the newly registered users
UPDATE auth.users 
SET email_confirmed_at = NOW(), 
    last_sign_in_at = NOW()
WHERE email IN ('admin@favatis.com', 'user@favatis.com');

-- 2. Elevate the admin account to the 'admin' role
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@favatis.com';

-- 3. Verify the changes
SELECT email, role, subscription_tier 
FROM public.profiles 
WHERE email IN ('admin@favatis.com', 'user@favatis.com');
