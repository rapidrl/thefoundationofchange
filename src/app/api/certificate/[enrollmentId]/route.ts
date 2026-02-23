import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

interface RouteParams {
    params: Promise<{ enrollmentId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { enrollmentId } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user owns this enrollment or is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const { data: enrollment } = await supabase
            .from('enrollments')
            .select('*, profiles:user_id (*)')
            .eq('id', enrollmentId)
            .single();

        if (!enrollment) {
            return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
        }

        if (enrollment.user_id !== user.id && profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get certificate
        const { data: certificate } = await supabase
            .from('certificates')
            .select('*')
            .eq('enrollment_id', enrollmentId)
            .single();

        const participantProfile = enrollment.profiles as Record<string, string>;
        const verificationCode = certificate?.verification_code || 'N/A';
        const issuedDate = certificate?.issued_at
            ? new Date(certificate.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Generate PDF
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 25;

        // --- Header ---
        doc.setFontSize(10);
        doc.setTextColor(26, 39, 68); // Navy
        doc.text('The Foundation of Change', margin, 20);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('501(c)(3) Nonprofit Organization', margin, 25);
        doc.text('EIN: 33-5003265', margin, 29);

        // Right-aligned header info
        doc.text('Jennifer Schroeder, Executive Director', pageWidth - margin, 20, { align: 'right' });
        doc.text('www.thefoundationofchange.org', pageWidth - margin, 25, { align: 'right' });
        doc.text('info@thefoundationofchange.org', pageWidth - margin, 29, { align: 'right' });

        // Divider
        doc.setDrawColor(26, 39, 68);
        doc.setLineWidth(0.5);
        doc.line(margin, 34, pageWidth - margin, 34);

        // --- Title ---
        doc.setFontSize(22);
        doc.setTextColor(26, 39, 68);
        doc.text('Certificate of Completion', pageWidth / 2, 55, { align: 'center' });

        // Decorative line
        doc.setDrawColor(212, 168, 83); // Gold
        doc.setLineWidth(1);
        doc.line(pageWidth / 2 - 40, 60, pageWidth / 2 + 40, 60);

        // --- Body ---
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        doc.text('This is to certify that', pageWidth / 2, 80, { align: 'center' });

        // Participant name
        doc.setFontSize(24);
        doc.setTextColor(26, 39, 68);
        doc.text(participantProfile?.full_name || 'Participant', pageWidth / 2, 95, { align: 'center' });

        // Underline
        const nameWidth = doc.getTextWidth(participantProfile?.full_name || 'Participant');
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.line(pageWidth / 2 - nameWidth / 2 - 5, 98, pageWidth / 2 + nameWidth / 2 + 5, 98);

        // Completion text
        doc.setFontSize(12);
        doc.setTextColor(50, 50, 50);
        const completionText = `has successfully completed ${Number(enrollment.hours_completed)} hours of community service through The Foundation of Change online community service program.`;
        const splitText = doc.splitTextToSize(completionText, pageWidth - margin * 2 - 20);
        doc.text(splitText, pageWidth / 2, 115, { align: 'center' });

        // --- Details Box ---
        const boxY = 145;
        doc.setFillColor(249, 250, 251);
        doc.setDrawColor(229, 231, 235);
        doc.roundedRect(margin + 10, boxY, pageWidth - margin * 2 - 20, 40, 3, 3, 'FD');

        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        const col1X = margin + 20;
        const col2X = pageWidth / 2 + 10;

        doc.text('Verification Code:', col1X, boxY + 10);
        doc.text('Date Issued:', col1X, boxY + 20);
        doc.text('Hours Completed:', col1X, boxY + 30);

        doc.text('Program:', col2X, boxY + 10);
        doc.text('Status:', col2X, boxY + 20);
        doc.text('Organization:', col2X, boxY + 30);

        doc.setTextColor(26, 39, 68);
        doc.setFontSize(10);
        doc.text(verificationCode, col1X + 35, boxY + 10);
        doc.text(issuedDate, col1X + 26, boxY + 20);
        doc.text(`${Number(enrollment.hours_completed)} of ${Number(enrollment.hours_required)} hours`, col1X + 35, boxY + 30);

        doc.text('Community Service', col2X + 20, boxY + 10);
        doc.text('Completed', col2X + 14, boxY + 20);
        doc.text('The Foundation of Change', col2X + 27, boxY + 30);

        // --- Signature ---
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        doc.text('Certified by,', margin + 20, 210);

        // Signature line
        doc.setFontSize(13);
        doc.setTextColor(26, 39, 68);
        doc.text('J. Schroeder', margin + 20, 222);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin + 20, 224, margin + 80, 224);

        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text('J. Schroeder, MS CADC', margin + 20, 230);
        doc.text('Executive Director', margin + 20, 235);

        // --- Footer ---
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        const footerText = 'The Foundation of Change is a registered 501(c)(3) nonprofit organization. To confirm authenticity, visit www.thefoundationofchange.org, click the Verify Certificate tab, and enter the verification code from this document.';
        const footerSplit = doc.splitTextToSize(footerText, pageWidth - margin * 2);
        doc.text(footerSplit, pageWidth / 2, 255, { align: 'center' });

        // Output
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Certificate_${participantProfile?.full_name?.replace(/\s+/g, '_') || 'Completion'}.pdf"`,
            },
        });
    } catch (error) {
        console.error('Certificate PDF generation error:', error);
        return NextResponse.json({ error: 'Failed to generate certificate PDF' }, { status: 500 });
    }
}
