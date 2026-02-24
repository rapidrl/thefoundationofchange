// Generate 5 batch scripts for pushing state content to WordPress
const fs = require('fs');
const path = require('path');

const stateDir = path.join(__dirname, '..', 'wordpress', 'state-pages');
const files = fs.readdirSync(stateDir).filter(f => f.endsWith('.html')).sort();

const batchSize = 10;
for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;

    const stateData = {};
    for (const file of batch) {
        const html = fs.readFileSync(path.join(stateDir, file), 'utf8');
        const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
        if (!bodyMatch) continue;
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        const title = titleMatch ? titleMatch[1].replace(' | The Foundation of Change', '') : '';
        const slug = file.replace('.html', '');
        stateData[slug] = { title, body: bodyMatch[1].trim() };
    }

    const script = `(async function() {
  const allPages = [];
  let pg = 1;
  while (true) {
    const r = await fetch('/wp-json/wp/v2/pages?per_page=100&page=' + pg + '&_fields=id,slug');
    if (!r.ok) break;
    const d = await r.json();
    if (!d.length) break;
    allPages.push(...d);
    pg++;
  }
  const slugMap = {};
  allPages.forEach(p => slugMap[p.slug] = p.id);
  const states = ${JSON.stringify(stateData)};
  let ok = 0, errs = [];
  for (const [slug, data] of Object.entries(states)) {
    const id = slugMap[slug];
    if (!id) { 
      // Try to create
      const r = await fetch('/wp-json/wp/v2/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': wpApiSettings.nonce },
        body: JSON.stringify({ title: data.title, slug, content: data.body, status: 'publish' })
      });
      if (r.ok) ok++; else errs.push(slug + ':' + r.status);
    } else {
      const r = await fetch('/wp-json/wp/v2/pages/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': wpApiSettings.nonce },
        body: JSON.stringify({ title: data.title, content: data.body, status: 'publish' })
      });
      if (r.ok) ok++; else errs.push(slug + ':' + r.status);
    }
    document.title = 'Batch ${batchNum}: ' + ok + '/' + Object.keys(states).length;
    await new Promise(r => setTimeout(r, 500));
  }
  document.title = 'Batch ${batchNum} DONE: ' + ok + ' ok, ' + errs.length + ' err. ' + errs.join('; ');
})();`;

    fs.writeFileSync(path.join(__dirname, `wp-batch-${batchNum}.js`), script, 'utf8');
    console.log(`Batch ${batchNum}: ${batch.map(f => f.replace('.html', '')).join(', ')} (${(Buffer.byteLength(script) / 1024).toFixed(1)} KB)`);
}
console.log('Done! 5 batch files generated.');
