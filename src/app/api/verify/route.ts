import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { enrolleeName, verificationCode } = body;

        if (!enrolleeName || !verificationCode) {
            return NextResponse.json(
                { error: 'Enrollee name and verification code are required.' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Look up certificate by verification code
        const { data: certificate, error } = await supabase
            .from('certificates')
            .select(`
                *,
                profiles:user_id (full_name, state, city),
                enrollments:enrollment_id (hours_required, hours_completed, status, start_date, completed_at)
            `)
            .eq('verification_code', verificationCode.trim())
            .single();

        if (error || !certificate) {
            return NextResponse.json(
                { error: 'No certificate found with that verification code. Please check your information and try again.' },
                { status: 404 }
            );
        }

        // Verify the name matches (case-insensitive)
        const profile = certificate.profiles as Record<string, string> | null;
        const profileName = (profile?.full_name || '').toLowerCase().trim();
        const searchName = enrolleeName.toLowerCase().trim();

        if (!profileName.includes(searchName) && !searchName.includes(profileName)) {
            return NextResponse.json(
                { error: 'The name provided does not match the certificate record. Please verify your information.' },
                { status: 404 }
            );
        }

        const enrollment = certificate.enrollments as Record<string, unknown> | null;

        return NextResponse.json({
            verified: true,
            data: {
                participantName: profile?.full_name || '',
                location: [profile?.city, profile?.state].filter(Boolean).join(', ') || 'N/A',
                verificationCode: certificate.verification_code,
                hoursCompleted: enrollment?.hours_completed ?? 0,
                hoursRequired: enrollment?.hours_required ?? 0,
                status: enrollment?.status ?? 'unknown',
                issuedDate: certificate.issued_at,
                completedDate: enrollment?.completed_at || null,
                startDate: enrollment?.start_date || null,
                certificateUrl: `/api/certificates/${certificate.verification_code}/pdf`,
                hourLogUrl: certificate.enrollment_id ? `/api/hour-log/${certificate.enrollment_id}/pdf` : null,
            },
        });
    } catch {
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
