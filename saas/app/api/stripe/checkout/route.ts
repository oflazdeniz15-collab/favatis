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

        const { priceId, tier } = await req.json();

        if (!priceId) {
            return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${req.nextUrl.origin}/dashboard?success=true`,
            cancel_url: `${req.nextUrl.origin}/dashboard?canceled=true`,
            metadata: {
                userId: authSession.user.id,
                tier: tier,
            },
            customer_email: authSession.user.email,
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
