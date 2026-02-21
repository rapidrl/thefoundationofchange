import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: Generate certificate view page data
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const supabase = await createClient();

    const { data: certificate } = await supabase
        .from('certificates')
        .select(`
      *,
      profiles:user_id (full_name, email),
      enrollments:enrollment_id (hours_required, hours_completed, start_date, completed_at)
    `)
        .eq('verification_code', code)
        .single();

    if (!certificate) {
        return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json({ certificate });
}
