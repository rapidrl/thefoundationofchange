'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditHoursForm({
    enrollmentId,
    currentHours,
}: {
    enrollmentId: string;
    currentHours: number;
}) {
    const [hours, setHours] = useState(currentHours.toString());
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleSave = async () => {
        const newHours = parseFloat(hours);
        if (isNaN(newHours) || newHours < 0) {
            setMessage('Invalid hours value');
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/admin/update-hours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enrollmentId, newHours }),
            });

            const data = await res.json();
            if (data.success) {
                setMessage('Hours updated!');
                router.refresh();
            } else {
                setMessage(data.error || 'Failed to update');
            }
        } catch {
            setMessage('Network error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            marginTop: 'var(--space-3)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px dashed var(--color-gray-200)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            fontSize: 'var(--text-sm)',
        }}>
            <label style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Edit Hours:</label>
            <input
                type="number"
                step="0.01"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                style={{
                    width: '100px',
                    padding: '4px 8px',
                    border: '1px solid var(--color-gray-300)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                }}
            />
            <button
                onClick={handleSave}
                disabled={saving}
                style={{
                    padding: '4px 12px',
                    background: 'var(--color-blue)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                }}
            >
                {saving ? 'Saving...' : 'Save'}
            </button>
            {message && <span style={{ color: message.includes('updated') ? '#16a34a' : '#dc2626' }}>{message}</span>}
        </div>
    );
}
