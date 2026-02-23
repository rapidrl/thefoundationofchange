'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Supabase will pass the recovery token via URL hash
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                // User arrived via reset link — ready to set new password
            }
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 2000);
        }
    };

    if (success) {
        return (
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem' }}>✅</span>
                    <h1 style={{ fontSize: 'var(--text-2xl)', margin: 'var(--space-4) 0' }}>Password Updated!</h1>
                    <p style={{ color: 'var(--color-gray-500)' }}>Redirecting to your dashboard...</p>
                </div>
            </section>
        );
    }

    return (
        <section style={{ padding: 'var(--space-16) 0' }}>
            <div className="container" style={{ maxWidth: '400px', margin: '0 auto' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
                    Set New Password
                </h1>
                <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)', textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                    Enter your new password below.
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
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <label style={{
                            display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600,
                            color: 'var(--color-navy)', marginBottom: 'var(--space-1)',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>New Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: 'var(--space-3) var(--space-4)',
                                border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'var(--font-body)',
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <label style={{
                            display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600,
                            color: 'var(--color-navy)', marginBottom: 'var(--space-1)',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>Confirm Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            style={{
                                width: '100%', padding: 'var(--space-3) var(--space-4)',
                                border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'var(--font-body)',
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-cta"
                        disabled={loading}
                        style={{ width: '100%', border: 'none', opacity: loading ? 0.5 : 1 }}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </section>
    );
}
