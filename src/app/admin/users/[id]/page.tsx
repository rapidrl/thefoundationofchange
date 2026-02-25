import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from '../../admin.module.css';
import AdminUserEditor from './AdminUserEditor';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'User Detail — Admin',
    description: 'View and manage user information, enrollments, hour logs, and certificates.',
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

            {/* Full Admin Editor (profile, enrollments, hour logs, certificates) */}
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
                        account_status: profile.account_status || 'active',
                    }}
                    enrollments={(enrollments || []).map(e => ({
                        id: e.id,
                        hours_required: Number(e.hours_required) || 0,
                        hours_completed: Number(e.hours_completed) || 0,
                        status: e.status,
                        amount_paid: Number(e.amount_paid) || 0,
                        start_date: e.start_date,
                    }))}
                    hourLogs={(hourLogs || []).map(l => ({
                        id: l.id,
                        enrollment_id: l.enrollment_id,
                        log_date: l.log_date,
                        hours: Number(l.hours) || 0,
                        minutes: Number(l.minutes) || 0,
                    }))}
                    certificates={(certificates || []).map(c => ({
                        id: c.id,
                        enrollment_id: c.enrollment_id,
                        verification_code: c.verification_code,
                        issued_at: c.issued_at,
                    }))}
                />
            </div>

            {/* Reflections (read-only, stays server-rendered) */}
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
        </>
    );
}
