/**
 * WP Direct API Updater — runs outside browser using Node.js fetch
 * Usage: node scripts/wp-direct-update.js
 * 
 * This reads batch files and sends them directly to the WP REST API
 * using application passwords for authentication.
 */
const https = require('https');
const http = require('http');

const WP_URL = 'https://y8e.62b.myftpupload.com';
const WP_USER = 'rapidrl';
// Application password (spaces removed)
const WP_APP_PASS = 'RFZ1 EWoH iYS0 KLgc Bk4f mvSS';

const AUTH = Buffer.from(`${WP_USER}:${WP_APP_PASS}`).toString('base64');

function wpFetch(endpoint, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, WP_URL);
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Authorization': `Basic ${AUTH}`,
                'Content-Type': 'application/json',
                'User-Agent': 'TFC-Rebuild/1.0',
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ error: data.substring(0, 500) });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    console.log('Checking authentication...');
    const me = await wpFetch('/wp-json/wp/v2/users/me');
    if (me.id) {
        console.log(`✓ Authenticated as: ${me.name} (id=${me.id})`);
    } else {
        console.log('✗ Auth failed:', JSON.stringify(me).substring(0, 200));
        console.log('Will try browser-based approach instead.');
        return;
    }

    // Get all pages
    console.log('\nFetching all pages...');
    let allPages = [];
    let page = 1;
    while (true) {
        const batch = await wpFetch(`/wp-json/wp/v2/pages?per_page=100&page=${page}&_fields=id,slug,title`);
        if (Array.isArray(batch) && batch.length > 0) {
            allPages = allPages.concat(batch);
            page++;
        } else {
            break;
        }
    }
    console.log(`Found ${allPages.length} pages total`);

    // Show which state pages exist
    const statesSlugs = require('../wp-state-batches/batch-1.js.slugs.json');
    // Actually let's just list them
    const found = [];
    const missing = [];
    const testSlugs = ['alabama', 'alaska', 'arizona', 'arkansas', 'california'];
    for (const slug of testSlugs) {
        const match = allPages.find(p => p.slug === slug);
        if (match) found.push(`${slug} (id=${match.id})`);
        else missing.push(slug);
    }
    console.log(`Found: ${found.join(', ')}`);
    if (missing.length) console.log(`Missing: ${missing.join(', ')}`);
}

main().catch(console.error);
