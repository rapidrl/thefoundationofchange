import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CourseworkClient from './CourseworkClient';
import styles from './page.module.css';

export const metadata = {
    title: 'Coursework | The Foundation of Change',
};

export default async function CourseworkPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Get active enrollment
    const { data: enrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

    if (!enrollment) {
        return (
            <div className={styles.noEnrollment}>
                <h1>No Active Enrollment</h1>
                <p>You need an active enrollment to access coursework.</p>
                <a href="/start-now" className="btn btn-cta">Choose a Program</a>
            </div>
        );
    }

    // Get all courses with articles
    const { data: courses } = await supabase
        .from('courses')
        .select(`
      *,
      articles (*)
    `)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    // Sort articles within each course
    const sortedCourses = (courses || []).map((course) => ({
        ...course,
        articles: (course.articles || []).sort(
            (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
        ),
    }));

    // Get user's progress
    const { data: progress } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('enrollment_id', enrollment.id);

    // Get user's reflections
    const { data: reflections } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id)
        .eq('enrollment_id', enrollment.id);

    // Get today's hours
    const today = new Date().toISOString().split('T')[0];
    const { data: todayLog } = await supabase
        .from('hour_logs')
        .select('hours')
        .eq('enrollment_id', enrollment.id)
        .eq('log_date', today)
        .single();

    return (
        <CourseworkClient
            enrollment={enrollment}
            courses={sortedCourses}
            progress={progress || []}
            reflections={reflections || []}
            dailyHours={todayLog?.hours || 0}
        />
    );
}
