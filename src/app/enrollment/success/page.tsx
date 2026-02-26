import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { getStripe } from '@/lib/stripe';
import Link from 'next/link';
import GoogleAdsConversion from '@/components/GoogleAdsConversion';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: 'Enrollment Confirmed — The Foundation of Change',
    description: 'Your community service enrollment has been confirmed.',
};

interface PageProps {
    searchParams: Promise<{ session_id?: string }>;
}

export default async function EnrollmentSuccessPage({ searchParams }: PageProps) {
    const { session_id } = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let sessionData: {
        tierLabel: string;
        hours: string;
        amountPaid: string;
        amountRaw: number;
        transactionId: string;
    } | null = null;

    let enrollmentCreated = false;

    // Try to retrieve session details from Stripe AND create enrollment
    if (session_id && user) {
        try {
            const session = await getStripe().checkout.sessions.retrieve(session_id);

            // Only process paid sessions
            if (session.payment_status === 'paid') {
                const metadata = session.metadata;
                const userId = metadata?.user_id || metadata?.userId || user.id;
                const maxHours = parseInt(metadata?.max_hours || metadata?.hours || '0', 10);
                const amountPaid = (session.amount_total || 0) / 100;
                const paymentIntent = typeof session.payment_intent === 'string'
                    ? session.payment_intent
                    : (session.payment_intent as { id?: string })?.id || null;

                sessionData = {
                    tierLabel: metadata?.tierLabel || 'Community Service Program',
                    hours: metadata?.max_hours || metadata?.hours || '—',
                    amountPaid: session.amount_total
                        ? `$${(session.amount_total / 100).toFixed(2)}`
                        : '—',
                    amountRaw: amountPaid,
                    transactionId: paymentIntent || session.id,
                };

                // Create enrollment if it doesn't already exist
                // This replaces the webhook — guaranteed to run since the success page is on Vercel
                if (maxHours > 0) {
                    const serviceClient = createServiceClient(
                        process.env.NEXT_PUBLIC_SUPABASE_URL!,
                        process.env.SUPABASE_SERVICE_ROLE_KEY!
                    );

                    // Check if enrollment already exists for this payment
                    const { data: existing } = await serviceClient
                        .from('enrollments')
                        .select('id')
                        .eq('user_id', userId)
                        .eq('stripe_payment_id', paymentIntent || '')
                        .single();

                    if (!existing) {
                        // Also check if there's already an active enrollment (avoid duplicates)
                        const { data: activeEnrollment } = await serviceClient
                            .from('enrollments')
                            .select('id')
                            .eq('user_id', userId)
                            .eq('status', 'active')
                            .single();

                        if (!activeEnrollment) {
                            const { error } = await serviceClient
                                .from('enrollments')
                                .insert({
                                    user_id: userId,
                                    hours_required: maxHours,
                                    hours_completed: 0,
                                    status: 'active',
                                    amount_paid: amountPaid,
                                    stripe_payment_id: paymentIntent,
                                    start_date: new Date().toISOString().split('T')[0],
                                });

                            if (!error) {
                                enrollmentCreated = true;
                                console.log(`✅ Enrollment created on success page: user=${userId}, hours=${maxHours}, paid=$${amountPaid}`);
                            } else {
                                console.error('❌ Failed to create enrollment on success page:', error);
                            }
                        } else {
                            console.log(`ℹ️ User ${userId} already has active enrollment ${activeEnrollment.id}`);
                        }
                    } else {
                        console.log(`ℹ️ Enrollment already exists for payment ${paymentIntent}`);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to retrieve Stripe session:', err);
        }
    }

    return (
        <section style={{ padding: 'var(--space-16) 0' }}>
            <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                {/* Success icon */}
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: '#ecfdf5', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto var(--space-6)',
                    fontSize: '2.5rem',
                }}>
                    🎉
                </div>

                <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)', color: 'var(--color-navy)' }}>
                    Enrollment Confirmed!
                </h1>
                <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-8)', fontSize: 'var(--text-lg)' }}>
                    Welcome to The Foundation of Change. Your community service program is ready.
                </p>

                {/* Details Card */}
                {sessionData && (
                    <div style={{
                        background: 'var(--color-white)', border: '1px solid var(--color-gray-200)',
                        borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
                        marginBottom: 'var(--space-8)', textAlign: 'left',
                    }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-gray-100)' }}>
                            Order Details
                        </h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-gray-50)' }}>
                            <span style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)' }}>Program</span>
                            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{sessionData.tierLabel}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-gray-50)' }}>
                            <span style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)' }}>Hours</span>
                            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{sessionData.hours} hours</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-2) 0' }}>
                            <span style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)' }}>Amount Paid</span>
                            <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: '#059669' }}>{sessionData.amountPaid}</span>
                        </div>
                    </div>
                )}

                {/* Next Steps */}
                <div style={{
                    background: '#eff6ff', border: '1px solid #bfdbfe',
                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
                    marginBottom: 'var(--space-8)', textAlign: 'left',
                }}>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--color-navy)' }}>
                        What&apos;s Next?
                    </h3>
                    <ol style={{ paddingLeft: 'var(--space-5)', color: 'var(--color-gray-700)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
                        <li style={{ marginBottom: 'var(--space-2)' }}>Go to your <strong>Coursework</strong> page to begin reading articles</li>
                        <li style={{ marginBottom: 'var(--space-2)' }}>Each article includes a <strong>30-minute timer</strong> — just read and the time is tracked automatically</li>
                        <li style={{ marginBottom: 'var(--space-2)' }}>After each article, write a brief <strong>reflection</strong> (1-hour timer)</li>
                        <li>Once all hours are complete, your <strong>certificate</strong> will be generated automatically</li>
                    </ol>
                </div>

                {/* CTAs */}
                <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/coursework" className="btn btn-cta" style={{ fontSize: 'var(--text-base)' }}>
                        Start Coursework →
                    </Link>
                    <Link href="/dashboard" className="btn btn-secondary" style={{ border: '1px solid var(--color-gray-300)', fontSize: 'var(--text-base)' }}>
                        View Dashboard
                    </Link>
                </div>

                {/* Google Ads Conversion Tracking — always fire when session_id present */}
                {session_id && (
                    <GoogleAdsConversion
                        transactionId={sessionData?.transactionId || session_id}
                        value={sessionData?.amountRaw || 1}
                    />
                )}
            </div>
        </section>
    );
}
