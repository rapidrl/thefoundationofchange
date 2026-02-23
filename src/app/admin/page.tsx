import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';
import styles from './admin.module.css';

export default async function AdminOverviewPage() {
    const { supabase } = await requireAdmin();

    // Aggregate stats
    const [
        { count: totalUsers },
        { data: enrollments },
        { data: hourLogs },
        { count: totalReflections },
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'participant'),
        supabase.from('enrollments').select('status, amount_paid, hours_completed'),
        supabase.from('hour_logs').select('hours, minutes'),
        supabase.from('reflections').select('*', { count: 'exact', head: true }),
    ]);

    const activeEnrollments = enrollments?.filter((e) => e.status === 'active').length ?? 0;
    const completedEnrollments = enrollments?.filter((e) => e.status === 'completed').length ?? 0;
    const totalRevenue = enrollments?.reduce((sum, e) => sum + (Number(e.amount_paid) || 0), 0) ?? 0;
    const totalHoursLogged = hourLogs?.reduce((sum, l) => sum + (Number(l.hours) || 0) + ((Number(l.minutes) || 0) / 60), 0) ?? 0;

    // Recent enrollments
    const { data: recentEnrollments } = await supabase
        .from('enrollments')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(10);

    const stats = [
        { label: 'Total Users', value: totalUsers ?? 0, sub: 'participants' },
        { label: 'Active Enrollments', value: activeEnrollments, sub: 'in progress' },
        { label: 'Completed', value: completedEnrollments, sub: 'enrollments' },
        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, sub: 'all time' },
        { label: 'Hours Logged', value: totalHoursLogged.toFixed(1), sub: 'total hours' },
        { label: 'Reflections', value: totalReflections ?? 0, sub: 'submitted' },
    ];

    return (
        <>
            <h1 className={styles.pageTitle}>Dashboard Overview</h1>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <p className={styles.pageSubtitle} style={{ margin: 0 }}>Platform-wide statistics at a glance</p>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <a href="/api/admin/export/users" className={styles.navLink} style={{ fontSize: 'var(--text-xs)', padding: '4px 10px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)' }}>📊 Export Users</a>
                    <a href="/api/admin/export/hours" className={styles.navLink} style={{ fontSize: 'var(--text-xs)', padding: '4px 10px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)' }}>📋 Export Hours</a>
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {stats.map((stat) => (
                    <div key={stat.label} className={styles.statCard}>
                        <div className={styles.statLabel}>{stat.label}</div>
                        <div className={styles.statValue}>{stat.value}</div>
                        <div className={styles.statSub}>{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* Recent Enrollments Table */}
            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <h3>Recent Enrollments</h3>
                    <Link href="/admin/users" className={styles.navLink} style={{ color: 'var(--color-blue)' }}>
                        View All Users →
                    </Link>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Hours</th>
                            <th>Progress</th>
                            <th>Paid</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentEnrollments && recentEnrollments.length > 0 ? (
                            recentEnrollments.map((enrollment: Record<string, unknown>) => {
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
                                        <td>{profile?.email || '—'}</td>
                                        <td>{hoursDone} / {hoursReq}h</td>
                                        <td>{pct}%</td>
                                        <td>${Number(enrollment.amount_paid || 0).toFixed(2)}</td>
                                        <td>
                                            <span className={`${styles.badge} ${badgeClass}`}>
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className={styles.emptyState}>
                                    No enrollments yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
