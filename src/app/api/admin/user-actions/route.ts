import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';

// POST /api/admin/user-actions — Perform admin actions on user accounts
export async function POST(req: NextRequest) {
    try {
        const { supabase } = await requireAdmin();
        const body = await req.json();
        const { action, userId, enrollmentId, hourLogId, certificateId, ...extra } = body;

        if (!action) {
            return NextResponse.json({ error: 'action is required' }, { status: 400 });
        }

        switch (action) {
            // ===============================
            // ACCOUNT-LEVEL ACTIONS
            // ===============================
            case 'send_password_reset': {
                if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

                // Get user email from profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('id', userId)
                    .single();

                if (!profile?.email) {
                    return NextResponse.json({ error: 'User email not found' }, { status: 404 });
                }

                // supabase from requireAdmin() is already service-role
                const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://app.thefoundationofchange.org'}/reset-password`,
                });

                if (error) return NextResponse.json({ error: error.message }, { status: 500 });
                return NextResponse.json({ success: true, message: `Password reset email sent to ${profile.email}` });
            }

            case 'suspend_account': {
                if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

                // Update profile status
                const { error: profileErr } = await supabase
                    .from('profiles')
                    .update({ account_status: 'suspended', suspended_at: new Date().toISOString() })
                    .eq('id', userId);

                if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

                // Also suspend all active enrollments
                await supabase
                    .from('enrollments')
                    .update({ status: 'suspended' })
                    .eq('user_id', userId)
                    .eq('status', 'active');

                return NextResponse.json({ success: true, message: 'Account suspended' });
            }

            case 'reactivate_account': {
                if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

                const { error: profileErr } = await supabase
                    .from('profiles')
                    .update({ account_status: 'active', suspended_at: null })
                    .eq('id', userId);

                if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

                // Reactivate suspended enrollments
                await supabase
                    .from('enrollments')
                    .update({ status: 'active' })
                    .eq('user_id', userId)
                    .eq('status', 'suspended');

                return NextResponse.json({ success: true, message: 'Account reactivated' });
            }

            // ===============================
            // ENROLLMENT ACTIONS
            // ===============================
            case 'force_complete': {
                if (!enrollmentId) return NextResponse.json({ error: 'enrollmentId required' }, { status: 400 });

                // Get enrollment
                const { data: enrollment } = await supabase
                    .from('enrollments')
                    .select('*')
                    .eq('id', enrollmentId)
                    .single();

                if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });

                // Mark completed, set hours_completed = hours_required
                await supabase
                    .from('enrollments')
                    .update({
                        status: 'completed',
                        hours_completed: enrollment.hours_required,
                        completed_at: new Date().toISOString(),
                    })
                    .eq('id', enrollmentId);

                // Generate certificate
                const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                const code = `TFOC-${segment()}-${segment()}`;

                // Check if cert already exists
                const { data: existingCert } = await supabase
                    .from('certificates')
                    .select('id')
                    .eq('enrollment_id', enrollmentId)
                    .single();

                if (!existingCert) {
                    await supabase
                        .from('certificates')
                        .insert({
                            user_id: enrollment.user_id,
                            enrollment_id: enrollmentId,
                            verification_code: code,
                            issued_at: new Date().toISOString(),
                            hours_completed: enrollment.hours_required,
                        });
                }

                return NextResponse.json({ success: true, message: 'Enrollment force-completed with certificate', verificationCode: code });
            }

            case 'reset_hours': {
                if (!enrollmentId) return NextResponse.json({ error: 'enrollmentId required' }, { status: 400 });

                // Reset enrollment hours
                await supabase
                    .from('enrollments')
                    .update({ hours_completed: 0, status: 'active', completed_at: null })
                    .eq('id', enrollmentId);

                // Get enrollment to find user_id
                const { data: enr } = await supabase
                    .from('enrollments')
                    .select('user_id')
                    .eq('id', enrollmentId)
                    .single();

                // Delete hour logs for this enrollment
                await supabase
                    .from('hour_logs')
                    .delete()
                    .eq('enrollment_id', enrollmentId);

                // Delete certificate if exists
                await supabase
                    .from('certificates')
                    .delete()
                    .eq('enrollment_id', enrollmentId);

                return NextResponse.json({ success: true, message: 'Hours reset to 0, all logs cleared' });
            }

            case 'delete_enrollment': {
                if (!enrollmentId) return NextResponse.json({ error: 'enrollmentId required' }, { status: 400 });

                // Cascade delete: certificates, hour_logs, then enrollment
                await supabase.from('certificates').delete().eq('enrollment_id', enrollmentId);
                await supabase.from('hour_logs').delete().eq('enrollment_id', enrollmentId);
                await supabase.from('enrollments').delete().eq('id', enrollmentId);

                return NextResponse.json({ success: true, message: 'Enrollment deleted' });
            }

            case 'refund_enrollment': {
                if (!enrollmentId) return NextResponse.json({ error: 'enrollmentId required' }, { status: 400 });

                await supabase
                    .from('enrollments')
                    .update({ status: 'refunded' })
                    .eq('id', enrollmentId);

                return NextResponse.json({ success: true, message: 'Enrollment marked as refunded' });
            }

            // ===============================
            // HOUR LOG ACTIONS
            // ===============================
            case 'add_hour_log': {
                if (!enrollmentId) return NextResponse.json({ error: 'enrollmentId required' }, { status: 400 });
                const { logDate, hours } = extra;
                if (!logDate || hours === undefined) {
                    return NextResponse.json({ error: 'logDate and hours are required' }, { status: 400 });
                }

                // Get enrollment user_id
                const { data: enrl } = await supabase
                    .from('enrollments')
                    .select('user_id')
                    .eq('id', enrollmentId)
                    .single();

                if (!enrl) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });

                const h = Number(hours);
                await supabase.from('hour_logs').insert({
                    enrollment_id: enrollmentId,
                    user_id: enrl.user_id,
                    log_date: logDate,
                    hours: h,
                    minutes: Math.round(h * 60),
                });

                // Update enrollment total
                const { data: allLogs } = await supabase
                    .from('hour_logs')
                    .select('hours')
                    .eq('enrollment_id', enrollmentId);

                const total = (allLogs || []).reduce((sum, l) => sum + (Number(l.hours) || 0), 0);
                await supabase
                    .from('enrollments')
                    .update({ hours_completed: Math.round(total * 100) / 100 })
                    .eq('id', enrollmentId);

                return NextResponse.json({ success: true, message: `Added ${h}h on ${logDate}`, newTotal: total });
            }

            case 'edit_hour_log': {
                if (!hourLogId) return NextResponse.json({ error: 'hourLogId required' }, { status: 400 });
                const { hours: editHours, logDate: editDate } = extra;

                const updates: Record<string, unknown> = {};
                if (editHours !== undefined) {
                    updates.hours = Number(editHours);
                    updates.minutes = Math.round(Number(editHours) * 60);
                }
                if (editDate) updates.log_date = editDate;

                if (Object.keys(updates).length === 0) {
                    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
                }

                // Get enrollment_id from hour log
                const { data: logEntry } = await supabase
                    .from('hour_logs')
                    .select('enrollment_id')
                    .eq('id', hourLogId)
                    .single();

                await supabase.from('hour_logs').update(updates).eq('id', hourLogId);

                // Recalculate enrollment total
                if (logEntry) {
                    const { data: allLogs } = await supabase
                        .from('hour_logs')
                        .select('hours')
                        .eq('enrollment_id', logEntry.enrollment_id);

                    const total = (allLogs || []).reduce((sum, l) => sum + (Number(l.hours) || 0), 0);
                    await supabase
                        .from('enrollments')
                        .update({ hours_completed: Math.round(total * 100) / 100 })
                        .eq('id', logEntry.enrollment_id);
                }

                return NextResponse.json({ success: true, message: 'Hour log updated' });
            }

            case 'delete_hour_log': {
                if (!hourLogId) return NextResponse.json({ error: 'hourLogId required' }, { status: 400 });

                // Get enrollment_id before deleting
                const { data: logToDelete } = await supabase
                    .from('hour_logs')
                    .select('enrollment_id')
                    .eq('id', hourLogId)
                    .single();

                await supabase.from('hour_logs').delete().eq('id', hourLogId);

                // Recalculate enrollment total
                if (logToDelete) {
                    const { data: remainingLogs } = await supabase
                        .from('hour_logs')
                        .select('hours')
                        .eq('enrollment_id', logToDelete.enrollment_id);

                    const total = (remainingLogs || []).reduce((sum, l) => sum + (Number(l.hours) || 0), 0);
                    await supabase
                        .from('enrollments')
                        .update({ hours_completed: Math.round(total * 100) / 100 })
                        .eq('id', logToDelete.enrollment_id);
                }

                return NextResponse.json({ success: true, message: 'Hour log entry deleted' });
            }

            // ===============================
            // CERTIFICATE ACTIONS
            // ===============================
            case 'regenerate_certificate': {
                if (!enrollmentId) return NextResponse.json({ error: 'enrollmentId required' }, { status: 400 });

                // Delete existing certificate
                await supabase.from('certificates').delete().eq('enrollment_id', enrollmentId);

                // Get enrollment
                const { data: enrlForCert } = await supabase
                    .from('enrollments')
                    .select('user_id, hours_completed')
                    .eq('id', enrollmentId)
                    .single();

                if (!enrlForCert) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });

                // Generate new code
                const chars2 = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                const seg = () => Array.from({ length: 4 }, () => chars2[Math.floor(Math.random() * chars2.length)]).join('');
                const newCode = `TFOC-${seg()}-${seg()}`;

                await supabase.from('certificates').insert({
                    user_id: enrlForCert.user_id,
                    enrollment_id: enrollmentId,
                    verification_code: newCode,
                    issued_at: new Date().toISOString(),
                    hours_completed: enrlForCert.hours_completed,
                });

                return NextResponse.json({ success: true, message: `New certificate issued: ${newCode}`, verificationCode: newCode });
            }

            case 'revoke_certificate': {
                if (!certificateId) return NextResponse.json({ error: 'certificateId required' }, { status: 400 });
                await supabase.from('certificates').delete().eq('id', certificateId);
                return NextResponse.json({ success: true, message: 'Certificate revoked' });
            }

            default:
                return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
        }
    } catch (err: unknown) {
        console.error('Admin user-actions error:', err);
        const message = err instanceof Error ? err.message : 'Server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
