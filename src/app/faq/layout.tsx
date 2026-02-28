import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Online Community Service FAQ — Common Questions Answered',
    description:
        'Get answers to frequently asked questions about our online community service program. Learn about court acceptance, certificates, completion time, refunds, and more.',
    alternates: {
        canonical: 'https://thefoundationofchange.org/faq',
    },
    openGraph: {
        title: 'Online Community Service FAQ | The Foundation of Change',
        description:
            'Answers to common questions about court-approved online community service: how the program works, certificate acceptance, pricing, and completion timelines.',
    },
};

// FAQPage JSON-LD schema — enables rich Q&A results in Google
const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'How does the The Foundation of Change program work?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Participants select required hours, complete educational coursework focused on anger management, accountability, emotional regulation, and decision-making. Key concepts from Cognitive Behavioral Therapy (CBT) are introduced. A built-in timer tracks learning time. A certificate of completion is issued when hours are fulfilled.',
            },
        },
        {
            '@type': 'Question',
            name: 'Will my certificate be accepted by the court, probation, or school?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'We provide a certificate of completion. Acceptance is determined by your referring agency. Confirm approval before enrolling.',
            },
        },
        {
            '@type': 'Question',
            name: 'How long do I have to complete my hours?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'There is no deadline. Complete your hours at your own pace.',
            },
        },
        {
            '@type': 'Question',
            name: "What happens if I don't finish all my hours at once?",
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Your progress is automatically saved. You may log in and continue anytime. A maximum of 8 hours per day can be completed toward your service hours.',
            },
        },
        {
            '@type': 'Question',
            name: 'Is the coursework difficult?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'The coursework encourages self-reflection, accountability, and behavioral growth. It is accessible but designed to be meaningful and educational.',
            },
        },
        {
            '@type': 'Question',
            name: 'Can I get a refund if my hours are not accepted?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. Access to materials is immediate. Confirm acceptance with your referring agency before enrolling.',
            },
        },
        {
            '@type': 'Question',
            name: 'How do I get my certificate?',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'Once all required hours and reflections are completed, your certificate becomes available for download directly from your dashboard.',
            },
        },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thefoundationofchange.org/' },
        { '@type': 'ListItem', position: 2, name: 'FAQ' },
    ],
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </>
    );
}
