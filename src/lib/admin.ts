import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Server-side helper: verifies the current user has admin role.
 * Redirects non-admins to /dashboard, unauthenticated users to /login.
 * Returns the admin profile on success.
 */
export async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        redirect('/dashboard');
    }

    return { profile, supabase };
}
