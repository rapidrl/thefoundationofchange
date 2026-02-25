import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

// Cache loaded images
let logoBase64: string | null = null;
let signatureBase64: string | null = null;
let goldSealBase64: string | null = null;

function getLogoBase64(): string {
    if (!logoBase64) {
        const logoPath = path.join(process.cwd(), 'src', 'assets', 'logo.png');
        const buf = fs.readFileSync(logoPath);
        logoBase64 = buf.toString('base64');
    }
    return logoBase64;
}

function getSignatureBase64(): string {
    if (!signatureBase64) {
        const sigPath = path.join(process.cwd(), 'src', 'assets', 'signature.png');
        const buf = fs.readFileSync(sigPath);
        signatureBase64 = buf.toString('base64');
    }
    return signatureBase64;
}

function getGoldSealBase64(): string {
    if (!goldSealBase64) {
        const sealPath = path.join(process.cwd(), 'src', 'assets', 'gold_seal.jpg');
        const buf = fs.readFileSync(sealPath);
        goldSealBase64 = buf.toString('base64');
    }
    return goldSealBase64;
}

// Shared styles
const NAVY: [number, number, number] = [10, 30, 61];
const DARK_GRAY: [number, number, number] = [50, 50, 50];
const GRAY: [number, number, number] = [100, 100, 100];
const LIGHT_GRAY: [number, number, number] = [180, 180, 180];
const BLUE: [number, number, number] = [37, 99, 235];
const MAROON: [number, number, number] = [139, 0, 0];

function drawHeader(doc: jsPDF, includeTitle: string) {
    // Logo (left side)
    try {
        const logoData = getLogoBase64();
        doc.addImage(`data:image/png;base64,${logoData}`, 'PNG', 15, 10, 22, 22);
    } catch {
        // Fallback text if image not available
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...NAVY);
        doc.text('TFC', 22, 25);
    }

    // "The Foundation of Change" next to logo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...NAVY);
    doc.text('The Foundation of Change', 42, 24);

    // Executive Director info (right side)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...DARK_GRAY);
    doc.text('Jennifer Schroeder, Executive Director', 140, 12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BLUE);
    doc.text('Website: https://www.thefoundationofchange.org', 140, 17);
    doc.text('Email: info@thefoundationofchange.org', 140, 22);
    doc.setTextColor(...DARK_GRAY);
    doc.text('Organization Tax ID Number: 33-5003265', 140, 27);

    // Divider line under header
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.5);
    doc.line(15, 35, 195, 35);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...NAVY);
    const titleWidth = doc.getTextWidth(includeTitle);
    doc.text(includeTitle, (210 - titleWidth) / 2, 47);
}

interface FieldData {
    clientWorker: string;
    startDate: string;
    dateIssued: string;
    verificationCode: string;
    currentAddress: string;
}

function drawFields(doc: jsPDF, fields: FieldData, startY: number): number {
    const leftLabelX = 20;
    const leftValueX = 55;
    const rightLabelX = 110;
    const rightValueX = 148;
    const lineHeight = 6;
    let y = startY;

    const fieldPairs = [
        { leftLabel: 'Client-Worker:', leftValue: fields.clientWorker, rightLabel: 'Current Address:', rightValue: fields.currentAddress },
        { leftLabel: 'Start Date:', leftValue: fields.startDate, rightLabel: 'Probation Officer:', rightValue: '' },
        { leftLabel: 'Date Issued:', leftValue: fields.dateIssued, rightLabel: 'Court ID:', rightValue: '' },
        { leftLabel: 'Verification Code:', leftValue: fields.verificationCode, rightLabel: 'Local Charity:', rightValue: 'The Foundation of Change' },
    ];

    for (const pair of fieldPairs) {
        // Left label
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...DARK_GRAY);
        doc.text(pair.leftLabel, leftLabelX, y);
        // Left value
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...GRAY);
        doc.text(pair.leftValue, leftValueX, y);
        // Right label
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK_GRAY);
        doc.text(pair.rightLabel, rightLabelX, y);
        // Right value
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...GRAY);
        doc.text(pair.rightValue, rightValueX, y);
        y += lineHeight;
    }

    return y;
}

function drawSignature(doc: jsPDF, y: number, label: string = 'Respectfully submitted,') {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MAROON);
    doc.text(label, 20, y);

    // Signature image
    try {
        const sigData = getSignatureBase64();
        doc.addImage(`data:image/png;base64,${sigData}`, 'PNG', 18, y + 2, 50, 25);
    } catch {
        // Fallback: text-based signature
        doc.setFont('helvetica', 'bolditalic');
        doc.setFontSize(14);
        doc.setTextColor(...NAVY);
        doc.text('Jennifer Schroeder', 20, y + 12);
    }

    // Title lines below signature
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...DARK_GRAY);
    doc.text('Executive Director, The Foundation of Change', 20, y + 30);

    return y + 36;
}

function drawSeal(doc: jsPDF, x: number, y: number, size: number = 30) {
    try {
        const sealData = getGoldSealBase64();
        doc.addImage(`data:image/jpeg;base64,${sealData}`, 'JPEG', x, y, size, size);
    } catch {
        // Fallback: draw circles
        doc.setDrawColor(184, 157, 82);
        doc.setLineWidth(1);
        doc.circle(x + size / 2, y + size / 2, size / 2);
        doc.circle(x + size / 2, y + size / 2, size / 2 - 3);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5);
        doc.setTextColor(139, 115, 50);
        doc.text('THE FOUNDATION', x + 3, y + size / 2);
        doc.text('OF CHANGE', x + 5, y + size / 2 + 4);
    }
}

export function buildCertificatePDF(data: {
    participantName: string;
    address: string;
    startDate: string;
    issuedDate: string;
    verificationCode: string;
    hoursCompleted: number;
}): Buffer {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

    drawHeader(doc, 'Community Service Statement of Completion');

    // Fields
    const fieldsEndY = drawFields(doc, {
        clientWorker: data.participantName,
        startDate: data.startDate,
        dateIssued: data.issuedDate,
        verificationCode: data.verificationCode,
        currentAddress: data.address,
    }, 58);

    // Hours Completed
    const hoursY = fieldsEndY + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...NAVY);
    const hoursText = `Hours Completed: ${data.hoursCompleted}`;
    const hoursWidth = doc.getTextWidth(hoursText);
    doc.text(hoursText, (210 - hoursWidth) / 2, hoursY);

    // Divider
    doc.setDrawColor(...LIGHT_GRAY);
    doc.setLineWidth(0.3);
    doc.line(15, hoursY + 4, 195, hoursY + 4);

    // Paragraph 1 — Service description
    const para1Y = hoursY + 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...DARK_GRAY);
    const para1 = `This letter serves to verify the above named person successfully completed ${data.hoursCompleted} hours of volunteer community service work, sponsored by our non profit organization. The services performed were educational in nature, with a labor component, and provide ongoing value to the community and the client through self improvement. All training materials were prepared or approved by a licensed and experienced Master's Level Social Worker. Examples of topics addressed include Anger Management, Civics, Drug and Alcohol Awareness, Parenting and American Government. Structured feedback from the client is used to improve our other programs.`;
    doc.text(para1, 20, para1Y, { maxWidth: 170 });

    // Paragraph 2 — Verification
    const para2Y = para1Y + 35;
    const para2 = `To verify the authenticity of this document, please go to https://www.thefoundationofchange.org. Near the bottom center of the page, click the Client Authentication tab. You will be instructed to enter the Verification Code from this letter. The information from our database should match the enrollment information given above. If any other information is needed, feel free to contact me at: info@thefoundationofchange.org. The Foundation of Change is a 501c(3) registered non-profit organization.`;
    doc.text(para2, 20, para2Y, { maxWidth: 170 });

    // Signature
    const sigY = para2Y + 32;
    drawSignature(doc, sigY);

    // Gold seal
    drawSeal(doc, 160, sigY - 5, 30);

    // Footer line
    doc.setDrawColor(...LIGHT_GRAY);
    doc.setLineWidth(0.2);
    doc.line(15, 265, 195, 265);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(160, 160, 160);
    doc.text('The Foundation of Change  |  501(c)(3)  |  EIN: 33-5003265  |  info@thefoundationofchange.org  |  734-834-6934', 105, 269, { align: 'center' });

    return Buffer.from(doc.output('arraybuffer'));
}

export function buildHourLogPDF(data: {
    participantName: string;
    address: string;
    startDate: string;
    issuedDate: string;
    verificationCode: string;
    hoursCompleted: number;
    hourLogs: Array<{ log_date: string; hours: number; minutes: number }>;
}): Buffer {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

    drawHeader(doc, 'Community Service Log - Work Days and Time');

    // Fields
    const fieldsEndY = drawFields(doc, {
        clientWorker: data.participantName,
        startDate: data.startDate,
        dateIssued: data.issuedDate,
        verificationCode: data.verificationCode,
        currentAddress: data.address,
    }, 58);

    // Hours Completed
    const hoursY = fieldsEndY + 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...NAVY);
    const hoursText = `Hours Completed: ${data.hoursCompleted}`;
    const hoursWidth = doc.getTextWidth(hoursText);
    doc.text(hoursText, (210 - hoursWidth) / 2, hoursY);

    // ═══════════ TABLE ═══════════
    const tableTop = hoursY + 6;
    const tableLeft = 15;
    const tableWidth = 180;
    const colWidth = tableWidth / 4; // 4 columns of Date | Hrs:Mins
    const rowHeight = 5.5;
    const maxRows = 16;

    // Header row background
    doc.setFillColor(230, 235, 245);
    doc.rect(tableLeft, tableTop, tableWidth, rowHeight, 'F');

    // Header text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...NAVY);
    for (let col = 0; col < 4; col++) {
        const colX = tableLeft + col * colWidth;
        doc.text('Date', colX + 3, tableTop + 4);
        doc.text('Hrs:Mins', colX + colWidth / 2 + 2, tableTop + 4);
    }

    // Draw table grid
    doc.setDrawColor(...NAVY);
    doc.setLineWidth(0.3);

    // Outer border
    const tableHeight = rowHeight * (maxRows + 1);
    doc.rect(tableLeft, tableTop, tableWidth, tableHeight);

    // Header bottom line (thicker)
    doc.setLineWidth(0.4);
    doc.line(tableLeft, tableTop + rowHeight, tableLeft + tableWidth, tableTop + rowHeight);
    doc.setLineWidth(0.2);

    // Column separators
    for (let col = 1; col < 4; col++) {
        const x = tableLeft + col * colWidth;
        doc.line(x, tableTop, x, tableTop + tableHeight);
    }

    // Mid-column separators (between Date and Hrs:Mins)
    doc.setDrawColor(...LIGHT_GRAY);
    doc.setLineWidth(0.15);
    for (let col = 0; col < 4; col++) {
        const x = tableLeft + col * colWidth + colWidth / 2;
        doc.line(x, tableTop, x, tableTop + tableHeight);
    }

    // Row lines
    for (let row = 2; row <= maxRows; row++) {
        const y = tableTop + rowHeight * row;
        doc.line(tableLeft, y, tableLeft + tableWidth, y);
    }

    // Fill in data
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    const logs = data.hourLogs || [];
    for (let i = 0; i < logs.length && i < maxRows * 4; i++) {
        const col = Math.floor(i / maxRows);
        const row = i % maxRows;
        const log = logs[i];
        const h = Number(log.hours) || 0;
        const m = Number(log.minutes) || 0;
        const dateStr = new Date(log.log_date + 'T00:00:00').toLocaleDateString('en-US', {
            month: '2-digit', day: '2-digit', year: '2-digit',
        });
        const timeStr = `${h}:${m.toString().padStart(2, '0')}`;

        const colX = tableLeft + col * colWidth;
        const rowY = tableTop + rowHeight * (row + 1) + 4;

        doc.text(dateStr, colX + 3, rowY);
        doc.text(timeStr, colX + colWidth / 2 + 5, rowY);
    }

    // ═══════════ FOOTER ═══════════
    const footerY = tableTop + tableHeight + 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...DARK_GRAY);
    const footerText = 'The Foundation of Change is a registered 501(c)(3) nonprofit organization. To confirm authenticity, visit www.thefoundationofchange.org, click the Verify Certificate tab, and enter the verification code from this document. Verification details should match the enrollment information above. For further questions, contact info@thefoundationofchange.org.';
    doc.text(footerText, 20, footerY, { maxWidth: 170 });

    // Signature
    const sigY = footerY + 18;
    drawSignature(doc, sigY, 'Certified by,');

    // Gold seal on certificate
    drawSeal(doc, 160, sigY - 5, 28);

    return Buffer.from(doc.output('arraybuffer'));
}
