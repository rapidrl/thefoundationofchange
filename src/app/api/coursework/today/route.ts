import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getTodayInTimezone } from '@/lib/timezone';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's timezone
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
            (sum, log) => sum + (Number(log.hours) || 0) + ((Number(log.minutes) || 0) / 60),
            0
        );

        const remaining = Math.max(0, 8 - hoursToday);

        return NextResponse.json({
            hoursUsedToday: Math.round(hoursToday * 100) / 100,
            hoursRemaining: Math.round(remaining * 100) / 100,
            canContinue: remaining > 0,
            today,
        });
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
