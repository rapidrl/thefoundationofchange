// Utility: Build a simple PDF from scratch (no dependencies)
// Uses PDF 1.4 spec with direct content streams

export function buildPDF(options: {
    title: string;
    lines: Array<{ text: string; x: number; y: number; fontSize?: number; bold?: boolean; color?: [number, number, number] }>;
    pageWidth?: number;
    pageHeight?: number;
}): Uint8Array {
    const { title, lines, pageWidth = 612, pageHeight = 792 } = options;

    // Build content stream
    let contentStream = 'BT\n';
    for (const line of lines) {
        const fontSize = line.fontSize || 12;
        const fontKey = line.bold ? '/F2' : '/F1';
        if (line.color) {
            const [r, g, b] = line.color;
            contentStream += `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} rg\n`;
        } else {
            contentStream += '0 0 0 rg\n';
        }
        contentStream += `${fontKey} ${fontSize} Tf\n`;
        // PDF coordinates: origin at bottom-left, y increases upward
        const pdfY = pageHeight - line.y;
        contentStream += `${line.x} ${pdfY} Td\n`;
        // Escape special chars in PDF string
        const escaped = line.text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
        contentStream += `(${escaped}) Tj\n`;
        // Reset position for next absolute positioning
        contentStream += `${-line.x} ${-pdfY} Td\n`;
    }
    contentStream += 'ET\n';

    const objects: string[] = [];
    const offsets: number[] = [];

    // Object 1: Catalog
    objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    // Object 2: Pages
    objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

    // Object 3: Page
    objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`);

    // Object 4: Content stream
    const streamBytes = Buffer.from(contentStream, 'utf-8');
    objects.push(`4 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${contentStream}endstream\nendobj\n`);

    // Object 5: Font (Helvetica)
    objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n');

    // Object 6: Font Bold (Helvetica-Bold)
    objects.push('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');

    // Object 7: Info
    const escapedTitle = title.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    objects.push(`7 0 obj\n<< /Title (${escapedTitle}) /Producer (The Foundation of Change) /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}) >>\nendobj\n`);

    // Build PDF
    let pdf = '%PDF-1.4\n%âãÏÓ\n';
    for (let i = 0; i < objects.length; i++) {
        offsets.push(pdf.length);
        pdf += objects[i];
    }

    const xrefOffset = pdf.length;
    pdf += 'xref\n';
    pdf += `0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (const offset of offsets) {
        pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`;
    }

    pdf += 'trailer\n';
    pdf += `<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>\n`;
    pdf += 'startxref\n';
    pdf += `${xrefOffset}\n`;
    pdf += '%%EOF\n';

    return new Uint8Array(Buffer.from(pdf, 'binary'));
}
