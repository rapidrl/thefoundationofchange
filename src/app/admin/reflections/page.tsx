import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from '../page.module.css';

export const metadata = { title: 'Reflections | Admin' };

export default async function AdminReflectionsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') redirect('/dashboard');

    const { data: reflections } = await supabase
        .from('reflections')
        .select('*, profiles:user_id (full_name), articles:article_id (title)')
        .order('submitted_at', { ascending: false });

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <h2 className={styles.sidebarTitle}>Admin</h2>
                <nav className={styles.nav}>
                    <Link href="/admin" className={styles.navItem}>📊 Dashboard</Link>
                    <Link href="/admin/users" className={styles.navItem}>👥 Users</Link>
                    <Link href="/admin/enrollments" className={styles.navItem}>📋 Enrollments</Link>
                    <Link href="/admin/reflections" className={`${styles.navItem} ${styles.navActive}`}>📝 Reflections</Link>
                </nav>
            </aside>
            <main className={styles.main}>
                <h1 className={styles.pageTitle}>Reflections ({(reflections || []).length})</h1>

                {(reflections || []).map((r) => (
                    <div key={r.id} style={{
                        border: '1px solid var(--color-gray-200)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-5)',
                        marginBottom: 'var(--space-4)',
                        background: 'var(--color-white)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                            <div>
                                <Link href={`/admin/users/${r.user_id}`} className={styles.link} style={{ fontWeight: 600 }}>
                                    {(r.profiles as { full_name: string })?.full_name}
                                </Link>
                                <span style={{ margin: '0 var(--space-2)', color: 'var(--color-gray-300)' }}>·</span>
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                                    {(r.articles as { title: string })?.title}
                                </span>
                            </div>
                            <span className={`${styles.badge} ${styles[`badge_${r.status}`]}`}>{r.status}</span>
                        </div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', lineHeight: 1.7 }}>
                            {r.response_text}
                        </p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginTop: 'var(--space-2)' }}>
                            Submitted {new Date(r.submitted_at).toLocaleString()}
                        </p>
                    </div>
                ))}

                {(!reflections || reflections.length === 0) && (
                    <p style={{ color: 'var(--color-gray-400)', textAlign: 'center', padding: 'var(--space-10)' }}>
                        No reflections submitted yet.
                    </p>
                )}
            </main>
        </div>
    );
}
