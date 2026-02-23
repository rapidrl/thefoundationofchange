import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import ReflectionForm from '@/components/coursework/ReflectionForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reflection — The Foundation of Change',
};

interface PageProps {
    params: Promise<{ articleId: string }>;
}

export default async function ReflectPage({ params }: PageProps) {
    const { articleId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Get article
    const { data: article } = await supabase
        .from('articles')
        .select('id, title, course_id, sort_order, estimated_minutes')
        .eq('id', articleId)
        .single();

    if (!article) notFound();

    // Get active enrollment
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

    if (!enrollments?.[0]) redirect('/coursework');

    // Find next article
    const { data: nextArticle } = await supabase
        .from('articles')
        .select('id')
        .eq('course_id', article.course_id)
        .gt('sort_order', article.sort_order)
        .order('sort_order', { ascending: true })
        .limit(1)
        .single();

    return (
        <ReflectionForm
            articleId={article.id}
            articleTitle={article.title}
            enrollmentId={enrollments[0].id}
            nextArticleId={nextArticle?.id || null}
            estimatedMinutes={article.estimated_minutes || 60}
        />
    );
}
