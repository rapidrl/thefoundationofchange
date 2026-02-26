import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const formData = await request.formData();
        const reflectionId = formData.get('reflectionId') as string;
        const action = formData.get('action') as string;

        if (!reflectionId || !action) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const newStatus = action === 'approve' ? 'approved' : action === 'flag' ? 'flagged' : null;

        if (!newStatus) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const { error } = await supabase
            .from('reflections')
            .update({ status: newStatus })
            .eq('id', reflectionId);

        if (error) {
            console.error('Failed to update reflection:', error);
            return NextResponse.json({ error: 'Failed to update reflection' }, { status: 500 });
        }

        // Redirect back to reflections page
        const origin = request.nextUrl.origin;
        return NextResponse.redirect(`${origin}/admin/reflections`, { status: 303 });
    } catch (err) {
        console.error('Reflection action error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
