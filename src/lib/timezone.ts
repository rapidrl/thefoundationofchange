/**
 * Get today's date string (YYYY-MM-DD) in the user's timezone.
 * Falls back to America/New_York if timezone is not provided.
 */
export function getTodayInTimezone(timezone?: string | null): string {
    const tz = timezone || 'America/New_York';
    try {
        // Use Intl.DateTimeFormat to get the date in the user's timezone
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: tz,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        return formatter.format(new Date()); // Returns YYYY-MM-DD
    } catch {
        // Invalid timezone — fall back to server local
        return new Date().toISOString().split('T')[0];
    }
}
