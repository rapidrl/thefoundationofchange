import PageHeader from '@/components/ui/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for The Foundation of Change.',
};

export default function PrivacyPolicyPage() {
    return (
        <>
            <PageHeader title="Privacy Policy" />
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)' }}>
                        Effective Date: January 1, 2025
                    </p>

                    <h2>Introduction</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
                        The Foundation of Change (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy and is committed to protecting
                        your personal information. This Privacy Policy explains what data we collect, how we use it,
                        and how we protect it when you use our website and services.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-8)' }}>Information We Collect</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
                        We collect personal information you provide during registration (name, email, address, phone number),
                        payment information processed securely through our payment processor, coursework progress and
                        completion data, and communication records when you contact us.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-8)' }}>How We Use Your Information</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
                        We use your information to provide and manage our community service programs, process payments,
                        issue certificates, verify completion for courts and probation officers, communicate with you
                        about your account, and improve our services.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-8)' }}>Data Security</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
                        We implement industry-standard security measures to protect your personal information.
                        However, no method of electronic storage or transmission is 100% secure.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-8)' }}>Contact Us</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)' }}>
                        If you have questions about this Privacy Policy, contact us at{' '}
                        <a href="mailto:info@thefoundationofchange.org">info@thefoundationofchange.org</a>.
                    </p>
                </div>
            </section>
        </>
    );
}
