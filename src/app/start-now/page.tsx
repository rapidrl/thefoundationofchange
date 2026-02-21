import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Start Now',
    description: 'Choose your community service program and start today. Programs start at $28.99.',
};

const tiers = [
    { hours: '1–10 Hours', price: '$28.99', popular: false },
    { hours: '11–25 Hours', price: '$44.99', popular: false },
    { hours: '26–50 Hours', price: '$59.99', popular: true },
    { hours: '51–100 Hours', price: '$79.99', popular: false },
    { hours: '101–250 Hours', price: '$119.99', popular: false },
    { hours: '251–500 Hours', price: '$169.99', popular: false },
    { hours: '501–1000 Hours', price: '$229.99', popular: false },
];

export default function StartNowPage() {
    return (
        <>
            <PageHeader
                title="Choose Your Program"
                subtitle="Select the number of community service hours you need. One-time fee — no hidden costs."
            />
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-5)', maxWidth: '900px', margin: '0 auto' }}>
                        {tiers.map((tier) => (
                            <div key={tier.hours} style={{
                                background: tier.popular ? 'var(--color-navy)' : 'var(--color-white)',
                                color: tier.popular ? '#fff' : 'inherit',
                                border: tier.popular ? '2px solid var(--color-navy)' : '1px solid var(--color-gray-200)',
                                borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', textAlign: 'center',
                                position: 'relative' as const,
                            }}>
                                {tier.popular && (
                                    <span style={{
                                        position: 'absolute' as const, top: -12, left: '50%', transform: 'translateX(-50%)',
                                        background: 'var(--color-blue)', color: '#fff', padding: '2px 12px',
                                        borderRadius: 'var(--radius-full)', fontSize: 'var(--text-xs)', fontWeight: 600
                                    }}>Most Popular</span>
                                )}
                                <h3 style={{
                                    fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)',
                                    color: tier.popular ? '#fff' : 'var(--color-navy)'
                                }}>{tier.hours}</h3>
                                <p style={{
                                    fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-4)',
                                    color: tier.popular ? '#fff' : 'var(--color-navy)'
                                }}>{tier.price}</p>
                                <Link
                                    href="/how-to-register"
                                    className={tier.popular ? 'btn btn-cta' : 'btn btn-secondary'}
                                    style={{ width: '100%', fontSize: 'var(--text-sm)' }}
                                >
                                    Enroll
                                </Link>
                            </div>
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', marginTop: 'var(--space-8)', color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)' }}>
                        All programs include: educational coursework, time tracking, reflection prompts, certificate of completion, and verification portal access.
                    </p>
                </div>
            </section>
        </>
    );
}
