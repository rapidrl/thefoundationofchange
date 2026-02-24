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
    const location = [profile?.city, profile?.state].filter(Boolean).join(', ') || 'N/A';
    const hoursCompleted = Number(enrollment?.hours_completed) || 0;
    const issuedDate = new Date(certificate.issued_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const startDate = enrollment?.start_date
        ? new Date(enrollment.start_date as string).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    const lines = [
        // Header
        { text: 'THE FOUNDATION OF CHANGE', x: 180, y: 80, fontSize: 18, bold: true, color: [10, 30, 61] as [number, number, number] },
        { text: '501(c)(3) Nonprofit Organization — EIN: 33-5003265', x: 170, y: 105, fontSize: 9, color: [120, 120, 120] as [number, number, number] },

        // Divider text
        { text: '___________________________________________________________', x: 80, y: 130, fontSize: 12, color: [200, 200, 200] as [number, number, number] },

        // Title
        { text: 'CERTIFICATE OF COMMUNITY SERVICE', x: 140, y: 180, fontSize: 20, bold: true, color: [10, 30, 61] as [number, number, number] },

        // Body
        { text: 'This certifies that', x: 220, y: 230, fontSize: 13, color: [80, 80, 80] as [number, number, number] },
        { text: participantName, x: 180, y: 270, fontSize: 22, bold: true, color: [10, 30, 61] as [number, number, number] },
        { text: `of ${location}`, x: 230, y: 300, fontSize: 12, color: [100, 100, 100] as [number, number, number] },

        { text: 'has successfully completed', x: 200, y: 340, fontSize: 13, color: [80, 80, 80] as [number, number, number] },
        { text: `${hoursCompleted} Hours of Community Service`, x: 140, y: 380, fontSize: 20, bold: true, color: [5, 150, 105] as [number, number, number] },

        { text: 'through The Foundation of Change online community service program.', x: 110, y: 420, fontSize: 11, color: [80, 80, 80] as [number, number, number] },
        { text: 'This program consists of educational coursework and written reflections', x: 100, y: 440, fontSize: 11, color: [80, 80, 80] as [number, number, number] },
        { text: 'on topics including community impact, civic responsibility, and personal growth.', x: 90, y: 460, fontSize: 11, color: [80, 80, 80] as [number, number, number] },

        // Dates
        { text: '___________________________________________________________', x: 80, y: 490, fontSize: 12, color: [200, 200, 200] as [number, number, number] },
        { text: `Program Start Date:  ${startDate}`, x: 100, y: 520, fontSize: 11, color: [60, 60, 60] as [number, number, number] },
        { text: `Certificate Issued:  ${issuedDate}`, x: 100, y: 540, fontSize: 11, color: [60, 60, 60] as [number, number, number] },
        { text: `Verification Code:   ${certificate.verification_code}`, x: 100, y: 560, fontSize: 11, bold: true, color: [10, 30, 61] as [number, number, number] },

        // Footer
        { text: '___________________________________________________________', x: 80, y: 600, fontSize: 12, color: [200, 200, 200] as [number, number, number] },
        { text: 'To verify this certificate, visit:', x: 100, y: 630, fontSize: 9, color: [120, 120, 120] as [number, number, number] },
        { text: 'https://thefoundationofchange.org/certificate-verification', x: 100, y: 645, fontSize: 9, color: [37, 99, 235] as [number, number, number] },
        { text: 'Enter the participant name and verification code to confirm.', x: 100, y: 660, fontSize: 9, color: [120, 120, 120] as [number, number, number] },

        { text: 'The Foundation of Change  |  info@thefoundationofchange.org  |  734-834-6934', x: 110, y: 720, fontSize: 8, color: [160, 160, 160] as [number, number, number] },
    ];

    const pdfBuffer = buildPDF({
        title: `Certificate - ${participantName} - ${certificate.verification_code}`,
        lines,
    });

    return new Response(pdfBuffer.buffer as ArrayBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Certificate_${certificate.verification_code}.pdf"`,
        },
    });
}
