import { NextRequest, NextResponse } from 'next/server';
import { stripe, getTierById } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { tierId } = body;

        const tier = getTierById(tierId);
        if (!tier) {
            return NextResponse.json({ error: 'Invalid program tier' }, { status: 400 });
        }

        // Check for existing active enrollment
        const { data: existing } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'You already have an active enrollment. Complete or contact support before enrolling again.' },
                { status: 400 }
            );
        }

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Community Service Program — ${tier.label}`,
                            description: `Online community service program for up to ${tier.maxHours} hours. Includes coursework access, time tracking, and verified certificate.`,
                        },
                        unit_amount: tier.price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${request.nextUrl.origin}/dashboard?payment=success`,
            cancel_url: `${request.nextUrl.origin}/start-now?payment=cancelled`,
            customer_email: user.email,
            metadata: {
                user_id: user.id,
                tier_id: tier.id,
                max_hours: tier.maxHours.toString(),
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
