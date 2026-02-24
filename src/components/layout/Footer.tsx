import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerGrid}>
                {/* Column 1 — About the Program */}
                <div className={styles.footerColumn}>
                    <h3>About the Program</h3>
                    <ul>
                        <li><Link href="/community">Community Service Program</Link></li>
                        <li><Link href="/how-it-works">How It Works</Link></li>
                        <li><Link href="/faq">Frequently Asked Questions</Link></li>
                        <li><Link href="/about-us">About Us</Link></li>
                        <li><Link href="/our-guarantee">Our Guarantee</Link></li>
                        <li><Link href="/states">State Programs</Link></li>
                        <li><Link href="/dashboard">My Dashboard</Link></li>
                        <li><Link href="/coursework">My Coursework</Link></li>
                    </ul>
                </div>

                {/* Column 2 — Verification & Documents */}
                <div className={styles.footerColumn}>
                    <h3>Verification &amp; Documents</h3>
                    <ul>
                        <li><Link href="/certificate-verification">Verify a Certificate</Link></li>
                        <li><Link href="/letter-of-introductions">Sample Enrollment Letter</Link></li>
                        <li><Link href="/terms-of-service">Attendance Policy</Link></li>
                        <li><Link href="/refund-policy">Refund Policy</Link></li>
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
                        <Link href="/contact-us" className={styles.contactLink}>
                            Secure Contact Form
                        </Link>
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
                    <Link href="/privacy-policy">Privacy</Link>
                    <Link href="/terms-of-service">Terms &amp; Conditions</Link>
                    <Link href="/refund-policy">Refund Policy</Link>
                </div>
            </div>
        </footer>
    );
}
