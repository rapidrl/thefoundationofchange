import { requireAdmin } from '@/lib/admin';
import AdminOverview from './AdminOverview';

export default async function AdminOverviewPage() {
    const { supabase } = await requireAdmin();

    // Fetch all data needed for the dashboard
    const [
        { count: totalUsers },
        { data: enrollments },
        { data: hourLogs },
        { count: totalReflections },
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'participant'),
        supabase.from('enrollments').select('id, status, amount_paid, hours_completed, hours_required, created_at, profiles(full_name, email)').order('created_at', { ascending: false }),
        supabase.from('hour_logs').select('hours, minutes, log_date').order('log_date', { ascending: false }),
        supabase.from('reflections').select('*', { count: 'exact', head: true }),
    ]);

    return (
        <AdminOverview
            totalUsers={totalUsers ?? 0}
            totalReflections={totalReflections ?? 0}
            enrollments={(enrollments || []).map((e: Record<string, unknown>) => ({
                id: e.id as string,
                status: e.status as string,
                amount_paid: Number(e.amount_paid) || 0,
                hours_completed: Number(e.hours_completed) || 0,
                hours_required: Number(e.hours_required) || 0,
                created_at: e.created_at as string,
                profile: e.profiles as { full_name: string; email: string } | null,
            }))}
            hourLogs={(hourLogs || []).map((l: Record<string, unknown>) => ({
                hours: Number(l.hours) || 0,
                minutes: Number(l.minutes) || 0,
                log_date: l.log_date as string,
            }))}
        />
    );
}
