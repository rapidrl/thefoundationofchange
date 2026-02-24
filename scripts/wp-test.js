const https = require('https');

const WP_HOST = 'y8e.62b.myftpupload.com';
const WP_USER = '958945pwpadmin';
const WP_PASS = 'Pztp 9Hx2 lmbE 5RPx abB0 uytg';
const AUTH = 'Basic ' + Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64');

// Test XML-RPC
const xml = `<?xml version="1.0"?>
<methodCall>
  <methodName>wp.getProfile</methodName>
  <params>
    <param><value><int>1</int></value></param>
    <param><value><string>${WP_USER}</string></value></param>
    <param><value><string>${WP_PASS}</string></value></param>
  </params>
</methodCall>`;

const opts = {
    hostname: WP_HOST,
    path: '/xmlrpc.php',
    method: 'POST',
    headers: {
        'Content-Type': 'text/xml',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Length': Buffer.byteLength(xml),
    },
};

const req = https.request(opts, (r) => {
    let b = '';
    r.on('data', (c) => (b += c));
    r.on('end', () => {
        console.log('XML-RPC Status:', r.statusCode);
        console.log('Body:', b.substring(0, 800));
    });
});
req.write(xml);
req.end();

// Also test REST API with cookie-style
const opts2 = {
    hostname: WP_HOST,
    path: '/wp-json/',
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
};

https.get(opts2, (r) => {
    let b = '';
    r.on('data', (c) => (b += c));
    r.on('end', () => {
        console.log('\nREST API root Status:', r.statusCode);
        if (r.statusCode === 200) {
            try {
                const j = JSON.parse(b);
                console.log('Site name:', j.name);
                console.log('REST routes available:', Object.keys(j.routes || {}).length);
            } catch (e) {
                console.log('Body preview:', b.substring(0, 300));
            }
        } else {
            console.log('Body preview:', b.substring(0, 300));
        }
    });
});
