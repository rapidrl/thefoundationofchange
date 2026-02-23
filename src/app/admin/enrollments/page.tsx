import { requireAdmin } from '@/lib/admin';
import styles from '../admin.module.css';

export default async function AdminEnrollmentsPage() {
    const { supabase } = await requireAdmin();

    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, profiles:user_id(full_name, email)')
        .order('created_at', { ascending: false });

    return (
        <>
            <h1 className={styles.pageTitle}>Enrollment Management</h1>
            <p className={styles.pageSubtitle}>View, suspend, and manage all enrollments</p>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Participant</th>
                            <th>Email</th>
                            <th>Hours</th>
                            <th>Progress</th>
                            <th>Paid</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrollments && enrollments.length > 0 ? (
                            enrollments.map((enrollment: Record<string, unknown>) => {
                                const profile = enrollment.profiles as Record<string, string> | null;
                                const hoursReq = Number(enrollment.hours_required) || 0;
                                const hoursDone = Number(enrollment.hours_completed) || 0;
                                const pct = hoursReq > 0 ? Math.round((hoursDone / hoursReq) * 100) : 0;
                                const status = enrollment.status as string;
                                const badgeClass = status === 'active' ? styles.badgeActive
                                    : status === 'completed' ? styles.badgeCompleted
                                        : styles.badgeSuspended;

                                return (
                                    <tr key={enrollment.id as string}>
                                        <td><strong>{profile?.full_name || '—'}</strong></td>
                                        <td style={{ fontSize: 'var(--text-xs)' }}>{profile?.email || '—'}</td>
                                        <td>{hoursDone} / {hoursReq}h</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                <div style={{
                                                    width: '60px', height: '6px', background: 'var(--color-gray-200)',
                                                    borderRadius: 'var(--radius-full)', overflow: 'hidden',
                                                }}>
                                                    <div style={{
                                                        width: `${pct}%`, height: '100%',
                                                        background: pct >= 100 ? '#059669' : 'var(--color-blue)',
                                                        borderRadius: 'var(--radius-full)',
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: 'var(--text-xs)' }}>{pct}%</span>
                                            </div>
                                        </td>
                                        <td>${Number(enrollment.amount_paid || 0).toFixed(2)}</td>
                                        <td>
                                            <span className={`${styles.badge} ${badgeClass}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td>
                                            <form method="POST" action="/api/admin/enrollments" style={{ display: 'flex', gap: '4px' }}>
                                                <input type="hidden" name="enrollmentId" value={enrollment.id as string} />
                                                {status === 'active' && (
                                                    <button type="submit" name="action" value="suspend" style={{
                                                        fontSize: 'var(--text-xs)', padding: '2px 8px', background: '#fef3c7',
                                                        border: '1px solid #f59e0b', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                                        color: '#92400e',
                                                    }}>Suspend</button>
                                                )}
                                                {status === 'suspended' && (
                                                    <button type="submit" name="action" value="resume" style={{
                                                        fontSize: 'var(--text-xs)', padding: '2px 8px', background: '#ecfdf5',
                                                        border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                                        color: '#059669',
                                                    }}>Resume</button>
                                                )}
                                                {status !== 'completed' && (
                                                    <button type="submit" name="action" value="complete" style={{
                                                        fontSize: 'var(--text-xs)', padding: '2px 8px', background: '#eff6ff',
                                                        border: '1px solid #bfdbfe', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                                        color: '#1e40af',
                                                    }}>Complete</button>
                                                )}
                                            </form>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className={styles.emptyState}>No enrollments found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
