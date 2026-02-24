'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from './Header.module.css';

const navLinks = [
    { href: '/community', label: 'Community Service' },
    { href: '/states', label: 'State Programs' },
    { href: '/faq', label: 'FAQ' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/contact-us', label: 'Contact Us' },
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<{ email?: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.headerInner}>
                <Link href="/" className={styles.logo}>
                    <div className={styles.logoIcon}>
                        <span>TFC</span>
                    </div>
                    <span className={styles.logoText}>The Foundation of Change</span>
                </Link>

                {/* Desktop nav */}
                <nav className={styles.nav}>
                    {navLinks.map((link) => (
                        <Link key={link.href} href={link.href} className={styles.navLink}>
                            {link.label}
                        </Link>
                    ))}

                    {!loading && user ? (
                        <>
                            <Link href="/dashboard" className={styles.navLink} style={{ fontWeight: 600 }}>
                                Dashboard
                            </Link>
                            <Link href="/coursework" className={styles.ctaButton}>
                                My Coursework
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={styles.navLinkAccent}>
                                Log In
                            </Link>
                            <Link href="/how-to-register" className={styles.ctaButton}>
                                Get Started
                            </Link>
                        </>
                    )}
                </nav>

                {/* Mobile toggle */}
                <button
                    className={styles.mobileToggle}
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={mobileOpen}
                >
                    <div className={styles.hamburgerIcon}>
                        <span />
                        <span />
                        <span />
                    </div>
                </button>
            </div>

            {/* Mobile menu */}
            <nav className={`${styles.mobileMenu} ${mobileOpen ? styles.open : ''}`}>
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={styles.mobileNavLink}
                        onClick={() => setMobileOpen(false)}
                    >
                        {link.label}
                    </Link>
                ))}

                {!loading && user ? (
                    <>
                        <Link
                            href="/dashboard"
                            className={styles.mobileNavLink}
                            onClick={() => setMobileOpen(false)}
                            style={{ fontWeight: 700, color: 'var(--color-navy)' }}
                        >
                            📊 Dashboard
                        </Link>
                        <Link
                            href="/coursework"
                            className={styles.mobileCta}
                            onClick={() => setMobileOpen(false)}
                        >
                            My Coursework
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className={styles.mobileNavLink}
                            onClick={() => setMobileOpen(false)}
                            style={{ fontWeight: 700, color: 'var(--color-blue)' }}
                        >
                            Log In
                        </Link>
                        <Link
                            href="/how-to-register"
                            className={styles.mobileCta}
                            onClick={() => setMobileOpen(false)}
                        >
                            Get Started
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
}
