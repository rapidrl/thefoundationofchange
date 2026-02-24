// Inspect PDF templates for form fields and page dimensions
import { readFileSync } from 'fs';
import { PDFDocument } from 'pdf-lib';

async function inspect(filePath, label) {
    const bytes = readFileSync(filePath);
    const pdf = await PDFDocument.load(bytes);

    console.log(`\n=== ${label} ===`);
    console.log(`Pages: ${pdf.getPageCount()}`);

    for (let i = 0; i < pdf.getPageCount(); i++) {
        const page = pdf.getPage(i);
        const { width, height } = page.getSize();
        console.log(`  Page ${i + 1}: ${width} x ${height} points (${(width / 72).toFixed(1)}" x ${(height / 72).toFixed(1)}")`);
    }

    // Check for form fields
    const form = pdf.getForm();
    const fields = form.getFields();
    console.log(`Form fields: ${fields.length}`);
    fields.forEach(f => {
        console.log(`  - "${f.getName()}" (${f.constructor.name})`);
    });
}

await inspect('public/templates/completion-letter.pdf', 'Completion Letter');
await inspect('public/templates/hour-log.pdf', 'Hour Log');
