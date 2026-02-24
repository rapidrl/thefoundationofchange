'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';

interface VerificationResult {
    participantName: string;
    location: string;
    verificationCode: string;
    hoursCompleted: number;
    hoursRequired: number;
    status: string;
    issuedDate: string;
    completedDate: string | null;
    startDate: string | null;
    certificateUrl: string | null;
    hourLogUrl: string | null;
}

export default function CertificateVerificationPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<VerificationResult | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const enrolleeName = `${firstName.trim()} ${lastName.trim()}`;
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enrolleeName, verificationCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Verification failed.');
            } else {
                setResult(data.data);
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        padding: 'var(--space-3) var(--space-4)',
        border: '1px solid var(--color-gray-300)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--text-base)',
        outline: 'none',
        transition: 'border-color var(--transition-fast)',
        fontFamily: 'var(--font-body)',
    };

    return (
        <>
            <PageHeader
                title="Certificate Verification Portal"
                subtitle="For court and probation officers, employers, and agencies to verify completion of community-service hours."
            />
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '640px', margin: '0 auto' }}>
                    {/* Icons */}
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

                    {/* Form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', textAlign: 'center' }}>
                            All fields are required. Type the information exactly as it appears on the enrollee&apos;s documentation.
                        </p>

                        {error && (
                            <div style={{
                                padding: 'var(--space-4)', background: '#fef2f2',
                                border: '1px solid #fecaca', borderRadius: 'var(--radius-md)',
                                color: '#dc2626', fontSize: 'var(--text-sm)', textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <label htmlFor="firstName" style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: 'var(--text-sm)' }}>First Name *</label>
                                <input
                                    type="text" id="firstName" required
                                    placeholder="John"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <label htmlFor="lastName" style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: 'var(--text-sm)' }}>Last Name *</label>
                                <input
                                    type="text" id="lastName" required
                                    placeholder="Doe"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <label htmlFor="verificationCode" style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: 'var(--text-sm)' }}>Verification Code *</label>
                            <input
                                type="text" id="verificationCode" required
                                placeholder="e.g. TFOC-XXXX-XXXX"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <button
                            type="submit" className="btn btn-cta"
                            style={{ border: 'none', width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify Certificate'}
                        </button>
                    </form>

                    {/* Results */}
                    {result && (
                        <div style={{
                            marginTop: 'var(--space-8)', padding: 'var(--space-6)',
                            background: '#ecfdf5', borderRadius: 'var(--radius-lg)',
                            border: '1px solid #a7f3d0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
                                <span style={{ fontSize: '1.5rem' }}>✅</span>
                                <h3 style={{ fontSize: 'var(--text-lg)', color: '#059669', margin: 0 }}>Certificate Verified</h3>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>Participant</p>
                                    <p style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{result.participantName}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>Hours Completed</p>
                                    <p style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{result.hoursCompleted} of {result.hoursRequired} hours</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>Verification Code</p>
                                    <p style={{ fontWeight: 600, color: 'var(--color-navy)', fontFamily: 'var(--font-mono)' }}>{result.verificationCode}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>Status</p>
                                    <span style={{
                                        display: 'inline-block', padding: '2px 10px', borderRadius: '9999px',
                                        fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'capitalize',
                                        background: result.status === 'completed' ? '#eff6ff' : '#ecfdf5',
                                        color: result.status === 'completed' ? '#2563eb' : '#059669'
                                    }}>
                                        {result.status}
                                    </span>
                                </div>
                                <div>
                                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>Issued Date</p>
                                    <p style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{new Date(result.issuedDate).toLocaleDateString()}</p>
                                </div>
                                {result.completedDate && (
                                    <div>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>Completed Date</p>
                                        <p style={{ fontWeight: 600, color: 'var(--color-navy)' }}>{new Date(result.completedDate).toLocaleDateString()}</p>
                                    </div>
                                )}
                            </div>

                            {/* Download links */}
                            {(result.certificateUrl || result.hourLogUrl) && (
                                <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid #a7f3d0', display: 'flex', gap: 'var(--space-3)' }}>
                                    {result.certificateUrl && (
                                        <a href={result.certificateUrl} target="_blank" className="btn btn-primary" style={{ fontSize: 'var(--text-sm)' }}>
                                            📄 Download Certificate
                                        </a>
                                    )}
                                    {result.hourLogUrl && (
                                        <a href={result.hourLogUrl} target="_blank" className="btn btn-secondary" style={{ fontSize: 'var(--text-sm)' }}>
                                            📋 Download Hour Log
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Manual fallback */}
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
