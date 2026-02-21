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

    const activeEnrollment = enrollments?.find((e) => e.status === 'active');
    const totalHoursCompleted = activeEnrollment?.hours_completed ?? 0;
    const totalHoursRequired = activeEnrollment?.hours_required ?? 0;
    const progressPercent = totalHoursRequired > 0
        ? Math.min(100, Math.round((totalHoursCompleted / totalHoursRequired) * 100))
        : 0;

    return (
        <div className={styles.dashboard}>
            <div className="container">
                {/* Greeting */}
                <div className={styles.greeting}>
                    <h1>Welcome, {profile?.full_name || user.email}</h1>
                    <p>{user.email}</p>
                </div>

                {/* Stats */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Hours Completed</div>
                        <div className={styles.statValue}>{totalHoursCompleted}</div>
                        <div className={styles.statSub}>of {totalHoursRequired} required</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Progress</div>
                        <div className={styles.statValue}>{progressPercent}%</div>
                        <div className={styles.statSub}>
                            {progressPercent === 100 ? '✓ Complete' : `${totalHoursRequired - totalHoursCompleted} hours remaining`}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Certificates</div>
                        <div className={styles.statValue}>{certificates?.length ?? 0}</div>
                        <div className={styles.statSub}>issued</div>
                    </div>
                </div>

                {/* Active Program */}
                <div className={styles.section}>
                    <h2>Your Program</h2>
                    {activeEnrollment ? (
                        <div className={styles.actions}>
                            <Link href="/coursework" className="btn btn-cta">
                                Continue Coursework
                            </Link>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>You don&apos;t have an active enrollment yet.</p>
                            <Link href="/start-now" className="btn btn-cta">
                                Enroll Now
                            </Link>
                        </div>
                    )}
                </div>

                {/* Certificates */}
                {certificates && certificates.length > 0 && (
                    <div className={styles.section}>
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

                {/* Logout */}
                <LogoutButton />
            </div>
        </div>
    );
}
