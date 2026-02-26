import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

function generateVerificationCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TFOC-';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

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
        .select('id, hours_completed, hours_required, status')
        .eq('id', enrollmentId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

    if (!enrollment) {
        return NextResponse.json({ error: 'No active enrollment found' }, { status: 404 });
    }

    // Get article details (title + estimated reading time)
    const { data: article } = await supabase
        .from('articles')
        .select('title, estimated_minutes')
        .eq('id', articleId)
        .single();

    const articleMinutes = Number(article?.estimated_minutes) || 0;

    // Upsert reflection (one per article per enrollment)
    const { data, error } = await supabase
        .from('reflections')
        .upsert({
            user_id: user.id,
            enrollment_id: enrollmentId,
            article_id: articleId,
            article_title: article?.title || 'Unknown Article',
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

    // ── Credit article's estimated reading time to enrollment hours ──
    // Use service-role client to bypass RLS
    const serviceClient = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if we already credited time for this article (to avoid double-crediting on re-submit)
    const { data: existingLog } = await serviceClient
        .from('hour_logs')
        .select('id')
        .eq('enrollment_id', enrollmentId)
        .eq('user_id', user.id)
        .eq('log_date', `article-${articleId}`)
        .single();

    let addedHours = 0;

    if (!existingLog && articleMinutes > 0) {
        // Credit the article's estimated time
        addedHours = Math.round((articleMinutes / 60) * 100) / 100;

        // Insert an hour log entry tagged to this article
        await serviceClient
            .from('hour_logs')
            .insert({
                enrollment_id: enrollmentId,
                user_id: user.id,
                log_date: `article-${articleId}`,
                hours: addedHours,
                minutes: articleMinutes,
            });
    }

    // Update enrollment hours_completed
    const currentHours = Number(enrollment.hours_completed) || 0;
    const newTotal = Math.round((currentHours + addedHours) * 100) / 100;
    const hoursRequired = Number(enrollment.hours_required) || 0;
    const isNowComplete = newTotal >= hoursRequired && hoursRequired > 0;

    if (isNowComplete) {
        // Auto-complete enrollment + generate certificate
        await serviceClient
            .from('enrollments')
            .update({
                hours_completed: newTotal,
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', enrollmentId);

        const verificationCode = generateVerificationCode();
        await serviceClient
            .from('certificates')
            .insert({
                user_id: user.id,
                enrollment_id: enrollmentId,
                verification_code: verificationCode,
                issued_at: new Date().toISOString(),
                hours_completed: newTotal,
            });

        return NextResponse.json({
            success: true,
            reflection: data,
            enrollmentCompleted: true,
            verificationCode,
            totalHours: newTotal,
            addedHours,
        });
    } else {
        // Just update hours
        await serviceClient
            .from('enrollments')
            .update({ hours_completed: newTotal })
            .eq('id', enrollmentId);

        return NextResponse.json({
            success: true,
            reflection: data,
            enrollmentCompleted: false,
            totalHours: newTotal,
            addedHours,
        });
    }
}
