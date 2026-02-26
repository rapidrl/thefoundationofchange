import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        console.error('❌ Stripe webhook: Missing stripe-signature header');
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        event = getStripe().webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('❌ Stripe webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`📦 Stripe webhook received: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        console.log(`📋 Checkout session ${session.id} metadata:`, JSON.stringify(metadata));

        // Support multiple metadata formats
        const userId = metadata?.user_id || metadata?.userId;
        const maxHours = parseInt(metadata?.max_hours || metadata?.hours || '0', 10);

        if (!userId || !maxHours) {
            console.error('❌ Missing userId or hours in checkout session:', session.id, metadata);
            return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
        }

        const amountPaid = (session.amount_total || 0) / 100;
        const paymentIntent = typeof session.payment_intent === 'string'
            ? session.payment_intent
            : (session.payment_intent as Stripe.PaymentIntent)?.id || null;

        // Create Supabase service-role client INSIDE the handler
        // (module-level creation can fail if env vars aren't loaded on serverless cold start)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Create enrollment record
        const { data: enrollment, error } = await supabaseAdmin
            .from('enrollments')
            .insert({
                user_id: userId,
                hours_required: maxHours,
                hours_completed: 0,
                status: 'active',
                amount_paid: amountPaid,
                stripe_payment_id: paymentIntent,
                start_date: new Date().toISOString().split('T')[0],
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Failed to create enrollment:', error);
            return NextResponse.json({ error: 'Failed to create enrollment' }, { status: 500 });
        }

        console.log(`✅ Enrollment created: id=${enrollment.id}, user=${userId}, hours=${maxHours}, paid=$${amountPaid}`);
    }

    return NextResponse.json({ received: true });
}
