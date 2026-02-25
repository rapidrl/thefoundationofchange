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
        .select('full_name, email, city, state, address, zip_code')
        .eq('id', user.id)
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

    const navy: [number, number, number] = [10, 30, 61];
    const gray: [number, number, number] = [80, 80, 80];
    const darkGray: [number, number, number] = [50, 50, 50];
    const lightGray: [number, number, number] = [180, 180, 180];
    const blue: [number, number, number] = [37, 99, 235];
    const tableGray: [number, number, number] = [120, 120, 120];

    const items: Parameters<typeof buildPDF>[0]['lines'] = [
        // ═══════════════════════════════════════════════════════
        // HEADER — Logo text + Executive Director info
        // ═══════════════════════════════════════════════════════

        // Logo text (left side)
        { type: 'text', text: 'The', x: 60, y: 45, fontSize: 14, bold: true, color: navy },
        { type: 'text', text: 'Foundation', x: 60, y: 62, fontSize: 14, bold: true, color: navy },
        { type: 'text', text: 'of Change', x: 60, y: 79, fontSize: 14, bold: true, color: navy },

        // Executive Director info (right-aligned)
        { type: 'text', text: 'Jennifer Schroeder, Executive Director', x: 330, y: 40, fontSize: 8, bold: true, color: darkGray },
        { type: 'text', text: 'Website: https://www.thefoundationofchange.org', x: 330, y: 52, fontSize: 8, color: blue },
        { type: 'text', text: 'Email: info@thefoundationofchange.org', x: 330, y: 64, fontSize: 8, color: blue },
        { type: 'text', text: 'Organization Tax ID Number: 33-5003265', x: 330, y: 76, fontSize: 8, color: darkGray },

        // Header divider line
        { type: 'line', x1: 55, y1: 95, x2: 555, y2: 95, lineWidth: 1.5, color: navy },

        // ═══════════════════════════════════════════════════════
        // TITLE
        // ═══════════════════════════════════════════════════════
        { type: 'text', text: 'Community Service Log - Work Days and Time', x: 120, y: 125, fontSize: 15, bold: true, color: navy },

        // ═══════════════════════════════════════════════════════
        // TWO-COLUMN FIELD LAYOUT
        // ═══════════════════════════════════════════════════════

        // Left column labels
        { type: 'text', text: 'Client-Worker:', x: 65, y: 160, fontSize: 9, bold: true, color: darkGray },
        { type: 'text', text: 'Start Date:', x: 65, y: 178, fontSize: 9, bold: true, color: darkGray },
        { type: 'text', text: 'Date Issued:', x: 65, y: 196, fontSize: 9, bold: true, color: darkGray },
        { type: 'text', text: 'Verification Code:', x: 65, y: 214, fontSize: 9, bold: true, color: darkGray },

        // Left column values
        { type: 'text', text: participantName, x: 170, y: 160, fontSize: 9, color: gray },
        { type: 'text', text: startDate, x: 170, y: 178, fontSize: 9, color: gray },
        { type: 'text', text: issuedDate, x: 170, y: 196, fontSize: 9, color: gray },
        { type: 'text', text: verificationCode, x: 170, y: 214, fontSize: 9, color: gray },

        // Right column labels
        { type: 'text', text: 'Current Address:', x: 310, y: 160, fontSize: 9, bold: true, color: darkGray },
        { type: 'text', text: 'Probation Officer:', x: 310, y: 178, fontSize: 9, bold: true, color: darkGray },
        { type: 'text', text: 'Court ID:', x: 310, y: 196, fontSize: 9, bold: true, color: darkGray },
        { type: 'text', text: 'Local Charity:', x: 310, y: 214, fontSize: 9, bold: true, color: darkGray },

        // Right column values
        { type: 'text', text: address || '', x: 415, y: 160, fontSize: 9, color: gray },
        { type: 'text', text: '', x: 415, y: 178, fontSize: 9, color: gray },
        { type: 'text', text: '', x: 415, y: 196, fontSize: 9, color: gray },
        { type: 'text', text: 'The Foundation of Change', x: 415, y: 214, fontSize: 9, color: gray },

        // ═══════════════════════════════════════════════════════
        // HOURS COMPLETED
        // ═══════════════════════════════════════════════════════
        { type: 'text', text: `Hours Completed: ${hoursCompleted}`, x: 210, y: 250, fontSize: 14, bold: true, color: navy },
    ];

    // ═══════════════════════════════════════════════════════
    // TABLE - 4 columns of Date | Hrs:Mins
    // ═══════════════════════════════════════════════════════
    const tableTop = 280;
    const rowHeight = 18;
    const colWidth = 122.5; // 4 columns across 490px (65 to 555)
    const tableLeft = 55;
    const numCols = 4;
    const maxRows = 18; // 18 data rows fits nicely on the page

    // Table header row background
    items.push({
        type: 'rect', x: tableLeft, y: tableTop, width: colWidth * numCols, height: rowHeight,
        fill: [230, 235, 245], stroke: navy, lineWidth: 0.5,
    });

    // Header text for each column pair
    for (let col = 0; col < numCols; col++) {
        const colX = tableLeft + col * colWidth;
        items.push(
            { type: 'text', text: 'Date', x: colX + 8, y: tableTop + 13, fontSize: 8, bold: true, color: navy },
            { type: 'text', text: 'Hrs:Mins', x: colX + 68, y: tableTop + 13, fontSize: 8, bold: true, color: navy },
        );
        // Vertical line between Date and Hrs:Mins
        items.push({
            type: 'line', x1: colX + 62, y1: tableTop, x2: colX + 62, y2: tableTop + rowHeight * (maxRows + 1),
            lineWidth: 0.3, color: lightGray,
        });
        // Column separator
        if (col > 0) {
            items.push({
                type: 'line', x1: colX, y1: tableTop, x2: colX, y2: tableTop + rowHeight * (maxRows + 1),
                lineWidth: 0.5, color: navy,
            });
        }
    }

    // Table outer border (top)
    items.push({ type: 'line', x1: tableLeft, y1: tableTop, x2: tableLeft + colWidth * numCols, y2: tableTop, lineWidth: 0.5, color: navy });
    // Table outer border (left)
    items.push({ type: 'line', x1: tableLeft, y1: tableTop, x2: tableLeft, y2: tableTop + rowHeight * (maxRows + 1), lineWidth: 0.5, color: navy });
    // Table outer border (right)
    items.push({ type: 'line', x1: tableLeft + colWidth * numCols, y1: tableTop, x2: tableLeft + colWidth * numCols, y2: tableTop + rowHeight * (maxRows + 1), lineWidth: 0.5, color: navy });
    // Table outer border (bottom)
    items.push({ type: 'line', x1: tableLeft, y1: tableTop + rowHeight * (maxRows + 1), x2: tableLeft + colWidth * numCols, y2: tableTop + rowHeight * (maxRows + 1), lineWidth: 0.5, color: navy });

    // Header bottom line
    items.push({ type: 'line', x1: tableLeft, y1: tableTop + rowHeight, x2: tableLeft + colWidth * numCols, y2: tableTop + rowHeight, lineWidth: 0.5, color: navy });

    // Data row lines
    for (let row = 2; row <= maxRows; row++) {
        const lineY = tableTop + rowHeight * row;
        items.push({
            type: 'line', x1: tableLeft, y1: lineY, x2: tableLeft + colWidth * numCols, y2: lineY,
            lineWidth: 0.3, color: lightGray,
        });
    }

    // Fill in hour log data
    const logs = hourLogs || [];
    for (let i = 0; i < logs.length && i < maxRows * numCols; i++) {
        const col = Math.floor(i / maxRows);
        const row = i % maxRows;
        const log = logs[i];
        const h = Number(log.hours) || 0;
        const m = Number(log.minutes) || 0;
        const dateStr = new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', {
            month: '2-digit', day: '2-digit', year: '2-digit',
        });
        const timeStr = `${h}:${m.toString().padStart(2, '0')}`;

        const colX = tableLeft + col * colWidth;
        const rowY = tableTop + rowHeight * (row + 1) + 13;

        items.push(
            { type: 'text', text: dateStr, x: colX + 8, y: rowY, fontSize: 8, color: tableGray },
            { type: 'text', text: timeStr, x: colX + 75, y: rowY, fontSize: 8, color: tableGray },
        );
    }

    // ═══════════════════════════════════════════════════════
    // FOOTER — Verification text and signature
    // ═══════════════════════════════════════════════════════
    const footerY = tableTop + rowHeight * (maxRows + 1) + 20;

    items.push(
        { type: 'line', x1: 55, y1: footerY - 5, x2: 555, y2: footerY - 5, lineWidth: 0.5, color: lightGray },

        { type: 'text', text: 'The Foundation of Change is a registered 501(c)(3) nonprofit organization. To confirm', x: 65, y: footerY + 10, fontSize: 8, color: darkGray },
        { type: 'text', text: 'authenticity, visit www.thefoundationofchange.org, click the Verify Certificate tab, and enter the', x: 65, y: footerY + 21, fontSize: 8, color: darkGray },
        { type: 'text', text: 'verification code from this document. Verification details should match the enrollment', x: 65, y: footerY + 32, fontSize: 8, color: darkGray },
        { type: 'text', text: 'information above. For further questions, contact info@thefoundationofchange.org.', x: 65, y: footerY + 43, fontSize: 8, color: darkGray },

        { type: 'text', text: 'Certified by,', x: 65, y: footerY + 68, fontSize: 9, color: darkGray },
        { type: 'text', text: 'Jennifer Schroeder', x: 65, y: footerY + 90, fontSize: 12, bold: true, color: navy },
        { type: 'text', text: 'Jennifer Schroeder, M.S., CADC', x: 65, y: footerY + 105, fontSize: 8, color: darkGray },
    );

    const pdfBuffer = buildPDF({
        title: `Hour Log - ${participantName}`,
        lines: items,
    });

    return new Response(pdfBuffer.buffer as ArrayBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="HourLog_${participantName.replace(/\s+/g, '_')}.pdf"`,
        },
    });
}
