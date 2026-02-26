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
    const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        async function checkUser() {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
            setLoading(false);

            if (data.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single();
                setIsAdmin(profile?.role === 'admin');
            }
        }

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session?.user) setIsAdmin(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.headerInner}>
                <Link href="/" className={styles.logo}>
                    <img
                        src="/logo.png"
                        alt="The Foundation of Change"
                        width={36}
                        height={36}
                        className={styles.logoIcon}
                        style={{ borderRadius: '50%', objectFit: 'contain' }}
                    />
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
                            {isAdmin && (
                                <Link href="/admin" className={styles.navLink} style={{ fontWeight: 700, color: '#dc2626' }}>
                                    🛡️ Admin
                                </Link>
                            )}
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
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className={styles.mobileNavLink}
                                onClick={() => setMobileOpen(false)}
                                style={{ fontWeight: 700, color: '#dc2626' }}
                            >
                                🛡️ Admin Dashboard
                            </Link>
                        )}
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
