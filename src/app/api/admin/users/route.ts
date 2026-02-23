import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';

// PUT /api/admin/users — Update a user's profile
export async function PUT(req: NextRequest) {
    try {
        const { supabase } = await requireAdmin();
        const body = await req.json();
        const { userId, ...fields } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Only allow updating known profile fields
        const allowedFields = [
            'full_name', 'email', 'phone', 'date_of_birth', 'gender',
            'address', 'city', 'state', 'zip_code',
            'probation_officer', 'court_id', 'reason_for_service', 'role',
        ];

        const updateData: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (key in fields) {
                updateData[key] = fields[key] || null;
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { error } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

// POST /api/admin/users — Create enrollment for a user (admin grants hours)
export async function POST(req: NextRequest) {
    try {
        const { supabase } = await requireAdmin();
        const { userId, hoursRequired, notes } = await req.json();

        if (!userId || !hoursRequired) {
            return NextResponse.json({ error: 'userId and hoursRequired are required' }, { status: 400 });
        }

        // Check if user already has an active enrollment
        const { data: existing } = await supabase
            .from('enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .limit(1);

        if (existing && existing.length > 0) {
            return NextResponse.json({ error: 'User already has an active enrollment' }, { status: 409 });
        }

        // Create enrollment (admin-granted, no payment)
        const { data, error } = await supabase
            .from('enrollments')
            .insert({
                user_id: userId,
                hours_required: hoursRequired,
                hours_completed: 0,
                status: 'active',
                amount_paid: 0,
                start_date: new Date().toISOString().split('T')[0],
                notes: notes || 'Admin-granted enrollment',
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, enrollment: data });
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}

// PATCH /api/admin/users — Update enrollment (hours, status)
export async function PATCH(req: NextRequest) {
    try {
        const { supabase } = await requireAdmin();
        const { enrollmentId, hoursRequired, hoursCompleted, status } = await req.json();

        if (!enrollmentId) {
            return NextResponse.json({ error: 'enrollmentId is required' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (hoursRequired !== undefined) updateData.hours_required = hoursRequired;
        if (hoursCompleted !== undefined) updateData.hours_completed = hoursCompleted;
        if (status) updateData.status = status;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        const { error } = await supabase
            .from('enrollments')
            .update(updateData)
            .eq('id', enrollmentId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}
