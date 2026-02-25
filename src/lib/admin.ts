import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

/**
 * Server-side helper: verifies the current user has admin role.
 * Redirects non-admins to /dashboard, unauthenticated users to /login.
 * Returns:
 *   - profile: the admin's profile
 *   - supabase: SERVICE ROLE client (bypasses RLS for admin operations)
 */
export async function requireAdmin() {
    // Use the user-scoped client to verify auth + admin role
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile } = await authClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        redirect('/dashboard');
    }

    // Return a service-role client that bypasses RLS for admin data operations
    const supabase = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    return { profile, supabase };
}
