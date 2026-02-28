'use client';

import { useState } from 'react';
import styles from './CountyCoverage.module.css';

interface CountyCoverageProps {
    stateName: string;
    stateAbbr: string;
    counties: string[];
}

export default function CountyCoverage({ stateName, stateAbbr, counties }: CountyCoverageProps) {
    const [search, setSearch] = useState('');

    const filtered = counties.filter((c) =>
        c.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <section className={styles.section} id="county-coverage">
            <div className="container">
                <h2 className={styles.title}>
                    Is Our Online Community Service Program Accepted in Your {stateName} County?
                </h2>
                <p className={styles.subtitle}>
                    Our program serves residents in all <strong>{counties.length} {stateName} counties</strong>.
                    Those marked with a <span className={styles.checkInline}>✓</span> accept certificates
                    from 501(c)(3) nonprofit organizations like The Foundation of Change.
                </p>

                {/* Search bar */}
                <div className={styles.searchWrap}>
                    <input
                        type="text"
                        placeholder={`Search ${stateName} counties...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                        id="county-search"
                        aria-label={`Search ${stateName} counties`}
                    />
                    {search && (
                        <button
                            className={styles.clearBtn}
                            onClick={() => setSearch('')}
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* County grid */}
                <div className={styles.grid}>
                    {filtered.map((county) => (
                        <div key={county} className={styles.countyItem}>
                            <span className={styles.checkmark}>✓</span>
                            <span className={styles.countyName}>{county}</span>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <p className={styles.noResults}>
                        No counties found matching &ldquo;{search}&rdquo; in {stateName}.
                    </p>
                )}

                {/* SEO-rich footer text */}
                <p className={styles.footerText}>
                    Whether you are in <strong>{counties[0]}</strong>, <strong>{counties[Math.floor(counties.length / 2)]}</strong>,
                    or <strong>{counties[counties.length - 1]}</strong> — our online community service
                    program is available to you. Complete your court-ordered, probation-required, or
                    school-mandated hours from anywhere in {stateName}.
                </p>
            </div>
        </section>
    );
}
