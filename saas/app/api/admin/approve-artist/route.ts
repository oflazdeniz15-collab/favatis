import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface ApproveRequest {
    artistId: string;
    action: 'approve' | 'reject';
    reason?: string;
}

export async function POST(request: NextRequest) {
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

        const body: ApproveRequest = await request.json();
        const { artistId, action, reason } = body;

        if (!artistId || !action) {
            return NextResponse.json(
                { error: 'Artist ID and action are required' },
                { status: 400 }
            );
        }

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
        }

        // Verify artist exists
        const { data: artist, error: fetchError } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, is_approved')
            .eq('id', artistId)
            .eq('role', 'artist')
            .single();

        if (fetchError || !artist) {
            return NextResponse.json(
                { error: 'Artist not found' },
                { status: 404 }
            );
        }

        if (action === 'approve') {
            // Approve the artist
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_approved: true })
                .eq('id', artistId);

            if (updateError) {
                return NextResponse.json(
                    { error: 'Failed to approve artist' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: `${artist.full_name || 'Artist'} has been approved`,
                artist: { id: artistId, status: 'approved' }
            });

        } else {
            // Reject the artist
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ role: 'user', is_approved: false })
                .eq('id', artistId);

            if (updateError) {
                return NextResponse.json(
                    { error: 'Failed to reject artist' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: `${artist.full_name || 'Artist'} application has been rejected`,
                artist: { id: artistId, status: 'rejected' }
            });
        }

    } catch (error) {
        console.error('Approve artist API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
