import Link from 'next/link';
import styles from './Footer.module.css';

const WP = 'https://thefoundationofchange.org';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerGrid}>
                {/* Column 1 — About the Program */}
                <div className={styles.footerColumn}>
                    <h3>About the Program</h3>
                    <ul>
                        <li><a href={`${WP}/community-service`}>Community Service Program</a></li>
                        <li><a href={`${WP}/how-it-works`}>How It Works</a></li>
                        <li><a href={`${WP}/faq`}>Frequently Asked Questions</a></li>
                        <li><a href={`${WP}/court-acceptance`}>Court Acceptance</a></li>
                        <li><a href={`${WP}/program-details`}>Program Details</a></li>
                        <li><a href={`${WP}/community-service-by-state`}>State Programs</a></li>
                        <li><Link href="/dashboard">My Dashboard</Link></li>
                        <li><Link href="/coursework">My Coursework</Link></li>
                    </ul>
                </div>

                {/* Column 2 — Verification & Documents */}
                <div className={styles.footerColumn}>
                    <h3>Verification &amp; Documents</h3>
                    <ul>
                        <li><Link href="/certificate-verification">Verify a Certificate</Link></li>
                        <li><a href={`${WP}/enrollment-letter`}>Sample Enrollment Letter</a></li>
                        <li><a href={`${WP}/terms-of-service`}>Attendance Policy</a></li>
                        <li><a href={`${WP}/refund-policy`}>Refund Policy</a></li>
                    </ul>
                </div>

                {/* Column 3 — Contact Us */}
                <div className={styles.footerColumn}>
                    <h3>Contact Us</h3>
                    <div className={styles.footerContact}>
                        <a href="mailto:info@thefoundationofchange.org" className={styles.contactLink}>
                            info@thefoundationofchange.org
                        </a>
                        <a href="tel:+17348346934" className={styles.contactLink}>
                            734-834-6934
                        </a>
                        <a href={`${WP}/contact-us`} className={styles.contactLink}>
                            Secure Contact Form
                        </a>
                    </div>
                </div>
            </div>

            {/* Partner Programs */}
            <div className={styles.partnerSection}>
                <p className={styles.partnerLabel}>Other Programs — In Partnership With Schroeder Counseling</p>
                <div className={styles.partnerLinks}>
                    <a href="https://www.schroedercounseling.com/court-approved-anger-management-classes" target="_blank" rel="noopener noreferrer">
                        Anger Management Classes
                    </a>
                    <a href="https://www.schroedercounseling.com/substance-abuse-asssessments" target="_blank" rel="noopener noreferrer">
                        Substance Abuse Assessments
                    </a>
                    <a href="https://www.schroedercounseling.com/drug-and-alcohol" target="_blank" rel="noopener noreferrer">
                        Alcohol Education Classes
                    </a>
                    <a href="https://www.schroedercounseling.com/theft-awareness-class" target="_blank" rel="noopener noreferrer">
                        Theft Awareness Classes
                    </a>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className={styles.bottomBar}>
                <p className={styles.copyright}>
                    © {new Date().getFullYear()} The Foundation of Change — 501(c)(3) Nonprofit — EIN: 33-5003265
                </p>
                <div className={styles.legalLinks}>
                    <a href={`${WP}/privacy-policy`}>Privacy</a>
                    <a href={`${WP}/terms-of-service`}>Terms &amp; Conditions</a>
                    <a href={`${WP}/refund-policy`}>Refund Policy</a>
                </div>
            </div>
        </footer>
    );
}
