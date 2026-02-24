import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { readFileSync } from 'fs';
import path from 'path';

interface RouteParams {
    params: Promise<{ enrollmentId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { enrollmentId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user owns this enrollment or is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('*, profiles:user_id (*)')
            .eq('id', enrollmentId)
            .single();

        if (!enrollment) {
            return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
        }

        if (enrollment.user_id !== user.id && profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Fetch hour logs
        const { data: hourLogs } = await supabase
            .from('hour_logs')
            .select('*')
            .eq('enrollment_id', enrollmentId)
            .order('log_date', { ascending: true });

        // Get certificate for verification code
        const { data: certificate } = await supabase
            .from('certificates')
            .select('verification_code')
            .eq('enrollment_id', enrollmentId)
            .single();

        const participantProfile = enrollment.profiles as Record<string, string>;
        const verificationCode = certificate?.verification_code || 'N/A';
        const fullName = participantProfile?.full_name || 'Participant';
        const startDate = new Date(enrollment.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const issuedDate = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const hoursCompleted = Number(enrollment.hours_completed) || 0;
        const address = [participantProfile?.address, participantProfile?.city, participantProfile?.state].filter(Boolean).join(', ');

        // Load the PDF template
        const templatePath = path.join(process.cwd(), 'public', 'templates', 'hour-log.pdf');
        const templateBytes = readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);

        const page1 = pdfDoc.getPage(0);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const { height: h1 } = page1.getSize();

        const textColor = rgb(0.1, 0.1, 0.1);
        const fieldSize = 9;

        // ====================================================================
        // HOUR LOG PAGE 1 FIELD POSITIONS (US Letter: 612 x 792 pt)
        // Template has same header block as completion letter
        // ====================================================================

        // LEFT COLUMN header fields
        const leftValueX = 142;
        const rightValueX = 230;
        const headerBaseY = h1 - 225; // approx Y for "Client-Worker:" row

        // Client-Worker: value
        page1.drawText(fullName, {
            x: leftValueX,
            y: headerBaseY,
            size: fieldSize,
            font: font,
            color: textColor,
        });

        // Start Date: value
        page1.drawText(startDate, {
            x: leftValueX,
            y: headerBaseY - 20,
            size: fieldSize,
            font: font,
            color: textColor,
        });

        // Date Issued: value
        page1.drawText(issuedDate, {
            x: leftValueX,
            y: headerBaseY - 40,
            size: fieldSize,
            font: font,
            color: textColor,
        });

        // Verification Code: value
        page1.drawText(verificationCode, {
            x: leftValueX,
            y: headerBaseY - 60,
            size: fieldSize,
            font: font,
            color: textColor,
        });

        // RIGHT COLUMN
        // Current Address: value
        page1.drawText(address || 'N/A', {
            x: rightValueX,
            y: headerBaseY,
            size: fieldSize - 1,
            font: font,
            color: textColor,
        });

        // Probation Officer: value
        if (participantProfile?.probation_officer) {
            page1.drawText(participantProfile.probation_officer, {
                x: rightValueX,
                y: headerBaseY - 20,
                size: fieldSize,
                font: font,
                color: textColor,
            });
        }

        // Hours Completed: value (large, after the label)
        page1.drawText(String(hoursCompleted), {
            x: 340,
            y: headerBaseY - 105,
            size: 14,
            font: fontBold,
            color: textColor,
        });

        // ====================================================================
        // HOUR LOG TABLE
        // Template has a table with 4 column pairs (Date | Hrs:Mins)
        // 8 rows visible in the template
        // ====================================================================

        const logs = hourLogs || [];

        // Table grid coordinates (from the template screenshot)
        // 4 column pairs, each ~80pt wide
        const tableTopY = headerBaseY - 150;  // Top of first data row
        const rowHeight = 25;
        const maxRows = 8;

        // Column pair X positions (Date start, then Hrs:Mins start)
        const colPairX = [
            { dateX: 80, hrsX: 144 },   // Column pair 1
            { dateX: 185, hrsX: 250 },   // Column pair 2
            { dateX: 290, hrsX: 357 },   // Column pair 3
            { dateX: 398, hrsX: 465 },   // Column pair 4
        ];

        // Fill in the log entries across the 4-column grid
        for (let i = 0; i < Math.min(logs.length, maxRows * 4); i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const y = tableTopY - (row * rowHeight);

            const logDate = new Date(logs[i].log_date + 'T00:00:00').toLocaleDateString('en-US', {
                month: '2-digit', day: '2-digit', year: 'numeric'
            });
            const hours = Number(logs[i].hours) || 0;
            const mins = Number(logs[i].minutes) || 0;

            // Date
            page1.drawText(logDate, {
                x: colPairX[col].dateX,
                y: y,
                size: 7,
                font: font,
                color: textColor,
            });

            // Hours:Mins
            page1.drawText(`${hours}:${mins.toString().padStart(2, '0')}`, {
                x: colPairX[col].hrsX,
                y: y,
                size: 7,
                font: font,
                color: textColor,
            });
        }

        // Serialize
        const pdfBytes = await pdfDoc.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Hour_Log_${fullName.replace(/\s+/g, '_')}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Hour log PDF generation error:', error);
        return NextResponse.json({ error: 'Failed to generate hour log PDF' }, { status: 500 });
    }
}
