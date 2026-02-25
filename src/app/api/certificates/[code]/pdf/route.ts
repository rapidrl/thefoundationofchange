import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildPDF } from '@/lib/pdf';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const supabase = await createClient();

    // Get certificate with profile and enrollment data
    const { data: certificate } = await supabase
        .from('certificates')
        .select(`
            *,
            profiles:user_id (full_name, email, city, state, address, zip_code),
            enrollments:enrollment_id (hours_required, hours_completed, start_date, completed_at, status)
        `)
        .eq('verification_code', code)
        .single();

    if (!certificate) {
        return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    const profile = certificate.profiles as Record<string, string> | null;
    const enrollment = certificate.enrollments as Record<string, unknown> | null;
    const participantName = profile?.full_name || 'Participant';
    const address = [profile?.address, profile?.city, profile?.state, profile?.zip_code].filter(Boolean).join(', ') || '';
    const hoursCompleted = Number(enrollment?.hours_completed) || 0;
    const issuedDate = new Date(certificate.issued_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const startDate = enrollment?.start_date
        ? new Date(enrollment.start_date as string).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : 'N/A';

    const navy: [number, number, number] = [10, 30, 61];
    const gray: [number, number, number] = [80, 80, 80];
    const darkGray: [number, number, number] = [50, 50, 50];
    const lightGray: [number, number, number] = [180, 180, 180];
    const blue: [number, number, number] = [37, 99, 235];
    const maroon: [number, number, number] = [139, 0, 0];

    const items: Parameters<typeof buildPDF>[0]['lines'] = [
        // ═══════════════════════════════════════════════════════
        // HEADER — Logo text + Executive Director info
        // ═══════════════════════════════════════════════════════

        // Logo text (left side) - styled to look like TFC branding
        { type: 'text', text: 'The', x: 60, y: 45, fontSize: 14, bold: true, color: navy },
        { type: 'text', text: 'Foundation', x: 60, y: 62, fontSize: 14, bold: true, color: navy },
        { type: 'text', text: 'of Change', x: 60, y: 79, fontSize: 14, bold: true, color: navy },

        // "The Foundation of Change" large title next to logo
        { type: 'text', text: 'The Foundation of Change', x: 150, y: 65, fontSize: 20, bold: true, color: navy },

        // Executive Director info (right side)
        { type: 'text', text: 'Jennifer Schroeder, Executive Director', x: 355, y: 40, fontSize: 8, color: darkGray },
        { type: 'text', text: 'https://www.thefoundationofchange.org', x: 355, y: 52, fontSize: 8, color: blue },
        { type: 'text', text: 'Email: info@thefoundationofchange.org', x: 355, y: 64, fontSize: 8, color: blue },

        // Header divider line
        { type: 'line', x1: 55, y1: 95, x2: 555, y2: 95, lineWidth: 1.5, color: navy },

        // ═══════════════════════════════════════════════════════
        // TITLE
        // ═══════════════════════════════════════════════════════
        { type: 'text', text: 'Community Service Statement of Completion', x: 120, y: 130, fontSize: 16, bold: true, color: navy },

        // ═══════════════════════════════════════════════════════
        // TWO-COLUMN FIELD LAYOUT
        // ═══════════════════════════════════════════════════════

        // Left column labels
        { type: 'text', text: 'Client-Worker:', x: 65, y: 175, fontSize: 9, bold: true, color: darkGray },
        { type: 'text', text: 'Start Date:', x: 65, y: 195, fontSize: 9, bold: true, color: darkGray },
        { type: 'text', text: 'Date Issued:', x: 65, y: 215, fontSize: 9, bold: true, color: darkGray },
        { type: 'text', text: 'Verification Code:', x: 65, y: 235, fontSize: 9, bold: true, color: darkGray },

        // Left column values
        { type: 'text', text: participantName, x: 170, y: 175, fontSize: 9, color: gray },
        { type: 'text', text: startDate, x: 170, y: 195, fontSize: 9, color: gray },
        { type: 'text', text: issuedDate, x: 170, y: 215, fontSize: 9, color: gray },
        { type: 'text', text: certificate.verification_code, x: 170, y: 235, fontSize: 9, color: gray },

        // Right column labels
        { type: 'text', text: 'Current Address:', x: 310, y: 175, fontSize: 9, bold: true, color: darkGray },
        { type: 'text', text: 'Probation Officer:', x: 310, y: 195, fontSize: 9, bold: true, color: darkGray },
        { type: 'text', text: 'Court ID:', x: 310, y: 215, fontSize: 9, bold: true, color: darkGray },
        { type: 'text', text: 'Local Charity:', x: 310, y: 235, fontSize: 9, bold: true, color: darkGray },

        // Right column values
        { type: 'text', text: address || '', x: 415, y: 175, fontSize: 9, color: gray },
        { type: 'text', text: '', x: 415, y: 195, fontSize: 9, color: gray },
        { type: 'text', text: '', x: 415, y: 215, fontSize: 9, color: gray },
        { type: 'text', text: 'The Foundation of Change', x: 415, y: 235, fontSize: 9, color: gray },

        // ═══════════════════════════════════════════════════════
        // HOURS COMPLETED
        // ═══════════════════════════════════════════════════════
        { type: 'text', text: `Hours Completed: ${hoursCompleted}`, x: 210, y: 280, fontSize: 16, bold: true, color: navy },

        // Divider
        { type: 'line', x1: 55, y1: 300, x2: 555, y2: 300, lineWidth: 0.5, color: lightGray },

        // ═══════════════════════════════════════════════════════
        // VERIFICATION PARAGRAPH 1
        // ═══════════════════════════════════════════════════════
        { type: 'text', text: `This letter serves to verify the above named person successfully completed ${hoursCompleted} hours of volunteer`, x: 65, y: 325, fontSize: 9, color: darkGray },
        { type: 'text', text: 'community service work, sponsored by our non profit organization. The services performed were', x: 65, y: 338, fontSize: 9, color: darkGray },
        { type: 'text', text: 'educational in nature, with a labor component, and provide ongoing value to the community and', x: 65, y: 351, fontSize: 9, color: darkGray },
        { type: 'text', text: 'the client through self improvement. All training materials were prepared or approved by a licensed', x: 65, y: 364, fontSize: 9, color: darkGray },
        { type: 'text', text: 'and experienced Master\'s Level Social Worker. Examples of topics addressed include Anger', x: 65, y: 377, fontSize: 9, color: darkGray },
        { type: 'text', text: 'Management, Civics, Drug and Alcohol Awareness, Parenting and American Government. Structured', x: 65, y: 390, fontSize: 9, color: darkGray },
        { type: 'text', text: 'feedback from the client is used to improve our other programs.', x: 65, y: 403, fontSize: 9, color: darkGray },

        // ═══════════════════════════════════════════════════════
        // VERIFICATION PARAGRAPH 2
        // ═══════════════════════════════════════════════════════
        { type: 'text', text: 'To verify the authenticity of this document, please go to https://www.thefoundationofchange.org.', x: 65, y: 430, fontSize: 9, color: darkGray },
        { type: 'text', text: 'Near the bottom center of the page, click the Client Authentication tab. You will be instructed to', x: 65, y: 443, fontSize: 9, color: darkGray },
        { type: 'text', text: 'enter the Verification Code from this letter. The information from our database should match the', x: 65, y: 456, fontSize: 9, color: darkGray },
        { type: 'text', text: 'enrollment information given above. If any other information is needed, feel free to contact me at:', x: 65, y: 469, fontSize: 9, color: darkGray },
        { type: 'text', text: 'info@thefoundationofchange.org. The Foundation of Change is a 501c(3) registered non-profit', x: 65, y: 482, fontSize: 9, color: darkGray },
        { type: 'text', text: 'organization.', x: 65, y: 495, fontSize: 9, color: darkGray },

        // ═══════════════════════════════════════════════════════
        // SIGNATURE SECTION
        // ═══════════════════════════════════════════════════════
        { type: 'text', text: 'Respectfully submitted,', x: 65, y: 545, fontSize: 10, color: maroon },

        // Signature line (cursive-style name)
        { type: 'text', text: 'Jennifer Schroeder', x: 65, y: 585, fontSize: 14, bold: true, color: navy },
        { type: 'line', x1: 65, y1: 590, x2: 220, y2: 590, lineWidth: 0.5, color: lightGray },

        { type: 'text', text: 'Jennifer Schroeder, M.S., CADC', x: 65, y: 608, fontSize: 9, color: darkGray },
        { type: 'text', text: 'Executive Director, The Foundation of Change', x: 65, y: 621, fontSize: 9, color: darkGray },

        // ═══════════════════════════════════════════════════════
        // GOLD SEAL (drawn as concentric circles with text)
        // ═══════════════════════════════════════════════════════

        // Outer circle - gold
        { type: 'circle', cx: 490, cy: 595, r: 38, stroke: [184, 157, 82], lineWidth: 3 },
        // Inner circle - gold
        { type: 'circle', cx: 490, cy: 595, r: 30, stroke: [184, 157, 82], lineWidth: 1.5 },
        // Inner fill
        { type: 'circle', cx: 490, cy: 595, r: 28, fill: [255, 248, 220], stroke: [184, 157, 82], lineWidth: 0.5 },

        // Seal text
        { type: 'text', text: 'THE', x: 478, y: 583, fontSize: 7, bold: true, color: [139, 115, 50] },
        { type: 'text', text: 'FOUNDATION', x: 466, y: 594, fontSize: 6, bold: true, color: [139, 115, 50] },
        { type: 'text', text: 'OF CHANGE', x: 470, y: 604, fontSize: 6, bold: true, color: [139, 115, 50] },

        // ═══════════════════════════════════════════════════════
        // FOOTER
        // ═══════════════════════════════════════════════════════
        { type: 'line', x1: 55, y1: 660, x2: 555, y2: 660, lineWidth: 0.5, color: lightGray },
        { type: 'text', text: 'The Foundation of Change  |  501(c)(3)  |  EIN: 33-5003265  |  info@thefoundationofchange.org  |  734-834-6934', x: 105, y: 675, fontSize: 7, color: [160, 160, 160] },
    ];

    const pdfBuffer = buildPDF({
        title: `Certificate - ${participantName} - ${certificate.verification_code}`,
        lines: items,
    });

    return new Response(pdfBuffer.buffer as ArrayBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Certificate_${certificate.verification_code}.pdf"`,
        },
    });
}
