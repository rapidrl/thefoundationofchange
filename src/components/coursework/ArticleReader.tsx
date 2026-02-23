'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Timer from '@/components/coursework/Timer';

interface ArticleData {
    id: string;
    title: string;
    body: string;
    estimated_minutes: number;
    course_id: string;
}

interface Props {
    article: ArticleData;
    enrollmentId: string;
}

export default function ArticleReader({ article, enrollmentId }: Props) {
    const router = useRouter();
    const [capReached, setCapReached] = useState(false);
    const [loading, setLoading] = useState(true);
    const [savedSeconds, setSavedSeconds] = useState(0);

    useEffect(() => {
        // Check daily cap AND load saved progress on mount
        Promise.all([
            fetch('/api/coursework/today').then((r) => r.json()),
            fetch(`/api/coursework/progress?articleId=${article.id}&enrollmentId=${enrollmentId}`).then((r) => r.json()),
        ])
            .then(([todayData, progressData]) => {
                if (!todayData.canContinue) setCapReached(true);

                // If they already completed this article, redirect to reflection
                if (progressData.status === 'reflecting' || progressData.status === 'completed') {
                    router.push(`/coursework/${article.id}/reflect`);
                    return;
                }

                // Resume from saved progress
                if (progressData.secondsSpent > 0) {
                    setSavedSeconds(progressData.secondsSpent);
                }

                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [article.id, enrollmentId, router]);

    const handleSave = useCallback(async (secondsElapsed: number) => {
        try {
            await fetch('/api/coursework/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    articleId: article.id,
                    enrollmentId,
                    secondsSpent: secondsElapsed,
                    status: 'reading',
                }),
            });
        } catch (err) {
            console.error('Save progress error:', err);
        }
    }, [article.id, enrollmentId]);

    const handleComplete = useCallback(async () => {
        // Save final progress and redirect to reflection
        try {
            await fetch('/api/coursework/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    articleId: article.id,
                    enrollmentId,
                    secondsSpent: article.estimated_minutes * 60,
                    status: 'reflecting',
                }),
            });
        } catch (err) {
            console.error('Save error:', err);
        }
        router.push(`/coursework/${article.id}/reflect`);
    }, [article.id, article.estimated_minutes, enrollmentId, router]);

    if (loading) {
        return (
            <div style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-gray-500)' }}>Loading...</p>
            </div>
        );
    }

    if (capReached) {
        return (
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem' }}>⏰</span>
                    <h1 style={{ fontSize: 'var(--text-2xl)', margin: 'var(--space-4) 0' }}>Daily Limit Reached</h1>
                    <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)' }}>
                        You&apos;ve reached the 8-hour daily maximum. Come back tomorrow to continue your coursework.
                    </p>
                    <Link href="/coursework" className="btn btn-primary">← Back to Coursework</Link>
                </div>
            </section>
        );
    }

    // Simple markdown-like rendering for the article body
    const renderBody = (body: string) => {
        return body.split('\n\n').map((block, i) => {
            if (block.startsWith('## ')) {
                return <h2 key={i} style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-navy)', margin: 'var(--space-6) 0 var(--space-3)' }}>{block.replace('## ', '')}</h2>;
            }
            if (block.startsWith('### ')) {
                return <h3 key={i} style={{ fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--color-navy)', margin: 'var(--space-5) 0 var(--space-2)' }}>{block.replace('### ', '')}</h3>;
            }
            if (block.startsWith('- ')) {
                const items = block.split('\n').filter((l) => l.startsWith('- '));
                return (
                    <ul key={i} style={{ paddingLeft: 'var(--space-6)', margin: 'var(--space-3) 0', listStyle: 'disc' }}>
                        {items.map((item, j) => {
                            const text = item.replace(/^- \*\*(.*?)\*\*:?\s*/, '');
                            const bold = item.match(/^- \*\*(.*?)\*\*/)?.[1];
                            return (
                                <li key={j} style={{ marginBottom: 'var(--space-2)', lineHeight: 'var(--leading-relaxed)', color: 'var(--color-gray-700)' }}>
                                    {bold && <strong>{bold}: </strong>}
                                    {text}
                                </li>
                            );
                        })}
                    </ul>
                );
            }
            if (block.match(/^\d+\.\s/)) {
                const items = block.split('\n').filter((l) => l.match(/^\d+\.\s/));
                return (
                    <ol key={i} style={{ paddingLeft: 'var(--space-6)', margin: 'var(--space-3) 0' }}>
                        {items.map((item, j) => {
                            const text = item.replace(/^\d+\.\s\*\*(.*?)\*\*:?\s*/, '');
                            const bold = item.match(/^\d+\.\s\*\*(.*?)\*\*/)?.[1];
                            return (
                                <li key={j} style={{ marginBottom: 'var(--space-2)', lineHeight: 'var(--leading-relaxed)', color: 'var(--color-gray-700)' }}>
                                    {bold && <strong>{bold}: </strong>}
                                    {text}
                                </li>
                            );
                        })}
                    </ol>
                );
            }
            return <p key={i} style={{ lineHeight: 'var(--leading-relaxed)', color: 'var(--color-gray-700)', marginBottom: 'var(--space-4)' }}>{block}</p>;
        });
    };

    return (
        <section style={{ padding: 'var(--space-6) 0 var(--space-16)' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {/* Back link */}
                <Link href="/coursework" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', display: 'inline-block', marginBottom: 'var(--space-4)' }}>
                    ← Back to Coursework
                </Link>

                {/* Timer - sticky at top */}
                <div style={{ position: 'sticky', top: 'var(--header-height, 70px)', zIndex: 10, marginBottom: 'var(--space-6)' }}>
                    <Timer
                        durationMinutes={article.estimated_minutes}
                        onComplete={handleComplete}
                        onSave={handleSave}
                        saveInterval={30}
                        initialSeconds={savedSeconds}
                    />
                </div>

                {/* Article Content */}
                <article style={{
                    background: 'var(--color-white)', border: '1px solid var(--color-gray-200)',
                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)',
                }}>
                    <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-navy)', marginBottom: 'var(--space-6)', lineHeight: 1.3 }}>
                        {article.title}
                    </h1>
                    <div>{renderBody(article.body)}</div>
                </article>
            </div>
        </section>
    );
}
