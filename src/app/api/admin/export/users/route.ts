import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch all users with enrollments
        const { data: profiles } = await supabase
            .from('profiles')
            .select('*, enrollments(*)')
            .eq('role', 'participant')
            .order('created_at', { ascending: false });

        // Build CSV
        const headers = [
            'Name', 'Email', 'Phone', 'DOB', 'Address', 'City', 'State', 'Zip',
            'Probation Officer', 'Court ID', 'Hours Required', 'Hours Completed',
            'Amount Paid', 'Enrollment Status', 'Start Date', 'Registered At',
        ];

        const rows = (profiles || []).map((p) => {
            const enrollment = Array.isArray(p.enrollments) ? p.enrollments[0] : null;
            return [
                p.full_name || '',
                p.email || '',
                p.phone || '',
                p.date_of_birth || '',
                p.address || '',
                p.city || '',
                p.state || '',
                p.zip_code || '',
                p.probation_officer || '',
                p.court_id || '',
                enrollment?.hours_required || '',
                enrollment?.hours_completed || '',
                enrollment?.amount_paid || '',
                enrollment?.status || 'no enrollment',
                enrollment?.start_date || '',
                p.created_at || '',
            ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');

        return new NextResponse(csv, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch {
        return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }
}
