import { requireAdmin } from '@/lib/admin';
import styles from '../admin.module.css';

export default async function AdminMessagesPage() {
    const { supabase } = await requireAdmin();

    const { data: messages } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <>
            <h1 className={styles.pageTitle}>Contact Messages</h1>
            <p className={styles.pageSubtitle}>Inquiries from the contact form</p>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Subject</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {messages && messages.length > 0 ? (
                            messages.map((msg: Record<string, unknown>) => {
                                const status = (msg.status as string) || 'new';
                                const messageText = (msg.message as string) || '';
                                const truncated = messageText.length > 100
                                    ? messageText.substring(0, 100) + '...'
                                    : messageText;

                                return (
                                    <tr key={msg.id as string}>
                                        <td><strong>{msg.name as string}</strong></td>
                                        <td style={{ fontSize: 'var(--text-xs)' }}>
                                            <a href={`mailto:${msg.email as string}`} style={{ color: 'var(--color-blue)' }}>
                                                {msg.email as string}
                                            </a>
                                        </td>
                                        <td style={{ fontSize: 'var(--text-xs)' }}>{(msg.subject as string) || '—'}</td>
                                        <td style={{ fontSize: 'var(--text-xs)', maxWidth: '250px' }}>
                                            <details>
                                                <summary style={{ cursor: 'pointer', color: 'var(--color-blue)' }}>
                                                    {truncated}
                                                </summary>
                                                <div style={{
                                                    padding: 'var(--space-3)', marginTop: 'var(--space-2)',
                                                    background: 'var(--color-gray-50)', borderRadius: 'var(--radius-md)',
                                                    whiteSpace: 'pre-wrap',
                                                }}>
                                                    {messageText}
                                                </div>
                                            </details>
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${status === 'replied' ? styles.badgeCompleted
                                                    : status === 'closed' ? styles.badgeSuspended
                                                        : styles.badgeActive
                                                }`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: 'var(--text-xs)' }}>
                                            {new Date(msg.created_at as string).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <form method="POST" action="/api/admin/messages" style={{ display: 'flex', gap: '4px' }}>
                                                <input type="hidden" name="messageId" value={msg.id as string} />
                                                {status !== 'replied' && (
                                                    <button type="submit" name="action" value="replied" style={{
                                                        fontSize: 'var(--text-xs)', padding: '2px 8px', background: '#ecfdf5',
                                                        border: '1px solid #a7f3d0', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                                        color: '#059669',
                                                    }}>Replied</button>
                                                )}
                                                {status !== 'closed' && (
                                                    <button type="submit" name="action" value="closed" style={{
                                                        fontSize: 'var(--text-xs)', padding: '2px 8px', background: 'var(--color-gray-50)',
                                                        border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                                        color: 'var(--color-gray-600)',
                                                    }}>Close</button>
                                                )}
                                            </form>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className={styles.emptyState}>No messages yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
