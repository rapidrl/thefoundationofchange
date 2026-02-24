'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Timer from '@/components/coursework/Timer';

interface Props {
    articleId: string;
    articleTitle: string;
    enrollmentId: string;
    nextArticleId: string | null;
    estimatedMinutes: number;
}

export default function ReflectionForm({ articleId, articleTitle, enrollmentId, nextArticleId, estimatedMinutes }: Props) {
    const router = useRouter();
    const [response, setResponse] = useState('');
    const [relevance, setRelevance] = useState(0);
    const [improvements, setImprovements] = useState('');
    const [generalFeedback, setGeneralFeedback] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [completedData, setCompletedData] = useState<{ verificationCode: string; totalHours: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [savedSeconds, setSavedSeconds] = useState(0);

    useEffect(() => {
        // Load saved progress for the reflection timer
        fetch(`/api/coursework/progress?articleId=${articleId}&enrollmentId=${enrollmentId}`)
            .then((r) => r.json())
            .then((data) => {
                // The reflection timer picks up from where the reading timer left off
                // Reading was estimated_minutes * 60 seconds, so reflection time is anything beyond that
                const readingSeconds = estimatedMinutes * 60;
                if (data.secondsSpent > readingSeconds) {
                    setSavedSeconds(data.secondsSpent - readingSeconds);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [articleId, enrollmentId, estimatedMinutes]);

    const handleSave = useCallback(async (secondsElapsed: number) => {
        try {
            await fetch('/api/coursework/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    articleId,
                    enrollmentId,
                    secondsSpent: 3600 + secondsElapsed,
                    status: 'reflecting',
                }),
            });
        } catch (err) {
            console.error('Save error:', err);
        }
    }, [articleId, enrollmentId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (response.trim().length < 80) {
            setError('Please write a more detailed reflection (at least 80 characters).');
            return;
        }

        if (relevance === 0) {
            setError('Please rate the relevance of the article (1-5 stars).');
            return;
        }

        setSubmitting(true);

        // Combine all feedback into a structured response
        const feedbackParts = [
            `REFLECTION:\n${response.trim()}`,
            `\n\nRELEVANCE RATING: ${relevance}/5`,
            improvements.trim() ? `\n\nSUGGESTED IMPROVEMENTS:\n${improvements.trim()}` : '',
            generalFeedback.trim() ? `\n\nGENERAL FEEDBACK:\n${generalFeedback.trim()}` : '',
        ];
        const combinedResponse = feedbackParts.join('');

        try {
            const res = await fetch('/api/coursework/reflect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    articleId,
                    enrollmentId,
                    responseText: combinedResponse,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to submit reflection.');
                setSubmitting(false);
                return;
            }

            if (data.enrollmentCompleted) {
                setCompletedData({
                    verificationCode: data.verificationCode,
                    totalHours: data.totalHours,
                });
            }
            setSubmitted(true);
        } catch {
            setError('An error occurred. Please try again.');
            setSubmitting(false);
        }
    };

    const handleTimerComplete = useCallback(() => {
        // Timer for reflection is informational — doesn't force navigation
    }, []);

    if (submitted) {
        // Enrollment completed — show congratulations
        if (completedData) {
            return (
                <section style={{ padding: 'var(--space-16) 0' }}>
                    <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                        <span style={{ fontSize: '4rem' }}>🎓</span>
                        <h1 style={{ fontSize: 'var(--text-3xl)', margin: 'var(--space-4) 0', color: 'var(--color-navy)' }}>
                            Congratulations!
                        </h1>
                        <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-6)' }}>
                            You&apos;ve completed all {completedData.totalHours} hours of your community service program!
                        </p>
                        <div style={{
                            background: '#ecfdf5', border: '1px solid #a7f3d0',
                            borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
                            marginBottom: 'var(--space-6)',
                        }}>
                            <div style={{ fontSize: 'var(--text-sm)', color: '#059669', marginBottom: 'var(--space-2)' }}>
                                Your Verification Code
                            </div>
                            <div style={{
                                fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)',
                                color: 'var(--color-navy)', letterSpacing: '0.05em',
                            }}>
                                {completedData.verificationCode}
                            </div>
                        </div>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)' }}>
                            Your certificate and hour log are now available for download from your dashboard.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                            <Link href="/dashboard" className="btn btn-cta">
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </section>
            );
        }

        // Normal reflection success
        return (
            <section style={{ padding: 'var(--space-16) 0' }}>
                <div className="container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <span style={{ fontSize: '3rem' }}>✅</span>
                    <h1 style={{ fontSize: 'var(--text-2xl)', margin: 'var(--space-4) 0' }}>Reflection Submitted!</h1>
                    <p style={{ color: 'var(--color-gray-500)', marginBottom: 'var(--space-6)' }}>
                        Great work! Your reflection for &ldquo;{articleTitle}&rdquo; has been saved.
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                        {nextArticleId ? (
                            <Link href={`/coursework/${nextArticleId}`} className="btn btn-cta">
                                Next Article →
                            </Link>
                        ) : (
                            <Link href="/coursework" className="btn btn-cta">
                                Back to Coursework
                            </Link>
                        )}
                        <Link href="/dashboard" className="btn btn-secondary" style={{ border: '1px solid var(--color-gray-300)' }}>
                            View Dashboard
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section style={{ padding: 'var(--space-6) 0 var(--space-16)' }}>
            <div className="container" style={{ maxWidth: '700px', margin: '0 auto' }}>
                <Link href="/coursework" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', display: 'inline-block', marginBottom: 'var(--space-4)' }}>
                    ← Back to Coursework
                </Link>

                {/* Timer */}
                <div style={{ marginBottom: 'var(--space-6)' }}>
                    {!loading && (
                        <Timer
                            durationMinutes={60}
                            onComplete={handleTimerComplete}
                            onSave={handleSave}
                            saveInterval={30}
                            initialSeconds={savedSeconds}
                        />
                    )}
                </div>

                {/* Reflection Form */}
                <div style={{
                    background: 'var(--color-white)', border: '1px solid var(--color-gray-200)',
                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)',
                }}>
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-gray-500)', fontWeight: 600 }}>
                            Reflection for
                        </span>
                        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-navy)', marginTop: 'var(--space-1)' }}>
                            {articleTitle}
                        </h1>
                    </div>

                    <p style={{ color: 'var(--color-gray-600)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-relaxed)', marginBottom: 'var(--space-6)' }}>
                        Please share your thoughts on the article you just read. Consider what you learned,
                        how it relates to your own experiences, and what changes or actions it inspires you to take.
                    </p>

                    {error && (
                        <div style={{
                            padding: 'var(--space-3) var(--space-4)', background: '#fef2f2',
                            border: '1px solid #fecaca', borderRadius: 'var(--radius-md)',
                            color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)',
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Question 1: Main reflection */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
                                Your Reflection <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <textarea
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                placeholder="Write your reflection here... (minimum 80 characters)"
                                required
                                minLength={80}
                                rows={8}
                                style={{
                                    width: '100%', padding: 'var(--space-4)', border: '1px solid var(--color-gray-300)',
                                    borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
                                    fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)',
                                    resize: 'vertical', outline: 'none',
                                    transition: 'border-color var(--transition-fast)',
                                }}
                            />
                            <span style={{ fontSize: 'var(--text-xs)', color: response.length < 80 ? '#dc2626' : '#059669' }}>
                                {response.length} / 80 characters minimum
                            </span>
                        </div>

                        {/* Question 2: Relevance rating */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
                                How relevant was the information in the article to your community service requirements? <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRelevance(star)}
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            fontSize: '2rem', padding: '2px',
                                            color: star <= relevance ? '#f59e0b' : '#d1d5db',
                                            transition: 'color 0.15s, transform 0.15s',
                                            transform: star <= relevance ? 'scale(1.1)' : 'scale(1)',
                                        }}
                                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                                    >
                                        ★
                                    </button>
                                ))}
                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-gray-500)', marginLeft: 'var(--space-2)' }}>
                                    {relevance === 0 ? 'Select a rating' : relevance === 1 ? 'Not relevant' : relevance === 2 ? 'Slightly relevant' : relevance === 3 ? 'Moderately relevant' : relevance === 4 ? 'Very relevant' : 'Extremely relevant'}
                                </span>
                            </div>
                        </div>

                        {/* Question 3: Article improvements */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
                                What improvements, if any, would you suggest for this article?
                            </label>
                            <textarea
                                value={improvements}
                                onChange={(e) => setImprovements(e.target.value)}
                                placeholder="Share any suggestions for improving this article... (optional)"
                                rows={4}
                                style={{
                                    width: '100%', padding: 'var(--space-4)', border: '1px solid var(--color-gray-300)',
                                    borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
                                    fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)',
                                    resize: 'vertical', outline: 'none',
                                    transition: 'border-color var(--transition-fast)',
                                }}
                            />
                        </div>

                        {/* Question 4: General feedback */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-navy)', marginBottom: 'var(--space-2)' }}>
                                Do you have any other feedback or suggestions for us to improve the service overall?
                            </label>
                            <textarea
                                value={generalFeedback}
                                onChange={(e) => setGeneralFeedback(e.target.value)}
                                placeholder="Share your overall feedback about our service... (optional)"
                                rows={4}
                                style={{
                                    width: '100%', padding: 'var(--space-4)', border: '1px solid var(--color-gray-300)',
                                    borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
                                    fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)',
                                    resize: 'vertical', outline: 'none',
                                    transition: 'border-color var(--transition-fast)',
                                }}
                            />
                        </div>

                        {/* Submit */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-gray-100)' }}>
                            <button
                                type="submit"
                                className="btn btn-cta"
                                disabled={submitting || response.trim().length < 80 || relevance === 0}
                                style={{ border: 'none', opacity: submitting || response.trim().length < 80 || relevance === 0 ? 0.5 : 1 }}
                            >
                                {submitting ? 'Submitting...' : 'Submit Reflection'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
