import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How to Register for Online Community Service',
    description: 'Register for court-approved online community service in 5 easy steps. Create your account, choose your hours, and start earning verified service credit from home today.',
    openGraph: {
        title: 'How to Register for Online Community Service | The Foundation of Change',
        description: 'Create your account, choose your required hours, and begin earning verified community service credit from home. 5 simple steps to get started.',
    },
};

const steps = [
    { title: 'Create an Online Community Service Profile', description: 'Set up your account with your personal information.' },
    { title: 'Review Your Payment Options', description: 'One-time program administration fee which covers access to educational materials, supervision, engagement tracking, and certificate processing.' },
    { title: 'Learn & Reflect', description: 'Complete a series of articles and guided reflections designed to provide a meaningful community service learning experience.' },
    { title: 'Engagement Verification', description: 'Throughout the program, you will be prompted to interact and confirm your presence. The timer pauses if you are not actively engaged, ensuring your service time is legitimate.' },
    { title: 'Receive Verified Certificate', description: 'Once you complete all coursework and reflection requirements, you will receive a Certificate of Community Service Completion. Each certificate includes a digital verification ID that courts and probation officers can confirm through our system.' },
];

export default function HowToRegisterPage() {
    return (
        <>
            <PageHeader
                title="Community Service Registration"
                subtitle="The registration process is broken down into simple steps."
            />
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        {steps.map((step, i) => (
                            <div key={i} style={{
                                display: 'flex', gap: 'var(--space-5)', padding: 'var(--space-6)',
                                background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--color-gray-200)'
                            }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 'var(--radius-full)',
                                    background: 'var(--color-navy)', color: '#fff', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                                    fontSize: 'var(--text-lg)', flexShrink: 0
                                }}>{i + 1}</div>
                                <div>
                                    <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-2)' }}>{step.title}</h3>
                                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)' }}>{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
                        <Link href="/register" className="btn btn-cta">Create Your Account</Link>
                    </div>
                </div>
            </section>
        </>
    );
}
