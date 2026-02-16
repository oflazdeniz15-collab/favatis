-- ============================================
-- FAVATIS ARTIST FILTERING UPDATES
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add columns for filtering and sorting if they don't exist
ALTER TABLE public.artists 
ADD COLUMN IF NOT EXISTS starting_price DECIMAL(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS subscriber_count INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_artists_starting_price ON public.artists(starting_price);
CREATE INDEX IF NOT EXISTS idx_artists_subscriber_count ON public.artists(subscriber_count);

-- Update sample data for testing (optional)
UPDATE public.artists 
SET starting_price = 25.00, subscriber_count = 1200 
WHERE artist_name = 'Luna Rivers';

UPDATE public.artists 
SET starting_price = 15.00, subscriber_count = 850 
WHERE artist_name = 'The Midnight City';
