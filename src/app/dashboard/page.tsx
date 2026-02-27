import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from './page.module.css';
import LogoutButton from './LogoutButton';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Your community service program dashboard.',
};

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch enrollments (including suspended)
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    // Fetch certificates
    const { data: certificates } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id);

    // Fetch hour logs for active/suspended enrollment
    const activeEnrollment = enrollments?.find((e) => e.status === 'active' || e.status === 'suspended');
    let hourLogs: Array<{ id: string; log_date: string; hours: number; minutes: number }> | null = null;
    if (activeEnrollment) {
        const { data } = await supabase
            .from('hour_logs')
            .select('*')
            .eq('enrollment_id', activeEnrollment.id)
            .order('log_date', { ascending: true });
        hourLogs = data;
    }
    const totalHoursCompleted = Math.round((activeEnrollment?.hours_completed ?? 0) * 100) / 100;
    const totalHoursRequired = activeEnrollment?.hours_required ?? 0;
    const progressPercent = totalHoursRequired > 0
        ? Math.min(100, Math.round((totalHoursCompleted / totalHoursRequired) * 100))
        : 0;
    const hoursRemaining = Math.round(Math.max(0, totalHoursRequired - totalHoursCompleted) * 100) / 100;
    const certCount = certificates?.length ?? 0;

    return (
        <div className={styles.dashboard}>
            <div className="container">
                {/* Greeting */}
                <div className={styles.greeting}>
                    <div>
                        <h1>Welcome back, {profile?.full_name || user.email?.split('@')[0]}</h1>
                        <p>{user.email}</p>
                    </div>
                    <LogoutButton />
                </div>

                {/* Suspension Banner */}
                {activeEnrollment?.status === 'suspended' && (
                    <div style={{
                        padding: 'var(--space-5)', background: '#fef2f2',
                        border: '2px solid #fecaca', borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--space-6)', textAlign: 'center',
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>🚫</span>
                        <h3 style={{ color: '#dc2626', margin: 'var(--space-2) 0' }}>Enrollment Suspended</h3>
                        <p style={{ color: '#991b1b', fontSize: 'var(--text-sm)', margin: 0 }}>
                            Your enrollment has been suspended. You cannot access coursework or log hours.
                            Please <a href="/contact-us" style={{ color: '#dc2626', fontWeight: 600 }}>contact support</a> for assistance.
                        </p>
                    </div>
                )}

                {/* Progress Overview Bar */}
                {activeEnrollment ? (
                    <div className={styles.progressOverview}>
                        <div className={styles.progressLeft}>
                            <div className={styles.progressTitle}>Overall Progress</div>
                            <div className={styles.progressNumbers}>
                                <span className={styles.progressBig}>{totalHoursCompleted.toFixed(1)}</span>
                                <span className={styles.progressSep}>/</span>
                                <span className={styles.progressSmall}>{totalHoursRequired}</span>
                                <span className={styles.progressUnit}>hours</span>
                            </div>
                            <div className={styles.progressBarTrack}>
                                <div
                                    className={styles.progressBarFill}
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                        <div className={styles.progressRight}>
                            <div className={styles.progressStat}>
                                <span className={styles.progressStatVal}>{progressPercent}%</span>
                                <span className={styles.progressStatLabel}>Complete</span>
                            </div>
                            <div className={styles.progressStat}>
                                <span className={styles.progressStatVal}>{hoursRemaining.toFixed(1)}</span>
                                <span className={styles.progressStatLabel}>Remaining</span>
                            </div>
                            <div className={styles.progressStat}>
                                <span className={styles.progressStatVal}>{certCount}</span>
                                <span className={styles.progressStatLabel}>Certificates</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.progressOverview}>
                        <div className={styles.progressLeft}>
                            <div className={styles.progressTitle}>No Active Program</div>
                            <div className={styles.progressNumbers}>
                                <span className={styles.progressSmall}>Enroll to start tracking your community service hours</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className={styles.quickActions}>
                    {activeEnrollment && activeEnrollment.status === 'active' ? (
                        <Link href="/coursework" className={styles.actionCardPrimary}>
                            <span className={styles.actionIcon}>📚</span>
                            <div>
                                <div className={styles.actionLabel}>Continue Coursework</div>
                                <div className={styles.actionDesc}>{hoursRemaining.toFixed(1)}h remaining — pick up where you left off</div>
                            </div>
                        </Link>
                    ) : (
                        <Link href="/start-now" className={styles.actionCardPrimary}>
                            <span className={styles.actionIcon}>🚀</span>
                            <div>
                                <div className={styles.actionLabel}>Enroll Now</div>
                                <div className={styles.actionDesc}>Choose your hours and start today</div>
                            </div>
                        </Link>
                    )}
                    <Link href="/dashboard/profile" className={styles.actionCard}>
                        <span className={styles.actionIcon}>✏️</span>
                        <div>
                            <div className={styles.actionLabel}>Edit Profile</div>
                            <div className={styles.actionDesc}>Update your name, phone, or address</div>
                        </div>
                    </Link>
                    {certCount > 0 && (
                        <Link href="#certificates" className={styles.actionCard}>
                            <span className={styles.actionIcon}>📄</span>
                            <div>
                                <div className={styles.actionLabel}>View Certificates</div>
                                <div className={styles.actionDesc}>{certCount} certificate{certCount > 1 ? 's' : ''} issued</div>
                            </div>
                        </Link>
                    )}
                    <Link href="/contact-us" className={styles.actionCard}>
                        <span className={styles.actionIcon}>💬</span>
                        <div>
                            <div className={styles.actionLabel}>Need Help?</div>
                            <div className={styles.actionDesc}>Contact our support team</div>
                        </div>
                    </Link>
                </div>

                {/* Certificates */}
                {certificates && certificates.length > 0 && (
                    <div className={styles.section} id="certificates">
                        <h2>Your Certificates</h2>
                        {certificates.map((cert: { id: string; verification_code: string; issued_at: string; enrollment_id: string }) => (
                            <div key={cert.id} style={{
                                background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)',
                                borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
                                marginBottom: 'var(--space-3)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                    <div>
                                        <strong>Verification Code:</strong>{' '}
                                        <span style={{ fontFamily: 'monospace', color: 'var(--color-navy)' }}>{cert.verification_code}</span>
                                        <br />
                                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                                            Issued: {new Date(cert.issued_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                                    <a
                                        href={`/api/certificates/${cert.verification_code}/pdf`}
                                        className="btn btn-cta"
                                        style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-4)' }}
                                    >
                                        📄 Download Certificate PDF
                                    </a>
                                    <a
                                        href={`/api/hour-log/${cert.enrollment_id}/pdf`}
                                        className="btn btn-secondary"
                                        style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-4)', border: '1px solid var(--color-gray-300)' }}
                                    >
                                        📋 Download Hour Log PDF
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Hour Log Detail */}
                <div className={styles.section}>
                    <h2>Your Hour Log</h2>
                    {hourLogs && hourLogs.length > 0 ? (
                        <div className={styles.hourLogTable}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Hours</th>
                                        <th>Minutes</th>
                                        <th>Running Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        let runningTotal = 0;
                                        return hourLogs.map((log) => {
                                            const h = Number(log.hours) || 0;
                                            const m = Number(log.minutes) || 0;
                                            runningTotal += h;
                                            return (
                                                <tr key={log.id}>
                                                    <td>{new Date(log.log_date + 'T00:00:00').toLocaleDateString()}</td>
                                                    <td>{h}h</td>
                                                    <td>{m}m</td>
                                                    <td><strong>{runningTotal.toFixed(1)}h</strong></td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No hours logged yet. Start your coursework to begin tracking time.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
