import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, message } = body;

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

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPhone = phone?.trim() || '';
        const trimmedMessage = message.trim();

        // Save to Supabase
        const supabase = await createClient();
        const { error: dbError } = await supabase
            .from('contact_submissions')
            .insert({
                name: trimmedName,
                email: trimmedEmail,
                message: trimmedMessage,
            });

        if (dbError) {
            console.error('Contact form DB error:', dbError);
        }

        // Send email notification via Resend
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
            try {
                const resendClient = new Resend(apiKey);
                await resendClient.emails.send({
                    from: 'Contact Form <onboarding@resend.dev>',
                    to: ['info@thefoundationofchange.org'],
                    replyTo: trimmedEmail,
                    subject: `New Contact Form: ${trimmedName}`,
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px;">
                            <h2 style="color: #1a365d;">New Contact Form Submission</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr><td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td><td>${trimmedName}</td></tr>
                                <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${trimmedEmail}">${trimmedEmail}</a></td></tr>
                                ${trimmedPhone ? `<tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td>${trimmedPhone}</td></tr>` : ''}
                            </table>
                            <hr style="margin: 16px 0; border: none; border-top: 1px solid #e2e8f0;" />
                            <p style="font-weight: bold; margin-bottom: 4px;">Message:</p>
                            <p style="white-space: pre-wrap; color: #4a5568;">${trimmedMessage}</p>
                            <hr style="margin: 16px 0; border: none; border-top: 1px solid #e2e8f0;" />
                            <p style="color: #a0aec0; font-size: 12px;">
                                Sent from the contact form at thefoundationofchange.org
                            </p>
                        </div>
                    `,
                });
            } catch (emailErr) {
                // Email failure is non-blocking — the submission is still saved
                console.error('Resend email error:', emailErr);
            }
        } else {
            console.warn('RESEND_API_KEY not set — skipping email notification');
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
