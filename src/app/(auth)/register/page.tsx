'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from '../auth.module.css';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        setSuccess('Account created! Check your email to confirm, then sign in.');
        setLoading(false);
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <h1>Create Account</h1>
                <p className={styles.subtitle}>Register for your community service program</p>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form onSubmit={handleRegister} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className={styles.switchLink}>
                    Already have an account? <Link href="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
