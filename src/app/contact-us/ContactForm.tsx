'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function ContactForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            message: formData.get('message') as string,
        };

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await res.json();

            if (!res.ok) {
                setError(result.error || 'Something went wrong. Please try again.');
                return;
            }

            setSuccess(true);
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <section className={styles.content}>
                <div className="container">
                    <div className={styles.successMessage}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <h2>Message Sent!</h2>
                        <p>Thank you for reaching out. We typically respond within 1-2 business days.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.content}>
            <div className="container">
                <div className={styles.note}>
                    For commonly asked questions, please refer to the{' '}
                    <Link href="/faq">FAQ page</Link> first.
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="name">Full Name *</label>
                        <input type="text" id="name" name="name" required />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="email">Email Address *</label>
                        <input type="email" id="email" name="email" required />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="phone">Phone Number</label>
                        <input type="tel" id="phone" name="phone" />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="message">Message *</label>
                        <textarea id="message" name="message" required />
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Sending...' : 'Send Message'}
                    </button>
                </form>
            </div>
        </section>
    );
}
