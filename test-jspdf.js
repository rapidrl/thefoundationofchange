const { jsPDF } = require('jspdf');
const doc = new jsPDF();
doc.text('Hello World', 10, 10);
console.log('jsPDF works. Output length:', doc.output().length);

// Test adding an image from buffer
const fs = require('fs');
const sharp = require('sharp');
console.log('jsPDF version:', jsPDF.version || 'unknown');

// Check if addImage exists
console.log('addImage method exists:', typeof doc.addImage === 'function');
