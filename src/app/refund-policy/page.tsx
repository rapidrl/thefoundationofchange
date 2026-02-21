import PageHeader from '@/components/ui/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Refund Policy',
    description: 'Refund and return policy for The Foundation of Change community service programs.',
};

export default function RefundPolicyPage() {
    return (
        <>
            <PageHeader title="Refund Policy" />
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)' }}>
                        Effective Date: January 1, 2025
                    </p>

                    <h2>General Policy</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
                        Due to the digital nature of our community service programs, all sales are final.
                        Access to educational materials and the tracking platform is granted immediately
                        upon payment, making refunds generally unavailable.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-8)' }}>Important Notice</h2>
                    <div style={{
                        background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)',
                        borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)'
                    }}>
                        <p style={{ color: 'var(--color-gray-700)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                            ⚠️ Confirm acceptance before enrolling
                        </p>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
                            We strongly recommend that participants confirm with their court, probation officer,
                            school, or referring agency that online community service hours from The Foundation
                            of Change will be accepted before enrolling and paying.
                        </p>
                    </div>

                    <h2 style={{ marginTop: 'var(--space-8)' }}>Exceptions</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
                        Refund requests are reviewed on a case-by-case basis. If you believe you have a
                        valid reason for a refund, please contact us at{' '}
                        <a href="mailto:info@thefoundationofchange.org">info@thefoundationofchange.org</a>{' '}
                        with your account details and explanation.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-8)' }}>Contact</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)' }}>
                        For questions about this policy, email{' '}
                        <a href="mailto:info@thefoundationofchange.org">info@thefoundationofchange.org</a>{' '}
                        or call <a href="tel:+17348346934">734-834-6934</a>.
                    </p>
                </div>
            </section>
        </>
    );
}
