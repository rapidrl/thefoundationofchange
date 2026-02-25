'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';

const TIERS = [
    { minHours: 1, maxHours: 5, price: '$28.99' },
    { minHours: 6, maxHours: 10, price: '$78.99' },
    { minHours: 11, maxHours: 25, price: '$105.99' },
    { minHours: 26, maxHours: 50, price: '$134.99' },
    { minHours: 51, maxHours: 75, price: '$154.99' },
    { minHours: 76, maxHours: 250, price: '$174.99' },
    { minHours: 251, maxHours: 500, price: '$194.99' },
    { minHours: 501, maxHours: 1000, price: '$214.99' },
];

function getTier(hours: number) {
    return TIERS.find((t) => hours >= t.minHours && hours <= t.maxHours) || null;
}

export default function StartNowPage() {
    const router = useRouter();
    const [hours, setHours] = useState<number | ''>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const tier = useMemo(() => (typeof hours === 'number' ? getTier(hours) : null), [hours]);

    const handleEnroll = async () => {
        if (!hours || !tier) return;
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hours }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    router.push('/register?redirect=/start-now');
                    return;
                }
                setError(data.error || 'Something went wrong.');
                setLoading(false);
                return;
            }

            window.location.href = data.url;
        } catch {
            setError('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>
            <PageHeader
                title="Choose Your Program"
                subtitle="Enter the number of community service hours you need. One-time fee — no hidden costs."
            />
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>

                    {/* Hour Input */}
                    <div style={{
                        maxWidth: '480px', margin: '0 auto var(--space-10)',
                        background: 'var(--color-white)', border: '1px solid var(--color-gray-200)',
                        borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)',
                        boxShadow: 'var(--shadow-lg)',
                    }}>
                        <label htmlFor="hours" style={{
                            display: 'block', fontWeight: 600, fontSize: 'var(--text-lg)',
                            color: 'var(--color-navy)', marginBottom: 'var(--space-3)', textAlign: 'center',
                        }}>
                            How many hours do you need?
                        </label>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                            <input
                                type="number"
                                id="hours"
                                min={1}
                                max={1000}
                                placeholder="e.g. 40"
                                value={hours}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setHours(v === '' ? '' : Math.max(1, Math.min(1000, parseInt(v) || 0)));
                                }}
                                style={{
                                    flex: 1, padding: 'var(--space-4)', fontSize: 'var(--text-xl)',
                                    fontWeight: 700, textAlign: 'center', border: '2px solid var(--color-gray-300)',
                                    borderRadius: 'var(--radius-lg)', outline: 'none',
                                    fontFamily: 'var(--font-body)',
                                    transition: 'border-color var(--transition-fast)',
                                }}
                            />
                            <span style={{ fontSize: 'var(--text-lg)', color: 'var(--color-gray-500)', fontWeight: 500 }}>hours</span>
                        </div>

                        {/* Dynamic price display */}
                        {tier && (
                            <div style={{
                                marginTop: 'var(--space-5)', padding: 'var(--space-4)',
                                background: '#ecfdf5', borderRadius: 'var(--radius-lg)',
                                border: '1px solid #a7f3d0', textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 'var(--text-sm)', color: '#059669', marginBottom: 'var(--space-1)' }}>
                                    Your price
                                </div>
                                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-navy)' }}>
                                    {tier.price}
                                </div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: 'var(--space-1)' }}>
                                    {hours} hours • {tier.minHours}–{tier.maxHours} hour tier
                                </div>
                            </div>
                        )}

                        {error && (
                            <div style={{
                                marginTop: 'var(--space-4)', padding: 'var(--space-3)',
                                background: '#fef2f2', border: '1px solid #fecaca',
                                borderRadius: 'var(--radius-md)', color: '#dc2626',
                                fontSize: 'var(--text-sm)', textAlign: 'center',
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleEnroll}
                            disabled={!tier || loading}
                            className="btn btn-cta"
                            style={{
                                width: '100%', marginTop: 'var(--space-5)', border: 'none',
                                fontSize: 'var(--text-base)', opacity: !tier || loading ? 0.5 : 1,
                                cursor: !tier || loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? 'Processing...' : tier ? `Register — ${tier.price}` : 'Enter hours to continue'}
                        </button>
                    </div>

                    {/* Pricing Table */}
                    <h2 style={{ textAlign: 'center', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', color: 'var(--color-navy)' }}>
                        Pricing Guide
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
                        {TIERS.map((t) => {
                            const isActive = tier && t.minHours === tier.minHours;
                            return (
                                <button
                                    key={t.minHours}
                                    onClick={() => setHours(t.minHours)}
                                    style={{
                                        background: isActive ? 'var(--color-navy)' : 'var(--color-white)',
                                        color: isActive ? '#fff' : 'inherit',
                                        border: isActive ? '2px solid var(--color-navy)' : '1px solid var(--color-gray-200)',
                                        borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
                                        textAlign: 'center', cursor: 'pointer',
                                        transition: 'all var(--transition-fast)',
                                    }}
                                >
                                    <div style={{
                                        fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-1)',
                                        color: isActive ? '#fff' : 'var(--color-navy)',
                                    }}>
                                        {t.minHours}–{t.maxHours} Hours
                                    </div>
                                    <div style={{
                                        fontSize: 'var(--text-xl)', fontWeight: 700,
                                        color: isActive ? '#fff' : 'var(--color-navy)',
                                    }}>
                                        {t.price}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <p style={{ textAlign: 'center', marginTop: 'var(--space-8)', color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)' }}>
                        All programs include: educational coursework, time tracking, reflection prompts, certificate of completion, and verification portal access.
                    </p>
                    <p style={{ textAlign: 'center', marginTop: 'var(--space-3)', color: 'var(--color-gray-400)', fontSize: 'var(--text-xs)' }}>
                        Secure payments powered by Stripe. 🔒
                    </p>
                </div>
            </section>
        </>
    );
}
