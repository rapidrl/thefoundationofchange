import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

function generateVerificationCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'TFOC-';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { articleId, enrollmentId, responseText } = await request.json();

        if (!articleId || !enrollmentId || !responseText) {
            return NextResponse.json(
                { error: 'articleId, enrollmentId, and responseText are required' },
                { status: 400 }
            );
        }

        if (responseText.trim().length < 80) {
            return NextResponse.json(
                { error: 'Please write a more detailed reflection (at least 80 characters).' },
                { status: 400 }
            );
        }

        // Get article title
        const { data: article } = await supabase
            .from('articles')
            .select('title')
            .eq('id', articleId)
            .single();

        // Insert reflection
        const { error: reflectionError } = await supabase
            .from('reflections')
            .insert({
                user_id: user.id,
                enrollment_id: enrollmentId,
                article_title: article?.title || 'Unknown Article',
                response_text: responseText.trim(),
                status: 'pending',
            });

        if (reflectionError) {
            console.error('Reflection save error:', reflectionError);
            return NextResponse.json({ error: 'Failed to save reflection' }, { status: 500 });
        }

        // Mark article as completed
        await supabase
            .from('article_progress')
            .upsert({
                user_id: user.id,
                enrollment_id: enrollmentId,
                article_id: articleId,
                status: 'completed',
                completed_at: new Date().toISOString(),
            }, {
                onConflict: 'enrollment_id,article_id',
            });

        // ── Update enrollment hours ──
        const { data: allProgress } = await supabase
            .from('article_progress')
            .select('seconds_spent')
            .eq('enrollment_id', enrollmentId)
            .eq('status', 'completed');

        const totalSeconds = (allProgress || []).reduce(
            (sum, p) => sum + (Number(p.seconds_spent) || 0),
            0
        );
        const totalHours = Math.round((totalSeconds / 3600) * 100) / 100;

        // Get enrollment to check if completed
        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('hours_required, status')
            .eq('id', enrollmentId)
            .single();

        const hoursRequired = Number(enrollment?.hours_required) || 0;
        const isNowComplete = totalHours >= hoursRequired && hoursRequired > 0;

        if (isNowComplete && enrollment?.status === 'active') {
            // ── Auto-complete enrollment ──
            // Use service-role client to bypass RLS for enrollment updates
            const serviceClient = createServiceClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            await serviceClient
                .from('enrollments')
                .update({
                    hours_completed: totalHours,
                    status: 'completed',
                    completed_at: new Date().toISOString(),
                })
                .eq('id', enrollmentId);

            // ── Auto-generate certificate ──
            const verificationCode = generateVerificationCode();
            await serviceClient
                .from('certificates')
                .insert({
                    user_id: user.id,
                    enrollment_id: enrollmentId,
                    verification_code: verificationCode,
                    issued_at: new Date().toISOString(),
                    hours_completed: totalHours,
                });

            return NextResponse.json({
                success: true,
                enrollmentCompleted: true,
                verificationCode,
                totalHours,
            });
        } else {
            // Just update hours
            const serviceClient = createServiceClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            await serviceClient
                .from('enrollments')
                .update({ hours_completed: totalHours })
                .eq('id', enrollmentId);

            return NextResponse.json({
                success: true,
                enrollmentCompleted: false,
                totalHours,
            });
        }
    } catch {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
