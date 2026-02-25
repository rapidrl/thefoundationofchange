import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildCertificatePDF } from '@/lib/pdf';

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
    const hoursCompleted = Math.round((Number(enrollment?.hours_completed) || 0) * 100) / 100;
    const issuedDate = new Date(certificate.issued_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
    const startDate = enrollment?.start_date
        ? new Date(enrollment.start_date as string).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        : 'N/A';

    const pdfBuffer = buildCertificatePDF({
        participantName,
        address,
        startDate,
        issuedDate,
        verificationCode: certificate.verification_code,
        hoursCompleted,
    });

    return new Response(pdfBuffer.buffer as ArrayBuffer, {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="Certificate_${certificate.verification_code}.pdf"`,
        },
    });
}
