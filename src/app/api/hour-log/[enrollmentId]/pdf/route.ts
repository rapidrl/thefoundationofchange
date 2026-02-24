import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildPDF } from '@/lib/pdf';

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

    // Get enrollment
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('id', enrollmentId)
        .eq('user_id', user.id)
        .single();

    if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Get profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email, city, state')
        .eq('id', user.id)
        .single();

    // Get hour logs
    const { data: hourLogs } = await supabase
        .from('hour_logs')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .order('log_date', { ascending: true });

    const participantName = profile?.full_name || user.email || 'Participant';
    const location = [profile?.city, profile?.state].filter(Boolean).join(', ') || 'N/A';
    const hoursCompleted = Number(enrollment.hours_completed) || 0;
    const hoursRequired = Number(enrollment.hours_required) || 0;

    const lines: Array<{ text: string; x: number; y: number; fontSize?: number; bold?: boolean; color?: [number, number, number] }> = [
        // Header
        { text: 'THE FOUNDATION OF CHANGE', x: 180, y: 60, fontSize: 16, bold: true, color: [10, 30, 61] },
        { text: '501(c)(3) Nonprofit  |  EIN: 33-5003265', x: 200, y: 80, fontSize: 8, color: [120, 120, 120] },

        // Title
        { text: 'OFFICIAL HOUR LOG', x: 215, y: 120, fontSize: 18, bold: true, color: [10, 30, 61] },

        // Participant Info
        { text: `Participant:  ${participantName}`, x: 60, y: 160, fontSize: 11, bold: true, color: [30, 30, 30] },
        { text: `Location:  ${location}`, x: 60, y: 178, fontSize: 10, color: [80, 80, 80] },
        { text: `Hours Required:  ${hoursRequired}   |   Hours Completed:  ${hoursCompleted}`, x: 60, y: 196, fontSize: 10, color: [80, 80, 80] },
        { text: `Status:  ${enrollment.status === 'completed' ? 'COMPLETED' : 'In Progress'}`, x: 60, y: 214, fontSize: 10, bold: true, color: enrollment.status === 'completed' ? [5, 150, 105] : [37, 99, 235] },

        // Table Header
        { text: '____________________________________________________________', x: 50, y: 235, fontSize: 10, color: [200, 200, 200] },
        { text: 'DATE', x: 60, y: 258, fontSize: 9, bold: true, color: [80, 80, 80] },
        { text: 'HOURS', x: 230, y: 258, fontSize: 9, bold: true, color: [80, 80, 80] },
        { text: 'MINUTES', x: 330, y: 258, fontSize: 9, bold: true, color: [80, 80, 80] },
        { text: 'RUNNING TOTAL', x: 440, y: 258, fontSize: 9, bold: true, color: [80, 80, 80] },
        { text: '____________________________________________________________', x: 50, y: 265, fontSize: 10, color: [220, 220, 220] },
    ];

    // Add hour log rows
    let runningTotal = 0;
    let yPos = 285;
    const logs = hourLogs || [];

    for (let i = 0; i < logs.length && yPos < 700; i++) {
        const log = logs[i];
        const h = Number(log.hours) || 0;
        const m = Number(log.minutes) || 0;
        runningTotal += h + m / 60;
        const dateStr = new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', {
            month: '2-digit', day: '2-digit', year: 'numeric',
        });

        lines.push(
            { text: dateStr, x: 60, y: yPos, fontSize: 9, color: [60, 60, 60] },
            { text: `${h}h`, x: 240, y: yPos, fontSize: 9, color: [60, 60, 60] },
            { text: `${m}m`, x: 345, y: yPos, fontSize: 9, color: [60, 60, 60] },
            { text: `${runningTotal.toFixed(1)}h`, x: 460, y: yPos, fontSize: 9, bold: true, color: [10, 30, 61] },
        );
        yPos += 18;
    }

    if (logs.length > 0) {
        lines.push(
            { text: '____________________________________________________________', x: 50, y: yPos, fontSize: 10, color: [200, 200, 200] },
            { text: `Total: ${hoursCompleted} hours completed`, x: 60, y: yPos + 20, fontSize: 11, bold: true, color: [5, 150, 105] },
        );
        yPos += 40;
    } else {
        lines.push(
            { text: 'No hours logged yet.', x: 60, y: yPos, fontSize: 10, color: [150, 150, 150] },
        );
    }

    // Footer
    lines.push(
        { text: 'Generated on ' + new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), x: 60, y: 740, fontSize: 8, color: [160, 160, 160] },
        { text: 'The Foundation of Change  |  info@thefoundationofchange.org  |  734-834-6934', x: 120, y: 755, fontSize: 8, color: [160, 160, 160] },
    );

    const pdfBuffer = buildPDF({
        title: `Hour Log - ${participantName}`,
        lines,
    });

    return new Response(pdfBuffer.buffer as ArrayBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="HourLog_${participantName.replace(/\s+/g, '_')}.pdf"`,
        },
    });
}
