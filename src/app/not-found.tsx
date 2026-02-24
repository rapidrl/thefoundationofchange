import Link from 'next/link';

export default function NotFound() {
    return (
        <section style={{
            padding: 'var(--space-16) 0',
            minHeight: 'calc(100vh - var(--header-height) - 300px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
                <div style={{
                    fontSize: '6rem',
                    fontWeight: 800,
                    color: 'var(--color-navy)',
                    lineHeight: 1,
                    marginBottom: 'var(--space-4)',
                    opacity: 0.15,
                }}>
                    404
                </div>
                <h1 style={{
                    fontSize: 'var(--text-3xl)',
                    color: 'var(--color-navy)',
                    marginBottom: 'var(--space-3)',
                }}>
                    Page Not Found
                </h1>
                <p style={{
                    color: 'var(--color-gray-500)',
                    marginBottom: 'var(--space-8)',
                    fontSize: 'var(--text-lg)',
                    lineHeight: 'var(--leading-relaxed)',
                }}>
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    If you were looking for your coursework, try the links below.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/" className="btn btn-cta">
                        Go Home
                    </Link>
                    <Link href="/dashboard" className="btn btn-secondary" style={{ border: '1px solid var(--color-gray-300)' }}>
                        Dashboard
                    </Link>
                    <Link href="/coursework" className="btn btn-secondary" style={{ border: '1px solid var(--color-gray-300)' }}>
                        Coursework
                    </Link>
                    <Link href="/contact-us" className="btn btn-secondary" style={{ border: '1px solid var(--color-gray-300)' }}>
                        Contact Us
                    </Link>
                </div>
            </div>
        </section>
    );
}
