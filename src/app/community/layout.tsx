import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community Service Program',
    description:
        'Complete your court-approved community service online. Earn verified community service hours from home — accepted by courts, probation, and schools nationwide.',
    openGraph: {
        title: 'Online Community Service Program | The Foundation of Change',
        description:
            'Complete your court-approved community service 100% online. Verified by a 501(c)(3) nonprofit. Accepted by courts, probation, and schools in all 50 states.',
    },
};

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
