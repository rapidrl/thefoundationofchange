import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required.' },
                { status: 400 }
            );
        }

        // Basic email validation
        if (!email.includes('@') || !email.includes('.')) {
            return NextResponse.json(
                { error: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { error } = await supabase
            .from('contact_submissions')
            .insert({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                message: message.trim(),
            });

        if (error) {
            console.error('Contact form submission error:', error);
            return NextResponse.json(
                { error: 'Failed to submit your message. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Your message has been received. We typically respond within 1-2 business days.',
        });
    } catch {
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        );
    }
}
