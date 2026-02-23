import { requireAdmin } from '@/lib/admin';
import Link from 'next/link';
import styles from './admin.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Dashboard',
    description: 'Administrative dashboard for The Foundation of Change.',
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This will redirect non-admins
    const { profile } = await requireAdmin();

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>Admin Panel</h2>
                    <p>{profile.full_name}</p>
                </div>
                <nav className={styles.sidebarNav}>
                    <Link href="/admin" className={styles.navLink}>
                        <span className={styles.navIcon}>📊</span>
                        Overview
                    </Link>
                    <Link href="/admin/users" className={styles.navLink}>
                        <span className={styles.navIcon}>👥</span>
                        Users
                    </Link>
                    <Link href="/admin/enrollments" className={styles.navLink}>
                        <span className={styles.navIcon}>📋</span>
                        Enrollments
                    </Link>
                    <Link href="/admin/reflections" className={styles.navLink}>
                        <span className={styles.navIcon}>✍️</span>
                        Reflections
                    </Link>
                    <Link href="/admin/messages" className={styles.navLink}>
                        <span className={styles.navIcon}>💬</span>
                        Messages
                    </Link>
                </nav>
            </aside>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    );
}
