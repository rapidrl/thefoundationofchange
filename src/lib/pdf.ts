// Utility: Build a PDF from scratch (no dependencies)
// Uses PDF 1.4 spec with direct content streams
// Supports text, lines, and rectangles

interface TextItem {
    type?: 'text';
    text: string;
    x: number;
    y: number;
    fontSize?: number;
    bold?: boolean;
    color?: [number, number, number];
}

interface LineItem {
    type: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    lineWidth?: number;
    color?: [number, number, number];
}

interface RectItem {
    type: 'rect';
    x: number;
    y: number;
    width: number;
    height: number;
    fill?: [number, number, number];
    stroke?: [number, number, number];
    lineWidth?: number;
}

interface CircleItem {
    type: 'circle';
    cx: number;
    cy: number;
    r: number;
    fill?: [number, number, number];
    stroke?: [number, number, number];
    lineWidth?: number;
}

type PDFItem = TextItem | LineItem | RectItem | CircleItem;

export function buildPDF(options: {
    title: string;
    lines: PDFItem[];
    pageWidth?: number;
    pageHeight?: number;
}): Uint8Array {
    const { title, lines, pageWidth = 612, pageHeight = 792 } = options;

    // Build content stream
    let contentStream = '';

    for (const item of lines) {
        if (item.type === 'line') {
            // Draw line
            const { x1, y1, x2, y2, lineWidth = 0.5, color = [0, 0, 0] } = item;
            const [r, g, b] = color;
            contentStream += `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} RG\n`;
            contentStream += `${lineWidth} w\n`;
            contentStream += `${x1} ${pageHeight - y1} m\n`;
            contentStream += `${x2} ${pageHeight - y2} l\n`;
            contentStream += 'S\n';
        } else if (item.type === 'rect') {
            // Draw rectangle
            const { x, y, width, height, fill, stroke, lineWidth = 0.5 } = item;
            if (fill) {
                const [r, g, b] = fill;
                contentStream += `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} rg\n`;
                contentStream += `${x} ${pageHeight - y - height} ${width} ${height} re\n`;
                contentStream += 'f\n';
            }
            if (stroke) {
                const [r, g, b] = stroke;
                contentStream += `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} RG\n`;
                contentStream += `${lineWidth} w\n`;
                contentStream += `${x} ${pageHeight - y - height} ${width} ${height} re\n`;
                contentStream += 'S\n';
            }
        } else if (item.type === 'circle') {
            // Approximate circle with bezier curves
            const { cx, cy, r, fill, stroke, lineWidth = 0.5 } = item;
            const py = pageHeight - cy;
            const k = 0.5522848; // kappa for bezier circle approximation
            const kr = k * r;
            contentStream += `${cx} ${py + r} m\n`;
            contentStream += `${cx + kr} ${py + r} ${cx + r} ${py + kr} ${cx + r} ${py} c\n`;
            contentStream += `${cx + r} ${py - kr} ${cx + kr} ${py - r} ${cx} ${py - r} c\n`;
            contentStream += `${cx - kr} ${py - r} ${cx - r} ${py - kr} ${cx - r} ${py} c\n`;
            contentStream += `${cx - r} ${py + kr} ${cx - kr} ${py + r} ${cx} ${py + r} c\n`;
            if (fill) {
                const [fr, fg, fb] = fill;
                contentStream += `${(fr / 255).toFixed(3)} ${(fg / 255).toFixed(3)} ${(fb / 255).toFixed(3)} rg\n`;
            }
            if (stroke) {
                const [sr, sg, sb] = stroke;
                contentStream += `${(sr / 255).toFixed(3)} ${(sg / 255).toFixed(3)} ${(sb / 255).toFixed(3)} RG\n`;
                contentStream += `${lineWidth} w\n`;
            }
            if (fill && stroke) contentStream += 'B\n';
            else if (fill) contentStream += 'f\n';
            else contentStream += 'S\n';
        } else {
            // Text item (original behavior)
            const textItem = item as TextItem;
            const fontSize = textItem.fontSize || 12;
            const fontKey = textItem.bold ? '/F2' : '/F1';
            contentStream += 'BT\n';
            if (textItem.color) {
                const [r, g, b] = textItem.color;
                contentStream += `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)} rg\n`;
            } else {
                contentStream += '0 0 0 rg\n';
            }
            contentStream += `${fontKey} ${fontSize} Tf\n`;
            const pdfY = pageHeight - textItem.y;
            contentStream += `${textItem.x} ${pdfY} Td\n`;
            const escaped = textItem.text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
            contentStream += `(${escaped}) Tj\n`;
            contentStream += 'ET\n';
        }
    }

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
    let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
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
