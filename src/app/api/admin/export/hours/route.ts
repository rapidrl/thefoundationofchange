import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch all hour logs with user info
        const { data: hourLogs } = await supabase
            .from('hour_logs')
            .select('*, profiles:user_id(full_name, email), enrollments:enrollment_id(hours_required)')
            .order('log_date', { ascending: false });

        const headers = ['Date', 'Name', 'Email', 'Hours', 'Minutes', 'Hours Required'];

        const rows = (hourLogs || []).map((log) => {
            const p = log.profiles as Record<string, string> | null;
            const e = log.enrollments as Record<string, unknown> | null;
            return [
                log.log_date || '',
                p?.full_name || '',
                p?.email || '',
                log.hours || 0,
                log.minutes || 0,
                e?.hours_required || '',
            ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="hour_logs_export_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch {
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
