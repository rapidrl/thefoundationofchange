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

    // Service-role client for ALL writes (bypasses RLS)
    const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check enrollment belongs to user and is active
    const { data: enrollment } = await serviceClient
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
    const { data: profile } = await serviceClient
        .from('profiles')
        .select('timezone')
        .eq('id', user.id)
        .single();

    // Check 8-hour daily cap (uses user's local midnight, not UTC)
    const today = getTodayInTimezone(profile?.timezone);
    const { data: todayLog } = await serviceClient
        .from('hour_logs')
        .select('id, hours, minutes')
        .eq('enrollment_id', enrollmentId)
        .eq('log_date', today)
        .maybeSingle();

    // Reconstruct decimal hours from hours:minutes format (e.g., 1h 27m = 1.45)
    const storedHours = Number(todayLog?.hours) || 0;
    const storedMinutes = Number(todayLog?.minutes) || 0;
    const currentDailyHours = storedHours + storedMinutes / 60;
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

    // Update or insert daily hour log (explicit to avoid upsert issues)
    // Store time as whole hours + remainder minutes (0-59)
    // e.g., 1.45 decimal hours = 1h 27m -> hours=1, minutes=27
    const totalDecimalHours = Math.round((currentDailyHours + allowedHours) * 100) / 100;
    const totalMinutes = Math.round(totalDecimalHours * 60);
    const wholeHours = Math.floor(totalMinutes / 60);
    const remainderMinutes = totalMinutes % 60;

    if (todayLog?.id) {
        // UPDATE existing record
        await serviceClient
            .from('hour_logs')
            .update({ hours: wholeHours, minutes: remainderMinutes })
            .eq('id', todayLog.id);
    } else {
        // INSERT new record
        await serviceClient
            .from('hour_logs')
            .insert({
                enrollment_id: enrollmentId,
                user_id: user.id,
                log_date: today,
                hours: wholeHours,
                minutes: remainderMinutes,
            });
    }

    // Update course progress - accumulate time (service client)
    const { data: existingProgress } = await serviceClient
        .from('course_progress')
        .select('time_spent_seconds')
        .eq('user_id', user.id)
        .eq('enrollment_id', enrollmentId)
        .eq('article_id', articleId)
        .single();

    const previousSeconds = Number(existingProgress?.time_spent_seconds) || 0;
    const accumulatedSeconds = previousSeconds + allowedSeconds;

    await serviceClient
        .from('course_progress')
        .upsert({
            user_id: user.id,
            enrollment_id: enrollmentId,
            article_id: articleId,
            time_spent_seconds: accumulatedSeconds,
            started_at: new Date().toISOString(),
        }, { onConflict: 'user_id,enrollment_id,article_id' });

    // Update total enrollment hours (service client)
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
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const verificationCode = `TFOC-${segment()}-${segment()}`;

        await serviceClient
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
        dailyHours: totalDecimalHours,
        totalHours: newTotal,
        hoursRequired: enrollment.hours_required,
        isCompleted,
        dailyLimitReached: totalDecimalHours >= MAX_DAILY_HOURS,
    });
}
