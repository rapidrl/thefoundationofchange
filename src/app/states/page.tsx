'use client';

import { useState } from 'react';
import Link from 'next/link';
import { states } from './stateData';
import styles from './page.module.css';

export default function StatesIndexPage() {
    const [search, setSearch] = useState('');

    const filtered = states.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.abbr.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            {/* ======= HERO ======= */}
            <section className={styles.hero}>
                <div className={styles.heroOverlay} />
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroBadges}>
                        <span className={styles.heroBadge}>✓ Court-Approved</span>
                        <span className={styles.heroBadge}>✓ All 50 States</span>
                        <span className={styles.heroBadge}>✓ 501(c)(3) Nonprofit</span>
                    </div>
                    <h1 className={styles.heroTitle}>
                        Online Community Service
                        <span className={styles.heroAccent}>Available in Every State</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Select your state to learn about court-approved online community service
                        programs, requirements, and how to get started.
                    </p>
                </div>
            </section>

            {/* ======= SEARCH & GRID ======= */}
            <section className={styles.statesSection}>
                <div className="container">
                    <div className={styles.searchBar}>
                        <input
                            type="text"
                            placeholder="Search your state..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={styles.searchInput}
                            id="state-search"
                        />
                    </div>

                    <div className={styles.statesGrid}>
                        {filtered.map((state) => (
                            <Link
                                key={state.slug}
                                href={`/states/${state.slug}`}
                                className={styles.stateCard}
                            >
                                <span className={styles.stateAbbr}>{state.abbr}</span>
                                <span className={styles.stateName}>{state.name}</span>
                                <span className={styles.stateArrow}>→</span>
                            </Link>
                        ))}
                    </div>

                    {filtered.length === 0 && (
                        <p className={styles.noResults}>No states found matching &ldquo;{search}&rdquo;</p>
                    )}
                </div>
            </section>

            {/* ======= WHY CHOOSE US ======= */}
            <section className={styles.whySection}>
                <div className="container">
                    <h2 className={styles.whySectionTitle}>Why Choose The Foundation of Change?</h2>
                    <p className={styles.whySectionSubtitle}>
                        Trusted by participants across all 50 states for court-approved online community service.
                    </p>
                    <div className={styles.whyGrid}>
                        <div className={styles.whyCard}>
                            <span className={styles.whyIcon}>🏛️</span>
                            <h3>Court Accepted Nationwide</h3>
                            <p>Our 501(c)(3) certificates are accepted by courts and probation departments in all 50 states.</p>
                        </div>
                        <div className={styles.whyCard}>
                            <span className={styles.whyIcon}>⏰</span>
                            <h3>Complete On Your Schedule</h3>
                            <p>Self-paced with no deadlines. Up to 8 hours per day. Progress saves automatically.</p>
                        </div>
                        <div className={styles.whyCard}>
                            <span className={styles.whyIcon}>📜</span>
                            <h3>Instant Certificates</h3>
                            <p>Download your verified certificate immediately upon completion. Includes verification code.</p>
                        </div>
                        <div className={styles.whyCard}>
                            <span className={styles.whyIcon}>🔒</span>
                            <h3>Tamper-Proof Tracking</h3>
                            <p>Idle detection, anti-cheat measures, and detailed hour logs ensure audit-ready records.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======= FINAL CTA ======= */}
            <section className={styles.finalCta}>
                <div className={styles.finalCtaGlow} />
                <div className={`container ${styles.finalCtaContent}`}>
                    <h2>Ready to Get Started?</h2>
                    <p>Select your state above to learn more, or enroll now and begin your hours today.</p>
                    <Link href="/how-to-register" className={styles.ctaPrimary}>
                        Enroll Now — Get Started Today
                    </Link>
                </div>
            </section>
        </>
    );
}
