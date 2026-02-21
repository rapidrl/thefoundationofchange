import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

// Use service-role client for webhook (no user session available)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        const userId = session.metadata?.user_id;
        const tierId = session.metadata?.tier_id;
        const maxHours = parseInt(session.metadata?.max_hours || '0', 10);

        if (!userId || !tierId || !maxHours) {
            console.error('Missing metadata in checkout session:', session.id);
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        // Create enrollment record
        const { error } = await supabaseAdmin
            .from('enrollments')
            .insert({
                user_id: userId,
                hours_required: maxHours,
                hours_completed: 0,
                status: 'active',
                amount_paid: (session.amount_total || 0) / 100,
                stripe_payment_id: session.payment_intent as string,
            });

        if (error) {
            console.error('Failed to create enrollment:', error);
            return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
        }

        console.log(`Enrollment created for user ${userId}: ${maxHours} hours, $${(session.amount_total || 0) / 100}`);
    }

    return NextResponse.json({ received: true });
}
