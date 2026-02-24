import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTodayInTimezone } from '@/lib/timezone';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Coursework — The Foundation of Change',
    description: 'Complete your community service coursework and reflections.',
};

export default async function CourseworkPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Get active enrollment
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

    const enrollment = enrollments?.[0];

    if (!enrollment) {
        return (
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
                    <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>No Active Enrollment</h1>
                    <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)' }}>
                        You need an active enrollment to access coursework. Please enroll in a community service program first.
                    </p>
                    <Link href="/community" className="btn btn-cta">Explore Programs</Link>
                </div>
            </section>
        );
    }

    // Get courses with articles
    const { data: courses } = await supabase
        .from('courses')
        .select('*, articles(*)')
        .order('sort_order', { ascending: true });

    // Get user's article progress
    const { data: progressData } = await supabase
        .from('article_progress')
        .select('*')
        .eq('enrollment_id', enrollment.id);

    const progressMap = new Map(
        (progressData || []).map((p) => [p.article_id, p])
    );

    // Calculate stats
    const hoursCompleted = Number(enrollment.hours_completed) || 0;
    const hoursRequired = Number(enrollment.hours_required) || 0;
    const hoursRemaining = Math.max(0, hoursRequired - hoursCompleted);
    const progressPct = hoursRequired > 0 ? Math.round((hoursCompleted / hoursRequired) * 100) : 0;

    // Get user's timezone for daily cap
    const { data: profile } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();

    const today = getTodayInTimezone(profile?.timezone);
    const { data: todayLogs } = await supabase
        .from('hour_logs')
        .select('hours, minutes')
        .eq('user_id', user.id)
        .eq('log_date', today);

    const hoursToday = (todayLogs || []).reduce(
        (sum, l) => sum + (Number(l.hours) || 0) + ((Number(l.minutes) || 0) / 60),
        0
    );
    const hoursRemainingToday = Math.max(0, 8 - hoursToday);

    // Find next incomplete article
    let nextArticleId: string | null = null;
    if (courses) {
        for (const course of courses) {
            const articles = (course.articles || []) as Array<Record<string, unknown>>;
            articles.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
            for (const article of articles) {
                const progress = progressMap.get(article.id as string);
                if (!progress || progress.status !== 'completed') {
                    nextArticleId = article.id as string;
                    break;
                }
            }
            if (nextArticleId) break;
        }
    }

    return (
        <section style={{ padding: 'var(--space-10) 0' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <Link href="/dashboard" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-blue)', textDecoration: 'none', fontWeight: 500 }}>
                        ← Back to Dashboard
                    </Link>
                    <Link href="/contact-us" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-400)', textDecoration: 'none' }}>
                        Need help?
                    </Link>
                </div>
                <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>Your Coursework</h1>
                <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-8)' }}>
                    Read each article and submit a reflection to log your hours.
                </p>

                {/* Progress Overview */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 'var(--space-4)', marginBottom: 'var(--space-8)',
                }}>
                    <div style={{
                        background: 'var(--color-white)', border: '1px solid var(--color-gray-200)',
                        borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
                    }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>Overall Progress</div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-navy)' }}>{progressPct}%</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>{hoursCompleted}h of {hoursRequired}h</div>
                    </div>
                    <div style={{
                        background: 'var(--color-white)', border: '1px solid var(--color-gray-200)',
                        borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
                    }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>Hours Remaining</div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-navy)' }}>{hoursRemaining}h</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>to complete</div>
                    </div>
                    <div style={{
                        background: hoursRemainingToday > 0 ? '#ecfdf5' : '#fef2f2',
                        border: `1px solid ${hoursRemainingToday > 0 ? '#a7f3d0' : '#fecaca'}`,
                        borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
                    }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>Today&apos;s Limit</div>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: hoursRemainingToday > 0 ? '#059669' : '#dc2626' }}>
                            {hoursRemainingToday.toFixed(1)}h
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)' }}>
                            {hoursRemainingToday > 0 ? 'remaining today (8h max)' : 'daily limit reached'}
                        </div>
                    </div>
                </div>

                {/* Continue Button */}
                {nextArticleId && hoursRemainingToday > 0 && (
                    <div style={{ marginBottom: 'var(--space-8)' }}>
                        <Link
                            href={`/coursework/${nextArticleId}`}
                            className="btn btn-cta"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
                        >
                            ▶️ Continue Coursework
                        </Link>
                    </div>
                )}

                {/* Course List */}
                {courses && courses.map((course) => {
                    const articles = (course.articles || []) as Array<Record<string, unknown>>;
                    articles.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
                    const completedCount = articles.filter(
                        (a) => progressMap.get(a.id as string)?.status === 'completed'
                    ).length;

                    return (
                        <div key={course.id} style={{
                            background: 'var(--color-white)', border: '1px solid var(--color-gray-200)',
                            borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)', overflow: 'hidden',
                        }}>
                            <div style={{
                                padding: 'var(--space-5) var(--space-6)',
                                borderBottom: '1px solid var(--color-gray-100)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div>
                                    <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>{course.title}</h2>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)' }}>{course.description}</p>
                                </div>
                                <span style={{
                                    fontSize: 'var(--text-sm)', fontWeight: 600,
                                    color: completedCount === articles.length ? '#059669' : 'var(--color-gray-500)',
                                }}>
                                    {completedCount}/{articles.length} completed
                                </span>
                            </div>

                            {articles.map((article, idx) => {
                                const progress = progressMap.get(article.id as string);
                                const status = progress?.status || 'not_started';
                                const statusIcon = status === 'completed' ? '✅'
                                    : status === 'reading' ? '📖'
                                        : status === 'reflecting' ? '✍️'
                                            : '○';
                                const isClickable = hoursRemainingToday > 0 && status !== 'completed';

                                return (
                                    <div key={article.id as string} style={{
                                        padding: 'var(--space-4) var(--space-6)',
                                        borderBottom: idx < articles.length - 1 ? '1px solid var(--color-gray-50)' : 'none',
                                        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                                        opacity: status === 'completed' ? 0.6 : 1,
                                    }}>
                                        <span style={{ fontSize: '1.2rem', width: '28px', textAlign: 'center' }}>{statusIcon}</span>
                                        <div style={{ flex: 1 }}>
                                            <span style={{
                                                fontSize: 'var(--text-sm)', fontWeight: 500,
                                                color: status === 'completed' ? 'var(--color-gray-500)' : 'var(--color-navy)',
                                            }}>
                                                {article.title as string}
                                            </span>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-400)', marginLeft: 'var(--space-2)' }}>
                                                {article.estimated_minutes as number} min
                                            </span>
                                        </div>
                                        {isClickable ? (
                                            <Link
                                                href={`/coursework/${article.id}`}
                                                style={{
                                                    fontSize: 'var(--text-xs)', fontWeight: 600,
                                                    color: 'var(--color-blue)',
                                                    padding: 'var(--space-1) var(--space-3)',
                                                    border: '1px solid var(--color-blue)',
                                                    borderRadius: 'var(--radius-md)',
                                                }}
                                            >
                                                {status === 'not_started' ? 'Start' : 'Continue'}
                                            </Link>
                                        ) : status === 'completed' ? (
                                            <span style={{ fontSize: 'var(--text-xs)', color: '#059669', fontWeight: 600 }}>Done</span>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
