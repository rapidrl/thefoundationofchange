import PageHeader from '@/components/ui/PageHeader';
import ContactForm from './ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us — Get Help with Community Service',
    description: 'Have questions about our online community service program? Contact The Foundation of Change today. We respond within 1-2 business days.',
    alternates: {
        canonical: 'https://thefoundationofchange.org/contact-us',
    },
    openGraph: {
        title: 'Contact The Foundation of Change',
        description: 'Get answers about enrollment, certificates, court acceptance, and more. We respond within 1-2 business days.',
    },
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thefoundationofchange.org/' },
        { '@type': 'ListItem', position: 2, name: 'Contact Us' },
    ],
};

export default function ContactPage() {
    return (
        <>
            <PageHeader
                title="Contact Us"
                subtitle="We'll get back to you within 1-2 business days."
            />
            <ContactForm />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </>
    );
}
