import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import ArticleReader from '@/components/coursework/ArticleReader';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Reading Article — The Foundation of Change',
};

interface PageProps {
    params: Promise<{ articleId: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
    const { articleId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Get article
    const { data: article } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

    if (!article) notFound();

    // Get active enrollment
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('id, status')
        .eq('user_id', user.id)
        .in('status', ['active', 'suspended'])
        .limit(1);

    if (!enrollments?.[0]) redirect('/coursework');

    // If suspended, redirect to coursework page (which shows suspension banner)
    if (enrollments[0].status === 'suspended') redirect('/coursework');

    return (
        <ArticleReader
            article={{
                id: article.id,
                title: article.title,
                body: article.body,
                estimated_minutes: article.estimated_minutes,
                course_id: article.course_id,
            }}
            enrollmentId={enrollments[0].id}
        />
    );
}
