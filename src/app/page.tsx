import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <h1>Helping Individuals Complete Verified Community Service Online</h1>
          <p>
            We provide accessible, trackable online service hours for participants
            nationwide. Every course is time‑tracked, verified, and court‑friendly —
            helping individuals meet requirements with integrity and accountability.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/how-to-register" className="btn btn-cta">
              Start Now
            </Link>
            <Link href="/certificate-verification" className="btn btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
              How Verification Works
            </Link>
          </div>
          <div className={styles.heroBadges}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✓</span>
              Court-Approved
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✓</span>
              Probation Compliant
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✓</span>
              School Recognized
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✓</span>
              501(c)(3) Nonprofit
            </div>
          </div>
        </div>
      </section>

      {/* Transparency & Fees */}
      <section className={styles.transparency}>
        <div className={`container ${styles.transparencyGrid}`}>
          <div className={styles.transparencyContent}>
            <h2>Program Transparency and Fees</h2>
            <p>
              As a registered 501(c)(3) nonprofit, The Foundation of Change
              charges a small administrative fee to cover the real costs of
              maintaining verified, court-accepted community service programs.
            </p>
            <p>
              Your fee helps us maintain secure recordkeeping, verify reflection
              submissions, and issue signed certificates.
            </p>
          </div>
          <div className={styles.feeNote}>
            <p>
              <span className={styles.feeHighlight}>Programs start at $28.99</span>, based on
              the number of verified service hours required.
            </p>
            <p>
              We do not receive government funding — these fees sustain the
              technology and supervision required for compliance verification.
            </p>
            <br />
            <Link href="/start-now" className="btn btn-primary">
              View all program options
            </Link>
          </div>
        </div>
      </section>

      {/* Certificate Preview */}
      <section className={styles.certificatePreview}>
        <div className={`container ${styles.certificatePreviewInner}`}>
          <div className={styles.certificateInfo}>
            <h2>What&apos;s on Your Certificate</h2>
            <ul className={styles.certificateList}>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Participant&apos;s full name
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Total verified hours and completion timestamp
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Unique verification code
              </li>
              <li>
                <span className={styles.checkIcon}>✓</span>
                Provider signature and EIN number
              </li>
            </ul>
            <br />
            <a
              href="/sample-certificate.pdf"
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Sample Certificate
            </a>
          </div>
          <div className={styles.certificateCard}>
            <div className={styles.certificateCardHeader}>
              <h3>Certificate of Community Service</h3>
              <p>The Foundation of Change — 501(c)(3)</p>
            </div>
            <div className={styles.certificateFields}>
              <div className={styles.certField}>Client-Worker</div>
              <div className={styles.certField}>Current Address</div>
              <div className={styles.certField}>Start Date</div>
              <div className={styles.certField}>Probation Officer</div>
              <div className={styles.certField}>Date Issued</div>
              <div className={styles.certField}>Court ID</div>
              <div className={styles.certField}>Verification Code</div>
              <div className={styles.certField}>Local Charity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className={styles.commitment}>
        <div className="container">
          <h2>Our Commitment to Transparency</h2>
          <p>
            The Foundation of Change is a registered 501(c)(3) nonprofit organization
            (EIN: 33-5003265). We provide verified, trackable community service programs
            accepted by thousands of courts and probation departments across the U.S.
          </p>
          <div className={styles.commitmentLinks}>
            <a href="mailto:info@thefoundationofchange.org">
              info@thefoundationofchange.org
            </a>
            <Link href="/certificate-verification">
              Verification Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>
            Complete your community service requirements from home, at your own
            pace. Enroll now and receive your verified certificate upon completion.
          </p>
          <Link href="/how-to-register" className="btn btn-cta">
            Enroll Now
          </Link>
        </div>
      </section>
    </>
  );
}
