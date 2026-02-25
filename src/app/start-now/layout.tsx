import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Enroll — Choose Your Online Community Service Hours',
    description:
        'Select your community service hours and enroll instantly. Programs start at $28.99. Court-approved, self-paced, 100% online. Verified by a 501(c)(3) nonprofit — accepted in all 50 states.',
    openGraph: {
        title: 'Enroll in Online Community Service | The Foundation of Change',
        description:
            'Choose 1–1,000 hours and start immediately. Affordable, court-approved community service with verified certificates. Programs from $28.99.',
    },
};

export default function StartNowLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
