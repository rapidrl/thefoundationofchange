'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './page.module.css';

interface Article {
    id: string;
    title: string;
    body: string;
    estimated_minutes: number;
    sort_order: number;
}

interface Course {
    id: string;
    title: string;
    description: string;
    articles: Article[];
}

interface Progress {
    article_id: string;
    completed_at: string | null;
    time_spent_seconds: number;
}

interface Reflection {
    article_id: string;
    response_text: string;
    status: string;
}

interface Enrollment {
    id: string;
    hours_required: number;
    hours_completed: number;
    status: string;
}

interface Props {
    enrollment: Enrollment;
    courses: Course[];
    progress: Progress[];
    reflections: Reflection[];
    dailyHours: number;
}

const IDLE_TIMEOUT_MS = 120000; // 2 minutes of inactivity pauses timer
const SYNC_INTERVAL_MS = 30000; // Sync every 30 seconds
const MAX_DAILY_HOURS = 8;

export default function CourseworkClient({
    enrollment,
    courses,
    progress,
    reflections,
    dailyHours: initialDailyHours,
}: Props) {
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [sessionSeconds, setSessionSeconds] = useState(0);
    const [dailyHours, setDailyHours] = useState(initialDailyHours);
    const [totalHours, setTotalHours] = useState(enrollment.hours_completed);
    const [reflectionText, setReflectionText] = useState('');
    const [reflectionStatus, setReflectionStatus] = useState('');
    const [isIdle, setIsIdle] = useState(false);
    const [dailyLimitReached, setDailyLimitReached] = useState(initialDailyHours >= MAX_DAILY_HOURS);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const lastActivityRef = useRef(Date.now());
    const unsyncedSecondsRef = useRef(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const syncRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Check if article is completed
    const isArticleCompleted = (articleId: string) =>
        progress.some((p) => p.article_id === articleId && p.completed_at);

    // Check if article has reflection
    const getArticleReflection = (articleId: string) =>
        reflections.find((r) => r.article_id === articleId);

    // Reset idle on user activity
    const resetIdle = useCallback(() => {
        lastActivityRef.current = Date.now();
        if (isIdle) {
            setIsIdle(false);
        }
    }, [isIdle]);

    // Sync time to server
    const syncTime = useCallback(async () => {
        if (!selectedArticle || unsyncedSecondsRef.current <= 0) return;

        const secondsToSync = unsyncedSecondsRef.current;
        unsyncedSecondsRef.current = 0;

        try {
            const res = await fetch('/api/track-time', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollmentId: enrollment.id,
                    articleId: selectedArticle.id,
                    secondsToAdd: secondsToSync,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setDailyHours(data.dailyHours);
                setTotalHours(data.totalHours);
                if (data.dailyLimitReached) {
                    setDailyLimitReached(true);
                    setIsTimerRunning(false);
                }
            } else if (res.status === 429) {
                setDailyLimitReached(true);
                setIsTimerRunning(false);
            }
        } catch {
            // Re-add unsynced seconds on failure
            unsyncedSecondsRef.current += secondsToSync;
        }
    }, [selectedArticle, enrollment.id]);

    // Timer tick
    useEffect(() => {
        if (isTimerRunning && !isIdle && !dailyLimitReached) {
            timerRef.current = setInterval(() => {
                // Check idle
                if (Date.now() - lastActivityRef.current > IDLE_TIMEOUT_MS) {
                    setIsIdle(true);
                    return;
                }

                // Cap at max per article: reading time + 1 hour reflection
                const maxPerArticle = ((selectedArticle?.estimated_minutes || 30) + 60) * 60;
                setSessionSeconds((prev) => {
                    if (prev >= maxPerArticle) {
                        // Auto-stop timer at article cap
                        syncTime();
                        setIsTimerRunning(false);
                        return prev;
                    }
                    unsyncedSecondsRef.current += 1;
                    return prev + 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerRunning, isIdle, dailyLimitReached, selectedArticle, syncTime]);

    // Periodic sync
    useEffect(() => {
        if (isTimerRunning) {
            syncRef.current = setInterval(syncTime, SYNC_INTERVAL_MS);
        }

        return () => {
            if (syncRef.current) clearInterval(syncRef.current);
        };
    }, [isTimerRunning, syncTime]);

    // Activity listeners
    useEffect(() => {
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        events.forEach((e) => window.addEventListener(e, resetIdle));
        return () => events.forEach((e) => window.removeEventListener(e, resetIdle));
    }, [resetIdle]);

    // Sync on page unload
    useEffect(() => {
        const handleBeforeUnload = () => syncTime();
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [syncTime]);

    // Start/stop timer
    const toggleTimer = () => {
        if (dailyLimitReached) return;
        if (isTimerRunning) {
            syncTime();
            setIsTimerRunning(false);
        } else {
            setIsTimerRunning(true);
            setIsIdle(false);
            lastActivityRef.current = Date.now();
        }
    };

    // Select article
    const openArticle = (article: Article) => {
        if (isTimerRunning) syncTime();
        setSessionSeconds(0);
        setSelectedArticle(article);
        setReflectionStatus('');

        const existing = getArticleReflection(article.id);
        setReflectionText(existing?.response_text || '');
        setSidebarOpen(false);

        // Auto-start the timer when an article is opened
        if (!dailyLimitReached) {
            setIsTimerRunning(true);
            setIsIdle(false);
            lastActivityRef.current = Date.now();
        }
    };

    // Submit reflection
    const submitReflection = async () => {
        if (!selectedArticle || reflectionText.trim().length < 50) {
            setReflectionStatus('Response must be at least 50 characters.');
            return;
        }

        setReflectionStatus('Saving...');

        try {
            const res = await fetch('/api/reflections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enrollmentId: enrollment.id,
                    articleId: selectedArticle.id,
                    responseText: reflectionText,
                }),
            });

            const data = await res.json();
            if (data.success) {
                setReflectionStatus('Reflection submitted successfully!');
                // Update progress bar with credited article time
                if (data.totalHours !== undefined) {
                    setTotalHours(data.totalHours);
                }
            } else {
                setReflectionStatus(data.error || 'Failed to submit.');
            }
        } catch {
            setReflectionStatus('Network error. Please try again.');
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progressPercent = Math.min((totalHours / enrollment.hours_required) * 100, 100);

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                <button className={styles.sidebarToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? '✕' : '☰ Courses'}
                </button>

                <div className={styles.sidebarContent}>
                    <div className={styles.progressInfo}>
                        <div className={styles.progressLabel}>
                            {totalHours.toFixed(1)} / {enrollment.hours_required} hours
                        </div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>

                    {courses.map((course) => (
                        <div key={course.id} className={styles.courseGroup}>
                            <h3 className={styles.courseTitle}>{course.title}</h3>
                            <ul className={styles.articleList}>
                                {course.articles.map((article) => (
                                    <li key={article.id}>
                                        <button
                                            className={`${styles.articleItem} ${selectedArticle?.id === article.id ? styles.articleActive : ''
                                                } ${isArticleCompleted(article.id) ? styles.articleDone : ''}`}
                                            onClick={() => openArticle(article)}
                                        >
                                            <span className={styles.articleIcon}>
                                                {isArticleCompleted(article.id) ? '✓' : '○'}
                                            </span>
                                            <span>{article.title}</span>
                                            <span className={styles.articleTime}>{article.estimated_minutes}m</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                {/* Timer Bar */}
                <div className={styles.timerBar}>
                    <div className={styles.timerInfo}>
                        <span className={styles.sessionTime}>{formatTime(sessionSeconds)}</span>
                        <span className={styles.dailyInfo}>
                            Today: {dailyHours.toFixed(1)}h / {MAX_DAILY_HOURS}h
                        </span>
                    </div>

                    {isIdle && (
                        <div className={styles.idleWarning}>
                            ⏸ Timer paused — you appear idle. Move your mouse to resume.
                        </div>
                    )}

                    {dailyLimitReached && (
                        <div className={styles.limitWarning}>
                            Daily limit reached (8 hours). Come back tomorrow!
                        </div>
                    )}

                    <button
                        onClick={toggleTimer}
                        disabled={!selectedArticle || dailyLimitReached}
                        className={`${styles.timerBtn} ${isTimerRunning ? styles.timerRunning : ''}`}
                    >
                        {isTimerRunning ? '⏸ Pause' : '▶ Start Timer'}
                    </button>
                </div>

                {/* Article Content */}
                {selectedArticle ? (
                    <div className={styles.articleContent}>
                        <h1>{selectedArticle.title}</h1>
                        <div className={styles.articleBody}>
                            {selectedArticle.body.split('\n\n').map((paragraph, i) => {
                                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                    return <h3 key={i}>{paragraph.replace(/\*\*/g, '')}</h3>;
                                }
                                if (paragraph.startsWith('- ')) {
                                    return (
                                        <ul key={i}>
                                            {paragraph.split('\n').map((item, j) => (
                                                <li key={j}>{item.replace(/^- \*\*(.+?)\*\*:/, '$1:').replace(/^- /, '')}</li>
                                            ))}
                                        </ul>
                                    );
                                }
                                if (paragraph.match(/^\d\. /)) {
                                    return (
                                        <ol key={i}>
                                            {paragraph.split('\n').map((item, j) => (
                                                <li key={j}>{item.replace(/^\d+\.\s*\*\*(.+?)\*\*\s*/, '$1 ').replace(/^\d+\.\s*/, '')}</li>
                                            ))}
                                        </ol>
                                    );
                                }
                                return <p key={i}>{paragraph.replace(/\*\*(.+?)\*\*/g, '$1')}</p>;
                            })}
                        </div>

                        {/* Reflection Form */}
                        {(() => {
                            const readingSeconds = (selectedArticle.estimated_minutes || 30) * 60;
                            const reflectionSeconds = 60 * 60; // 1 hour for reflection
                            const maxTotalSeconds = readingSeconds + reflectionSeconds; // 1.5 hours max per article

                            const readingRemaining = Math.max(0, readingSeconds - sessionSeconds);
                            const canReflect = readingRemaining === 0;

                            // Reflection countdown: time left in the 1-hour reflection window
                            const reflectionTimeSpent = Math.max(0, sessionSeconds - readingSeconds);
                            const reflectionRemaining = Math.max(0, reflectionSeconds - reflectionTimeSpent);
                            const reflectionDone = canReflect && reflectionRemaining === 0;

                            const minsLeft = Math.ceil(readingRemaining / 60);

                            return (
                                <div className={styles.reflectionSection}>
                                    <h2>Reflection</h2>
                                    {!canReflect ? (
                                        /* ──── READING PHASE: Countdown to unlock ──── */
                                        <div style={{
                                            textAlign: 'center', padding: 'var(--space-6)',
                                            background: 'var(--color-gray-50)', borderRadius: 'var(--radius-lg)',
                                            border: '1px solid var(--color-gray-200)',
                                        }}>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
                                                🔒 Reflection Locked
                                            </p>
                                            <p style={{ color: 'var(--color-gray-600)', marginBottom: 'var(--space-3)' }}>
                                                Complete the required reading time before writing your reflection.
                                            </p>
                                            <div style={{
                                                display: 'inline-block', padding: 'var(--space-2) var(--space-5)',
                                                background: 'var(--color-navy)', color: 'white',
                                                borderRadius: 'var(--radius-full)', fontSize: '1.2rem', fontWeight: 700,
                                                fontFamily: 'monospace',
                                            }}>
                                                📖 {Math.floor(readingRemaining / 60)}:{(readingRemaining % 60).toString().padStart(2, '0')} reading time left
                                            </div>
                                            <div style={{
                                                marginTop: 'var(--space-3)', height: '6px',
                                                background: 'var(--color-gray-200)', borderRadius: '3px', overflow: 'hidden',
                                            }}>
                                                <div style={{
                                                    width: `${Math.min(100, (sessionSeconds / readingSeconds) * 100)}%`,
                                                    height: '100%', background: 'var(--color-blue)',
                                                    borderRadius: '3px', transition: 'width 1s linear',
                                                }} />
                                            </div>
                                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gray-500)', marginTop: 'var(--space-2)' }}>
                                                {minsLeft} minute{minsLeft !== 1 ? 's' : ''} of reading left • Timer is {isTimerRunning ? 'running ✓' : 'paused ⏸'}
                                            </p>
                                        </div>
                                    ) : (
                                        /* ──── REFLECTION PHASE: Countdown from 1 hour ──── */
                                        <>
                                            {/* Reflection timer display */}
                                            <div style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: 'var(--space-3) var(--space-4)',
                                                background: reflectionDone ? '#ecfdf5' : '#eff6ff',
                                                border: `1px solid ${reflectionDone ? '#a7f3d0' : '#bfdbfe'}`,
                                                borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)',
                                            }}>
                                                <span style={{ fontSize: '13px', color: reflectionDone ? '#059669' : '#1e40af', fontWeight: 600 }}>
                                                    {reflectionDone ? '✅ Reflection time complete!' : '✍️ Reflection time counting...'}
                                                </span>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                                }}>
                                                    <span style={{
                                                        fontFamily: 'monospace', fontSize: '1rem', fontWeight: 700,
                                                        color: reflectionDone ? '#059669' : 'var(--color-navy)',
                                                    }}>
                                                        ✍️ {Math.floor(reflectionRemaining / 60)}:{(reflectionRemaining % 60).toString().padStart(2, '0')} left
                                                    </span>
                                                    <div style={{
                                                        width: '80px', height: '6px', background: 'var(--color-gray-200)',
                                                        borderRadius: '3px', overflow: 'hidden',
                                                    }}>
                                                        <div style={{
                                                            width: `${Math.min(100, (reflectionTimeSpent / reflectionSeconds) * 100)}%`,
                                                            height: '100%',
                                                            background: reflectionDone ? '#059669' : '#3b82f6',
                                                            borderRadius: '3px', transition: 'width 1s linear',
                                                        }} />
                                                    </div>
                                                </div>
                                            </div>

                                            <p className={styles.reflectionHint}>
                                                Write a thoughtful response (minimum 50 characters). Your timer continues while you write — time counts toward your total!
                                            </p>
                                            <textarea
                                                className={styles.reflectionInput}
                                                value={reflectionText}
                                                onChange={(e) => setReflectionText(e.target.value)}
                                                placeholder="Share your thoughts..."
                                                rows={6}
                                            />
                                            <div className={styles.reflectionFooter}>
                                                <span className={styles.charCount}>
                                                    {reflectionText.length} / 50 min characters
                                                </span>
                                                <button onClick={submitReflection} className="btn btn-cta">
                                                    Submit Reflection
                                                </button>
                                            </div>
                                            {reflectionStatus && (
                                                <p className={styles.reflectionMsg}>{reflectionStatus}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                ) : (
                    <div className={styles.placeholder}>
                        <h2>Welcome to Your Coursework</h2>
                        <p>Select an article from the sidebar to begin reading and tracking your time.</p>
                        <p>Remember to start the timer before you begin each article.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
