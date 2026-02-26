import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const formData = await request.formData();
        const enrollmentId = formData.get('enrollmentId') as string;
        const action = formData.get('action') as string;

        if (!enrollmentId || !action) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        switch (action) {
            case 'suspend':
                await supabase
                    .from('enrollments')
                    .update({ status: 'suspended' })
                    .eq('id', enrollmentId);
                break;

            case 'resume':
                await supabase
                    .from('enrollments')
                    .update({ status: 'active' })
                    .eq('id', enrollmentId);
                break;

            case 'complete': {
                await supabase
                    .from('enrollments')
                    .update({ status: 'completed', completed_at: new Date().toISOString() })
                    .eq('id', enrollmentId);

                // Get enrollment details for certificate
                const { data: enrollment } = await supabase
                    .from('enrollments')
                    .select('user_id, hours_completed')
                    .eq('id', enrollmentId)
                    .single();

                if (enrollment) {
                    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                    let code = 'TFOC-';
                    for (let i = 0; i < 8; i++) {
                        code += chars.charAt(Math.floor(Math.random() * chars.length));
                    }

                    await supabase
                        .from('certificates')
                        .insert({
                            user_id: enrollment.user_id,
                            enrollment_id: enrollmentId,
                            verification_code: code,
                            issued_at: new Date().toISOString(),
                            hours_completed: enrollment.hours_completed,
                        });
                }
                break;
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const origin = request.nextUrl.origin;
        return NextResponse.redirect(`${origin}/admin/enrollments`, { status: 303 });
    } catch (err) {
        console.error('Enrollment action error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
