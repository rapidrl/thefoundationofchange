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

        // Get certificate
        const { data: certificate } = await supabase
            .from('certificates')
            .select('*')
            .eq('enrollment_id', enrollmentId)
            .single();

        const participantProfile = enrollment.profiles as Record<string, string>;
        const verificationCode = certificate?.verification_code || 'N/A';
        const issuedDate = certificate?.issued_at
            ? new Date(certificate.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const startDate = new Date(enrollment.created_at).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const hoursCompleted = Number(enrollment.hours_completed) || 0;
        const fullName = participantProfile?.full_name || 'Participant';

        // Build address string
        const addrParts = [participantProfile?.address, participantProfile?.city, participantProfile?.state].filter(Boolean);
        const addressStr = addrParts.join(', ');

        // Load the PDF template
        const templatePath = path.join(process.cwd(), 'public', 'templates', 'completion-letter.pdf');
        const templateBytes = readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(templateBytes);

        const page = pdfDoc.getPage(0);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const { height } = page.getSize();

        // Text color matching the template
        const textColor = rgb(0.1, 0.1, 0.1);

        // ====================================================================
        // COMPLETION LETTER FIELD POSITIONS (A4: 595.275 x 841.889 pt)
        // PDF coordinates: origin at bottom-left
        // The template has existing labels; we overlay values next to them
        // ====================================================================

        const fieldFontSize = 10;
        const valueX_left = 182;   // Left column value start (after "Client-Worker:", etc.)
        const valueX_right = 265;  // Right column value start (after "Current Address:", etc.)
        const labelRightX = 230;   // Right column labels start X

        // LEFT COLUMN fields (from top of page, converting to bottom-up coords)
        // Client-Worker: value
        page.drawText(fullName, {
            x: valueX_left,
            y: height - 238,
            size: fieldFontSize,
            font: font,
            color: textColor,
        });

        // Start Date: value
        page.drawText(startDate, {
            x: valueX_left,
            y: height - 260,
            size: fieldFontSize,
            font: font,
            color: textColor,
        });

        // Date Issued: value
        page.drawText(issuedDate, {
            x: valueX_left,
            y: height - 282,
            size: fieldFontSize,
            font: font,
            color: textColor,
        });

        // Verification Code: value
        page.drawText(verificationCode, {
            x: valueX_left,
            y: height - 304,
            size: fieldFontSize,
            font: font,
            color: textColor,
        });

        // RIGHT COLUMN fields
        // Current Address: value
        const addressLines = addressStr.length > 30
            ? [addressStr.substring(0, 30), addressStr.substring(30)]
            : [addressStr];
        addressLines.forEach((line, i) => {
            page.drawText(line, {
                x: valueX_right,
                y: height - 238 - (i * 12),
                size: fieldFontSize - 1,
                font: font,
                color: textColor,
            });
        });

        // Probation Officer: value
        if (participantProfile?.probation_officer) {
            page.drawText(participantProfile.probation_officer, {
                x: valueX_right,
                y: height - 260,
                size: fieldFontSize,
                font: font,
                color: textColor,
            });
        }

        // Court ID: (usually blank)

        // Local Charity: already says "The Foundation of Change" in template

        // Hours Completed: large centered text
        // The template has "Hours Completed:" label — we overlay the number
        page.drawText(String(hoursCompleted), {
            x: 335,
            y: height - 370,
            size: 16,
            font: fontBold,
            color: textColor,
        });

        // Body paragraph — overlay the dynamic name and hours into the text
        // "...the above named person successfully completed X hours..."
        // The body text is pre-printed. We need to overlay the dynamic values.
        // Since the body text already has placeholder values, we'll draw white
        // rectangles over the old values and write new ones.

        // Cover old name in body text (line ~"...confirms that Eman Elouassi has...")
        page.drawRectangle({
            x: 162,
            y: height - 420,
            width: 120,
            height: 14,
            color: rgb(1, 1, 1), // white
        });
        page.drawText(fullName, {
            x: 162,
            y: height - 418,
            size: 9,
            font: font,
            color: textColor,
        });

        // Cover old hours in body text ("...completed 17 hours...")
        page.drawRectangle({
            x: 308,
            y: height - 420,
            width: 55,
            height: 14,
            color: rgb(1, 1, 1),
        });
        page.drawText(`${hoursCompleted} hours`, {
            x: 308,
            y: height - 418,
            size: 9,
            font: font,
            color: textColor,
        });

        // Serialize
        const pdfBytes = await pdfDoc.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Completion_Letter_${fullName.replace(/\s+/g, '_')}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Certificate PDF generation error:', error);
        return NextResponse.json({ error: 'Failed to generate certificate PDF' }, { status: 500 });
    }
}
