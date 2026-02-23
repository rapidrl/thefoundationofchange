'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerProps {
    durationMinutes: number;
    onComplete: () => void;
    onTick?: (secondsElapsed: number) => void;
    saveInterval?: number;
    onSave?: (secondsElapsed: number) => void;
    paused?: boolean;
    initialSeconds?: number;
}

const CHANNEL_NAME = 'tfoc-timer-lock';

export default function Timer({
    durationMinutes,
    onComplete,
    onTick,
    saveInterval = 30,
    onSave,
    paused: externalPaused = false,
    initialSeconds = 0,
}: TimerProps) {
    const [secondsElapsed, setSecondsElapsed] = useState(initialSeconds);
    const [isIdle, setIsIdle] = useState(false);
    const [tabBlocked, setTabBlocked] = useState(false);
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSaveRef = useRef(0);
    const completedRef = useRef(false);
    const channelRef = useRef<BroadcastChannel | null>(null);
    const totalSeconds = durationMinutes * 60;

    // ── Duplicate tab prevention ──
    useEffect(() => {
        if (typeof BroadcastChannel === 'undefined') return;

        const channel = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current = channel;

        // Announce this tab is running a timer
        channel.postMessage({ type: 'timer-started', timestamp: Date.now() });

        channel.onmessage = (event) => {
            if (event.data.type === 'timer-started') {
                // Another tab started a timer — block this one
                setTabBlocked(true);
            }
            if (event.data.type === 'timer-check') {
                // Another tab is checking — respond to claim ownership
                channel.postMessage({ type: 'timer-active', timestamp: Date.now() });
            }
            if (event.data.type === 'timer-active') {
                // Another tab already has an active timer
                setTabBlocked(true);
            }
        };

        // Check if any other tabs are already running
        channel.postMessage({ type: 'timer-check', timestamp: Date.now() });

        return () => {
            channel.postMessage({ type: 'timer-ended' });
            channel.close();
        };
    }, []);

    // ── Idle detection ──
    const resetIdleTimer = useCallback(() => {
        if (isIdle) setIsIdle(false);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => setIsIdle(true), 60000);
    }, [isIdle]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach((e) => window.addEventListener(e, resetIdleTimer));
        resetIdleTimer();
        return () => {
            events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [resetIdleTimer]);

    // ── Main timer tick ──
    useEffect(() => {
        if (isIdle || externalPaused || completedRef.current || tabBlocked) return;

        const interval = setInterval(() => {
            setSecondsElapsed((prev) => {
                const next = prev + 1;
                onTick?.(next);

                if (onSave && next - lastSaveRef.current >= saveInterval) {
                    lastSaveRef.current = next;
                    onSave(next);
                }

                if (next >= totalSeconds && !completedRef.current) {
                    completedRef.current = true;
                    onSave?.(next);
                    setTimeout(() => onComplete(), 500);
                }

                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isIdle, externalPaused, tabBlocked, totalSeconds, onComplete, onTick, onSave, saveInterval]);

    // ── Duplicate tab warning ──
    if (tabBlocked) {
        return (
            <div style={{
                padding: 'var(--space-4) var(--space-5)',
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 'var(--radius-lg)', textAlign: 'center',
            }}>
                <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                <p style={{ color: '#dc2626', fontWeight: 600, margin: 'var(--space-2) 0 0' }}>
                    Timer is already running in another tab.
                </p>
                <p style={{ color: '#9b1c1c', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>
                    Please close other coursework tabs and refresh this page.
                </p>
            </div>
        );
    }

    const remaining = Math.max(0, totalSeconds - secondsElapsed);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const progressPct = Math.min(100, (secondsElapsed / totalSeconds) * 100);

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                padding: 'var(--space-4) var(--space-5)',
                background: isIdle ? '#fef3c7' : 'var(--color-white)',
                border: `1px solid ${isIdle ? '#f59e0b' : 'var(--color-gray-200)'}`,
                borderRadius: 'var(--radius-lg)',
                transition: 'all 0.3s ease',
            }}>
                <div style={{ fontSize: '1.5rem' }}>
                    {isIdle ? '⏸️' : '⏱️'}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', marginBottom: 'var(--space-2)',
                    }}>
                        <span style={{
                            fontSize: 'var(--text-sm)', fontWeight: 600,
                            color: isIdle ? '#92400e' : 'var(--color-navy)',
                        }}>
                            {isIdle ? 'Session Paused — Move your mouse to resume' : 'Time Remaining'}
                        </span>
                        <span style={{
                            fontSize: 'var(--text-xl)', fontWeight: 700,
                            fontFamily: 'var(--font-mono, monospace)',
                            color: isIdle ? '#92400e' : 'var(--color-navy)',
                        }}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                    </div>
                    <div style={{
                        width: '100%', height: '6px',
                        background: 'var(--color-gray-200)',
                        borderRadius: 'var(--radius-full)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            width: `${progressPct}%`,
                            height: '100%',
                            background: isIdle
                                ? '#f59e0b'
                                : progressPct > 80 ? '#059669' : 'var(--color-blue)',
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 1s linear, background 0.3s ease',
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
