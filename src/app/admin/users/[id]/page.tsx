import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import EditHoursForm from './EditHoursForm';
import styles from '../../page.module.css';

export const metadata = {
    title: 'User Detail | Admin',
};

export default async function AdminUserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (adminProfile?.role !== 'admin') redirect('/dashboard');

    // Get target user
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

    if (!profile) redirect('/admin/users');

    // Get enrollments
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

    // Get hour logs
    const { data: hourLogs } = await supabase
        .from('hour_logs')
        .select('*')
        .eq('user_id', id)
        .order('log_date', { ascending: false })
        .limit(30);

    // Get certificates
    const { data: certificates } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', id);

    // Get reflections
    const { data: reflections } = await supabase
        .from('reflections')
        .select('*, articles:article_id (title)')
        .eq('user_id', id)
        .order('submitted_at', { ascending: false });

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
                <Link href="/admin/users" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-blue)', marginBottom: 'var(--space-4)', display: 'inline-block' }}>
                    ← Back to Users
                </Link>

                <h1 className={styles.pageTitle}>{profile.full_name}</h1>

                {/* Profile Info */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Profile Information</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                        <div><strong>Email:</strong> {profile.email}</div>
                        <div><strong>Phone:</strong> {profile.phone || '—'}</div>
                        <div><strong>Address:</strong> {profile.address || '—'}</div>
                        <div><strong>City:</strong> {profile.city || '—'}</div>
                        <div><strong>State:</strong> {profile.state || '—'}</div>
                        <div><strong>Zip:</strong> {profile.zip_code || '—'}</div>
                        <div><strong>Probation Officer:</strong> {profile.probation_officer || '—'}</div>
                        <div><strong>Court ID:</strong> {profile.court_id || '—'}</div>
                        <div><strong>Role:</strong> <span className={`${styles.badge} ${profile.role === 'admin' ? styles.badge_completed : styles.badge_active}`}>{profile.role}</span></div>
                        <div><strong>Joined:</strong> {new Date(profile.created_at).toLocaleDateString()}</div>
                    </div>
                </section>

                {/* Enrollments */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Enrollments ({(enrollments || []).length})</h2>
                    {(enrollments || []).map((e) => (
                        <div key={e.id} style={{
                            border: '1px solid var(--color-gray-200)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-4)',
                            marginBottom: 'var(--space-3)',
                            background: 'var(--color-white)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                <div>
                                    <span className={`${styles.badge} ${styles[`badge_${e.status}`]}`}>{e.status}</span>
                                    <span style={{ marginLeft: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                                        {new Date(e.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <div style={{ fontWeight: 600 }}>${parseFloat(e.amount_paid || 0).toFixed(2)}</div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{e.hours_completed}</strong> / {e.hours_required} hours
                                    {e.stripe_payment_id && (
                                        <span style={{ marginLeft: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', fontFamily: 'monospace' }}>
                                            {e.stripe_payment_id}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.progressMini} style={{ width: '120px' }}>
                                    <div className={styles.progressFill} style={{ width: `${Math.min((e.hours_completed / e.hours_required) * 100, 100)}%` }} />
                                </div>
                            </div>

                            {/* Edit hours form */}
                            <EditHoursForm enrollmentId={e.id} currentHours={e.hours_completed} />
                        </div>
                    ))}
                </section>

                {/* Recent Hour Logs */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Recent Hour Logs</h2>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(hourLogs || []).map((log) => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.log_date).toLocaleDateString()}</td>
                                        <td>{parseFloat(log.hours).toFixed(2)}</td>
                                    </tr>
                                ))}
                                {(!hourLogs || hourLogs.length === 0) && (
                                    <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--color-gray-400)' }}>No logs</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Certificates */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Certificates ({(certificates || []).length})</h2>
                    {(certificates || []).map((cert) => (
                        <div key={cert.id} style={{
                            border: '1px solid var(--color-gray-200)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-3)',
                            marginBottom: 'var(--space-2)',
                            fontSize: 'var(--text-sm)',
                        }}>
                            <strong>{cert.verification_code}</strong> — {cert.hours_verified} hours — Issued {new Date(cert.issued_at).toLocaleDateString()}
                        </div>
                    ))}
                    {(!certificates || certificates.length === 0) && (
                        <p style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-sm)' }}>No certificates issued</p>
                    )}
                </section>

                {/* Reflections */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Reflections ({(reflections || []).length})</h2>
                    {(reflections || []).map((r) => (
                        <div key={r.id} style={{
                            border: '1px solid var(--color-gray-200)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-4)',
                            marginBottom: 'var(--space-3)',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                                <strong style={{ fontSize: 'var(--text-sm)' }}>
                                    {(r.articles as { title: string })?.title || 'Article'}
                                </strong>
                                <span className={`${styles.badge} ${styles[`badge_${r.status}`]}`}>{r.status}</span>
                            </div>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-600)', lineHeight: 1.6 }}>
                                {r.response_text.substring(0, 200)}{r.response_text.length > 200 ? '...' : ''}
                            </p>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
}
