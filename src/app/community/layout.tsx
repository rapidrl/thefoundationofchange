import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community Service Program',
    description:
        'Complete your court-approved community service online. Earn verified community service hours from home — accepted by courts, probation, and schools nationwide.',
    alternates: {
        canonical: 'https://thefoundationofchange.org/community',
    },
    openGraph: {
        title: 'Online Community Service Program | The Foundation of Change',
        description:
            'Complete your court-approved community service 100% online. Verified by a 501(c)(3) nonprofit. Accepted by courts, probation, and schools in all 50 states.',
    },
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thefoundationofchange.org/' },
        { '@type': 'ListItem', position: 2, name: 'Community Service Program' },
    ],
};

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
        </>
    );
}
