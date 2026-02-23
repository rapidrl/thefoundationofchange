import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function POST(request: Request) {
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

        await supabase
            .from('contact_submissions')
            .update({ status: action })
            .eq('id', messageId);
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    redirect('/admin/messages');
}
