'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './page.module.css';

const stats = [
    { value: '10,000+', label: 'Hours Completed' },
    { value: '50', label: 'States Covered' },
    { value: '4.9★', label: 'Satisfaction Rating' },
    { value: '501(c)(3)', label: 'Verified Nonprofit' },
];

const steps = [
    {
        num: '1',
        title: 'Choose Your Hours',
        desc: 'Select the number of community service hours you need to complete.',
        icon: '📋',
    },
    {
        num: '2',
        title: 'Complete Coursework',
        desc: 'Work through meaningful, self-paced educational modules from home.',
        icon: '💻',
    },
    {
        num: '3',
        title: 'Receive Your Certificate',
        desc: 'Access your verified certificate upon successful completion of your required hours.',
        icon: '📜',
    },
];

const audiences = [
    {
        icon: '⚖️',
        title: 'Court-Ordered Hours?',
        desc: 'Fulfill your court or probation requirements online with a verified, audit-ready program accepted nationwide.',
        cta: 'View Program Details',
    },
    {
        icon: '🎓',
        title: 'Graduating Soon?',
        desc: 'Earn community service credit for graduation or service learning — on your own schedule.',
        cta: 'Learn More',
    },
    {
        icon: '🤝',
        title: 'Probation Requirement?',
        desc: 'Complete your probation-mandated community service from the comfort of home, accepted by probation departments.',
        cta: 'View Requirements',
    },
];

const trustItems = [
    { icon: '🏛️', title: 'Court Compliant', desc: 'Accepted by courts and probation departments across all 50 states.' },
    { icon: '🔒', title: 'Audit Ready', desc: 'Tamper-proof time tracking with verification logs for every session.' },
    { icon: '📄', title: '501(c)(3) Nonprofit', desc: 'A registered nonprofit — your hours are backed by a legitimate organization.' },
    { icon: '💡', title: 'Accountability Focused', desc: 'CBT-informed coursework that promotes real personal growth and reflection.' },
    { icon: '⏰', title: 'Self-Paced', desc: 'No deadlines. Complete your hours at your own pace, anytime, anywhere.' },
    { icon: '♿', title: 'Fully Accessible', desc: 'Designed for all learners. Work from any device, save progress automatically.' },
];

const testimonials = [
    {
        name: 'Marcus T.',
        role: 'Court-Ordered Participant',
        text: 'I was nervous about online community service, but this program made it simple. My probation officer accepted the certificate with no issues.',
        rating: 5,
    },
    {
        name: 'Sarah L.',
        role: 'High School Senior',
        text: 'I needed hours for graduation and this was so much more convenient than finding a local organization. The coursework was actually meaningful.',
        rating: 5,
    },
    {
        name: 'James R.',
        role: 'Probation Requirement',
        text: 'The self-paced structure allowed me to fulfill my obligations while working night shifts. The coursework was actually relevant and my probation officer accepted the certificate without question.',
        rating: 5,
    },
];

const faqs = [
    {
        q: 'How does the program work?',
        a: 'Select your required hours, complete educational coursework focused on anger management, accountability, emotional regulation, and decision-making. A built-in timer tracks your learning time. Once your hours are fulfilled, your certificate of completion becomes available for download.',
    },
    {
        q: 'Will my certificate be accepted by the court?',
        a: 'We provide a verified certificate of completion from a 501(c)(3) nonprofit. Acceptance is at the discretion of your referring agency. We recommend confirming with your court or probation officer before enrolling.',
    },
    {
        q: 'How long do I have to complete my hours?',
        a: 'There is no deadline. Complete your hours at your own pace. Your progress is automatically saved so you can log in and continue anytime.',
    },
    {
        q: 'Is there a limit to how many hours I can do per day?',
        a: 'Yes, a maximum of 8 hours per day can be completed toward your service hours to ensure meaningful engagement with the material.',
    },
    {
        q: 'How do I get my certificate?',
        a: 'Once all required hours and reflections are completed, your certificate becomes available for download directly from your dashboard.',
    },
    {
        q: 'Can I get a refund if my hours are not accepted?',
        a: 'Access to materials is immediate upon enrollment. We cannot offer refunds once coursework access is granted. Please confirm acceptance with your referring agency before enrolling.',
    },
];

export default function CommunityPage() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <>
            {/* ======= HERO ======= */}
            <section className={styles.hero}>
                <div className={styles.heroOverlay} />
                <div className={`container ${styles.heroContent}`}>
                    <div className={styles.heroBadges}>
                        <span className={styles.heroBadge}>✓ Court-Approved</span>
                        <span className={styles.heroBadge}>✓ Probation-Compliant</span>
                        <span className={styles.heroBadge}>✓ Nationwide</span>
                    </div>
                    <h1 className={styles.heroTitle}>
                        Complete Your Community Service Hours
                        <span className={styles.heroAccent}> — 100% Online</span>
                    </h1>
                    <p className={styles.heroSubtitle}>
                        A verified, structured nonprofit program accepted by courts, probation officers,
                        and schools across the United States. Start from home — finish on your schedule.
                    </p>
                    <div className={styles.heroCta}>
                        <Link href="/how-to-register" className={styles.ctaPrimary} id="hero-cta-enroll">
                            Begin Your Program
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
                    {stats.map((stat) => (
                        <div key={stat.label} className={styles.statItem}>
                            <span className={styles.statValue}>{stat.value}</span>
                            <span className={styles.statLabel}>{stat.label}</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* ======= HOW IT WORKS ======= */}
            <section className={styles.section} id="how-it-works">
                <div className="container">
                    <h2 className={styles.sectionTitle}>How It Works</h2>
                    <p className={styles.sectionSubtitle}>Three simple steps to complete your community service requirement.</p>
                    <div className={styles.stepsGrid}>
                        {steps.map((step) => (
                            <div key={step.num} className={styles.stepCard}>
                                <div className={styles.stepNumber}>{step.num}</div>
                                <span className={styles.stepIcon}>{step.icon}</span>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======= WHO IS THIS FOR ======= */}
            <section className={styles.sectionAlt} id="who-is-this-for">
                <div className="container">
                    <h2 className={styles.sectionTitle}>Is This Program Right For You?</h2>
                    <p className={styles.sectionSubtitle}>Whatever your situation, we&apos;re here to help you move forward.</p>
                    <div className={styles.audienceGrid}>
                        {audiences.map((a) => (
                            <div key={a.title} className={styles.audienceCard}>
                                <span className={styles.audienceIcon}>{a.icon}</span>
                                <h3>{a.title}</h3>
                                <p>{a.desc}</p>
                                <Link href="/how-to-register" className={styles.audienceCta}>
                                    {a.cta} →
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======= TRUST & CREDIBILITY ======= */}
            <section className={styles.section} id="why-choose-us">
                <div className="container">
                    <h2 className={styles.sectionTitle}>Program Integrity &amp; Accountability</h2>
                    <p className={styles.sectionSubtitle}>How we ensure every hour is verified, meaningful, and audit-ready.</p>
                    <div className={styles.trustGrid}>
                        {trustItems.map((item) => (
                            <div key={item.title} className={styles.trustCard}>
                                <span className={styles.trustIcon}>{item.icon}</span>
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======= TESTIMONIALS ======= */}
            <section className={styles.sectionDark} id="testimonials">
                <div className="container">
                    <h2 className={styles.sectionTitleLight}>What Participants Are Saying</h2>
                    <p className={styles.sectionSubtitleLight}>Real stories from real people who completed our program.</p>
                    <div className={styles.testimonialsGrid}>
                        {testimonials.map((t) => (
                            <div key={t.name} className={styles.testimonialCard}>
                                <div className={styles.testimonialStars}>
                                    {'★'.repeat(t.rating)}
                                </div>
                                <p className={styles.testimonialText}>&ldquo;{t.text}&rdquo;</p>
                                <div className={styles.testimonialAuthor}>
                                    <div className={styles.testimonialAvatar}>
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <strong>{t.name}</strong>
                                        <span>{t.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ======= FAQ ======= */}
            <section className={styles.section} id="faq">
                <div className="container">
                    <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                    <p className={styles.sectionSubtitle}>Everything you need to know before enrolling.</p>
                    <div className={styles.faqList}>
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={`${styles.faqItem} ${openFaq === i ? styles.faqOpen : ''}`}
                            >
                                <button
                                    className={styles.faqQuestion}
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    aria-expanded={openFaq === i}
                                    id={`faq-toggle-${i}`}
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
            <section className={styles.finalCta} id="enroll">
                <div className={styles.finalCtaGlow} />
                <div className={`container ${styles.finalCtaContent}`}>
                    <h2>Take the Next Step</h2>
                    <p>Begin fulfilling your community service requirements through our structured, verified nonprofit program.</p>
                    <Link href="/how-to-register" className={styles.ctaPrimary} id="final-cta-enroll">
                        Register for Program
                    </Link>
                </div>
            </section>
        </>
    );
}
