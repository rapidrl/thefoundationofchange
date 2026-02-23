import { requireAdmin } from '@/lib/admin';
import styles from '../admin.module.css';

export default async function AdminReflectionsPage() {
    const { supabase } = await requireAdmin();

    const { data: reflections } = await supabase
        .from('reflections')
        .select('*, profiles:user_id(full_name)')
        .order('created_at', { ascending: false });

    return (
        <>
            <h1 className={styles.pageTitle}>Reflection Review</h1>
            <p className={styles.pageSubtitle}>Review and approve participant reflections</p>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Participant</th>
                            <th>Article</th>
                            <th>Response</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reflections && reflections.length > 0 ? (
                            reflections.map((ref: Record<string, unknown>) => {
                                const profile = ref.profiles as Record<string, string> | null;
                                const status = ref.status as string;
                                const responseText = (ref.response_text as string) || '';
                                const truncated = responseText.length > 120
                                    ? responseText.substring(0, 120) + '...'
                                    : responseText;

                                return (
                                    <tr key={ref.id as string}>
                                        <td><strong>{profile?.full_name || '—'}</strong></td>
                                        <td style={{ fontSize: 'var(--text-xs)' }}>{ref.article_title as string}</td>
                                        <td style={{ fontSize: 'var(--text-xs)', maxWidth: '300px' }}>
                                            <details>
                                                <summary style={{ cursor: 'pointer', color: 'var(--color-blue)' }}>
                                                    {truncated}
                                                </summary>
                                                <div style={{
                                                    padding: 'var(--space-3)', marginTop: 'var(--space-2)',
                                                    background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)',
                                                    whiteSpace: 'pre-wrap', lineHeight: 'var(--leading-relaxed)',
                                                }}>
                                                    {responseText}
                                                </div>
                                            </details>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${status === 'approved' ? styles.badgeCompleted
                                                    : status === 'flagged' ? styles.badgeSuspended
                                                        : styles.badgeActive
                                                }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 'var(--text-xs)' }}>
                                            {new Date(ref.created_at as string).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <form method="POST" action="/api/admin/reflections" style={{ display: 'flex', gap: '4px' }}>
                                                <input type="hidden" name="reflectionId" value={ref.id as string} />
                                                {status !== 'approved' && (
                                                    <button type="submit" name="action" value="approve" style={{
                                                        fontSize: 'var(--text-xs)', padding: '2px 8px', background: '#ecfdf5',
                                                        border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                                        color: '#059669',
                                                    }}>✓ Approve</button>
                                                )}
                                                {status !== 'flagged' && (
                                                    <button type="submit" name="action" value="flag" style={{
                                                        fontSize: 'var(--text-xs)', padding: '2px 8px', background: '#fef2f2',
                                                        border: '1px solid #fecaca', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                                        color: '#dc2626',
                                                    }}>⚑ Flag</button>
                                                )}
                                            </form>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={6} className={styles.emptyState}>No reflections submitted yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
