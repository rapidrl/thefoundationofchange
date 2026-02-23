'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from '../auth.module.css';

const US_STATES = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming',
];

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zipCode, setZipCode] = useState('');
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [probationOfficer, setProbationOfficer] = useState('');
    const [reasonForService, setReasonForService] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        const supabase = createClient();
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    address,
                    city,
                    state,
                    zip_code: zipCode,
                    gender,
                    date_of_birth: dateOfBirth,
                    probation_officer: probationOfficer || null,
                    reason_for_service: reasonForService || null,
                },
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
        }

        // Also update the profile directly if user was auto-confirmed
        if (signUpData?.user) {
            await supabase
                .from('profiles')
                .update({
                    address,
                    city,
                    state,
                    zip_code: zipCode,
                    gender,
                    date_of_birth: dateOfBirth || null,
                    probation_officer: probationOfficer || null,
                    reason_for_service: reasonForService || null,
                })
                .eq('id', signUpData.user.id);
        }

        setSuccess('Account created! Check your email to confirm, then sign in.');
        setLoading(false);
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authCard}>
                <h1>Create Account</h1>
                <p className={styles.subtitle}>Register for your community service program</p>

                {error && <div className={styles.error}>{error}</div>}
                {success && <div className={styles.success}>{success}</div>}

                <form onSubmit={handleRegister} className={styles.form}>
                    {/* ── Account Info ── */}
                    <div className={styles.field}>
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            autoComplete="name"
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            autoComplete="new-password"
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    {/* ── Personal Info ── */}
                    <div className={styles.sectionLabel}>Personal Information</div>
                    <div className={styles.fieldRow}>
                        <div className={styles.field}>
                            <label htmlFor="dateOfBirth">Date of Birth</label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                required
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="gender">Gender</label>
                            <select
                                id="gender"
                                value={gender}
                                onChange={(e) => setGender(e.target.value)}
                                required
                            >
                                <option value="">Select...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="non-binary">Non-binary</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    {/* ── Address ── */}
                    <div className={styles.sectionLabel}>Address</div>
                    <div className={styles.field}>
                        <label htmlFor="address">Street Address</label>
                        <input
                            type="text"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                            autoComplete="street-address"
                            placeholder="123 Main St, Apt 4B"
                        />
                    </div>
                    <div className={styles.fieldRow}>
                        <div className={styles.field}>
                            <label htmlFor="city">City</label>
                            <input
                                type="text"
                                id="city"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                autoComplete="address-level2"
                            />
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="state">State</label>
                            <select
                                id="state"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                                required
                            >
                                <option value="">Select state...</option>
                                {US_STATES.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className={styles.field} style={{ maxWidth: '200px' }}>
                        <label htmlFor="zipCode">Postal Code</label>
                        <input
                            type="text"
                            id="zipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            required
                            autoComplete="postal-code"
                            pattern="[0-9]{5}(-[0-9]{4})?"
                            placeholder="12345"
                        />
                    </div>

                    {/* ── Optional Info ── */}
                    <div className={styles.sectionLabel}>Additional Information</div>
                    <div className={styles.field}>
                        <label htmlFor="probationOfficer">
                            Probation Officer
                            <span className={styles.optionalBadge}>(optional)</span>
                        </label>
                        <input
                            type="text"
                            id="probationOfficer"
                            value={probationOfficer}
                            onChange={(e) => setProbationOfficer(e.target.value)}
                            autoComplete="off"
                            placeholder="Officer name"
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="reasonForService">
                            Reason for Community Service
                            <span className={styles.optionalBadge}>(optional)</span>
                        </label>
                        <select
                            id="reasonForService"
                            value={reasonForService}
                            onChange={(e) => setReasonForService(e.target.value)}
                        >
                            <option value="">Select a reason...</option>
                            <option value="court-ordered">Court Ordered</option>
                            <option value="probation">Probation Requirement</option>
                            <option value="school">School Requirement</option>
                            <option value="personal">Personal Growth</option>
                            <option value="diversion">Diversion Program</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className={styles.switchLink}>
                    Already have an account? <Link href="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
