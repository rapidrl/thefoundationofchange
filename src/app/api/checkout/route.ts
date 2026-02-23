import { createClient } from '@/lib/supabase/server';
import { getStripe, getTierForHours } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Please log in to enroll.' }, { status: 401 });
        }

        const { hours } = await request.json();

        if (!hours || typeof hours !== 'number' || hours < 1 || hours > 1000) {
            return NextResponse.json({ error: 'Please select between 1 and 1000 hours.' }, { status: 400 });
        }

        const tier = getTierForHours(hours);
        if (!tier) {
            return NextResponse.json({ error: 'Invalid hour selection.' }, { status: 400 });
        }

        // Check if user already has an active enrollment
        const { data: existingEnrollments } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'active');

        if (existingEnrollments && existingEnrollments.length > 0) {
            return NextResponse.json(
                { error: 'You already have an active enrollment. Complete your current program first.' },
                { status: 400 }
            );
        }

        const origin = request.headers.get('origin') || 'http://localhost:3000';

        const session = await getStripe().checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Community Service Program — ${hours} Hours`,
                            description: `${hours} hours of community service coursework, certificate of completion, and verification portal access.`,
                        },
                        unit_amount: tier.priceInCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/enrollment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/start-now`,
            customer_email: user.email,
            metadata: {
                userId: user.id,
                hours: hours.toString(),
                tierId: tier.id,
                tierLabel: `${hours} Hours (${tier.price})`,
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Checkout session error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session. Please try again.' },
            { status: 500 }
        );
    }
}
