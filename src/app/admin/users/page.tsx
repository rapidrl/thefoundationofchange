import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';
import styles from '../admin.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Users — Admin',
    description: 'Manage all platform users.',
};

interface PageProps {
    searchParams: Promise<{ q?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
    const { supabase } = await requireAdmin();
    const { q } = await searchParams;
    const searchQuery = q || '';

    // Fetch all participants with their enrollment data
    let query = supabase
        .from('profiles')
        .select(`
            *,
            enrollments(id, hours_required, hours_completed, amount_paid, status, start_date)
        `)
        .eq('role', 'participant')
        .order('created_at', { ascending: false });

    if (searchQuery) {
        query = query.or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
    }

    const { data: users } = await query;

    return (
        <>
            <h1 className={styles.pageTitle}>User Directory</h1>
            <p className={styles.pageSubtitle}>{users?.length ?? 0} participants registered</p>

            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <h3>All Users</h3>
                    <form method="GET" action="/admin/users">
                        <input
                            type="text"
                            name="q"
                            placeholder="Search by name or email..."
                            defaultValue={searchQuery}
                            className={styles.searchInput}
                            id="admin-user-search"
                        />
                    </form>
                </div>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>DOB</th>
                            <th>State</th>
                            <th>Hours Paid</th>
                            <th>Hours Done</th>
                            <th>Paid</th>
                            <th>Status</th>
                            <th>Enrolled</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users && users.length > 0 ? (
                            users.map((user) => {
                                const enrollments = (user.enrollments || []) as Array<Record<string, unknown>>;
                                const latestEnrollment = enrollments[0];
                                const hoursRequired = latestEnrollment ? Number(latestEnrollment.hours_required) : 0;
                                const hoursCompleted = latestEnrollment ? Number(latestEnrollment.hours_completed) : 0;
                                const amountPaid = latestEnrollment ? Number(latestEnrollment.amount_paid || 0) : 0;
                                const status = (latestEnrollment?.status as string) || 'none';
                                const startDate = latestEnrollment?.start_date
                                    ? new Date(latestEnrollment.start_date as string).toLocaleDateString()
                                    : '—';
                                const badgeClass = status === 'active' ? styles.badgeActive
                                    : status === 'completed' ? styles.badgeCompleted
                                        : status === 'suspended' ? styles.badgeSuspended
                                            : '';

                                return (
                                    <Link
                                        key={user.id}
                                        href={`/admin/users/${user.id}`}
                                        style={{ display: 'contents' }}
                                    >
                                        <tr className={styles.clickableRow}>
                                            <td><strong>{user.full_name}</strong></td>
                                            <td>{user.email}</td>
                                            <td>{user.date_of_birth || '—'}</td>
                                            <td>{user.state || '—'}</td>
                                            <td>{hoursRequired}h</td>
                                            <td>{hoursCompleted}h</td>
                                            <td>${amountPaid.toFixed(2)}</td>
                                            <td>
                                                {badgeClass ? (
                                                    <span className={`${styles.badge} ${badgeClass}`}>{status}</span>
                                                ) : (
                                                    <span style={{ color: 'var(--color-gray-400)', fontSize: 'var(--text-xs)' }}>no enrollment</span>
                                                )}
                                            </td>
                                            <td>{startDate}</td>
                                        </tr>
                                    </Link>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={9} className={styles.emptyState}>
                                    {searchQuery ? `No users found for "${searchQuery}"` : 'No users registered yet'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
