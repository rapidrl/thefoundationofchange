import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from '../../admin.module.css';
import AdminUserEditor from './AdminUserEditor';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'User Detail — Admin',
    description: 'View and edit user information.',
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

    return (
        <>
            {/* Back Link */}
            <Link href="/admin/users" className={styles.backLink}>
                ← Back to Users
            </Link>

            {/* Page Header */}
            <h1 className={styles.pageTitle}>{profile.full_name}</h1>
            <p className={styles.pageSubtitle}>{profile.email} • Member since {new Date(profile.created_at).toLocaleDateString()}</p>

            {/* Editable Profile + Enrollments */}
            <div className={styles.detailGrid}>
                <AdminUserEditor
                    profile={{
                        id: profile.id,
                        full_name: profile.full_name || '',
                        email: profile.email || '',
                        phone: profile.phone || '',
                        date_of_birth: profile.date_of_birth || '',
                        gender: profile.gender || '',
                        address: profile.address || '',
                        city: profile.city || '',
                        state: profile.state || '',
                        zip_code: profile.zip_code || '',
                        probation_officer: profile.probation_officer || '',
                        court_id: profile.court_id || '',
                        reason_for_service: profile.reason_for_service || '',
                        role: profile.role || 'participant',
                    }}
                    enrollments={(enrollments || []).map(e => ({
                        id: e.id,
                        hours_required: Number(e.hours_required) || 0,
                        hours_completed: Number(e.hours_completed) || 0,
                        status: e.status,
                        amount_paid: Number(e.amount_paid) || 0,
                        start_date: e.start_date,
                    }))}
                />
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
                                            <a href={`/api/certificates/${cert.verification_code}/pdf`} target="_blank" className={styles.downloadBtn}>
                                                📄 Download
                                            </a>
                                        </td>
                                        <td>
                                            <a href={`/api/hour-log/${cert.enrollment_id}/pdf`} target="_blank" className={styles.downloadBtn}>
                                                📋 Download
                                            </a>
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
