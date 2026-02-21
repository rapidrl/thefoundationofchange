'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import styles from './page.module.css';

const tiers = [
    { id: 'tier_1_10', hours: '1–10 Hours', price: '$28.99', popular: false },
    { id: 'tier_11_25', hours: '11–25 Hours', price: '$44.99', popular: false },
    { id: 'tier_26_50', hours: '26–50 Hours', price: '$59.99', popular: true },
    { id: 'tier_51_100', hours: '51–100 Hours', price: '$79.99', popular: false },
    { id: 'tier_101_250', hours: '101–250 Hours', price: '$119.99', popular: false },
    { id: 'tier_251_500', hours: '251–500 Hours', price: '$169.99', popular: false },
    { id: 'tier_501_1000', hours: '501–1000 Hours', price: '$229.99', popular: false },
];

export default function StartNowPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleEnroll = async (tierId: string) => {
        setError('');
        setLoading(tierId);

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tierId }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push(`/login?redirect=/start-now`);
                    return;
                }
                setError(data.error || 'Something went wrong');
                setLoading(null);
                return;
            }

            // Redirect to Stripe Checkout
            window.location.href = data.url;
        } catch {
            setError('Failed to connect to payment service. Please try again.');
            setLoading(null);
        }
    };

    return (
        <>
            <PageHeader
                title="Choose Your Program"
                subtitle="Select the number of community service hours you need. One-time fee — no hidden costs."
            />
            <section className={styles.section}>
                <div className="container">
                    {error && <div className={styles.error}>{error}</div>}
                    <div className={styles.grid}>
                        {tiers.map((tier) => (
                            <div
                                key={tier.id}
                                className={`${styles.card} ${tier.popular ? styles.popular : ''}`}
                            >
                                {tier.popular && <span className={styles.badge}>Most Popular</span>}
                                <h3 className={styles.cardTitle}>{tier.hours}</h3>
                                <p className={styles.cardPrice}>{tier.price}</p>
                                <button
                                    onClick={() => handleEnroll(tier.id)}
                                    disabled={loading !== null}
                                    className={`btn ${tier.popular ? 'btn-cta' : 'btn-secondary'} ${styles.enrollBtn}`}
                                >
                                    {loading === tier.id ? 'Processing...' : 'Enroll'}
                                </button>
                            </div>
                        ))}
                    </div>
                    <p className={styles.footnote}>
                        All programs include: educational coursework, time tracking, reflection prompts,
                        certificate of completion, and verification portal access.
                    </p>
                </div>
            </section>
        </>
    );
}
