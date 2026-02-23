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
}

interface Enrollment {
    id: string;
    hours_required: number;
    hours_completed: number;
    status: string;
    amount_paid: number;
    start_date: string;
}

interface Props {
    profile: Profile;
    enrollments: Enrollment[];
}

export default function AdminUserEditor({ profile: initial, enrollments: initialEnrollments }: Props) {
    const [profile, setProfile] = useState(initial);
    const [enrollments, setEnrollments] = useState(initialEnrollments);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [msgType, setMsgType] = useState<'success' | 'error'>('success');

    // New enrollment form
    const [showNewEnrollment, setShowNewEnrollment] = useState(false);
    const [newHours, setNewHours] = useState(40);
    const [newNotes, setNewNotes] = useState('');
    const [creatingEnrollment, setCreatingEnrollment] = useState(false);

    const showMsg = (text: string, type: 'success' | 'error') => {
        setMessage(text);
        setMsgType(type);
        setTimeout(() => setMessage(''), 4000);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: profile.id, ...profile }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showMsg('Profile saved successfully', 'success');
            setEditing(false);
        } catch (err: unknown) {
            showMsg((err as Error).message || 'Failed to save', 'error');
        }
        setSaving(false);
    };

    const handleCreateEnrollment = async () => {
        setCreatingEnrollment(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: profile.id, hoursRequired: newHours, notes: newNotes }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setEnrollments([data.enrollment, ...enrollments]);
            setShowNewEnrollment(false);
            setNewHours(40);
            setNewNotes('');
            showMsg('Enrollment created successfully', 'success');
        } catch (err: unknown) {
            showMsg((err as Error).message || 'Failed to create enrollment', 'error');
        }
        setCreatingEnrollment(false);
    };

    const handleUpdateEnrollment = async (enrollmentId: string, updates: Record<string, unknown>) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enrollmentId, ...updates }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setEnrollments(enrollments.map(e => e.id === enrollmentId ? { ...e, ...updates } as Enrollment : e));
            showMsg('Enrollment updated', 'success');
        } catch (err: unknown) {
            showMsg((err as Error).message || 'Failed to update', 'error');
        }
    };

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

            {/* Profile Card */}
            <div className={styles.detailCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h3>👤 Profile Information</h3>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {editing ? (
                            <>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    style={{
                                        padding: '6px 16px', background: '#059669', color: '#fff',
                                        border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600,
                                        fontSize: 'var(--text-sm)', cursor: saving ? 'not-allowed' : 'pointer',
                                        opacity: saving ? 0.6 : 1,
                                    }}
                                >
                                    {saving ? 'Saving...' : '✓ Save'}
                                </button>
                                <button
                                    onClick={() => { setProfile(initial); setEditing(false); }}
                                    style={{
                                        padding: '6px 16px', background: 'var(--color-gray-100)',
                                        border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)',
                                        fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                style={{
                                    padding: '6px 16px', background: 'var(--color-navy)', color: '#fff',
                                    border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600,
                                    fontSize: 'var(--text-sm)', cursor: 'pointer',
                                }}
                            >
                                ✏️ Edit
                            </button>
                        )}
                    </div>
                </div>

                {field('Full Name', 'full_name')}
                {field('Email', 'email', 'email')}
                {field('Phone', 'phone', 'tel')}
                {field('Date of Birth', 'date_of_birth', 'date')}
                {selectField('Gender', 'gender', [
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'non-binary', label: 'Non-binary' },
                    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
                ])}
                {field('Address', 'address')}
                {field('City', 'city')}
                {field('State', 'state')}
                {field('Zip Code', 'zip_code')}
                {field('Probation Officer', 'probation_officer')}
                {field('Court ID', 'court_id')}
                {selectField('Reason for Service', 'reason_for_service', [
                    { value: 'court-ordered', label: 'Court Ordered' },
                    { value: 'probation', label: 'Probation' },
                    { value: 'school', label: 'School Requirement' },
                    { value: 'personal', label: 'Personal Choice' },
                    { value: 'other', label: 'Other' },
                ])}
                {selectField('Role', 'role', [
                    { value: 'participant', label: 'Participant' },
                    { value: 'admin', label: 'Admin' },
                ])}
            </div>

            {/* Enrollments Card */}
            <div className={styles.detailCard} style={{ marginTop: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h3>📋 Enrollments ({enrollments.length})</h3>
                    <button
                        onClick={() => setShowNewEnrollment(!showNewEnrollment)}
                        style={{
                            padding: '6px 16px', background: '#2563eb', color: '#fff',
                            border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600,
                            fontSize: 'var(--text-sm)', cursor: 'pointer',
                        }}
                    >
                        + Grant Hours
                    </button>
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
                                <input
                                    type="number" min={1} max={1000} value={newHours}
                                    onChange={(e) => setNewHours(Number(e.target.value))}
                                    style={{
                                        width: '100px', padding: '6px 10px', border: '1px solid var(--color-gray-300)',
                                        borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
                                    }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600, marginBottom: 4 }}>Notes</label>
                                <input
                                    type="text" value={newNotes} placeholder="e.g. Court order #12345"
                                    onChange={(e) => setNewNotes(e.target.value)}
                                    style={{
                                        width: '100%', padding: '6px 10px', border: '1px solid var(--color-gray-300)',
                                        borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)',
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleCreateEnrollment}
                                disabled={creatingEnrollment || newHours < 1}
                                style={{
                                    padding: '8px 20px', background: '#059669', color: '#fff',
                                    border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600,
                                    cursor: creatingEnrollment ? 'not-allowed' : 'pointer',
                                    opacity: creatingEnrollment ? 0.6 : 1,
                                }}
                            >
                                {creatingEnrollment ? 'Creating...' : 'Create Enrollment'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Enrollments List */}
                {enrollments.length > 0 ? (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Status</th>
                                <th>Hours Required</th>
                                <th>Hours Completed</th>
                                <th>Amount Paid</th>
                                <th>Start Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {enrollments.map((e) => (
                                <tr key={e.id}>
                                    <td>
                                        <select
                                            value={e.status}
                                            onChange={(ev) => handleUpdateEnrollment(e.id, { status: ev.target.value })}
                                            style={{
                                                padding: '4px 8px', border: '1px solid var(--color-gray-300)',
                                                borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
                                                fontWeight: 600, fontFamily: 'var(--font-body)',
                                                background: e.status === 'active' ? '#ecfdf5' :
                                                    e.status === 'completed' ? '#eff6ff' : '#fef2f2',
                                            }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="completed">Completed</option>
                                            <option value="suspended">Suspended</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="number" min={1} defaultValue={e.hours_required}
                                            onBlur={(ev) => {
                                                const v = Number(ev.target.value);
                                                if (v !== e.hours_required && v > 0) {
                                                    handleUpdateEnrollment(e.id, { hoursRequired: v });
                                                }
                                            }}
                                            style={{
                                                width: '70px', padding: '4px 8px',
                                                border: '1px solid var(--color-gray-300)',
                                                borderRadius: 'var(--radius-md)', textAlign: 'center',
                                                fontFamily: 'var(--font-body)',
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <input
                                            type="number" min={0} defaultValue={e.hours_completed}
                                            onBlur={(ev) => {
                                                const v = Number(ev.target.value);
                                                if (v !== e.hours_completed) {
                                                    handleUpdateEnrollment(e.id, { hoursCompleted: v });
                                                }
                                            }}
                                            style={{
                                                width: '70px', padding: '4px 8px',
                                                border: '1px solid var(--color-gray-300)',
                                                borderRadius: 'var(--radius-md)', textAlign: 'center',
                                                fontFamily: 'var(--font-body)',
                                            }}
                                        />
                                    </td>
                                    <td>${Number(e.amount_paid || 0).toFixed(2)}</td>
                                    <td>{new Date(e.start_date).toLocaleDateString()}</td>
                                    <td>—</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className={styles.emptyState}>No enrollments</div>
                )}
            </div>
        </>
    );
}
