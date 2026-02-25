import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Our Program — Enroll in Court-Approved Online Community Service',
    description: 'Learn about our structured community service program — enroll, complete self-paced coursework, and receive a verified 501(c)(3) certificate accepted by courts nationwide. Programs from $28.99.',
    openGraph: {
        title: 'Court-Approved Community Service Program | The Foundation of Change',
        description: 'Enroll, learn, and receive a verified certificate. Structured curriculum teaching civic responsibility and personal growth. Programs from $28.99.',
    },
};

export default function OurGuaranteePage() {
    return (
        <>
            <PageHeader
                title="Enroll and Complete Your Community Service Education Program"
                subtitle="Structured curriculum teaching civic responsibility, personal growth, and accountability."
            />
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2>How It Works</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', margin: 'var(--space-6) 0' }}>
                        <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)' }}>
                            <strong>Step 1 – Enroll:</strong> Pay a one-time program administration fee which covers access to educational materials, supervision, engagement tracking, and certificate processing.
                        </p>
                        <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)' }}>
                            <strong>Step 2 – Learn &amp; Reflect:</strong> Complete a series of articles and guided reflections designed to provide a meaningful community service learning experience.
                        </p>
                        <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)' }}>
                            <strong>Step 3 – Engagement Verification:</strong> Throughout the program, you will be prompted to interact and confirm your presence. The timer pauses if you are not actively engaged.
                        </p>
                        <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)' }}>
                            <strong>Step 4 – Receive Verified Certificate:</strong> Each certificate includes a digital verification ID that courts and probation officers can confirm through our system.
                        </p>
                    </div>

                    <h2 style={{ marginTop: 'var(--space-10)' }}>Program Length</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)', margin: 'var(--space-6) 0' }}>
                        {[
                            { label: 'Short Program', hours: '1–5 hours' },
                            { label: 'Standard Program', hours: '6–10 hours' },
                            { label: 'Extended Program', hours: '11–25 hours' },
                            { label: 'Comprehensive', hours: 'Up to 1000 hours' },
                        ].map((tier) => (
                            <div key={tier.label} style={{
                                background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)',
                                borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textAlign: 'center'
                            }}>
                                <h4 style={{ marginBottom: 'var(--space-1)' }}>{tier.label}</h4>
                                <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)' }}>Approx. {tier.hours}</p>
                            </div>
                        ))}
                    </div>

                    <h2 style={{ marginTop: 'var(--space-10)' }}>Program Fee</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)' }}>
                        The program fee is based on the amount of educational content and supervision required. The fee covers full program access, article library and reflection prompts, engagement verification and tracking, and professional review and certificate processing.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-10)' }}>Court &amp; Probation Acceptance</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)' }}>
                        We serve participants nationwide. Acceptance of this program is determined by the referring authority (court, probation officer, attorney, or school). We recommend confirming approval before enrolling.
                    </p>

                    <h2 style={{ marginTop: 'var(--space-10)' }}>Our Commitment</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)' }}>
                        We take community service seriously. Our process is built to ensure that participants are actively learning, not just running a timer. This protects the integrity of the courts, helps participants genuinely reflect, and makes your certificate credible and verifiable.
                    </p>

                    <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
                        <Link href="/how-to-register" className="btn btn-cta">Register for Program</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
