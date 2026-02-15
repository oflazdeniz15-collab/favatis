import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-12-18.acacia' as any,
    });
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { session: authSession } } = await supabase.auth.getSession();

        if (!authSession?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify if user is an artist
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, artists(stripe_account_id)')
            .eq('id', authSession.user.id)
            .single();

        if (profile?.role !== 'artist') {
            return NextResponse.json({ error: 'Only artists can connect' }, { status: 403 });
        }

        let accountId = (profile.artists as any)?.stripe_account_id;

        if (!accountId) {
            // Create a new Connect account
            const account = await stripe.accounts.create({
                type: 'express',
                email: authSession.user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });
            accountId = account.id;

            // Save to database
            await supabase
                .from('artists')
                .update({ stripe_account_id: accountId })
                .eq('profile_id', authSession.user.id);
        }

        // Create an account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${req.nextUrl.origin}/dashboard?refresh=true`,
            return_url: `${req.nextUrl.origin}/dashboard?success=true`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });
    } catch (error: any) {
        console.error('Stripe Connect Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
