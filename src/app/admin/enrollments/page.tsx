import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from '../page.module.css';

export const metadata = { title: 'Enrollments | Admin' };

export default async function AdminEnrollmentsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') redirect('/dashboard');

    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*, profiles:user_id (full_name, email)')
        .order('created_at', { ascending: false });

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>Admin</h2>
                <nav className={styles.nav}>
                    <Link href="/admin" className={styles.navItem}>📊 Dashboard</Link>
                    <Link href="/admin/users" className={styles.navItem}>👥 Users</Link>
                    <Link href="/admin/enrollments" className={`${styles.navItem} ${styles.navActive}`}>📋 Enrollments</Link>
                    <Link href="/admin/reflections" className={styles.navItem}>📝 Reflections</Link>
                </nav>
            </aside>
            <main className={styles.main}>
                <h1 className={styles.pageTitle}>All Enrollments ({(enrollments || []).length})</h1>
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
                                <th>Start Date</th>
                                <th>Completed</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(enrollments || []).map((e) => (
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
                                            <div className={styles.progressFill} style={{ width: `${Math.min((e.hours_completed / e.hours_required) * 100, 100)}%` }} />
                                        </div>
                                    </td>
                                    <td>${parseFloat(e.amount_paid || 0).toFixed(2)}</td>
                                    <td><span className={`${styles.badge} ${styles[`badge_${e.status}`]}`}>{e.status}</span></td>
                                    <td>{new Date(e.start_date).toLocaleDateString()}</td>
                                    <td>{e.completed_at ? new Date(e.completed_at).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
