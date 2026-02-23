import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

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

        // Generate PDF
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;

        // --- Header ---
        doc.setFontSize(11);
        doc.setTextColor(26, 39, 68);
        doc.text('The Foundation of Change', margin, 18);

        // Right-aligned header
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        doc.text('Jennifer Schroeder, Executive Director', pageWidth - margin, 14, { align: 'right' });
        doc.text('https://www.thefoundationofchange.org', pageWidth - margin, 19, { align: 'right' });
        doc.text('info@thefoundationofchange.org', pageWidth - margin, 24, { align: 'right' });
        doc.text('Organization Tax ID Number: 33-5003265', pageWidth - margin, 29, { align: 'right' });

        // Divider
        doc.setDrawColor(26, 39, 68);
        doc.setLineWidth(0.5);
        doc.line(margin, 33, pageWidth - margin, 33);

        // --- Title ---
        doc.setFontSize(16);
        doc.setTextColor(26, 39, 68);
        doc.text('Community Service Log - Work Days and Time', pageWidth / 2, 44, { align: 'center' });

        // --- Info Fields ---
        const infoY = 54;
        doc.setFontSize(9);
        doc.setTextColor(26, 39, 68);
        const col1 = margin;
        const col2 = pageWidth / 2 + 5;

        // Left column
        doc.text(`Client-Worker: ${participantProfile?.full_name || ''}`, col1, infoY);
        doc.text(`Start Date: ${enrollment.start_date ? new Date(enrollment.start_date).toLocaleDateString() : ''}`, col1, infoY + 6);
        doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, col1, infoY + 12);
        doc.text(`Verification Code: ${verificationCode}`, col1, infoY + 18);

        // Right column
        const address = [participantProfile?.address, participantProfile?.city, participantProfile?.state, participantProfile?.zip_code].filter(Boolean).join(', ');
        doc.text(`Current Address: ${address || 'N/A'}`, col2, infoY);
        doc.text(`Probation Officer: ${participantProfile?.probation_officer || 'N/A'}`, col2, infoY + 6);
        doc.text(`Court ID: ${participantProfile?.court_id || 'N/A'}`, col2, infoY + 12);
        doc.text('Local Charity: The Foundation of Change', col2, infoY + 18);

        // --- Hours Table ---
        const tableStartY = infoY + 30;
        doc.setFontSize(12);
        doc.setTextColor(26, 39, 68);
        doc.text('Hours Completed:', pageWidth / 2, tableStartY, { align: 'center' });

        // Table headers — 4 columns of Date | Hrs:Mins
        const tableY = tableStartY + 8;
        const colWidth = (pageWidth - margin * 2) / 4;
        const dateColWidth = colWidth * 0.55;
        const hrsColWidth = colWidth * 0.45;

        doc.setFontSize(8);
        doc.setFillColor(240, 240, 245);
        doc.setDrawColor(180, 180, 190);
        doc.setLineWidth(0.2);

        // Draw header row
        for (let c = 0; c < 4; c++) {
            const x = margin + c * colWidth;
            doc.rect(x, tableY, dateColWidth, 7, 'FD');
            doc.rect(x + dateColWidth, tableY, hrsColWidth, 7, 'FD');
            doc.setTextColor(26, 39, 68);
            doc.text('Date', x + 2, tableY + 5);
            doc.text('Hrs:Mins', x + dateColWidth + 2, tableY + 5);
        }

        // Fill in hour log data across 4 columns
        const logs = hourLogs || [];
        const rowHeight = 6;
        const maxRows = 20; // max rows per page

        for (let i = 0; i < Math.max(logs.length, maxRows); i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const y = tableY + 7 + row * rowHeight;

            if (y > 240) break; // Don't go past footer area

            const x = margin + col * colWidth;
            doc.setDrawColor(210, 210, 215);
            doc.rect(x, y, dateColWidth, rowHeight);
            doc.rect(x + dateColWidth, y, hrsColWidth, rowHeight);

            if (i < logs.length) {
                doc.setTextColor(50, 50, 50);
                doc.setFontSize(7);
                const logDate = new Date(logs[i].log_date + 'T00:00:00').toLocaleDateString();
                const hours = Number(logs[i].hours) || 0;
                const mins = Number(logs[i].minutes) || 0;
                doc.text(logDate, x + 2, y + 4);
                doc.text(`${hours}:${mins.toString().padStart(2, '0')}`, x + dateColWidth + 2, y + 4);
            }
        }

        // Total row
        const totalHours = logs.reduce((sum, l) => sum + (Number(l.hours) || 0), 0);
        const totalMins = logs.reduce((sum, l) => sum + (Number(l.minutes) || 0), 0);
        const finalHours = totalHours + Math.floor(totalMins / 60);
        const finalMins = totalMins % 60;

        const totalY = tableY + 7 + Math.min(Math.max(Math.ceil(logs.length / 4), 1), maxRows) * rowHeight + 4;
        doc.setFontSize(10);
        doc.setTextColor(26, 39, 68);
        doc.text(`Total Hours: ${finalHours}:${finalMins.toString().padStart(2, '0')}`, margin, totalY + 2);

        // --- Footer ---
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        const footerText = 'The Foundation of Change is a registered 501(c)(3) nonprofit organization. To confirm authenticity, visit www.thefoundationofchange.org, click the Verify Certificate tab, and enter the verification code from this document. Verification details should match the enrollment information above. For further questions, contact info@thefoundationofchange.org.';
        const footerSplit = doc.splitTextToSize(footerText, pageWidth - margin * 2);
        doc.text(footerSplit, pageWidth / 2, 245, { align: 'center' });

        // Signature
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        doc.text('Certified by,', margin, 260);
        doc.setFontSize(11);
        doc.setTextColor(26, 39, 68);
        doc.text('J. Schroeder', margin, 268);
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text('J. Schroeder, MS CADC', margin, 273);

        // Output
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Hour_Log_${participantProfile?.full_name?.replace(/\s+/g, '_') || 'Log'}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Hour log PDF generation error:', error);
        return NextResponse.json({ error: 'Failed to generate hour log PDF' }, { status: 500 });
    }
}
