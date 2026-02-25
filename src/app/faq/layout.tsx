import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Online Community Service FAQ — Common Questions Answered',
    description:
        'Get answers to frequently asked questions about our online community service program. Learn about court acceptance, certificates, completion time, refunds, and more.',
    openGraph: {
        title: 'Online Community Service FAQ | The Foundation of Change',
        description:
            'Answers to common questions about court-approved online community service: how the program works, certificate acceptance, pricing, and completion timelines.',
    },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
