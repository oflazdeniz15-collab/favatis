import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Fetch all pending artists (role = 'artist' AND is_approved = false)
export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // Verify authentication
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        // Fetch pending artists
        const { data: artists, error } = await supabase
            .from('profiles')
            .select(`
        id,
        email,
        full_name,
        avatar_url,
        artist_bio,
        genre,
        artist_portfolio_url,
        created_at,
        role,
        is_approved
      `)
            .eq('role', 'artist')
            .eq('is_approved', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching pending artists:', error);
            return NextResponse.json(
                { error: 'Failed to fetch pending artists' },
                { status: 500 }
            );
        }

        // Get stats
        const stats = {
            totalPending: artists?.length || 0,
            approvedToday: 0,
            rejectedToday: 0
        };

        return NextResponse.json({
            artists: artists || [],
            stats
        });

    } catch (error) {
        console.error('Pending artists API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
