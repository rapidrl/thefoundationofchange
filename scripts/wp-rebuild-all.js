// This script generates the browser-executable JS to rebuild ALL WordPress pages
// with pixel-perfect HTML matching the Vercel app.
const fs = require('fs');
const path = require('path');

const APP = 'https://app.thefoundationofchange.org';
const WP = 'https://thefoundationofchange.org';

// ──── SHARED COMPONENTS ────
const header = `<div class="tfc-header"><div class="tfc-header-inner"><a href="/" class="tfc-logo"><span class="tfc-logo-icon">TFC</span><span>The Foundation of Change</span></a><nav class="tfc-nav"><a href="/how-it-works">How It Works</a><a href="/community">Community Service</a><a href="/states">State Programs</a><a href="/faq">FAQ</a><a href="/contact-us">Contact Us</a><a href="${APP}/login" class="tfc-login">Log In</a><a href="${APP}/start-now" class="tfc-get-started">Get Started</a></nav></div></div>`;

const footer = `<div class="tfc-footer"><div class="tfc-footer-inner"><div class="tfc-footer-brand"><strong style="color:#fff;font-size:1.1rem">The Foundation of Change</strong><p>Verified 501(c)(3) nonprofit providing online community service hours accepted by courts, probation departments, and schools nationwide.</p><p style="font-size:0.8rem;color:#6b7280">EIN: 33-5003265</p></div><div><h4>Program</h4><a href="/community">Community Service</a><a href="/how-it-works">How It Works</a><a href="/faq">FAQ</a><a href="/states">State Programs</a><a href="${APP}/start-now">Enroll Now</a></div><div><h4>Verification</h4><a href="${APP}/certificate-verification">Verify a Certificate</a><a href="/terms-of-service">Terms of Service</a><a href="/privacy-policy-2">Privacy Policy</a><a href="/refund-policy">Refund Policy</a></div><div><h4>Contact</h4><a href="mailto:info@thefoundationofchange.org">info@thefoundationofchange.org</a><a href="tel:+17348346934">734-834-6934</a><a href="/contact-us">Contact Form</a></div></div><div style="max-width:1200px;margin:20px auto 0;padding:16px 24px 0;border-top:1px solid #2a3a5c;font-size:0.75rem;color:#6b7280;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px"><p style="margin:0">© 2026 The Foundation of Change — 501(c)(3) Nonprofit</p><div style="display:flex;gap:16px"><a href="/privacy-policy-2" style="color:#6b7280;font-size:0.75rem">Privacy</a><a href="/terms-of-service" style="color:#6b7280;font-size:0.75rem">Terms</a><a href="/refund-policy" style="color:#6b7280;font-size:0.75rem">Refund Policy</a></div></div></div>`;

// Partner section
const partners = `<div style="max-width:1200px;margin:0 auto;padding:20px 24px 0;border-top:1px solid rgba(255,255,255,0.1)"><p style="color:#6b7280;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px">Other Programs — In Partnership With Schroeder Counseling</p><div style="display:flex;flex-wrap:wrap;gap:16px"><a href="https://www.schroedercounseling.com/court-approved-anger-management-classes" target="_blank" rel="noopener" style="color:#9ca3af;font-size:0.85rem">Anger Management Classes</a><a href="https://www.schroedercounseling.com/substance-abuse-asssessments" target="_blank" rel="noopener" style="color:#9ca3af;font-size:0.85rem">Substance Abuse Assessments</a><a href="https://www.schroedercounseling.com/drug-and-alcohol" target="_blank" rel="noopener" style="color:#9ca3af;font-size:0.85rem">Alcohol Education Classes</a><a href="https://www.schroedercounseling.com/theft-awareness-class" target="_blank" rel="noopener" style="color:#9ca3af;font-size:0.85rem">Theft Awareness Classes</a></div></div>`;

// ──── STATE PAGE BUILDER ────
function buildStatePage(name, abbr) {
    const slug = name.toLowerCase().replace(/ /g, '-');
    return `${header}
<div class="tfc-hero">
<div class="tfc-badges"><span class="tfc-badge">✓ Court-Approved</span><span class="tfc-badge">✓ Probation-Compliant</span><span class="tfc-badge">✓ ${name} Accepted</span></div>
<h1>Complete Your Community Service Hours in ${name}<span class="tfc-accent"> — 100% Online</span></h1>
<p>A verified 501(c)(3) nonprofit program accepted by ${name} courts, probation officers, and schools. Start from home — finish on your schedule.</p>
<div class="tfc-hero-cta"><a href="${APP}/start-now" class="tfc-cta-primary">Enroll Now — Start Your ${abbr} Hours Today</a><a href="/contact-us" class="tfc-cta-secondary">Have Questions? Contact Us</a></div>
</div>

<div class="tfc-stats"><div class="tfc-stats-inner"><div><span class="tfc-stat-value">10,000+</span><span class="tfc-stat-label">Hours Completed</span></div><div><span class="tfc-stat-value">50</span><span class="tfc-stat-label">States Covered</span></div><div><span class="tfc-stat-value">4.9★</span><span class="tfc-stat-label">Satisfaction Rating</span></div><div><span class="tfc-stat-value">501(c)(3)</span><span class="tfc-stat-label">Verified Nonprofit</span></div></div></div>

<div class="tfc-section">
<h2 class="tfc-section-title">How Online Community Service Works in ${name}</h2>
<p class="tfc-section-subtitle">Three simple steps to complete your community service requirement from anywhere in ${name}.</p>
<div class="tfc-steps">
<div class="tfc-step-card"><div class="tfc-step-number">1</div><span class="tfc-step-icon">📋</span><h3>Choose Your Hours</h3><p>Select the exact number of community service hours you need — from 1 to 1,000.</p></div>
<div class="tfc-step-card"><div class="tfc-step-number">2</div><span class="tfc-step-icon">💻</span><h3>Complete Coursework</h3><p>Work through self-paced educational modules on accountability, personal growth, and community awareness.</p></div>
<div class="tfc-step-card"><div class="tfc-step-number">3</div><span class="tfc-step-icon">📜</span><h3>Download Certificate</h3><p>Instantly receive your verified certificate of completion with a unique verification code.</p></div>
</div></div>

<div class="tfc-section-alt"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<h2 class="tfc-section-title">Is This Program Right For You?</h2>
<p class="tfc-section-subtitle">Whatever your situation in ${name}, we're here to help you move forward.</p>
<div class="tfc-audience-grid">
<div class="tfc-audience-card"><span class="tfc-audience-icon">⚖️</span><h3>Court-Ordered Hours in ${name}?</h3><p>Fulfill your court-mandated community service through our verified online program. Accepted by ${name} courts across the state.</p><a href="${APP}/start-now" class="tfc-audience-cta">Start Your ${name} Court Hours →</a></div>
<div class="tfc-audience-card"><span class="tfc-audience-icon">🎓</span><h3>${name} Graduation Requirement?</h3><p>Earn service credit for graduation on your own schedule from anywhere in ${name}. Accepted by schools statewide.</p><a href="${APP}/start-now" class="tfc-audience-cta">Earn Your ${name} Credit →</a></div>
<div class="tfc-audience-card"><span class="tfc-audience-icon">🤝</span><h3>${name} Probation Requirement?</h3><p>Complete probation-mandated community service from the comfort of home. Certificates accepted by ${name} probation departments.</p><a href="${APP}/start-now" class="tfc-audience-cta">Get ${abbr} Compliant →</a></div>
</div></div></div>

<div class="tfc-mid-cta"><div style="max-width:1200px;margin:0 auto;text-align:center;padding:0 24px"><p style="font-size:1.125rem;color:#1a2744;font-weight:500;margin-bottom:20px">Ready to start? Most ${name} participants finish within 1–2 weeks.</p><a href="${APP}/start-now" class="tfc-cta-primary">Complete Your ${name} Hours Now →</a></div></div>

<div class="tfc-section"><div class="tfc-seo-content">
<h2>Online Community Service in ${name} — What You Need to Know</h2>
<p>${name} residents who need to complete community service hours — whether for court requirements, probation conditions, school graduation, or personal development — can fulfill their obligations entirely online through The Foundation of Change. Our 501(c)(3) nonprofit program provides a structured, self-paced educational experience accepted by courts and probation departments throughout ${name}.</p>
<h3>Verification and Acceptance</h3>
<p>Every certificate includes a unique verification code that ${name} courts and probation officers can independently verify through our <a href="${APP}/certificate-verification">online verification portal</a>. We provide detailed hour logs showing dates, times, and hours completed. Our 501(c)(3) nonprofit status provides the legitimacy ${name} courts expect.</p>
<h3>Getting Started in ${name}</h3>
<p>Enroll today and begin your hours immediately. There are no deadlines — work at your own pace with an 8-hour daily maximum. Your progress saves automatically on any device. Upon completion, your certificate and hour log are instantly available. <a href="${APP}/start-now" style="font-weight:600">Start your ${name} community service hours now</a>.</p>
</div></div>

<div class="tfc-section-alt"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<h2 class="tfc-section-title">Why ${name} Residents Choose The Foundation of Change</h2>
<p class="tfc-section-subtitle">Everything you need to complete your community service with confidence.</p>
<div class="tfc-trust-grid">
<div class="tfc-trust-card"><span class="tfc-trust-icon">🏛️</span><h3>Court Compliant</h3><p>Accepted by ${name} courts and probation departments statewide.</p></div>
<div class="tfc-trust-card"><span class="tfc-trust-icon">🔒</span><h3>Audit Ready</h3><p>Tamper-proof time tracking with verification logs for every session.</p></div>
<div class="tfc-trust-card"><span class="tfc-trust-icon">📄</span><h3>501(c)(3) Nonprofit</h3><p>Registered nonprofit — your hours carry legitimate weight.</p></div>
<div class="tfc-trust-card"><span class="tfc-trust-icon">⏰</span><h3>Self-Paced</h3><p>No deadlines. Complete hours at your pace from anywhere in ${name}.</p></div>
</div></div></div>

<div class="tfc-section"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<h2 class="tfc-section-title">Frequently Asked Questions</h2>
<p class="tfc-section-subtitle">${name} Community Service — Answered</p>
<div class="tfc-faq-list">
<details class="tfc-faq"><summary>Is online community service accepted by ${name} courts?</summary><p>Our 501(c)(3) nonprofit program provides verified certificates with unique verification codes. Many ${name} courts accept online community service programs. We recommend confirming with your specific court or probation officer before enrolling.</p></details>
<details class="tfc-faq"><summary>How do I prove my hours to my ${name} probation officer?</summary><p>You receive a certificate of completion and detailed hour log, both with a verification code your probation officer can verify through our online verification portal.</p></details>
<details class="tfc-faq"><summary>How many hours can I complete per day?</summary><p>Up to 8 hours per day. The daily limit resets at midnight in your local timezone to ensure meaningful engagement.</p></details>
<details class="tfc-faq"><summary>How long do I have to finish?</summary><p>There is no deadline. Complete hours at your own pace. Progress saves automatically.</p></details>
<details class="tfc-faq"><summary>What does the coursework cover?</summary><p>Coursework covers accountability, emotional regulation, decision-making, community awareness, and personal growth through self-paced educational modules and written reflections.</p></details>
</div></div></div>

<div class="tfc-final-cta">
<h2>Start Your ${name} Community Service Hours Today</h2>
<p>Join participants across ${name} who have completed their hours online through our verified nonprofit program.</p>
<a href="${APP}/start-now" class="tfc-cta-primary">Complete Your ${name} Hours — Enroll Now</a>
</div>

<div class="tfc-nearby"><h3>Community Service in Nearby States</h3><div class="tfc-nearby-links"><a href="/states" class="tfc-nearby-link">View All 50 State Programs →</a></div></div>

${partners}
${footer}`;
}

// ──── STATE LIST ────
const states = [
    { name: 'Alabama', abbr: 'AL' }, { name: 'Alaska', abbr: 'AK' }, { name: 'Arizona', abbr: 'AZ' },
    { name: 'Arkansas', abbr: 'AR' }, { name: 'California', abbr: 'CA' }, { name: 'Colorado', abbr: 'CO' },
    { name: 'Connecticut', abbr: 'CT' }, { name: 'Delaware', abbr: 'DE' }, { name: 'Florida', abbr: 'FL' },
    { name: 'Georgia', abbr: 'GA' }, { name: 'Hawaii', abbr: 'HI' }, { name: 'Idaho', abbr: 'ID' },
    { name: 'Illinois', abbr: 'IL' }, { name: 'Indiana', abbr: 'IN' }, { name: 'Iowa', abbr: 'IA' },
    { name: 'Kansas', abbr: 'KS' }, { name: 'Kentucky', abbr: 'KY' }, { name: 'Louisiana', abbr: 'LA' },
    { name: 'Maine', abbr: 'ME' }, { name: 'Maryland', abbr: 'MD' }, { name: 'Massachusetts', abbr: 'MA' },
    { name: 'Michigan', abbr: 'MI' }, { name: 'Minnesota', abbr: 'MN' }, { name: 'Mississippi', abbr: 'MS' },
    { name: 'Missouri', abbr: 'MO' }, { name: 'Montana', abbr: 'MT' }, { name: 'Nebraska', abbr: 'NE' },
    { name: 'Nevada', abbr: 'NV' }, { name: 'New Hampshire', abbr: 'NH' }, { name: 'New Jersey', abbr: 'NJ' },
    { name: 'New Mexico', abbr: 'NM' }, { name: 'New York', abbr: 'NY' }, { name: 'North Carolina', abbr: 'NC' },
    { name: 'North Dakota', abbr: 'ND' }, { name: 'Ohio', abbr: 'OH' }, { name: 'Oklahoma', abbr: 'OK' },
    { name: 'Oregon', abbr: 'OR' }, { name: 'Pennsylvania', abbr: 'PA' }, { name: 'Rhode Island', abbr: 'RI' },
    { name: 'South Carolina', abbr: 'SC' }, { name: 'South Dakota', abbr: 'SD' },
    { name: 'Tennessee', abbr: 'TN' }, { name: 'Texas', abbr: 'TX' }, { name: 'Utah', abbr: 'UT' },
    { name: 'Vermont', abbr: 'VT' }, { name: 'Virginia', abbr: 'VA' }, { name: 'Washington', abbr: 'WA' },
    { name: 'West Virginia', abbr: 'WV' }, { name: 'Wisconsin', abbr: 'WI' }, { name: 'Wyoming', abbr: 'WY' }
];

// Build all state page data
const statePages = {};
for (const s of states) {
    const slug = s.name.toLowerCase().replace(/ /g, '-');
    statePages[slug] = {
        title: `Online Community Service Hours in ${s.name}`,
        content: buildStatePage(s.name, s.abbr)
    };
}

// ──── HOMEPAGE ────
const homepage = `${header}
<div class="tfc-hero">
<div class="tfc-badges"><span class="tfc-badge">✓ Court-Approved</span><span class="tfc-badge">✓ 501(c)(3) Nonprofit</span></div>
<h1>Court-Accepted Community Service<span class="tfc-accent">You Can Complete 100% Online</span></h1>
<p>The Foundation of Change provides verified, trackable online community service hours accepted by courts, probation offices, and schools in all 50 states. Self-paced. Time-verified. Certificate upon completion.</p>
<div class="tfc-hero-cta"><a href="${APP}/start-now" class="tfc-cta-primary">Enroll Now — Get Started Today</a><a href="/how-it-works" class="tfc-cta-secondary">See How It Works</a></div>
</div>

<div class="tfc-stats"><div class="tfc-stats-inner"><div><span class="tfc-stat-value">50</span><span class="tfc-stat-label">States Served</span></div><div><span class="tfc-stat-value">501(c)(3)</span><span class="tfc-stat-label">Nonprofit Status</span></div><div><span class="tfc-stat-value">$28.99</span><span class="tfc-stat-label">Starting Price</span></div><div><span class="tfc-stat-value">100%</span><span class="tfc-stat-label">Online</span></div></div></div>

<div class="tfc-section">
<h2 class="tfc-section-title">How It Works</h2>
<p class="tfc-section-subtitle">Complete your hours in three simple steps.</p>
<div class="tfc-steps">
<div class="tfc-step-card"><div class="tfc-step-number">1</div><span class="tfc-step-icon">📋</span><h3>Choose Your Hours</h3><p>Select the exact number of hours you need — from 1 to 1,000.</p></div>
<div class="tfc-step-card"><div class="tfc-step-number">2</div><span class="tfc-step-icon">💻</span><h3>Complete Coursework</h3><p>Work through self-paced modules on accountability and community awareness.</p></div>
<div class="tfc-step-card"><div class="tfc-step-number">3</div><span class="tfc-step-icon">📜</span><h3>Download Certificate</h3><p>Instantly receive your verified certificate with a unique verification code.</p></div>
</div></div>

<div class="tfc-section-alt"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<h2 class="tfc-section-title">Who Is This For?</h2>
<p class="tfc-section-subtitle">Our program serves a wide range of needs.</p>
<div class="tfc-audience-grid">
<div class="tfc-audience-card"><span class="tfc-audience-icon">⚖️</span><h3>Court-Ordered Community Service</h3><p>Fulfill your court-mandated hours through our verified 501(c)(3) nonprofit program. Accepted by courts nationwide.</p><a href="${APP}/start-now" class="tfc-audience-cta">Get Started →</a></div>
<div class="tfc-audience-card"><span class="tfc-audience-icon">🎓</span><h3>School Graduation Requirement</h3><p>Earn service credit for graduation on your schedule. Accepted by schools in all 50 states.</p><a href="${APP}/start-now" class="tfc-audience-cta">Start Now →</a></div>
<div class="tfc-audience-card"><span class="tfc-audience-icon">🤝</span><h3>Probation Compliance</h3><p>Complete probation-mandated community service from home. Verified certificates accepted by probation departments.</p><a href="${APP}/start-now" class="tfc-audience-cta">Enroll Today →</a></div>
</div></div></div>

<div class="tfc-section"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<h2 class="tfc-section-title">Why Choose The Foundation of Change</h2>
<p class="tfc-section-subtitle">Everything you need to complete your service with confidence.</p>
<div class="tfc-trust-grid">
<div class="tfc-trust-card"><span class="tfc-trust-icon">🏛️</span><h3>Court Compliant</h3><p>Accepted by courts and probation departments in all 50 states.</p></div>
<div class="tfc-trust-card"><span class="tfc-trust-icon">🔒</span><h3>Audit Ready</h3><p>Tamper-proof time tracking and verification logs for every session.</p></div>
<div class="tfc-trust-card"><span class="tfc-trust-icon">📄</span><h3>501(c)(3) Nonprofit</h3><p>Registered nonprofit — your hours carry legitimate weight.</p></div>
<div class="tfc-trust-card"><span class="tfc-trust-icon">⏰</span><h3>Self-Paced</h3><p>No deadlines. Complete hours at your pace from anywhere.</p></div>
</div></div></div>

<div class="tfc-final-cta">
<h2>Ready to Complete Your Community Service Hours?</h2>
<p>Join thousands of participants who have completed their hours online through our verified nonprofit program.</p>
<a href="${APP}/start-now" class="tfc-cta-primary">Enroll Now — Get Started Today</a>
</div>

${partners}
${footer}`;

// ──── GENERATE OUTPUT ────
// Write individual state scripts in batches of 10
const allPages = { home: { title: 'The Easiest Way to Complete Your Community Service Hours', content: homepage }, ...statePages };

// Generate ONE combined script since we need batch execution
const entries = Object.entries(allPages);
const batchSize = 10;
const batches = [];
for (let i = 0; i < entries.length; i += batchSize) {
    batches.push(entries.slice(i, i + batchSize));
}

for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    const data = {};
    batch.forEach(([slug, { title, content }]) => {
        data[slug] = { title, content };
    });

    const script = `(async function(){
var sm={};var allPages=[];var pg=1;
while(true){var r=await fetch('/wp-json/wp/v2/pages?per_page=100&page='+pg+'&_fields=id,slug');if(!r.ok)break;var d=await r.json();if(!d.length)break;allPages=allPages.concat(d);pg++;}
allPages.forEach(function(p){sm[p.slug]=p.id;});
var pages=${JSON.stringify(data)};
var ok=0,errs=[];
for(var slug in pages){var p=pages[slug];var id=sm[slug];
try{if(id){var r=await fetch('/wp-json/wp/v2/pages/'+id,{method:'PUT',headers:{'Content-Type':'application/json','X-WP-Nonce':wpApiSettings.nonce},body:JSON.stringify({title:p.title,content:p.content,status:'publish'})});if(r.ok)ok++;else errs.push(slug+':'+r.status);}
else{var r=await fetch('/wp-json/wp/v2/pages',{method:'POST',headers:{'Content-Type':'application/json','X-WP-Nonce':wpApiSettings.nonce},body:JSON.stringify({title:p.title,slug:slug,content:p.content,status:'publish'})});if(r.ok)ok++;else errs.push(slug+':create'+r.status);}}
catch(e){errs.push(slug+':'+e.message);}
document.title='B${b + 1}: '+ok+'/'+Object.keys(pages).length;
await new Promise(function(r){setTimeout(r,500);});}
document.title='B${b + 1} DONE: '+ok+' ok, '+errs.length+' err. '+errs.join('; ');
})();`;

    const outPath = path.join(__dirname, `wp-rebuild-batch-${b + 1}.js`);
    fs.writeFileSync(outPath, script, 'utf8');
    const slugs = batch.map(([s]) => s);
    console.log(`Batch ${b + 1}: ${slugs.join(', ')} (${(Buffer.byteLength(script) / 1024).toFixed(1)} KB)`);
}

console.log(`\nTotal: ${batches.length} batches, ${entries.length} pages`);
