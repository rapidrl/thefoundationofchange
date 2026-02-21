import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId } = body;

    if (!enrollmentId) {
        return NextResponse.json({ error: 'enrollmentId required' }, { status: 400 });
    }

    // Verify enrollment is completed and belongs to user
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('id', enrollmentId)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .single();

    if (!enrollment) {
        return NextResponse.json({ error: 'No completed enrollment found' }, { status: 404 });
    }

    // Check if certificate already exists
    const { data: existing } = await supabase
        .from('certificates')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .single();

    if (existing) {
        return NextResponse.json({ certificate: existing });
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

    // Generate verification code
    const verificationCode = `TFOC-${nanoid(10).toUpperCase()}`;

    // Create certificate record
    const { data: certificate, error } = await supabase
        .from('certificates')
        .insert({
            enrollment_id: enrollmentId,
            user_id: user.id,
            verification_code: verificationCode,
            hours_verified: enrollment.hours_completed,
            issued_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) {
        console.error('Certificate creation error:', error);
        return NextResponse.json({ error: 'Failed to create certificate' }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        certificate: {
            ...certificate,
            participant_name: profile?.full_name,
        },
    });
}
