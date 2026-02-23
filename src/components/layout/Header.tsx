'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './Header.module.css';

const navLinks = [
    { href: '/community', label: 'Community Service Program' },
    { href: '/states', label: 'State Programs' },
    { href: '/faq', label: 'FAQ' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/additional-services', label: 'Additional Services' },
    { href: '/contact-us', label: 'Contact Us' },
];

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);

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
                    <Link href="/how-to-register" className={styles.ctaButton}>
                        Get Started
                    </Link>
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
                <Link
                    href="/how-to-register"
                    className={styles.mobileCta}
                    onClick={() => setMobileOpen(false)}
                >
                    Get Started
                </Link>
            </nav>
        </header>
    );
}
