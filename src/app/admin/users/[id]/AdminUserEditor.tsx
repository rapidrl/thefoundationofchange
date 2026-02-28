'use client';

import { useState } from 'react';
import styles from '../../admin.module.css';

interface Profile {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    gender: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    probation_officer: string;
    court_id: string;
    reason_for_service: string;
    role: string;
    account_status?: string;
}

interface Enrollment {
    id: string;
    hours_required: number;
    hours_completed: number;
    status: string;
    amount_paid: number;
    start_date: string;
}

interface HourLog {
    id: string;
    enrollment_id: string;
    log_date: string;
    hours: number;
    minutes: number;
}

interface Certificate {
    id: string;
    enrollment_id: string;
    verification_code: string;
    issued_at: string;
}

interface Props {
    profile: Profile;
    enrollments: Enrollment[];
    hourLogs: HourLog[];
    certificates: Certificate[];
}

// Reusable action button
function ActionBtn({ onClick, label, color, disabled, small }: {
    onClick: () => void; label: string; color: string; disabled?: boolean; small?: boolean;
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: small ? '3px 8px' : '6px 14px',
                background: disabled ? '#ccc' : color,
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: small ? '11px' : 'var(--text-xs)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                whiteSpace: 'nowrap' as const,
            }}
        >
            {label}
        </button>
    );
}

export default function AdminUserEditor({ profile: initial, enrollments: initialEnrollments, hourLogs: initialHourLogs, certificates: initialCerts }: Props) {
    const [profile, setProfile] = useState(initial);
    const [enrollments, setEnrollments] = useState(initialEnrollments);
    const [hourLogs, setHourLogs] = useState(initialHourLogs);
    const [certificates, setCertificates] = useState(initialCerts);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [msgType, setMsgType] = useState<'success' | 'error'>('success');
    const [busy, setBusy] = useState('');

    // New enrollment form
    const [showNewEnrollment, setShowNewEnrollment] = useState(false);
    const [newHours, setNewHours] = useState(40);
    const [newNotes, setNewNotes] = useState('');

    // Add hour log form
    const [showAddHourLog, setShowAddHourLog] = useState(false);
    const [addLogEnrollmentId, setAddLogEnrollmentId] = useState('');
    const [addLogDate, setAddLogDate] = useState(new Date().toISOString().split('T')[0]);
    const [addLogHours, setAddLogHours] = useState(1);

    const showMsg = (text: string, type: 'success' | 'error') => {
        setMessage(text);
        setMsgType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    // ---- API helpers ----
    const apiCall = async (url: string, method: string, body: Record<string, unknown>) => {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Request failed');
        return data;
    };

    const userAction = async (body: Record<string, unknown>, busyKey: string) => {
        setBusy(busyKey);
        try {
            const data = await apiCall('/api/admin/user-actions', 'POST', body);
            showMsg(data.message || 'Action completed', 'success');
            return data;
        } catch (err: unknown) {
            showMsg((err as Error).message, 'error');
            return null;
        } finally {
            setBusy('');
        }
    };

    // ---- Profile handlers ----
    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await apiCall('/api/admin/users', 'PUT', { userId: profile.id, ...profile });
            showMsg('Profile saved', 'success');
            setEditing(false);
        } catch (err: unknown) {
            showMsg((err as Error).message, 'error');
        }
        setSaving(false);
    };

    // ---- Enrollment handlers ----
    const handleCreateEnrollment = async () => {
        setBusy('createEnrollment');
        try {
            const data = await apiCall('/api/admin/users', 'POST', {
                userId: profile.id, hoursRequired: newHours, notes: newNotes,
            });
            setEnrollments([data.enrollment, ...enrollments]);
            setShowNewEnrollment(false);
            setNewHours(40);
            setNewNotes('');
            showMsg('Enrollment created', 'success');
        } catch (err: unknown) {
            showMsg((err as Error).message, 'error');
        }
        setBusy('');
    };

    const handleUpdateEnrollment = async (enrollmentId: string, updates: Record<string, unknown>) => {
        try {
            await apiCall('/api/admin/users', 'PATCH', { enrollmentId, ...updates });
            setEnrollments(enrollments.map(e => e.id === enrollmentId ? { ...e, ...updates } as Enrollment : e));
            showMsg('Enrollment updated', 'success');
        } catch (err: unknown) {
            showMsg((err as Error).message, 'error');
        }
    };

    const handleForceComplete = async (enrollmentId: string) => {
        if (!confirm('Force-complete this enrollment? This will generate a certificate.')) return;
        const data = await userAction({ action: 'force_complete', enrollmentId }, `fc-${enrollmentId}`);
        if (data) {
            setEnrollments(enrollments.map(e => e.id === enrollmentId ? { ...e, status: 'completed', hours_completed: e.hours_required } : e));
            // Reload page to see new certificate
            window.location.reload();
        }
    };

    const handleResetHours = async (enrollmentId: string) => {
        if (!confirm('Reset ALL hours and clear ALL logs for this enrollment? This cannot be undone.')) return;
        const data = await userAction({ action: 'reset_hours', enrollmentId }, `rh-${enrollmentId}`);
        if (data) {
            setEnrollments(enrollments.map(e => e.id === enrollmentId ? { ...e, hours_completed: 0, status: 'active' } : e));
            setHourLogs(hourLogs.filter(l => l.enrollment_id !== enrollmentId));
            setCertificates(certificates.filter(c => c.enrollment_id !== enrollmentId));
        }
    };

    const handleDeleteEnrollment = async (enrollmentId: string) => {
        if (!confirm('DELETE this enrollment permanently? All associated data (hour logs, certificates, progress) will be removed.')) return;
        const data = await userAction({ action: 'delete_enrollment', enrollmentId }, `de-${enrollmentId}`);
        if (data) {
            setEnrollments(enrollments.filter(e => e.id !== enrollmentId));
            setHourLogs(hourLogs.filter(l => l.enrollment_id !== enrollmentId));
            setCertificates(certificates.filter(c => c.enrollment_id !== enrollmentId));
        }
    };

    const handleRefund = async (enrollmentId: string) => {
        if (!confirm('Mark this enrollment as refunded?')) return;
        const data = await userAction({ action: 'refund_enrollment', enrollmentId }, `rf-${enrollmentId}`);
        if (data) setEnrollments(enrollments.map(e => e.id === enrollmentId ? { ...e, status: 'refunded' } : e));
    };

    // ---- Hour Log handlers ----
    const handleAddHourLog = async () => {
        if (!addLogEnrollmentId) { showMsg('Select an enrollment', 'error'); return; }
        const data = await userAction({
            action: 'add_hour_log', enrollmentId: addLogEnrollmentId,
            logDate: addLogDate, hours: addLogHours,
        }, 'addLog');
        if (data) {
            setShowAddHourLog(false);
            window.location.reload(); // Refresh to get new log entry with ID
        }
    };

    const handleDeleteHourLog = async (logId: string) => {
        if (!confirm('Delete this hour log entry?')) return;
        const data = await userAction({ action: 'delete_hour_log', hourLogId: logId }, `dl-${logId}`);
        if (data) {
            setHourLogs(hourLogs.filter(l => l.id !== logId));
        }
    };

    // ---- Certificate handlers ----
    const handleRegenerateCert = async (enrollmentId: string) => {
        if (!confirm('Regenerate certificate with a new verification code? The old code will stop working.')) return;
        const data = await userAction({ action: 'regenerate_certificate', enrollmentId }, `rc-${enrollmentId}`);
        if (data) window.location.reload();
    };

    const handleRevokeCert = async (certId: string) => {
        if (!confirm('Revoke this certificate? It will no longer be verifiable.')) return;
        const data = await userAction({ action: 'revoke_certificate', certificateId: certId }, `rv-${certId}`);
        if (data) setCertificates(certificates.filter(c => c.id !== certId));
    };

    // ---- Account actions ----
    const handlePasswordReset = async () => {
        if (!confirm(`Send password reset email to ${profile.email}?`)) return;
        await userAction({ action: 'send_password_reset', userId: profile.id }, 'pwreset');
    };

    const handleSuspendAccount = async () => {
        if (!confirm('Suspend this account? All active enrollments will be paused.')) return;
        const data = await userAction({ action: 'suspend_account', userId: profile.id }, 'suspend');
        if (data) {
            setProfile({ ...profile, account_status: 'suspended' });
            setEnrollments(enrollments.map(e => e.status === 'active' ? { ...e, status: 'suspended' } : e));
        }
    };

    const handleReactivateAccount = async () => {
        const data = await userAction({ action: 'reactivate_account', userId: profile.id }, 'reactivate');
        if (data) {
            setProfile({ ...profile, account_status: 'active' });
            setEnrollments(enrollments.map(e => e.status === 'suspended' ? { ...e, status: 'active' } : e));
        }
    };

    // ---- Render helpers ----
    const field = (label: string, key: keyof Profile, type = 'text') => (
        <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{label}</span>
            {editing ? (
                <input
                    type={type}
                    value={profile[key] || ''}
                    onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                    style={{
                        flex: 1, padding: '6px 10px', border: '1px solid var(--color-gray-300)',
                        borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-body)',
                    }}
                />
            ) : (
                <span className={styles.detailValue}>{profile[key] || '—'}</span>
            )}
        </div>
    );

    const selectField = (label: string, key: keyof Profile, options: { value: string; label: string }[]) => (
        <div className={styles.detailRow}>
            <span className={styles.detailLabel}>{label}</span>
            {editing ? (
                <select
                    value={profile[key] || ''}
                    onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                    style={{
                        flex: 1, padding: '6px 10px', border: '1px solid var(--color-gray-300)',
                        borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
                        fontFamily: 'var(--font-body)',
                    }}
                >
                    <option value="">—</option>
                    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
            ) : (
                <span className={styles.detailValue}>{profile[key] || '—'}</span>
            )}
        </div>
    );

    const isSuspended = profile.account_status === 'suspended';

    const statusColor = (s: string) =>
        s === 'active' ? '#059669' : s === 'completed' ? '#2563eb' :
            s === 'suspended' ? '#dc2626' : s === 'refunded' ? '#9333ea' : '#6b7280';

    const statusBg = (s: string) =>
        s === 'active' ? '#ecfdf5' : s === 'completed' ? '#eff6ff' :
            s === 'suspended' ? '#fef2f2' : s === 'refunded' ? '#faf5ff' : '#f9fafb';

    return (
        <>
            {/* Status Message */}
            {message && (
                <div style={{
                    padding: 'var(--space-3) var(--space-5)',
                    background: msgType === 'success' ? '#ecfdf5' : '#fef2f2',
                    border: `1px solid ${msgType === 'success' ? '#a7f3d0' : '#fecaca'}`,
                    borderRadius: 'var(--radius-lg)',
                    color: msgType === 'success' ? '#059669' : '#dc2626',
                    fontWeight: 600, fontSize: 'var(--text-sm)',
                    marginBottom: 'var(--space-4)',
                }}>
                    {message}
                </div>
            )}

            {/* ========== ACCOUNT ACTIONS TOOLBAR ========== */}
            <div className={styles.detailCard} style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <h3 style={{ margin: 0 }}>⚡ Account Actions</h3>
                        {isSuspended && (
                            <span style={{
                                padding: '2px 10px', borderRadius: '9999px', fontSize: '11px',
                                fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                            }}>
                                ⛔ SUSPENDED
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <ActionBtn
                            onClick={handlePasswordReset}
                            label={busy === 'pwreset' ? 'Sending...' : '🔑 Send Password Reset'}
                            color="#6366f1"
                            disabled={busy === 'pwreset'}
                        />
                        {isSuspended ? (
                            <ActionBtn
                                onClick={handleReactivateAccount}
                                label={busy === 'reactivate' ? 'Reactivating...' : '✅ Reactivate Account'}
                                color="#059669"
                                disabled={busy === 'reactivate'}
                            />
                        ) : (
                            <ActionBtn
                                onClick={handleSuspendAccount}
                                label={busy === 'suspend' ? 'Suspending...' : '🚫 Suspend Account'}
                                color="#dc2626"
                                disabled={busy === 'suspend'}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* ========== PROFILE CARD ========== */}
            <div className={styles.detailCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h3>👤 Profile Information</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {editing ? (
                            <>
                                <ActionBtn onClick={handleSaveProfile} label={saving ? 'Saving...' : '✓ Save'} color="#059669" disabled={saving} />
                                <ActionBtn onClick={() => { setProfile(initial); setEditing(false); }} label="Cancel" color="#6b7280" />
                            </>
                        ) : (
                            <ActionBtn onClick={() => setEditing(true)} label="✏️ Edit" color="var(--color-navy)" />
                        )}
                    </div>
                </div>

                {field('Full Name', 'full_name')}
                {field('Email', 'email', 'email')}
                {field('Phone', 'phone', 'tel')}
                {field('Date of Birth', 'date_of_birth', 'date')}
                {selectField('Gender', 'gender', [
                    { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' },
                    { value: 'non-binary', label: 'Non-binary' }, { value: 'prefer-not-to-say', label: 'Prefer not to say' },
                ])}
                {field('Address', 'address')}
                {field('City', 'city')}
                {field('State', 'state')}
                {field('Zip Code', 'zip_code')}
                {field('Probation Officer', 'probation_officer')}
                {field('Court ID', 'court_id')}
                {selectField('Reason for Service', 'reason_for_service', [
                    { value: 'court-ordered', label: 'Court Ordered' }, { value: 'probation', label: 'Probation' },
                    { value: 'school', label: 'School Requirement' }, { value: 'personal', label: 'Personal Choice' },
                    { value: 'other', label: 'Other' },
                ])}
                {selectField('Role', 'role', [
                    { value: 'participant', label: 'Participant' }, { value: 'admin', label: 'Admin' },
                ])}
            </div>

            {/* ========== ENROLLMENTS CARD ========== */}
            <div className={styles.detailCard} style={{ marginTop: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h3>📋 Enrollments ({enrollments.length})</h3>
                    <ActionBtn
                        onClick={() => setShowNewEnrollment(!showNewEnrollment)}
                        label="+ Grant Hours"
                        color="#2563eb"
                    />
                </div>

                {/* New Enrollment Form */}
                {showNewEnrollment && (
                    <div style={{
                        padding: 'var(--space-4)', background: '#f0f9ff',
                        border: '1px solid #bae6fd', borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--space-4)',
                    }}>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'end', flexWrap: 'wrap' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 4 }}>Hours</label>
                                <input type="number" min={1} max={1000} value={newHours}
                                    onChange={(e) => setNewHours(Number(e.target.value))}
                                    style={{ width: '100px', padding: '6px 10px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 4 }}>Notes</label>
                                <input type="text" value={newNotes} placeholder="e.g. Court order #12345"
                                    onChange={(e) => setNewNotes(e.target.value)}
                                    style={{ width: '100%', padding: '6px 10px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)' }}
                                />
                            </div>
                            <ActionBtn onClick={handleCreateEnrollment} label={busy === 'createEnrollment' ? 'Creating...' : 'Create'} color="#059669" disabled={busy === 'createEnrollment' || newHours < 1} />
                        </div>
                    </div>
                )}

                {/* Enrollments Table */}
                {enrollments.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Status</th>
                                    <th>Hrs Required</th>
                                    <th>Hrs Completed</th>
                                    <th>Progress</th>
                                    <th>Paid</th>
                                    <th>Start</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map((e) => {
                                    const pct = e.hours_required > 0 ? Math.min(100, Math.round((e.hours_completed / e.hours_required) * 100)) : 0;
                                    const remaining = Math.max(0, e.hours_required - e.hours_completed);
                                    const remainingH = Math.floor(remaining);
                                    const remainingM = Math.round((remaining % 1) * 60);
                                    return (
                                        <tr key={e.id}>
                                            <td>
                                                <span style={{
                                                    display: 'inline-block', padding: '2px 10px', borderRadius: '9999px',
                                                    fontSize: '11px', fontWeight: 700,
                                                    background: statusBg(e.status), color: statusColor(e.status),
                                                }}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            <td>
                                                <input type="number" min={1} defaultValue={e.hours_required}
                                                    key={`req-${e.id}-${e.hours_required}`}
                                                    onBlur={(ev) => {
                                                        const v = Number(ev.target.value);
                                                        if (v !== e.hours_required && v > 0) handleUpdateEnrollment(e.id, { hoursRequired: v });
                                                    }}
                                                    style={{ width: '65px', padding: '4px 6px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontFamily: 'var(--font-body)' }}
                                                />
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                    <input type="number" min={0} step={1}
                                                        key={`hrs-${e.id}-${e.hours_completed}`}
                                                        defaultValue={Math.floor(e.hours_completed)}
                                                        id={`hrs-${e.id}`}
                                                        onBlur={() => {
                                                            const h = Number((document.getElementById(`hrs-${e.id}`) as HTMLInputElement).value) || 0;
                                                            const m = Number((document.getElementById(`min-${e.id}`) as HTMLInputElement).value) || 0;
                                                            const combined = Math.round((h + m / 60) * 100) / 100;
                                                            if (combined !== e.hours_completed) handleUpdateEnrollment(e.id, { hoursCompleted: combined });
                                                        }}
                                                        style={{ width: '50px', padding: '4px 4px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '13px' }}
                                                    />
                                                    <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>h</span>
                                                    <input type="number" min={0} max={59} step={1}
                                                        key={`min-${e.id}-${e.hours_completed}`}
                                                        defaultValue={Math.round((e.hours_completed % 1) * 60)}
                                                        id={`min-${e.id}`}
                                                        onBlur={() => {
                                                            const h = Number((document.getElementById(`hrs-${e.id}`) as HTMLInputElement).value) || 0;
                                                            const m = Number((document.getElementById(`min-${e.id}`) as HTMLInputElement).value) || 0;
                                                            const combined = Math.round((h + m / 60) * 100) / 100;
                                                            if (combined !== e.hours_completed) handleUpdateEnrollment(e.id, { hoursCompleted: combined });
                                                        }}
                                                        style={{ width: '45px', padding: '4px 4px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '13px' }}
                                                    />
                                                    <span style={{ fontSize: '11px', color: 'var(--color-gray-500)' }}>m</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ minWidth: '120px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                                                        <span style={{ fontWeight: 700, color: pct >= 100 ? '#059669' : 'var(--color-navy)' }}>{pct}%</span>
                                                        <span style={{ color: 'var(--color-gray-500)' }}>
                                                            {remainingH}h {remainingM}m left
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        width: '100%', height: '8px', background: 'var(--color-gray-200)',
                                                        borderRadius: '4px', overflow: 'hidden',
                                                    }}>
                                                        <div style={{
                                                            width: `${pct}%`, height: '100%',
                                                            background: pct >= 100
                                                                ? 'linear-gradient(90deg, #059669, #10b981)'
                                                                : pct >= 50
                                                                    ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                                                                    : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                                                            borderRadius: '4px',
                                                            transition: 'width 0.3s ease',
                                                        }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>${Number(e.amount_paid || 0).toFixed(2)}</td>
                                            <td style={{ fontSize: '12px' }}>{new Date(e.start_date).toLocaleDateString()}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                    {e.status === 'active' && (
                                                        <>
                                                            <ActionBtn onClick={() => handleUpdateEnrollment(e.id, { status: 'suspended' })} label="⏸ Suspend" color="#f59e0b" small />
                                                            <ActionBtn onClick={() => handleForceComplete(e.id)} label="✅ Complete" color="#059669" small disabled={busy === `fc-${e.id}`} />
                                                        </>
                                                    )}
                                                    {e.status === 'suspended' && (
                                                        <ActionBtn onClick={() => handleUpdateEnrollment(e.id, { status: 'active' })} label="▶ Resume" color="#059669" small />
                                                    )}
                                                    <ActionBtn onClick={() => handleResetHours(e.id)} label="🔄 Reset" color="#6366f1" small disabled={busy === `rh-${e.id}`} />
                                                    <ActionBtn onClick={() => handleRefund(e.id)} label="💰 Refund" color="#9333ea" small disabled={busy === `rf-${e.id}`} />
                                                    <ActionBtn onClick={() => handleDeleteEnrollment(e.id)} label="🗑️ Delete" color="#dc2626" small disabled={busy === `de-${e.id}`} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>No enrollments</div>
                )}
            </div>

            {/* ========== HOUR LOGS CARD ========== */}
            <div className={styles.detailCard} style={{ marginTop: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h3>⏱️ Hour Logs ({hourLogs.length})</h3>
                    <ActionBtn
                        onClick={() => setShowAddHourLog(!showAddHourLog)}
                        label="+ Add Entry"
                        color="#2563eb"
                    />
                </div>

                {/* Add Hour Log Form */}
                {showAddHourLog && (
                    <div style={{
                        padding: 'var(--space-4)', background: '#f0f9ff',
                        border: '1px solid #bae6fd', borderRadius: 'var(--radius-lg)',
                        marginBottom: 'var(--space-4)',
                    }}>
                        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'end', flexWrap: 'wrap' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 4 }}>Enrollment</label>
                                <select value={addLogEnrollmentId} onChange={(e) => setAddLogEnrollmentId(e.target.value)}
                                    style={{ padding: '6px 10px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)' }}>
                                    <option value="">Select...</option>
                                    {enrollments.map(e => (
                                        <option key={e.id} value={e.id}>{e.hours_required}h ({e.status}) — {e.id.slice(0, 8)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 4 }}>Date</label>
                                <input type="date" value={addLogDate} onChange={(e) => setAddLogDate(e.target.value)}
                                    style={{ padding: '6px 10px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 4 }}>Hours</label>
                                <input type="number" min={0.1} max={24} step={0.1} value={addLogHours}
                                    onChange={(e) => setAddLogHours(Number(e.target.value))}
                                    style={{ width: '80px', padding: '6px 10px', border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)' }}
                                />
                            </div>
                            <ActionBtn onClick={handleAddHourLog} label={busy === 'addLog' ? 'Adding...' : 'Add Entry'} color="#059669" disabled={busy === 'addLog'} />
                        </div>
                    </div>
                )}

                {/* Hour Logs Table */}
                {hourLogs.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Hours</th>
                                    <th>Enrollment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {hourLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td>{new Date(log.log_date + 'T00:00:00').toLocaleDateString()}</td>
                                        <td><strong>{Number(log.hours)}h {Number(log.minutes)}m</strong></td>
                                        <td style={{ fontSize: '11px', fontFamily: 'monospace' }}>{log.enrollment_id.slice(0, 8)}</td>
                                        <td>
                                            <ActionBtn onClick={() => handleDeleteHourLog(log.id)} label="🗑️" color="#dc2626" small disabled={busy === `dl-${log.id}`} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>No hour logs</div>
                )}
            </div>

            {/* ========== CERTIFICATES CARD ========== */}
            <div className={styles.detailCard} style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>🎓 Certificates ({certificates.length})</h3>
                {certificates.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Verification Code</th>
                                    <th>Issued</th>
                                    <th>Downloads</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certificates.map((cert) => (
                                    <tr key={cert.id}>
                                        <td><strong style={{ fontFamily: 'monospace' }}>{cert.verification_code}</strong></td>
                                        <td>{new Date(cert.issued_at).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <a href={`/api/certificates/${cert.verification_code}/pdf`} target="_blank" className={styles.downloadBtn}>📄 Cert</a>
                                                <a href={`/api/hour-log/${cert.enrollment_id}/pdf`} target="_blank" className={styles.downloadBtn}>📋 Log</a>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <ActionBtn onClick={() => handleRegenerateCert(cert.enrollment_id)} label="🔄 Regen" color="#6366f1" small disabled={busy === `rc-${cert.enrollment_id}`} />
                                                <ActionBtn onClick={() => handleRevokeCert(cert.id)} label="❌ Revoke" color="#dc2626" small disabled={busy === `rv-${cert.id}`} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={styles.emptyState}>No certificates issued</div>
                )}
            </div>
        </>
    );
}
