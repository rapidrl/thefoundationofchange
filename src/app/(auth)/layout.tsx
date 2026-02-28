import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Log In',
    description:
        'Sign in to your Foundation of Change account to access your coursework, track your community service hours, and download certificates.',
    robots: { index: false, follow: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
