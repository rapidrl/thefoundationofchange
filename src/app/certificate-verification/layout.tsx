import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Verify a Community Service Certificate | Authentication Portal',
    description:
        'Verify the authenticity of a community service certificate issued by The Foundation of Change. Enter the verification code to confirm hours, completion date, and participant details.',
    openGraph: {
        title: 'Certificate Verification Portal | The Foundation of Change',
        description:
            'Courts, probation officers, and schools can verify any community service certificate instantly. Enter the unique verification code to confirm authenticity.',
    },
};

export default function CertificateVerificationLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
