import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import styles from './page.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community Service Program',
    description: 'Complete your court-approved community service online. Earn verified community service hours from home — accepted by courts, probation, and schools nationwide.',
};

export default function CommunityPage() {
    return (
        <>
            <PageHeader
                title="Community Service Program"
                subtitle="Complete your required community service hours online through a structured, verified nonprofit program."
            />

            {/* Badges */}
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.badges}>
                        <span className={styles.badgeItem}>✓ Court-Approved</span>
                        <span className={styles.badgeItem}>✓ Probation Compliant</span>
                        <span className={styles.badgeItem}>✓ School Recognized</span>
                        <span className={styles.badgeItem}>✓ 501(c)(3) Nonprofit</span>
                    </div>

                    <div className={styles.sectionContent}>
                        <h2>What Is the Online Community Service Program?</h2>
                        <p>
                            The Foundation of Change 501(c)(3) nonprofit organization offers a structured,
                            educational, and verifiable online community service program. Our program is
                            accepted by courts, probation officers, and schools across the United States.
                        </p>
                    </div>
                </div>
            </section>

            {/* Who This Program Is For */}
            <section className={styles.sectionAlt}>
                <div className="container">
                    <div className={styles.sectionContent}>
                        <h2>Who This Program Is For</h2>
                    </div>
                    <div className={styles.audienceGrid}>
                        <div className={styles.audienceCard}>
                            <h3>🎓 Schools</h3>
                            <p>Service Learning</p>
                            <p>Graduation Credit</p>
                        </div>
                        <div className={styles.audienceCard}>
                            <h3>⚖️ Court &amp; Probation</h3>
                            <p>Probation Requirements</p>
                            <p>Court-Ordered Hours</p>
                        </div>
                        <div className={styles.audienceCard}>
                            <h3>🤝 Flexible Needs</h3>
                            <p>Volunteer Hours</p>
                            <p>Personal Growth</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className={styles.section}>
                <div className="container">
                    <div className={styles.sectionContent}>
                        <h2>Why Choose The Foundation of Change</h2>
                    </div>
                    <div className={styles.featureGrid}>
                        <div className={styles.featureItem}>
                            <span className={styles.featureIcon}>🏛️</span>
                            <div>
                                <h4>Court Compliant</h4>
                                <p>Accepted by courts and probation departments nationwide</p>
                            </div>
                        </div>
                        <div className={styles.featureItem}>
                            <span className={styles.featureIcon}>🔒</span>
                            <div>
                                <h4>Audit Ready</h4>
                                <p>Tamper-proof time tracking and verification logs</p>
                            </div>
                        </div>
                        <div className={styles.featureItem}>
                            <span className={styles.featureIcon}>💡</span>
                            <div>
                                <h4>Accountability Focused</h4>
                                <p>Meaningful coursework that promotes personal growth</p>
                            </div>
                        </div>
                        <div className={styles.featureItem}>
                            <span className={styles.featureIcon}>♿</span>
                            <div>
                                <h4>Accessible &amp; Flexible</h4>
                                <p>Complete at your own pace, from anywhere</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.ctaRow}>
                        <Link href="/how-to-register" className="btn btn-cta">
                            Enroll Now
                        </Link>
                        <Link href="/contact-us" className="btn btn-secondary">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
}
