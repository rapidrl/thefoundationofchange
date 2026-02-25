'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import styles from './page.module.css';
import type { Metadata } from 'next';

const faqItems = [
    {
        question: 'How does the The Foundation of Change program work?',
        answer:
            'Participants select required hours, complete educational coursework focused on anger management, accountability, emotional regulation, and decision-making. Key concepts from Cognitive Behavioral Therapy (CBT) are introduced. A built-in timer tracks learning time. A certificate of completion is issued when hours are fulfilled.',
    },
    {
        question: 'Will my certificate be accepted by the court, probation, or school?',
        answer:
            'We provide a certificate of completion. Acceptance is determined by your referring agency. Confirm approval before enrolling.',
    },
    {
        question: 'How long do I have to complete my hours?',
        answer:
            'There is no deadline. Complete your hours at your own pace.',
    },
    {
        question: "What happens if I don't finish all my hours at once?",
        answer:
            'Your progress is automatically saved. You may log in and continue anytime. Note: A maximum of 8 hours per day can be completed toward your service hours.',
    },
    {
        question: 'Is the coursework difficult?',
        answer:
            'The coursework encourages self-reflection, accountability, and behavioral growth. It is accessible but designed to be meaningful and educational.',
    },
    {
        question: 'Can I get a refund if my hours are not accepted?',
        answer:
            'No. Access to materials is immediate. Confirm acceptance with your referring agency before enrolling.',
    },
    {
        question: 'How do I get my certificate?',
        answer:
            'Once all required hours and reflections are completed, your certificate becomes available for download directly from your dashboard.',
    },
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <>
            <PageHeader
                title="Frequently Asked Questions"
                subtitle="Find answers to common questions about our online community service program."
            />
            <section className={styles.faqSection}>
                <div className={`container ${styles.faqList}`}>
                    {faqItems.map((item, index) => (
                        <div key={index} className={styles.faqItem}>
                            <button
                                className={styles.faqQuestion}
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                aria-expanded={openIndex === index}
                            >
                                {item.question}
                                <span className={`${styles.faqIcon} ${openIndex === index ? styles.open : ''}`}>
                                    +
                                </span>
                            </button>
                            {openIndex === index && (
                                <div className={styles.faqAnswer}>
                                    {item.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
