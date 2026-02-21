import PageHeader from '@/components/ui/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for The Foundation of Change community service programs.',
};

export default function TermsOfServicePage() {
    return (
        <>
            <PageHeader title="Terms of Service" />
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)' }}>
                        Effective Date: January 1, 2025
                    </p>

                    <h2>Acceptance of Terms</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
                        By accessing or using The Foundation of Change website and community service programs,
                        you agree to be bound by these Terms of Service. If you do not agree, you may not use our services.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-8)' }}>Program Participation</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
                        Participants must complete all coursework honestly and in good faith. The maximum daily
                        hour limit is 8 hours per day. Attempts to manipulate the timer or submit fraudulent
                        reflections will result in account suspension and potential forfeiture of completed hours.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-8)' }}>Payments</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
                        All payments are processed securely through our payment processor. Fees are non-refundable
                        once access to program materials has been granted. See our Refund Policy for details.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-8)' }}>Certificate Issuance</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
                        Certificates are issued upon verified completion of all required hours and reflections.
                        Acceptance of certificates by courts, schools, or other institutions is at the discretion
                        of those institutions.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-8)' }}>Limitation of Liability</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
                        The Foundation of Change is not responsible for the acceptance or rejection of certificates
                        by any court, school, employer, or agency. Participants are responsible for confirming
                        acceptance before enrolling.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-8)' }}>Contact</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)' }}>
                        Questions about these terms? Email{' '}
                        <a href="mailto:info@thefoundationofchange.org">info@thefoundationofchange.org</a>.
                    </p>
                </div>
            </section>
        </>
    );
}
