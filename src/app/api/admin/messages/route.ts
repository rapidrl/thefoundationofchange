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
        const messageId = formData.get('messageId') as string;
        const action = formData.get('action') as string;

        if (!messageId || !action) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        if (!['replied', 'closed'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const { error } = await supabase
            .from('contact_submissions')
            .update({ status: action })
            .eq('id', messageId);

        if (error) {
            console.error('Failed to update message:', error);
            return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
        }

        const origin = request.nextUrl.origin;
        return NextResponse.redirect(`${origin}/admin/messages`, { status: 303 });
    } catch (err) {
        console.error('Message action error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
