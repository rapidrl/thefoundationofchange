import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
    title: 'Admin Dashboard | The Foundation of Change',
};

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    // Check admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Get stats
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { count: activeEnrollments } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    const { count: completedEnrollments } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

    const { data: revenueData } = await supabase
        .from('enrollments')
        .select('amount_paid')
        .not('amount_paid', 'is', null);

    const totalRevenue = (revenueData || []).reduce(
        (sum, e) => sum + (parseFloat(e.amount_paid) || 0), 0
    );

    const { count: pendingReflections } = await supabase
        .from('reflections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

    // Recent enrollments
    const { data: recentEnrollments } = await supabase
        .from('enrollments')
        .select(`
      *,
      profiles:user_id (full_name, email)
    `)
        .order('created_at', { ascending: false })
        .limit(10);

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>Admin</h2>
                <nav className={styles.nav}>
                    <Link href="/admin" className={`${styles.navItem} ${styles.navActive}`}>📊 Dashboard</Link>
                    <Link href="/admin/users" className={styles.navItem}>👥 Users</Link>
                    <Link href="/admin/enrollments" className={styles.navItem}>📋 Enrollments</Link>
                    <Link href="/admin/reflections" className={styles.navItem}>📝 Reflections</Link>
                </nav>
            </aside>

            <main className={styles.main}>
                <h1 className={styles.pageTitle}>Dashboard Overview</h1>

                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{totalUsers || 0}</span>
                        <span className={styles.statLabel}>Total Users</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{activeEnrollments || 0}</span>
                        <span className={styles.statLabel}>Active Enrollments</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>{completedEnrollments || 0}</span>
                        <span className={styles.statLabel}>Completed</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statValue}>${totalRevenue.toFixed(2)}</span>
                        <span className={styles.statLabel}>Total Revenue</span>
                    </div>
                    <div className={`${styles.statCard} ${(pendingReflections || 0) > 0 ? styles.statAlert : ''}`}>
                        <span className={styles.statValue}>{pendingReflections || 0}</span>
                        <span className={styles.statLabel}>Pending Reflections</span>
                    </div>
                </div>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Recent Enrollments</h2>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Participant</th>
                                    <th>Email</th>
                                    <th>Hours</th>
                                    <th>Progress</th>
                                    <th>Paid</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(recentEnrollments || []).map((e) => (
                                    <tr key={e.id}>
                                        <td>
                                            <Link href={`/admin/users/${e.user_id}`} className={styles.link}>
                                                {(e.profiles as { full_name: string })?.full_name || '—'}
                                            </Link>
                                        </td>
                                        <td>{(e.profiles as { email: string })?.email || '—'}</td>
                                        <td>{e.hours_completed} / {e.hours_required}</td>
                                        <td>
                                            <div className={styles.progressMini}>
                                                <div
                                                    className={styles.progressFill}
                                                    style={{ width: `${Math.min((e.hours_completed / e.hours_required) * 100, 100)}%` }}
                                                />
                                            </div>
                                        </td>
                                        <td>${parseFloat(e.amount_paid || 0).toFixed(2)}</td>
                                        <td>
                                            <span className={`${styles.badge} ${styles[`badge_${e.status}`]}`}>
                                                {e.status}
                                            </span>
                                        </td>
                                        <td>{new Date(e.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {(!recentEnrollments || recentEnrollments.length === 0) && (
                                    <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-gray-400)' }}>No enrollments yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
