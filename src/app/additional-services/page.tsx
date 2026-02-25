import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Additional Court-Ordered Services — Alcohol Education, DV Classes & More',
    description: 'Court-ordered alcohol education, domestic violence classes, substance abuse assessments, driver license evaluations, and economic crime courses through our licensed partner Schroeder Counseling.',
    openGraph: {
        title: 'Court-Ordered Services | The Foundation of Change',
        description: 'Alcohol education, domestic violence, substance abuse assessments, and more through our licensed partner Schroeder Counseling.',
    },
};

const services = [
    { title: 'Alcohol Education', href: 'https://www.schroedercounseling.com/drug-and-alcohol' },
    { title: 'Domestic Violence', href: 'https://www.schroedercounseling.com/domestic-violence-class' },
    { title: 'Outpatient Counseling', href: '' },
    { title: 'Driver License Evaluation', href: '' },
    { title: 'Economic Crime', href: 'https://www.schroedercounseling.com/theft-awareness-class' },
    { title: 'Substance Abuse Assessments', href: 'https://www.schroedercounseling.com/substance-abuse-asssessments' },
];

export default function AdditionalServicesPage() {
    return (
        <>
            <PageHeader
                title="Course Offerings"
                subtitle="Programs to meet court, probation, or attorney requirements and support personal growth."
            />
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-8)', textAlign: 'center' }}>
                        All courses are provided through our licensed partner, <strong>Schroeder Counseling</strong>.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-6)' }}>
                        {services.map((service) => (
                            <div key={service.title} style={{
                                background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)',
                                borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)', textAlign: 'center'
                            }}>
                                <h3 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>{service.title}</h3>
                                {service.href ? (
                                    <a href={service.href} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ fontSize: 'var(--text-sm)' }}>
                                        Learn More
                                    </a>
                                ) : (
                                    <span style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>Contact for details</span>
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
                        <a href="https://www.schroedercounseling.com" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                            Visit Schroeder Counseling
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
