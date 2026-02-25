import PageHeader from '@/components/ui/PageHeader';
import ContactForm from './ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us — Get Help with Community Service',
    description: 'Have questions about our online community service program? Contact The Foundation of Change today. We respond within 1-2 business days.',
    openGraph: {
        title: 'Contact The Foundation of Change',
        description: 'Get answers about enrollment, certificates, court acceptance, and more. We respond within 1-2 business days.',
    },
};

export default function ContactPage() {
    return (
        <>
            <PageHeader
                title="Contact Us"
                subtitle="We'll get back to you within 1-2 business days."
            />
            <ContactForm />
        </>
    );
}
