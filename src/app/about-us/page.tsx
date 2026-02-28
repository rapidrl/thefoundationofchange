import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import styles from './page.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About The Foundation of Change — 501(c)(3) Nonprofit',
    description: 'The Foundation of Change is a 501(c)(3) nonprofit providing court-approved community service nationwide with verified hours, licensed content, and official certificates.',
    alternates: {
        canonical: 'https://thefoundationofchange.org/about-us',
    },
    openGraph: {
        title: 'About The Foundation of Change | 501(c)(3) Nonprofit',
        description: 'Our mission is making community service accessible, meaningful, and verifiable. Licensed content, tamper-proof tracking, and certificates accepted by courts nationwide.',
    },
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thefoundationofchange.org/' },
        { '@type': 'ListItem', position: 2, name: 'About Us' },
    ],
};

export default function AboutPage() {
    return (
        <>
            <PageHeader
                title="About Us"
                subtitle="Dedicated to making community service accessible, meaningful, and verifiable."
            />

            <section className={styles.content}>
                <div className="container">
                    <h2>Mission Statement</h2>
                    <p>
                        The Foundation of Change is a 501(c)(3) nonprofit organization dedicated to
                        making community service accessible, meaningful, and verifiable. We help
                        individuals meet court, probation, and school requirements through structured
                        educational programs that foster accountability, reflection, and personal growth.
                    </p>

                    <h2>Organizational Overview</h2>
                    <p>
                        Founded in 2025, The Foundation of Change was established to support individuals
                        facing court-mandated, probation, or school-based community service obligations.
                        We provide a structured, educational approach to completing requirements while
                        promoting personal development.
                    </p>
                    <p>
                        Our core values of integrity, respect, and empowerment guide all our programs.
                        We work closely with courts, schools, and probation offices to deliver programs
                        that encourage positive behavior change and reduce recidivism.
                    </p>

                    <h2>Legal and Tax Information</h2>
                    <div className={styles.legalBox}>
                        <p><strong>The Foundation of Change</strong></p>
                        <p>501(c)(3) Nonprofit Organization</p>
                        <p>EIN: 33-5003265</p>
                        <p>Donations are tax-deductible to the fullest extent allowed by law.</p>
                    </div>

                    <h2>Commitment to Transparency</h2>
                    <p>
                        The Foundation of Change adheres to the highest standards of ethics, financial
                        stewardship, and accountability. Our annual reports and financial statements
                        are publicly accessible, demonstrating our commitment to donor privacy and
                        responsible resource management.
                    </p>
                    <p>
                        <Link href="/how-it-works">Learn how our online community service system works →</Link>
                    </p>

                    <h2>Program Access and Educational Infrastructure</h2>
                    <p>
                        The fee gives participants full access to our structured learning platform,
                        which includes over 100 educational courses on personal growth, life skills,
                        and civic responsibility. The system features built-in time tracking and
                        automatic progress saving to ensure accuracy and prevent data loss.
                    </p>

                    <h2>Professionally Developed Content</h2>
                    <p>
                        All courses are developed and reviewed by licensed professionals, including
                        a master&apos;s level social worker and Certified Alcohol and Drug Counselor.
                    </p>

                    <h2>Daily Hour Limits and Fraud Prevention</h2>
                    <p>
                        To maintain program integrity and mirror in-person service standards,
                        participants are limited to earning a maximum of 8 hours per day. This
                        prevents rushed completions and ensures authentic engagement with the material.
                    </p>

                    <h2>Real-Time Time Tracking &amp; Verification Logs</h2>
                    <p>
                        Every minute spent on the platform is logged to generate a tamper-proof
                        activity record. These logs include total time, articles completed, and
                        reflections submitted. Each certificate includes a verification code and
                        timestamp, allowing courts and probation officers to confirm authenticity
                        through our portal.
                    </p>

                    <h2>Human Review &amp; Reflection Oversight</h2>
                    <p>
                        Submitted reflections are manually reviewed by our trained staff to ensure
                        sincere engagement. This review process guarantees reflections are thoughtful,
                        relevant, and aligned with course objectives — enhancing the educational
                        value of the service.
                    </p>

                    <h2>Secure Certificate Processing &amp; Documentation</h2>
                    <p>
                        Upon completion, participants receive a professionally formatted PDF certificate,
                        along with a detailed daily hour log. Courts, attorneys, or schools can access
                        these instantly, and we offer additional documentation tailored to specific
                        jurisdictional requirements.
                    </p>
                </div>
            </section>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </>
    );
}
