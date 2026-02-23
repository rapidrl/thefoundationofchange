'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * Invisible component that auto-detects the user's timezone
 * and saves it to their profile if not already set correctly.
 * Include this in the root layout or dashboard layout.
 */
export default function TimezoneDetector() {
    useEffect(() => {
        async function detectAndSave() {
            const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (!detectedTz) return;

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('timezone')
                .eq('id', user.id)
                .single();

            // Only update if changed
            if (profile && profile.timezone !== detectedTz) {
                await supabase
                    .from('profiles')
                    .update({ timezone: detectedTz })
                    .eq('id', user.id);
            }
        }

        detectAndSave();
    }, []);

    return null; // Renders nothing
}
