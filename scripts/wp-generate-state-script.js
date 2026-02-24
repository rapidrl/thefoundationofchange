// This script reads all state HTML files and generates a browser-executable JS
// that pushes all state content to WordPress via REST API
const fs = require('fs');
const path = require('path');

const stateDir = path.join(__dirname, '..', 'wordpress', 'state-pages');
const files = fs.readdirSync(stateDir).filter(f => f.endsWith('.html'));

const stateData = {};

for (const file of files) {
    const html = fs.readFileSync(path.join(stateDir, file), 'utf8');

    // Extract body content (between <body> and </body>)
    const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
    if (!bodyMatch) continue;

    let body = bodyMatch[1].trim();

    // Extract title from <title> tag
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' | The Foundation of Change', '') : '';

    // Extract meta description
    const descMatch = html.match(/<meta name="description" content="(.*?)"/);
    const description = descMatch ? descMatch[1] : '';

    // Get slug from filename
    const slug = file.replace('.html', '');

    stateData[slug] = { title, body, description };
}

console.log(`Read ${Object.keys(stateData).length} state files`);

// Generate the browser script
let script = `(async function() {
  // Get all pages
  let allPages = [];
  let pg = 1;
  while (true) {
    const r = await fetch('/wp-json/wp/v2/pages?per_page=100&page=' + pg + '&_fields=id,slug');
    if (!r.ok) break;
    const d = await r.json();
    if (!d.length) break;
    allPages = allPages.concat(d);
    pg++;
  }
  const slugMap = {};
  allPages.forEach(p => slugMap[p.slug] = p.id);
  
  const states = ${JSON.stringify(stateData)};
  
  let updated = 0;
  let created = 0;
  let errors = [];
  const total = Object.keys(states).length;
  
  for (const [slug, data] of Object.entries(states)) {
    const pageId = slugMap[slug];
    
    try {
      if (pageId) {
        // Update existing page
        const r = await fetch('/wp-json/wp/v2/pages/' + pageId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': wpApiSettings.nonce },
          body: JSON.stringify({ title: data.title, content: data.body, status: 'publish' })
        });
        if (r.ok) { updated++; }
        else { errors.push(slug + ': update ' + r.status); }
      } else {
        // Create new page
        const r = await fetch('/wp-json/wp/v2/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': wpApiSettings.nonce },
          body: JSON.stringify({ title: data.title, slug: slug, content: data.body, status: 'publish' })
        });
        if (r.ok) { created++; }
        else { errors.push(slug + ': create ' + r.status); }
      }
    } catch(e) {
      errors.push(slug + ': ' + e.message);
    }
    
    document.title = 'States: ' + (updated + created) + '/' + total + ' (' + errors.length + ' errors)';
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  document.title = 'DONE: ' + updated + ' updated, ' + created + ' created, ' + errors.length + ' errors. ' + errors.join('; ');
  console.log('Complete!', { updated, created, errors });
})();`;

// Write the browser script to a file
fs.writeFileSync(path.join(__dirname, 'wp-push-states-browser.js'), script, 'utf8');
console.log('Browser script written to scripts/wp-push-states-browser.js');
console.log(`Script size: ${(Buffer.byteLength(script) / 1024).toFixed(1)} KB`);
