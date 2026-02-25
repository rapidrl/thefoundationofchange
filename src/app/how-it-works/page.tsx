import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import styles from './page.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Online Community Service Works — Step-by-Step Process',
    description: 'Learn how The Foundation of Change delivers, verifies, and documents online community service for courts, schools, and probation requirements. 5-step process from enrollment to certificate.',
    openGraph: {
        title: 'How Online Community Service Works | The Foundation of Change',
        description: 'Enroll, complete structured coursework, log your time, get reviewed, and receive your verified certificate. Self-paced and court-accepted.',
    },
};

const steps = [
    {
        number: 1,
        title: 'Enrollment',
        description: 'Participants enroll in the online community service program and gain immediate access to the platform.',
    },
    {
        number: 2,
        title: 'Structured Activities',
        description: 'Participants complete guided educational and service-based activities designed to meet community service standards.',
    },
    {
        number: 3,
        title: 'Time & Reflection Logging',
        description: 'Participants log time spent and submit reflections or confirmations for each session. All submissions are reviewed for accuracy, completeness, and compliance with program standards.',
    },
    {
        number: 4,
        title: 'Review & Verification',
        description: 'All submissions are reviewed for accuracy, completeness, and compliance with program standards.',
    },
    {
        number: 5,
        title: 'Documentation Issued',
        description: 'Once requirements are met, official documentation is issued for submission to the requesting institution.',
    },
];

export default function HowItWorksPage() {
    return (
        <>
            <PageHeader
                title="How the Online Community Service System Works"
                subtitle="Transparent, verified, and institution-ready."
            />

            <section className={styles.content}>
                <div className="container">
                    <p className={styles.intro}>
                        Foundation of Change provides a structured online community service system
                        designed to meet the requirements of courts, schools, probation departments,
                        employers, and other institutions. Our approach is built around transparency,
                        accountability, and consistency.
                    </p>

                    <h2>Who the System Serves</h2>
                    <ul className={styles.servesList}>
                        <li>
                            <span className={styles.checkIcon}>✓</span>
                            Courts and probation departments requiring verified completion
                        </li>
                        <li>
                            <span className={styles.checkIcon}>✓</span>
                            Schools and universities that accept service for academic or graduation credit
                        </li>
                        <li>
                            <span className={styles.checkIcon}>✓</span>
                            Employers and organizations requiring volunteer or service hours
                        </li>
                        <li>
                            <span className={styles.checkIcon}>✓</span>
                            Individuals completing service for legal, academic, or personal reasons
                        </li>
                    </ul>

                    <h2>How the System Works</h2>
                    <div className={styles.stepsGrid}>
                        {steps.map((step) => (
                            <div key={step.number} className={styles.step}>
                                <div className={styles.stepNumber}>{step.number}</div>
                                <div className={styles.stepContent}>
                                    <h3>{step.title}</h3>
                                    <p>{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={styles.coverage}>
                <div className="container">
                    <h2>Geographic Coverage</h2>
                    <p>Our online community service system is available throughout:</p>
                    <div className={styles.coverageList}>
                        <span>🇺🇸 United States (all states)</span>
                        <span>🇨🇦 Canada (select provinces)</span>
                    </div>
                </div>
            </section>
        </>
    );
}
