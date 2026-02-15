import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-12-18.acacia' as any,
    });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const supabase = createAdminClient();

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;
                const userId = session.metadata?.userId;

                if (userId) {
                    await (supabase as any)
                        .from('profiles')
                        .update({
                            stripe_customer_id: customerId,
                            stripe_subscription_id: subscriptionId,
                            subscription_status: 'active',
                        })
                        .eq('id', userId);
                }
                break;
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;
                const status = subscription.status === 'active' ? 'active' :
                    subscription.status === 'past_due' ? 'past_due' :
                        subscription.status === 'canceled' ? 'canceled' : 'inactive';

                await (supabase as any)
                    .from('profiles')
                    .update({
                        subscription_status: status,
                    })
                    .eq('stripe_customer_id', customerId);
                break;
            }

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
