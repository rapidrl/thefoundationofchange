import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Certificate Verification',
    description: 'Verify completion certificates issued by The Foundation of Change. For courts, probation officers, employers, and agencies.',
};

export default function CertificateVerificationPage() {
    return (
        <>
            <PageHeader
                title="Certificate Verification Portal"
                subtitle="For court and probation officers, employers, and agencies to verify completion of community-service hours."
            />
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-6)', marginBottom: 'var(--space-10)', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '2rem' }}>👁️</span>
                            <p style={{ fontWeight: 600, marginTop: 'var(--space-2)' }}>View Record</p>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>Status, hours, certificate ID</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '2rem' }}>🖨️</span>
                            <p style={{ fontWeight: 600, marginTop: 'var(--space-2)' }}>Print / Save</p>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>Download verification PDF</p>
                        </div>
                    </div>

                    <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', textAlign: 'center' }}>
                            All fields are required. Type the information exactly as it appears on the enrollee&apos;s documentation.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <label htmlFor="enrollee" style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: 'var(--text-sm)' }}>Enrollee Name *</label>
                            <input type="text" id="enrollee" name="enrollee" required style={{
                                padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--color-gray-300)',
                                borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)', outline: 'none'
                            }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <label htmlFor="location" style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: 'var(--text-sm)' }}>Location *</label>
                            <input type="text" id="location" name="location" required style={{
                                padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--color-gray-300)',
                                borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)', outline: 'none'
                            }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <label htmlFor="verificationCode" style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: 'var(--text-sm)' }}>Verification Code *</label>
                            <input type="text" id="verificationCode" name="verificationCode" required style={{
                                padding: 'var(--space-3) var(--space-4)', border: '1px solid var(--color-gray-300)',
                                borderRadius: 'var(--radius-md)', fontSize: 'var(--text-base)', outline: 'none'
                            }} />
                        </div>
                        <button type="submit" className="btn btn-cta" style={{ border: 'none', width: '100%' }}>
                            Verify Certificate
                        </button>
                    </form>

                    <div style={{
                        marginTop: 'var(--space-10)', padding: 'var(--space-6)',
                        background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-gray-200)'
                    }}>
                        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-3)' }}>Manual Verification (Fallback)</h3>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)' }}>
                            If you cannot locate a record or the portal is unavailable, email{' '}
                            <a href="mailto:info@thefoundationofchange.org">info@thefoundationofchange.org</a>.
                            Typical response time: within 1 business day (M–F, 9am–6pm ET). For urgent court dates,
                            include defendant name, DOB, case #, and verification code.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
