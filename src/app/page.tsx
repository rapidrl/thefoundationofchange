import Link from "next/link";
import styles from "./page.module.css";

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://thefoundationofchange.org/#website",
    name: "The Foundation of Change",
    url: "https://thefoundationofchange.org",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://thefoundationofchange.org/states/{search_term_string}",
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "NonprofitOrganization",
    "@id": "https://thefoundationofchange.org/#organization",
    name: "The Foundation of Change",
    url: "https://thefoundationofchange.org",
    logo: "https://thefoundationofchange.org/logo.png",
    description: "501(c)(3) nonprofit providing court-recognized online community service programs. Complete self-paced coursework from home and earn verified certificates.",
    email: "info@thefoundationofchange.org",
    telephone: "+1-734-834-6934",
    taxID: "33-5003265",
    nonprofitStatus: "501(c)(3)",
    sameAs: [],
    address: {
      "@type": "PostalAddress",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    serviceType: "Online Community Service Program",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
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
              501(c)(3) Nonprofit
            </div>
          </div>
          <h1>
            Court-Accepted Community Service
            <span className={styles.heroAccent}>You Can Complete 100% Online</span>
          </h1>
          <p>
            The Foundation of Change provides verified, trackable online community service
            hours accepted by courts, probation offices, and schools in all 50 states.
            Self-paced. Time-verified. Certificate upon completion.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/start-now" className="btn btn-cta">
              Begin Your Program
            </Link>
            <Link href="/how-it-works" className="btn btn-secondary" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
              See How It Works
            </Link>
          </div>
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>50</span>
              <span className={styles.statLabel}>States Served</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>501(c)(3)</span>
              <span className={styles.statLabel}>Nonprofit Status</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>$28.99</span>
              <span className={styles.statLabel}>Starting Price</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Online</span>
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

      {/* Quick Navigation — Internal Links */}
      <section style={{ padding: 'var(--space-12) 0', background: 'var(--color-gray-50)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Explore Our Programs</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-gray-500)', marginBottom: 'var(--space-8)', maxWidth: '600px', margin: '0 auto var(--space-8)' }}>
            Everything you need to complete your community service requirements.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            {[
              { href: '/community', label: 'Community Service Program', desc: 'Our flagship online program' },
              { href: '/how-it-works', label: 'How It Works', desc: 'Step-by-step guide' },
              { href: '/start-now', label: 'Enroll & Pricing', desc: 'Programs from $28.99' },
              { href: '/faq', label: 'FAQ', desc: 'Common questions answered' },
              { href: '/certificate-verification', label: 'Verify a Certificate', desc: 'Employer & court verification' },
              { href: '/letter-of-introductions', label: 'Court Acceptance', desc: 'Enrollment letters & proof' },
              { href: '/about-us', label: 'About Us', desc: 'Our mission & values' },
              { href: '/states', label: 'State Programs', desc: 'Available in all 50 states' },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{
                display: 'block', padding: 'var(--space-5)', background: '#fff',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-gray-200)',
                textDecoration: 'none', transition: 'all 0.2s',
              }}>
                <div style={{ fontWeight: 600, color: 'var(--color-navy)', marginBottom: 'var(--space-1)' }}>{item.label}</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>{item.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Available Nationwide — State Links */}
      <section style={{ padding: 'var(--space-12) 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Available in All 50 States</h2>
          <p style={{ textAlign: 'center', color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)', maxWidth: '600px', margin: '0 auto var(--space-6)' }}>
            Our community service programs are accepted by courts and probation offices across the country.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'var(--space-2)' }}>
            {[
              'california', 'texas', 'florida', 'new-york', 'illinois', 'pennsylvania',
              'ohio', 'georgia', 'michigan', 'north-carolina', 'new-jersey', 'virginia',
              'washington', 'arizona', 'massachusetts', 'colorado', 'tennessee', 'indiana',
              'missouri', 'maryland',
            ].map((slug) => (
              <Link key={slug} href={`/states/${slug}`} style={{
                padding: 'var(--space-2) var(--space-4)', background: 'var(--color-gray-50)',
                borderRadius: 'var(--radius-full)', border: '1px solid var(--color-gray-200)',
                fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-navy)',
                textDecoration: 'none', textTransform: 'capitalize',
              }}>
                {slug.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
            <Link href="/states" style={{ color: 'var(--color-blue)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
              View all 50 states →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaSection}>
        <div className="container">
          <h2>Take the Next Step</h2>
          <p>
            Complete your community service requirements from home, at your own
            pace. Register today and receive your verified certificate upon completion.
          </p>
          <Link href="/how-to-register" className="btn btn-cta">
            Register for Program
          </Link>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      {jsonLd.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
