import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { getTodayInTimezone } from '@/lib/timezone';

// POST: Log time for a session
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId, articleId, secondsToAdd } = body;

    if (!enrollmentId || !articleId || !secondsToAdd || secondsToAdd < 0) {
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Check enrollment belongs to user and is active
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('id', enrollmentId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

    if (!enrollment) {
        return NextResponse.json({ error: 'No active enrollment found' }, { status: 404 });
    }

    // Get user's timezone for daily cap calculation
    const { data: profile } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();

    // Check 8-hour daily cap (uses user's local midnight, not UTC)
    const today = getTodayInTimezone(profile?.timezone);
    const { data: todayLog } = await supabase
        .from('hour_logs')
        .select('hours')
        .eq('enrollment_id', enrollmentId)
        .eq('log_date', today)
        .single();

    const currentDailyHours = todayLog?.hours || 0;
    const hoursToAdd = secondsToAdd / 3600;
    const MAX_DAILY_HOURS = 8;

    if (currentDailyHours >= MAX_DAILY_HOURS) {
        return NextResponse.json({
            error: 'Daily limit reached. Maximum 8 hours per day.',
            dailyHours: currentDailyHours,
            maxHours: MAX_DAILY_HOURS,
        }, { status: 429 });
    }

    // Cap the addition to not exceed daily limit
    const allowedHours = Math.min(hoursToAdd, MAX_DAILY_HOURS - currentDailyHours);
    const allowedSeconds = Math.round(allowedHours * 3600);

    // Upsert daily hour log
    const newDailyHours = Math.round((currentDailyHours + allowedHours) * 100) / 100;
    await supabase
        .from('hour_logs')
        .upsert({
            enrollment_id: enrollmentId,
            user_id: user.id,
            log_date: today,
            hours: newDailyHours,
            minutes: Math.round(newDailyHours * 60),
        }, { onConflict: 'enrollment_id,log_date' });

    // Update course progress
    await supabase
        .from('course_progress')
        .upsert({
            user_id: user.id,
            enrollment_id: enrollmentId,
            article_id: articleId,
            time_spent_seconds: allowedSeconds,
            started_at: new Date().toISOString(),
        }, { onConflict: 'user_id,enrollment_id,article_id' });

    // Update total enrollment hours
    // Use service-role client to bypass RLS for enrollment updates
    const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const newTotal = Math.round((enrollment.hours_completed + allowedHours) * 100) / 100;
    const isCompleted = newTotal >= enrollment.hours_required;

    await serviceClient
        .from('enrollments')
        .update({
            hours_completed: newTotal,
            status: isCompleted ? 'completed' : 'active',
            completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', enrollmentId);

    // Auto-generate certificate on completion
    if (isCompleted) {
        // Generate unique verification code: TFOC-XXXX-XXXX
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous characters
        const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const verificationCode = `TFOC-${segment()}-${segment()}`;

        await supabase
            .from('certificates')
            .insert({
                user_id: user.id,
                enrollment_id: enrollmentId,
                verification_code: verificationCode,
                issued_at: new Date().toISOString(),
            });
    }

    return NextResponse.json({
        success: true,
        secondsLogged: allowedSeconds,
        dailyHours: newDailyHours,
        totalHours: newTotal,
        hoursRequired: enrollment.hours_required,
        isCompleted,
        dailyLimitReached: newDailyHours >= MAX_DAILY_HOURS,
    });
}
