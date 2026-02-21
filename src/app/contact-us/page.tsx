import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import styles from './page.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Have questions or need assistance? Contact The Foundation of Change today. We respond within 1-2 business days.',
};

export default function ContactPage() {
    return (
        <>
            <PageHeader
                title="Contact Us"
                subtitle="We'll get back to you within 1-2 business days."
            />

            <section className={styles.content}>
                <div className="container">
                    <div className={styles.note}>
                        For commonly asked questions, please refer to the{' '}
                        <Link href="/faq">FAQ page</Link> first.
                    </div>

                    <form className={styles.form} action="#" method="POST">
                        <div className={styles.field}>
                            <label htmlFor="name">Full Name *</label>
                            <input type="text" id="name" name="name" required />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="email">Email Address *</label>
                            <input type="email" id="email" name="email" required />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="phone">Phone Number</label>
                            <input type="tel" id="phone" name="phone" />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="message">Message *</label>
                            <textarea id="message" name="message" required />
                        </div>
                        <button type="submit" className={styles.submitBtn}>
                            Send Message
                        </button>
                    </form>
                </div>
            </section>
        </>
    );
}
