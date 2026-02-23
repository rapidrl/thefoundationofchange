'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface ProfileData {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    probation_officer: string;
    court_id: string;
    date_of_birth: string;
    gender: string;
    reason_for_service: string;
}

export default function EditProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile({
                    full_name: data.full_name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    city: data.city || '',
                    state: data.state || '',
                    zip_code: data.zip_code || '',
                    probation_officer: data.probation_officer || '',
                    court_id: data.court_id || '',
                    date_of_birth: data.date_of_birth || '',
                    gender: data.gender || '',
                    reason_for_service: data.reason_for_service || '',
                });
            }
            setLoading(false);
        }
        loadProfile();
    }, [router, supabase]);

    const handleChange = (field: keyof ProfileData, value: string) => {
        if (!profile) return;
        setProfile({ ...profile, [field]: value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);
        setError('');
        setMessage('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                full_name: profile.full_name,
                phone: profile.phone,
                address: profile.address,
                city: profile.city,
                state: profile.state,
                zip_code: profile.zip_code,
                probation_officer: profile.probation_officer,
                court_id: profile.court_id,
                date_of_birth: profile.date_of_birth,
                gender: profile.gender || null,
                reason_for_service: profile.reason_for_service || null,
            })
            .eq('id', user.id);

        if (updateError) {
            setError('Failed to save profile. Please try again.');
        } else {
            setMessage('Profile updated successfully!');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <section style={{ padding: 'var(--space-16) 0', textAlign: 'center' }}>
                <p style={{ color: 'var(--color-gray-500)' }}>Loading profile...</p>
            </section>
        );
    }

    if (!profile) return null;

    const inputStyle: React.CSSProperties = {
        width: '100%', padding: 'var(--space-3) var(--space-4)',
        border: '1px solid var(--color-gray-300)', borderRadius: 'var(--radius-md)',
        fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'var(--font-body)',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: 'var(--text-xs)', fontWeight: 600,
        color: 'var(--color-navy)', marginBottom: 'var(--space-1)',
        textTransform: 'uppercase', letterSpacing: '0.05em',
    };

    return (
        <section style={{ padding: 'var(--space-10) 0 var(--space-16)' }}>
            <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>Edit Profile</h1>
                <p style={{ color: 'var(--color-gray-500)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>
                    Keep your information up to date. This is used on your certificate and hour log.
                </p>

                {message && (
                    <div style={{
                        padding: 'var(--space-3) var(--space-4)', background: '#ecfdf5',
                        border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)',
                        color: '#059669', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)',
                    }}>{message}</div>
                )}
                {error && (
                    <div style={{
                        padding: 'var(--space-3) var(--space-4)', background: '#fef2f2',
                        border: '1px solid #fecaca', borderRadius: 'var(--radius-md)',
                        color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)',
                    }}>{error}</div>
                )}

                <form onSubmit={handleSave} style={{
                    background: 'var(--color-white)', border: '1px solid var(--color-gray-200)',
                    borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Full Name</label>
                            <input value={profile.full_name} onChange={(e) => handleChange('full_name', e.target.value)} style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Email (read-only)</label>
                            <input value={profile.email} disabled style={{ ...inputStyle, background: 'var(--color-gray-50)', color: 'var(--color-gray-500)' }} />
                        </div>
                        <div>
                            <label style={labelStyle}>Phone</label>
                            <input value={profile.phone} onChange={(e) => handleChange('phone', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Date of Birth</label>
                            <input type="date" value={profile.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Gender</label>
                            <select value={profile.gender} onChange={(e) => handleChange('gender', e.target.value)} style={inputStyle}>
                                <option value="">Select...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="non-binary">Non-binary</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Reason for Community Service</label>
                            <select value={profile.reason_for_service} onChange={(e) => handleChange('reason_for_service', e.target.value)} style={inputStyle}>
                                <option value="">Select...</option>
                                <option value="court-ordered">Court Ordered</option>
                                <option value="probation">Probation</option>
                                <option value="school">School Requirement</option>
                                <option value="personal">Personal Choice</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Address</label>
                            <input value={profile.address} onChange={(e) => handleChange('address', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>City</label>
                            <input value={profile.city} onChange={(e) => handleChange('city', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>State</label>
                            <input value={profile.state} onChange={(e) => handleChange('state', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Zip Code</label>
                            <input value={profile.zip_code} onChange={(e) => handleChange('zip_code', e.target.value)} style={inputStyle} />
                        </div>
                        <div>
                            <label style={labelStyle}>Probation Officer</label>
                            <input value={profile.probation_officer} onChange={(e) => handleChange('probation_officer', e.target.value)} style={inputStyle} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Court ID</label>
                            <input value={profile.court_id} onChange={(e) => handleChange('court_id', e.target.value)} style={inputStyle} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => router.push('/dashboard')} className="btn btn-secondary" style={{ border: '1px solid var(--color-gray-300)', fontSize: 'var(--text-sm)' }}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-cta" disabled={saving} style={{ border: 'none', fontSize: 'var(--text-sm)', opacity: saving ? 0.5 : 1 }}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
