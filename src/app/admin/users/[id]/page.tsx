import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from '../../admin.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'User Detail — Admin',
    description: 'View detailed user information.',
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AdminUserDetailPage({ params }: PageProps) {
    const { id } = await params;
    const { supabase } = await requireAdmin();

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (!profile) {
        notFound();
    }

    // Fetch all related data in parallel
    const [
        { data: enrollments },
        { data: hourLogs },
        { data: reflections },
        { data: certificates },
    ] = await Promise.all([
        supabase
            .from('enrollments')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false }),
        supabase
            .from('hour_logs')
            .select('*')
            .eq('user_id', id)
            .order('log_date', { ascending: true }),
        supabase
            .from('reflections')
            .select('*')
            .eq('user_id', id)
            .order('submitted_at', { ascending: false }),
        supabase
            .from('certificates')
            .select('*')
            .eq('user_id', id)
            .order('issued_at', { ascending: false }),
    ]);

    const activeEnrollment = enrollments?.find((e) => e.status === 'active') || enrollments?.[0];
    const totalHoursPaid = enrollments?.reduce((sum, e) => sum + (Number(e.hours_required) || 0), 0) ?? 0;
    const totalHoursCompleted = enrollments?.reduce((sum, e) => sum + (Number(e.hours_completed) || 0), 0) ?? 0;
    const totalPaid = enrollments?.reduce((sum, e) => sum + (Number(e.amount_paid) || 0), 0) ?? 0;

    return (
        <>
            {/* Back Link */}
            <Link href="/admin/users" className={styles.backLink}>
                ← Back to Users
            </Link>

            {/* Page Header */}
            <h1 className={styles.pageTitle}>{profile.full_name}</h1>
            <p className={styles.pageSubtitle}>{profile.email} • Member since {new Date(profile.created_at).toLocaleDateString()}</p>

            {/* Profile + Enrollment Cards */}
            <div className={styles.detailGrid}>
                {/* Profile Info */}
                <div className={styles.detailCard}>
                    <h3>👤 Profile Information</h3>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Full Name</span>
                        <span className={styles.detailValue}>{profile.full_name}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Email</span>
                        <span className={styles.detailValue}>{profile.email}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Date of Birth</span>
                        <span className={styles.detailValue}>{profile.date_of_birth || '—'}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Phone</span>
                        <span className={styles.detailValue}>{profile.phone || '—'}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Address</span>
                        <span className={styles.detailValue}>
                            {[profile.address, profile.city, profile.state, profile.zip_code].filter(Boolean).join(', ') || '—'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Probation Officer</span>
                        <span className={styles.detailValue}>{profile.probation_officer || '—'}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Court ID</span>
                        <span className={styles.detailValue}>{profile.court_id || '—'}</span>
                    </div>
                </div>

                {/* Enrollment Summary */}
                <div className={styles.detailCard}>
                    <h3>📋 Enrollment Summary</h3>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Total Hours Purchased</span>
                        <span className={styles.detailValue}>{totalHoursPaid}h</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Total Hours Completed</span>
                        <span className={styles.detailValue}>{totalHoursCompleted}h</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Hours Remaining</span>
                        <span className={styles.detailValue}>{Math.max(0, totalHoursPaid - totalHoursCompleted)}h</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Total Amount Paid</span>
                        <span className={styles.detailValue}>${totalPaid.toFixed(2)}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Current Status</span>
                        <span className={styles.detailValue}>
                            {activeEnrollment ? (
                                <span className={`${styles.badge} ${activeEnrollment.status === 'active' ? styles.badgeActive
                                        : activeEnrollment.status === 'completed' ? styles.badgeCompleted
                                            : styles.badgeSuspended
                                    }`}>
                                    {activeEnrollment.status}
                                </span>
                            ) : 'No enrollment'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Start Date</span>
                        <span className={styles.detailValue}>
                            {activeEnrollment ? new Date(activeEnrollment.start_date).toLocaleDateString() : '—'}
                        </span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Articles Read</span>
                        <span className={styles.detailValue}>{reflections?.length ?? 0}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Reflections Answered</span>
                        <span className={styles.detailValue}>{reflections?.length ?? 0}</span>
                    </div>
                </div>
            </div>

            {/* Hour Log Table */}
            <div className={styles.detailGrid} style={{ marginBottom: 0 }}>
                <div className={`${styles.detailCard} ${styles.detailCardFull}`}>
                    <h3>⏱️ Daily Hour Log</h3>
                    {hourLogs && hourLogs.length > 0 ? (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Hours</th>
                                    <th>Minutes</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(() => {
                                    let runningTotal = 0;
                                    return hourLogs.map((log) => {
                                        const h = Number(log.hours) || 0;
                                        const m = Number(log.minutes) || 0;
                                        runningTotal += h + m / 60;
                                        return (
                                            <tr key={log.id}>
                                                <td>{new Date(log.log_date + 'T00:00:00').toLocaleDateString()}</td>
                                                <td>{h}h</td>
                                                <td>{m}m</td>
                                                <td><strong>{runningTotal.toFixed(1)}h</strong></td>
                                            </tr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyState}>No hour logs recorded</div>
                    )}
                </div>
            </div>

            {/* Reflections */}
            <div className={styles.detailGrid} style={{ marginTop: 'var(--space-6)' }}>
                <div className={`${styles.detailCard} ${styles.detailCardFull}`}>
                    <h3>💬 Reflections ({reflections?.length ?? 0})</h3>
                    {reflections && reflections.length > 0 ? (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Article</th>
                                    <th>Response</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reflections.map((ref) => {
                                    const statusClass = ref.status === 'approved' ? styles.badgeApproved
                                        : ref.status === 'flagged' ? styles.badgeFlagged
                                            : styles.badgePending;
                                    return (
                                        <tr key={ref.id}>
                                            <td><strong>{ref.article_title}</strong></td>
                                            <td style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {ref.response_text}
                                            </td>
                                            <td>
                                                <span className={`${styles.badge} ${statusClass}`}>
                                                    {ref.status}
                                                </span>
                                            </td>
                                            <td>{new Date(ref.submitted_at).toLocaleDateString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyState}>No reflections submitted</div>
                    )}
                </div>
            </div>

            {/* Certificates */}
            <div className={styles.detailGrid} style={{ marginTop: 'var(--space-6)' }}>
                <div className={`${styles.detailCard} ${styles.detailCardFull}`}>
                    <h3>🎓 Certificates ({certificates?.length ?? 0})</h3>
                    {certificates && certificates.length > 0 ? (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Verification Code</th>
                                    <th>Issued Date</th>
                                    <th>Certificate</th>
                                    <th>Hour Log</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certificates.map((cert) => (
                                    <tr key={cert.id}>
                                        <td><strong>{cert.verification_code}</strong></td>
                                        <td>{new Date(cert.issued_at).toLocaleDateString()}</td>
                                        <td>
                                            {cert.certificate_url ? (
                                                <a href={cert.certificate_url} target="_blank" className={styles.downloadBtn}>
                                                    📄 Download
                                                </a>
                                            ) : (
                                                <span style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-xs)' }}>Not available</span>
                                            )}
                                        </td>
                                        <td>
                                            {cert.hour_log_url ? (
                                                <a href={cert.hour_log_url} target="_blank" className={styles.downloadBtn}>
                                                    📋 Download
                                                </a>
                                            ) : (
                                                <span style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-xs)' }}>Not available</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.emptyState}>No certificates issued</div>
                    )}
                </div>
            </div>
        </>
    );
}
