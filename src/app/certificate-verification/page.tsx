'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';

interface CertificateResult {
    verification_code: string;
    hours_verified: number;
    issued_at: string;
    profiles: { full_name: string };
    enrollments: {
        hours_required: number;
        hours_completed: number;
        start_date: string;
        completed_at: string;
    };
}

export default function CertificateVerificationPage() {
    const [code, setCode] = useState('');
    const [result, setResult] = useState<CertificateResult | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await fetch(`/api/certificates/${encodeURIComponent(code.trim())}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Certificate not found. Please check the code and try again.');
            } else {
                setResult(data.certificate);
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

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

                    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', textAlign: 'center' }}>
                            Enter the verification code from the participant&apos;s certificate.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            <label htmlFor="verificationCode" style={{ fontWeight: 600, color: 'var(--color-navy)', fontSize: 'var(--text-sm)' }}>
                                Verification Code *
                            </label>
                            <input
                                type="text"
                                id="verificationCode"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="TFOC-XXXXXXXXXX"
                                required
                                style={{
                                    padding: 'var(--space-3) var(--space-4)',
                                    border: '1px solid var(--color-gray-300)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 'var(--text-base)',
                                    outline: 'none',
                                    fontFamily: 'monospace',
                                    letterSpacing: '0.05em',
                                }}
                            />
                        </div>
                        <button type="submit" className="btn btn-cta" disabled={loading} style={{ border: 'none', width: '100%' }}>
                            {loading ? 'Verifying...' : 'Verify Certificate'}
                        </button>
                    </form>

                    {error && (
                        <div style={{
                            marginTop: 'var(--space-6)',
                            padding: 'var(--space-4)',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: 'var(--radius-md)',
                            color: '#dc2626',
                            textAlign: 'center',
                        }}>
                            {error}
                        </div>
                    )}

                    {result && (
                        <div style={{
                            marginTop: 'var(--space-6)',
                            padding: 'var(--space-6)',
                            background: '#f0fdf4',
                            border: '2px solid #22c55e',
                            borderRadius: 'var(--radius-lg)',
                        }}>
                            <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                                <span style={{ fontSize: '3rem' }}>✅</span>
                                <h3 style={{ color: '#16a34a', margin: 'var(--space-2) 0' }}>Certificate Verified</h3>
                            </div>
                            <table style={{ width: '100%', fontSize: 'var(--text-sm)' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: 'var(--space-2) 0', fontWeight: 600, color: 'var(--color-navy)' }}>Participant</td>
                                        <td style={{ padding: 'var(--space-2) 0' }}>{result.profiles?.full_name}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: 'var(--space-2) 0', fontWeight: 600, color: 'var(--color-navy)' }}>Verification Code</td>
                                        <td style={{ padding: 'var(--space-2) 0', fontFamily: 'monospace' }}>{result.verification_code}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: 'var(--space-2) 0', fontWeight: 600, color: 'var(--color-navy)' }}>Hours Verified</td>
                                        <td style={{ padding: 'var(--space-2) 0' }}>{result.hours_verified} hours</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: 'var(--space-2) 0', fontWeight: 600, color: 'var(--color-navy)' }}>Program Dates</td>
                                        <td style={{ padding: 'var(--space-2) 0' }}>
                                            {new Date(result.enrollments?.start_date).toLocaleDateString()} –{' '}
                                            {new Date(result.enrollments?.completed_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: 'var(--space-2) 0', fontWeight: 600, color: 'var(--color-navy)' }}>Issued</td>
                                        <td style={{ padding: 'var(--space-2) 0' }}>
                                            {new Date(result.issued_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <p style={{
                                marginTop: 'var(--space-4)',
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-gray-500)',
                                textAlign: 'center',
                            }}>
                                Issued by The Foundation of Change — 501(c)(3) Nonprofit — EIN: 33-5003265
                            </p>
                        </div>
                    )}

                    <div style={{
                        marginTop: 'var(--space-10)',
                        padding: 'var(--space-6)',
                        background: 'var(--color-gray-50)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-gray-200)',
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
