import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getTodayInTimezone } from '@/lib/timezone';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const articleId = request.nextUrl.searchParams.get('articleId');
        const enrollmentId = request.nextUrl.searchParams.get('enrollmentId');

        if (!articleId || !enrollmentId) {
            return NextResponse.json({ error: 'articleId and enrollmentId are required' }, { status: 400 });
        }

        const { data: progress } = await supabase
            .from('article_progress')
            .select('seconds_spent, status')
            .eq('enrollment_id', enrollmentId)
            .eq('article_id', articleId)
            .single();

        return NextResponse.json({
            secondsSpent: progress?.seconds_spent || 0,
            status: progress?.status || null,
        });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { articleId, enrollmentId, secondsSpent, status } = await request.json();

        if (!articleId || !enrollmentId) {
            return NextResponse.json({ error: 'articleId and enrollmentId are required' }, { status: 400 });
        }

        // Get user's timezone
        const { data: profile } = await supabase
            .from('profiles')
            .select('timezone')
            .eq('id', user.id)
            .single();

        // ── Anti-cheat: server-side time validation ──
        const now = new Date();
        let validatedSeconds = Math.max(0, secondsSpent || 0);

        const { data: existingProgress } = await supabase
            .from('article_progress')
            .select('seconds_spent, last_saved_at')
            .eq('enrollment_id', enrollmentId)
            .eq('article_id', articleId)
            .single();

        if (existingProgress?.last_saved_at) {
            const lastSave = new Date(existingProgress.last_saved_at);
            const wallClockElapsed = (now.getTime() - lastSave.getTime()) / 1000;
            const reportedGain = validatedSeconds - (existingProgress.seconds_spent || 0);

            if (reportedGain > 0 && reportedGain > wallClockElapsed * 2 + 10) {
                validatedSeconds = (existingProgress.seconds_spent || 0) + Math.floor(wallClockElapsed);
            }
        }

        validatedSeconds = Math.min(validatedSeconds, 7200);

        // ── Upsert article_progress ──
        const { error: progressError } = await supabase
            .from('article_progress')
            .upsert({
                user_id: user.id,
                enrollment_id: enrollmentId,
                article_id: articleId,
                status: status || 'reading',
                seconds_spent: validatedSeconds,
                last_saved_at: now.toISOString(),
                started_at: existingProgress ? undefined : now.toISOString(),
            }, {
                onConflict: 'enrollment_id,article_id',
            });

        if (progressError) {
            console.error('Progress save error:', progressError);
            return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
        }

        // ── Update hour_logs for today (user's timezone) ──
        const today = getTodayInTimezone(profile?.timezone);
        const totalMinutes = Math.floor(validatedSeconds / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        // Check daily cap (8 hours)
        const { data: todayLogs } = await supabase
            .from('hour_logs')
            .select('hours, minutes')
            .eq('user_id', user.id)
            .eq('log_date', today)
            .neq('enrollment_id', enrollmentId);

        const otherHoursToday = (todayLogs || []).reduce(
            (sum, log) => sum + (Number(log.hours) || 0) + ((Number(log.minutes) || 0) / 60),
            0
        );

        const cappedHours = Math.min(hours + minutes / 60, 8 - otherHoursToday);
        const finalHours = Math.floor(Math.max(0, cappedHours));
        const finalMinutes = Math.round((Math.max(0, cappedHours) - finalHours) * 60);

        await supabase
            .from('hour_logs')
            .upsert({
                enrollment_id: enrollmentId,
                user_id: user.id,
                log_date: today,
                hours: finalHours,
                minutes: finalMinutes,
            }, {
                onConflict: 'enrollment_id,log_date',
            });

        // ── Recalculate overall enrollment hours_completed from all hour_logs ──
        const { data: allLogs } = await supabase
            .from('hour_logs')
            .select('hours, minutes')
            .eq('enrollment_id', enrollmentId);

        const totalHoursFromLogs = (allLogs || []).reduce(
            (sum, log) => sum + (Number(log.hours) || 0) + ((Number(log.minutes) || 0) / 60),
            0
        );

        // Get enrollment to check completion (and preserve admin-set hours)
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('hours_required, hours_completed, status')
            .eq('id', enrollmentId)
            .single();

        // Never reduce hours below what's already on the enrollment
        // (admin may have manually set a higher value)
        const currentHours = Number(enrollment?.hours_completed) || 0;
        const roundedTotal = Math.max(currentHours, Math.round(totalHoursFromLogs * 100) / 100);

        const isCompleted = enrollment && roundedTotal >= enrollment.hours_required && enrollment.status === 'active';

        // Use service-role client to bypass RLS for enrollment updates
        const serviceClient = createServiceClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        await serviceClient
            .from('enrollments')
            .update({
                hours_completed: roundedTotal,
                ...(isCompleted ? { status: 'completed', completed_at: new Date().toISOString() } : {}),
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
                    hours_completed: roundedTotal,
                });
        }

        return NextResponse.json({ success: true, secondsSaved: validatedSeconds, totalHours: roundedTotal });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
