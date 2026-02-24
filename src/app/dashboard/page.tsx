import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from './page.module.css';
import LogoutButton from './LogoutButton';
import type { Metadata } from 'next';

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

    // Fetch enrollments
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

    // Fetch hour logs for active enrollment
    const activeEnrollment = enrollments?.find((e) => e.status === 'active');
    let hourLogs: Array<{ id: string; log_date: string; hours: number; minutes: number }> | null = null;
    if (activeEnrollment) {
        const { data } = await supabase
            .from('hour_logs')
            .select('*')
            .eq('enrollment_id', activeEnrollment.id)
            .order('log_date', { ascending: true });
        hourLogs = data;
    }
    const totalHoursCompleted = activeEnrollment?.hours_completed ?? 0;
    const totalHoursRequired = activeEnrollment?.hours_required ?? 0;
    const progressPercent = totalHoursRequired > 0
        ? Math.min(100, Math.round((totalHoursCompleted / totalHoursRequired) * 100))
        : 0;
    const hoursRemaining = Math.max(0, totalHoursRequired - totalHoursCompleted);
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

                {/* Progress Overview Bar */}
                {activeEnrollment ? (
                    <div className={styles.progressOverview}>
                        <div className={styles.progressLeft}>
                            <div className={styles.progressTitle}>Overall Progress</div>
                            <div className={styles.progressNumbers}>
                                <span className={styles.progressBig}>{totalHoursCompleted}</span>
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
                                <span className={styles.progressStatVal}>{hoursRemaining}</span>
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
                    {activeEnrollment ? (
                        <Link href="/coursework" className={styles.actionCardPrimary}>
                            <span className={styles.actionIcon}>📚</span>
                            <div>
                                <div className={styles.actionLabel}>Continue Coursework</div>
                                <div className={styles.actionDesc}>{hoursRemaining}h remaining — pick up where you left off</div>
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
                        {certificates.map((cert: { id: string; verification_code: string; issued_at: string; certificate_url?: string }) => (
                            <div key={cert.id} style={{
                                background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)',
                                borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
                                marginBottom: 'var(--space-3)', display: 'flex',
                                justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <strong>Verification Code:</strong> {cert.verification_code}<br />
                                    <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>
                                        Issued: {new Date(cert.issued_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {cert.certificate_url && (
                                    <a href={cert.certificate_url} className="btn btn-secondary" style={{ fontSize: 'var(--text-sm)' }} target="_blank">
                                        Download
                                    </a>
                                )}
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
                                            runningTotal += h + m / 60;
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
