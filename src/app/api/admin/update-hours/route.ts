import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';

export async function POST(request: NextRequest) {
    try {
        const { supabase } = await requireAdmin();

        const body = await request.json();
        const { enrollmentId, newHours } = body;

        if (!enrollmentId || newHours === undefined || newHours < 0) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        // Get enrollment to check required hours
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('hours_required')
            .eq('id', enrollmentId)
            .single();

        if (!enrollment) {
            return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
        }

        const isCompleted = newHours >= enrollment.hours_required;

        const { error } = await supabase
            .from('enrollments')
            .update({
                hours_completed: newHours,
                status: isCompleted ? 'completed' : 'active',
                completed_at: isCompleted ? new Date().toISOString() : null,
            })
            .eq('id', enrollmentId);

        if (error) {
            return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
        }

        return NextResponse.json({ success: true, newHours, isCompleted });
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
