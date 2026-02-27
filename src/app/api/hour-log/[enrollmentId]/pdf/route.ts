import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildHourLogPDF } from '@/lib/pdf';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ enrollmentId: string }> }
) {
    const { enrollmentId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get enrollment (without user_id filter so admins can access)
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('id', enrollmentId)
        .single();

    if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Verify ownership OR admin role
    if (enrollment.user_id !== user.id) {
        const { data: adminProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        if (adminProfile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
    }

    // Get participant's profile (not the logged-in user's) for PDF fields
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, city, state, address, zip_code')
        .eq('id', enrollment.user_id)
        .single();

    // Get hour logs
    const { data: hourLogs } = await supabase
        .from('hour_logs')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .order('log_date', { ascending: true });

    // Get certificate if exists
    const { data: cert } = await supabase
        .from('certificates')
        .select('verification_code')
        .eq('enrollment_id', enrollmentId)
        .limit(1)
        .single();

    const participantName = profile?.full_name || user.email || 'Participant';
    const address = [profile?.address, profile?.city, profile?.state, profile?.zip_code].filter(Boolean).join(', ') || '';
    const hoursCompleted = Math.round((Number(enrollment.hours_completed) || 0) * 100) / 100;
    const verificationCode = cert?.verification_code || '';

    const startDate = enrollment.start_date
        ? new Date(enrollment.start_date as string).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : 'N/A';
    const issuedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    const pdfBuffer = buildHourLogPDF({
        participantName,
        address,
        startDate,
        issuedDate,
        verificationCode,
        hoursCompleted,
        hourLogs: (hourLogs || []).map(l => ({
            log_date: l.log_date,
            hours: Number(l.hours) || 0,
            minutes: Number(l.minutes) || 0,
        })),
    });

    return new Response(pdfBuffer.buffer as ArrayBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="HourLog_${participantName.replace(/\s+/g, '_')}.pdf"`,
        },
    });
}
