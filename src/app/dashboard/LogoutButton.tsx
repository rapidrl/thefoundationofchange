'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './page.module.css';

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <button onClick={handleLogout} className={styles.logoutBtn}>
            Sign Out
        </button>
    );
}
