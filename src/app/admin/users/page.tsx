import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from '../page.module.css';

export const metadata = {
    title: 'Users | Admin',
};

export default async function AdminUsersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') redirect('/dashboard');

    // Get all users with their enrollment data
    const { data: users } = await supabase
        .from('profiles')
        .select(`
      *,
      enrollments (id, hours_required, hours_completed, status, amount_paid, created_at)
    `)
        .order('created_at', { ascending: false });

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>Admin</h2>
                <nav className={styles.nav}>
                    <Link href="/admin" className={styles.navItem}>📊 Dashboard</Link>
                    <Link href="/admin/users" className={`${styles.navItem} ${styles.navActive}`}>👥 Users</Link>
                    <Link href="/admin/enrollments" className={styles.navItem}>📋 Enrollments</Link>
                    <Link href="/admin/reflections" className={styles.navItem}>📝 Reflections</Link>
                </nav>
            </aside>

            <main className={styles.main}>
                <h1 className={styles.pageTitle}>All Users ({users?.length || 0})</h1>

                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Enrollments</th>
                                <th>Total Paid</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(users || []).map((u) => {
                                const enrollments = u.enrollments || [];
                                const totalPaid = enrollments.reduce(
                                    (sum: number, e: { amount_paid: string }) => sum + (parseFloat(e.amount_paid) || 0), 0
                                );
                                return (
                                    <tr key={u.id}>
                                        <td>
                                            <Link href={`/admin/users/${u.id}`} className={styles.link}>
                                                {u.full_name}
                                            </Link>
                                        </td>
                                        <td>{u.email}</td>
                                        <td>{u.phone || '—'}</td>
                                        <td>
                                            <span className={`${styles.badge} ${u.role === 'admin' ? styles.badge_completed : styles.badge_active}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td>{enrollments.length}</td>
                                        <td>${totalPaid.toFixed(2)}</td>
                                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
