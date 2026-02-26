'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

interface Enrollment {
    id: string;
    status: string;
    amount_paid: number;
    hours_completed: number;
    hours_required: number;
    created_at: string;
    profile: { full_name: string; email: string } | null;
}

interface HourLog {
    hours: number;
    minutes: number;
    log_date: string;
}

interface Props {
    totalUsers: number;
    totalReflections: number;
    enrollments: Enrollment[];
    hourLogs: HourLog[];
}

type TimeFrame = '7d' | '14d' | '30d' | '90d' | 'all';

const TIME_FRAMES: { key: TimeFrame; label: string }[] = [
    { key: '7d', label: 'Past 7 Days' },
    { key: '14d', label: 'Past 2 Weeks' },
    { key: '30d', label: 'Past Month' },
    { key: '90d', label: 'Past 90 Days' },
    { key: 'all', label: 'All Time' },
];

function getDateThreshold(timeFrame: TimeFrame): Date | null {
    if (timeFrame === 'all') return null;
    const now = new Date();
    const days = timeFrame === '7d' ? 7 : timeFrame === '14d' ? 14 : timeFrame === '30d' ? 30 : 90;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export default function AdminOverview({ totalUsers, totalReflections, enrollments, hourLogs }: Props) {
    const [timeFrame, setTimeFrame] = useState<TimeFrame>('30d');

    const threshold = useMemo(() => getDateThreshold(timeFrame), [timeFrame]);

    // Filter enrollments by time frame
    const filteredEnrollments = useMemo(() => {
        if (!threshold) return enrollments;
        return enrollments.filter(e => new Date(e.created_at) >= threshold);
    }, [enrollments, threshold]);

    // Filter hour logs by time frame
    const filteredLogs = useMemo(() => {
        if (!threshold) return hourLogs;
        return hourLogs.filter(l => new Date(l.log_date) >= threshold);
    }, [hourLogs, threshold]);

    // Compute stats from filtered data
    const activeEnrollments = filteredEnrollments.filter(e => e.status === 'active').length;
    const completedEnrollments = filteredEnrollments.filter(e => e.status === 'completed').length;
    const periodRevenue = filteredEnrollments.reduce((sum, e) => sum + e.amount_paid, 0);
    const periodHours = filteredLogs.reduce((sum, l) => sum + l.hours + (l.minutes / 60), 0);
    const allTimeRevenue = enrollments.reduce((sum, e) => sum + e.amount_paid, 0);

    const periodLabel = timeFrame === 'all' ? 'all time' : TIME_FRAMES.find(t => t.key === timeFrame)?.label?.toLowerCase() || '';

    const stats = [
        { label: 'Total Users', value: totalUsers, sub: 'all time' },
        { label: 'New Enrollments', value: filteredEnrollments.length, sub: periodLabel },
        { label: 'Active', value: activeEnrollments, sub: periodLabel },
        { label: 'Completed', value: completedEnrollments, sub: periodLabel },
        { label: 'Revenue', value: `$${periodRevenue.toFixed(2)}`, sub: periodLabel },
        { label: 'Hours Logged', value: periodHours.toFixed(1), sub: periodLabel },
        { label: 'All-Time Revenue', value: `$${allTimeRevenue.toFixed(2)}`, sub: 'lifetime' },
        { label: 'Reflections', value: totalReflections, sub: 'all time' },
    ];

    const btnBase: React.CSSProperties = {
        padding: '6px 14px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-gray-300)',
        background: 'white',
        cursor: 'pointer',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        transition: 'all 0.15s',
    };
    const btnActive: React.CSSProperties = {
        ...btnBase,
        background: 'var(--color-navy)',
        color: 'white',
        borderColor: 'var(--color-navy)',
    };

    return (
        <>
            <h1 className={styles.pageTitle}>Dashboard Overview</h1>

            {/* Header row: subtitle + exports */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <p className={styles.pageSubtitle} style={{ margin: 0 }}>Platform-wide statistics at a glance</p>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <a href="/api/admin/export/users" className={styles.navLink} style={{ fontSize: 'var(--text-xs)', padding: '4px 10px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)' }}>📊 Export Users</a>
                    <a href="/api/admin/export/hours" className={styles.navLink} style={{ fontSize: 'var(--text-xs)', padding: '4px 10px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)' }}>📋 Export Hours</a>
                </div>
            </div>

            {/* Time Frame Selector */}
            <div style={{
                display: 'flex', gap: '6px', marginBottom: 'var(--space-6)',
                padding: 'var(--space-3) var(--space-4)',
                background: 'var(--color-gray-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-gray-200)',
                alignItems: 'center',
            }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-navy)', marginRight: '8px' }}>
                    📅 Time Frame:
                </span>
                {TIME_FRAMES.map(tf => (
                    <button
                        key={tf.key}
                        onClick={() => setTimeFrame(tf.key)}
                        style={timeFrame === tf.key ? btnActive : btnBase}
                    >
                        {tf.label}
                    </button>
                ))}
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

            {/* Enrollments Table */}
            <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                    <h3>
                        Enrollments
                        <span style={{ fontWeight: 400, fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginLeft: '8px' }}>
                            ({filteredEnrollments.length} {timeFrame === 'all' ? 'total' : `in ${periodLabel}`})
                        </span>
                    </h3>
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
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEnrollments.length > 0 ? (
                            filteredEnrollments.map((enrollment) => {
                                const hoursReq = enrollment.hours_required;
                                const hoursDone = enrollment.hours_completed;
                                const pct = hoursReq > 0 ? Math.round((hoursDone / hoursReq) * 100) : 0;
                                const badgeClass = enrollment.status === 'active' ? styles.badgeActive
                                    : enrollment.status === 'completed' ? styles.badgeCompleted
                                        : styles.badgeSuspended;
                                return (
                                    <tr key={enrollment.id}>
                                        <td>
                                            <strong>{enrollment.profile?.full_name || '—'}</strong>
                                        </td>
                                        <td>{enrollment.profile?.email || '—'}</td>
                                        <td>{hoursDone} / {hoursReq}h</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{
                                                    width: '60px', height: '6px', background: 'var(--color-gray-200)',
                                                    borderRadius: '3px', overflow: 'hidden',
                                                }}>
                                                    <div style={{
                                                        width: `${Math.min(pct, 100)}%`, height: '100%',
                                                        background: pct >= 100 ? '#059669' : 'var(--color-blue)',
                                                        borderRadius: '3px',
                                                    }} />
                                                </div>
                                                <span style={{ fontSize: '12px' }}>{pct}%</span>
                                            </div>
                                        </td>
                                        <td>${enrollment.amount_paid.toFixed(2)}</td>
                                        <td>
                                            <span className={`${styles.badge} ${badgeClass}`}>
                                                {enrollment.status}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                                            {new Date(enrollment.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className={styles.emptyState}>
                                    No enrollments in this time period
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
