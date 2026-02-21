import PageHeader from '@/components/ui/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Letters of Introduction',
    description: 'Official letters of introduction for courts, schools, and probation officers from The Foundation of Change.',
};

export default function LettersPage() {
    return (
        <>
            <PageHeader
                title="501(c)(3) Non-Profit | Verified Program | Nationwide Use"
                subtitle="Official letters of introduction for institutions."
            />
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2>Letters of Introduction</h2>
                    <p style={{ color: 'var(--color-gray-600)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-8)' }}>
                        Below are official letters of introduction provided by The Foundation of Change.
                        These letters are used to verify the structure, legitimacy, and purpose of our
                        community service program for schools, courts, and probation officers.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
                        {['Letter to the Court', 'Letter to School Officials', 'Letter to Probation Officers', 'Letter to the Judge'].map((letter) => (
                            <div key={letter} style={{
                                background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)',
                                borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', textAlign: 'center'
                            }}>
                                <span style={{ fontSize: '2rem', display: 'block', marginBottom: 'var(--space-3)' }}>📄</span>
                                <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>{letter}</h3>
                                <a href="#" className="btn btn-secondary" style={{ fontSize: 'var(--text-sm)' }}>
                                    Download PDF
                                </a>
                            </div>
                        ))}
                    </div>

                    <p style={{ color: 'var(--color-gray-500)', marginTop: 'var(--space-8)', textAlign: 'center', fontSize: 'var(--text-sm)' }}>
                        A detailed overview of our program structure and verification process is available on our{' '}
                        <a href="/how-it-works">How Our System Works</a> page.
                    </p>
                </div>
            </section>
        </>
    );
}
