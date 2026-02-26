import { getStripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use Supabase service role for webhook (no user auth context)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
);

export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event;

    try {
        event = getStripe().webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const metadata = session.metadata;

        // Support both metadata formats:
        // Old format: userId, hours
        // New format: user_id, max_hours, tier_id
        const userId = metadata?.user_id || metadata?.userId;
        const hours = parseInt(metadata?.max_hours || metadata?.hours || '0', 10);

        if (!userId || !hours) {
            console.error('Missing metadata in checkout session:', session.id, metadata);
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        const amountPaid = (session.amount_total || 0) / 100;
        const paymentIntent = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null;

        // Create enrollment record
        const { error: enrollmentError } = await supabaseAdmin
            .from('enrollments')
            .insert({
                user_id: userId,
                hours_required: hours,
                hours_completed: 0,
                status: 'active',
                amount_paid: amountPaid,
                stripe_payment_id: paymentIntent,
                start_date: new Date().toISOString().split('T')[0],
            });

        if (enrollmentError) {
            console.error('Failed to create enrollment:', enrollmentError);
            return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
        }

        console.log(`✅ Enrollment created for user ${userId}: ${hours}h, $${amountPaid}`);
    }

    return NextResponse.json({ received: true });
}
