import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Submit a reflection for an article
export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { enrollmentId, articleId, responseText } = body;

    if (!enrollmentId || !articleId || !responseText?.trim()) {
        return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (responseText.trim().length < 50) {
        return NextResponse.json({ error: 'Response must be at least 50 characters' }, { status: 400 });
    }

    // Check enrollment
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('id', enrollmentId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

    if (!enrollment) {
        return NextResponse.json({ error: 'No active enrollment found' }, { status: 404 });
    }

    // Upsert reflection (one per article per enrollment)
    const { data, error } = await supabase
        .from('reflections')
        .upsert({
            user_id: user.id,
            enrollment_id: enrollmentId,
            article_id: articleId,
            response_text: responseText.trim(),
            status: 'approved',
            submitted_at: new Date().toISOString(),
        }, { onConflict: 'user_id,enrollment_id,article_id' })
        .select()
        .single();

    if (error) {
        console.error('Reflection error:', error);
        return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 });
    }

    // Mark article as completed in progress
    await supabase
        .from('course_progress')
        .upsert({
            user_id: user.id,
            enrollment_id: enrollmentId,
            article_id: articleId,
            completed_at: new Date().toISOString(),
        }, { onConflict: 'user_id,enrollment_id,article_id' });

    return NextResponse.json({ success: true, reflection: data });
}
