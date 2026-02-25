const https = require('https');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'assets');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Logo icon (circular plant) - get original quality (no size restriction)
const logoUrl = 'https://static.wixstatic.com/media/429950_030092c0a5ef476db1c0f52f7ba1f93a~mv2.png/v1/fill/w_400,h_400,al_c,q_85,usm_0.66_1.00_0.01/429950_030092c0a5ef476db1c0f52f7ba1f93a~mv2.png';

// Gold seal/award image
const sealUrl = 'https://static.wixstatic.com/media/429950_7eaebd70064a4b9a878740f4b4a87251~mv2.png/v1/fill/w_200,h_200,al_c,q_85,usm_0.66_1.00_0.01/award.png';

function download(url, filename) {
    return new Promise((resolve, reject) => {
        const outPath = path.join(dir, filename);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                download(res.headers.location, filename).then(resolve).catch(reject);
                return;
            }
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => {
                const buf = Buffer.concat(chunks);
                fs.writeFileSync(outPath, buf);
                console.log(`Saved ${filename}: ${buf.length} bytes, status=${res.statusCode}, type=${res.headers['content-type']}`);
                resolve();
            });
        }).on('error', reject);
    });
}

async function main() {
    await download(logoUrl, 'logo.png');
    await download(sealUrl, 'seal.png');

    console.log('Files:', fs.readdirSync(dir).map(f => `${f} (${fs.statSync(path.join(dir, f)).size} bytes)`));
}

main().catch(console.error);
