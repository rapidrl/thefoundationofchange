import { createClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import Link from 'next/link';
import GoogleAdsConversion from '@/components/GoogleAdsConversion';
import type { Metadata } from 'next';

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

    // Try to retrieve session details from Stripe
    if (session_id) {
        try {
            const session = await getStripe().checkout.sessions.retrieve(session_id);
            sessionData = {
                tierLabel: session.metadata?.tierLabel || 'Community Service Program',
                hours: session.metadata?.max_hours || session.metadata?.hours || '—',
                amountPaid: session.amount_total
                    ? `$${(session.amount_total / 100).toFixed(2)}`
                    : '—',
                amountRaw: session.amount_total ? session.amount_total / 100 : 0,
                transactionId: (session.payment_intent as string) || session.id,
            };
        } catch {
            // Session retrieval failed — show generic success
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

                {/* Google Ads Conversion Tracking */}
                {sessionData && sessionData.amountRaw > 0 && (
                    <GoogleAdsConversion
                        transactionId={sessionData.transactionId}
                        value={sessionData.amountRaw}
                    />
                )}
            </div>
        </section>
    );
}
