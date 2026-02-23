'use client';

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStateBySlug, states } from '../stateData';
import styles from './page.module.css';

interface Props {
    params: Promise<{ state: string }>;
}

export default function StatePage({ params }: Props) {
    const { state: stateSlug } = require('react').use(params);
    const stateData = getStateBySlug(stateSlug);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    if (!stateData) return notFound();

    const { name, abbr, cities, counties, courtInfo, geoContext, neighbors } = stateData;
    const citiesStr = cities.slice(0, -1).join(', ') + ', and ' + cities[cities.length - 1];

    const faqs = [
        {
            q: `Is online community service accepted by ${name} courts?`,
            a: `Our 501(c)(3) nonprofit program provides verified certificates with unique verification codes. Many ${name} courts accept online community service programs. We recommend confirming with your specific court or probation officer before enrolling.`,
        },
        {
            q: `How do I prove my hours to my ${name} probation officer?`,
            a: `You receive a certificate of completion and detailed hour log, both with a verification code your probation officer can verify through our online verification portal.`,
        },
        {
            q: 'How many hours can I complete per day?',
            a: 'Up to 8 hours per day. The daily limit resets at midnight in your local timezone to ensure meaningful engagement.',
        },
        {
            q: 'How long do I have to finish?',
            a: 'There is no deadline. Complete hours at your own pace. Progress saves automatically.',
        },
        {
            q: 'What does the coursework cover?',
            a: 'Coursework covers accountability, emotional regulation, decision-making, community awareness, and personal growth through self-paced educational modules and written reflections.',
        },
    ];

    const neighborStates = neighbors.map((slug) => states.find((s) => s.slug === slug)).filter(Boolean);

    return (
        <>
            {/* ======= HERO ======= */}
            <section className={styles.hero}>
                <div className={styles.heroOverlay} />
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroBadges}>
                        <span className={styles.heroBadge}>✓ Court-Approved</span>
                        <span className={styles.heroBadge}>✓ Probation-Compliant</span>
                        <span className={styles.heroBadge}>✓ {name} Accepted</span>
                    </div>
                    <h1 className={styles.heroTitle}>
                        Complete Your Community Service Hours in {name}
                        <span className={styles.heroAccent}> — 100% Online</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        A verified 501(c)(3) nonprofit program accepted by {name} courts,
                        probation officers, and schools. Start from home — finish on your schedule.
                    </p>
                    <div className={styles.heroCta}>
                        <Link href="/how-to-register" className={styles.ctaPrimary} id="hero-cta-enroll">
                            Enroll Now — Start Your {abbr} Hours Today
                        </Link>
                        <Link href="/contact-us" className={styles.ctaSecondary} id="hero-cta-contact">
                            Have Questions? Contact Us
                        </Link>
                    </div>
                </div>
            </section>

            {/* ======= STATS BAR ======= */}
            <section className={styles.statsBar}>
                <div className={`container ${styles.statsInner}`}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>10,000+</span>
                        <span className={styles.statLabel}>Hours Completed</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>50</span>
                        <span className={styles.statLabel}>States Covered</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>4.9★</span>
                        <span className={styles.statLabel}>Satisfaction Rating</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>501(c)(3)</span>
                        <span className={styles.statLabel}>Verified Nonprofit</span>
                    </div>
                </div>
            </section>

            {/* ======= HOW IT WORKS ======= */}
            <section className={styles.section} id="how-it-works">
                <div className="container">
                    <h2 className={styles.sectionTitle}>How Online Community Service Works in {name}</h2>
                    <p className={styles.sectionSubtitle}>Three simple steps to complete your community service requirement from anywhere in {name}.</p>
                    <div className={styles.stepsGrid}>
                        <div className={styles.stepCard}>
                            <div className={styles.stepNumber}>1</div>
                            <span className={styles.stepIcon}>📋</span>
                            <h3>Choose Your Hours</h3>
                            <p>Select the exact number of community service hours you need — from 1 to 1,000.</p>
                        </div>
                        <div className={styles.stepCard}>
                            <div className={styles.stepNumber}>2</div>
                            <span className={styles.stepIcon}>💻</span>
                            <h3>Complete Coursework</h3>
                            <p>Work through self-paced educational modules on accountability, personal growth, and community awareness.</p>
                        </div>
                        <div className={styles.stepCard}>
                            <div className={styles.stepNumber}>3</div>
                            <span className={styles.stepIcon}>📜</span>
                            <h3>Download Certificate</h3>
                            <p>Instantly receive your verified certificate of completion with a unique verification code.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======= WHO IS THIS FOR ======= */}
            <section className={styles.sectionAlt} id="who-is-this-for">
                <div className="container">
                    <h2 className={styles.sectionTitle}>Is This Program Right For You?</h2>
                    <p className={styles.sectionSubtitle}>Whatever your situation in {name}, we&apos;re here to help you move forward.</p>
                    <div className={styles.audienceGrid}>
                        <div className={styles.audienceCard}>
                            <span className={styles.audienceIcon}>⚖️</span>
                            <h3>Court-Ordered Hours in {name}?</h3>
                            <p>Fulfill your court-mandated community service through our verified online program. Accepted by {name} {courtInfo} across all {counties} counties.</p>
                            <Link href="/how-to-register" className={styles.audienceCta}>Start Your Hours →</Link>
                        </div>
                        <div className={styles.audienceCard}>
                            <span className={styles.audienceIcon}>🎓</span>
                            <h3>{name} Graduation Requirement?</h3>
                            <p>Earn service credit for graduation on your own schedule from anywhere in {name}. Accepted by schools statewide.</p>
                            <Link href="/how-to-register" className={styles.audienceCta}>Get Credit →</Link>
                        </div>
                        <div className={styles.audienceCard}>
                            <span className={styles.audienceIcon}>🤝</span>
                            <h3>{name} Probation Requirement?</h3>
                            <p>Complete probation-mandated community service from the comfort of home. Certificates accepted by {name} probation departments.</p>
                            <Link href="/how-to-register" className={styles.audienceCta}>Get Compliant →</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======= STATE-SPECIFIC SEO CONTENT ======= */}
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.seoContent}>
                        <h2>Online Community Service in {name} — What You Need to Know</h2>
                        <p>
                            {name} residents who need to complete community service hours — whether for court requirements,
                            probation conditions, school graduation, or personal development — can fulfill their obligations
                            entirely online through The Foundation of Change. Our 501(c)(3) nonprofit program provides a
                            structured, self-paced educational experience accepted by courts and probation departments
                            throughout {name}.
                        </p>

                        <h3>{name} Court System and Community Service</h3>
                        <p>
                            {name}&apos;s court system includes {courtInfo} across all {counties} counties. Courts
                            in <strong>{citiesStr}</strong> regularly assign community service as part of sentencing
                            for misdemeanor offenses, DUI cases, and first-time offender programs. Our certificate provides
                            the verified documentation {name} courts require.
                        </p>

                        <h3>Why {name} Residents Choose Online Community Service</h3>
                        <p>{geoContext}</p>

                        <h3>{name} County Coverage</h3>
                        <p>
                            Our program is available in all {counties} {name} counties. Whether you are in a major
                            metropolitan area like {cities[0]} or a rural county, you can start and complete your hours online.
                            {name}&apos;s {courtInfo} all recognize 501(c)(3) nonprofit community service certificates.
                            No in-person visits to service sites are needed — everything is completed from home using any
                            device with internet access.
                        </p>

                        <h3>Verification and Acceptance</h3>
                        <p>
                            Every certificate includes a unique verification code that {name} courts and probation officers
                            can independently verify through our online portal. We provide detailed hour logs showing dates,
                            times, and hours completed. Our 501(c)(3) nonprofit status provides the legitimacy {name} courts
                            expect from community service providers.
                        </p>

                        <h3>Getting Started in {name}</h3>
                        <p>
                            Enroll today and begin your hours immediately. There are no deadlines — work at your own pace
                            with an 8-hour daily maximum. Your progress is saved automatically on any device. Upon completion,
                            your certificate and hour log are instantly available.{' '}
                            <Link href="/how-to-register" style={{ fontWeight: 600 }}>
                                Start your {name} community service hours now
                            </Link>.
                        </p>
                    </div>
                </div>
            </section>

            {/* ======= LOCAL CITIES ======= */}
            <section className={styles.sectionAlt}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Serving Communities Across {name}</h2>
                    <p className={styles.sectionSubtitle}>
                        Our online community service program is available to residents in every {name} city and county.
                    </p>
                    <div className={styles.stepsGrid}>
                        {cities.map((city) => (
                            <div key={city} className={styles.stepCard}>
                                <span className={styles.stepIcon}>📍</span>
                                <h3>Community Service in {city}, {abbr}</h3>
                                <p>
                                    Residents of {city}, {name} can complete court-ordered, probation-required, or school-mandated
                                    community service hours entirely online. Our program is accepted by {city} area courts
                                    and provides verified certificates with hour logs.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======= TRUST GRID ======= */}
            <section className={styles.sectionAlt}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>Why {name} Residents Choose The Foundation of Change</h2>
                    <p className={styles.sectionSubtitle}>Everything you need to complete your community service with confidence.</p>
                    <div className={styles.trustGrid}>
                        <div className={styles.trustCard}>
                            <span className={styles.trustIcon}>🏛️</span>
                            <h4>Court Compliant</h4>
                            <p>Accepted by {name} courts and probation departments statewide.</p>
                        </div>
                        <div className={styles.trustCard}>
                            <span className={styles.trustIcon}>🔒</span>
                            <h4>Audit Ready</h4>
                            <p>Tamper-proof time tracking with verification logs for every session.</p>
                        </div>
                        <div className={styles.trustCard}>
                            <span className={styles.trustIcon}>📄</span>
                            <h4>501(c)(3) Nonprofit</h4>
                            <p>Registered nonprofit — your hours carry legitimate weight.</p>
                        </div>
                        <div className={styles.trustCard}>
                            <span className={styles.trustIcon}>⏰</span>
                            <h4>Self-Paced</h4>
                            <p>No deadlines. Complete hours at your pace from anywhere in {name}.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======= FAQ ======= */}
            <section className={styles.section} id="faq">
                <div className="container">
                    <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                    <p className={styles.sectionSubtitle}>{name} Community Service — Answered</p>
                    <div className={styles.faqList}>
                        {faqs.map((faq, i) => (
                            <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`}>
                                <button
                                    className={styles.faqQuestion}
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    aria-expanded={openFaq === i}
                                >
                                    <span>{faq.q}</span>
                                    <span className={styles.faqChevron}>{openFaq === i ? '−' : '+'}</span>
                                </button>
                                <div className={styles.faqAnswer}>
                                    <p>{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======= FINAL CTA ======= */}
            <section className={styles.finalCta}>
                <div className={styles.finalCtaGlow} />
                <div className={`container ${styles.finalCtaContent}`}>
                    <h2>Start Your {name} Community Service Hours Today</h2>
                    <p>
                        Join participants across {name} who have completed their hours online
                        through our verified nonprofit program.
                    </p>
                    <Link href="/how-to-register" className={styles.ctaPrimary}>
                        Enroll Now — Get Started
                    </Link>
                </div>
            </section>

            {/* ======= NEARBY STATES ======= */}
            {neighborStates.length > 0 && (
                <section className={styles.nearbyStates}>
                    <div className={`container ${styles.nearbyStatesInner}`}>
                        <h3>Community Service in Nearby States</h3>
                        <div className={styles.nearbyGrid}>
                            {neighborStates.map((s) => s && (
                                <Link key={s.slug} href={`/states/${s.slug}`} className={styles.nearbyLink}>
                                    {s.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ======= JSON-LD STRUCTURED DATA ======= */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqs.map((faq) => ({
                            '@type': 'Question',
                            name: faq.q,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: faq.a,
                            },
                        })),
                    }),
                }}
            />
        </>
    );
}
