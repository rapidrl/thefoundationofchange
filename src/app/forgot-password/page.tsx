'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const supabase = createClient();
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (resetError) {
            setError(resetError.message);
        } else {
            setSent(true);
        }
        setLoading(false);
    };

    if (sent) {
        return (
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem' }}>📧</span>
                    <h1 style={{ fontSize: 'var(--text-2xl)', margin: 'var(--space-4) 0' }}>Check Your Email</h1>
                    <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)' }}>
                        We sent a password reset link to <strong>{email}</strong>. Click the link in your email to reset your password.
                    </p>
                    <Link href="/login" style={{ color: 'var(--color-blue)', fontSize: 'var(--text-sm)' }}>
                        Back to Login
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section style={{ padding: 'var(--space-16) 0' }}>
            <div className="container" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
                    Forgot Password
                </h1>
                <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    Enter your email and we&apos;ll send you a reset link.
                </p>

                {error && (
                    <div style={{
                        padding: 'var(--space-3) var(--space-4)', background: '#fef2f2',
                        border: '1px solid #fecaca', borderRadius: 'var(--radius-md)',
                        color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)',
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} style={{
                    background: 'var(--color-white)', border: '1px solid var(--color-gray-200)',
                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
                }}>
                    <label style={{
                        display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600,
                        color: 'var(--color-navy)', marginBottom: 'var(--space-1)',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        style={{
                            width: '100%', padding: 'var(--space-3) var(--space-4)',
                            border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'var(--font-body)',
                            marginBottom: 'var(--space-4)',
                        }}
                    />
                    <button
                        type="submit"
                        className="btn btn-cta"
                        disabled={loading}
                        style={{ width: '100%', border: 'none', opacity: loading ? 0.5 : 1 }}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                    Remember your password?{' '}
                    <Link href="/login" style={{ color: 'var(--color-blue)', fontWeight: 500 }}>Log in</Link>
                </p>
            </div>
        </section>
    );
}
