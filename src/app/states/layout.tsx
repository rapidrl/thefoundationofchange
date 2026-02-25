import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Online Community Service Programs by State — All 50 States',
    description:
        'Find court-approved online community service programs in your state. The Foundation of Change serves all 50 states with verified, 501(c)(3) nonprofit community service hours.',
    openGraph: {
        title: 'Online Community Service by State | The Foundation of Change',
        description:
            'Court-approved online community service available in all 50 states. Find your state program and start earning verified hours today.',
    },
};

export default function StatesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
