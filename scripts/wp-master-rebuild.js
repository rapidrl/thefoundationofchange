// Master rebuild: Fixes ALL issues in one pass
// 1. Creates /states index page
// 2. Rebuilds ALL 50 state pages with proper nearby states, footer, nav order
// 3. Rebuilds homepage with proper footer
// 4. Fixes footer structure to match Vercel exactly

const fs = require('fs');
const path = require('path');
const APP = 'https://app.thefoundationofchange.org';

// ─── STATE DATA (from stateData.ts) ───
const states = [
    { s: 'alabama', n: 'Alabama', a: 'AL', nb: ['florida', 'georgia', 'mississippi', 'tennessee'] },
    { s: 'alaska', n: 'Alaska', a: 'AK', nb: ['washington'] },
    { s: 'arizona', n: 'Arizona', a: 'AZ', nb: ['california', 'colorado', 'nevada', 'new-mexico', 'utah'] },
    { s: 'arkansas', n: 'Arkansas', a: 'AR', nb: ['louisiana', 'mississippi', 'missouri', 'oklahoma', 'tennessee', 'texas'] },
    { s: 'california', n: 'California', a: 'CA', nb: ['arizona', 'nevada', 'oregon'] },
    { s: 'colorado', n: 'Colorado', a: 'CO', nb: ['arizona', 'kansas', 'nebraska', 'new-mexico', 'oklahoma', 'utah', 'wyoming'] },
    { s: 'connecticut', n: 'Connecticut', a: 'CT', nb: ['massachusetts', 'new-york', 'rhode-island'] },
    { s: 'delaware', n: 'Delaware', a: 'DE', nb: ['maryland', 'new-jersey', 'pennsylvania'] },
    { s: 'florida', n: 'Florida', a: 'FL', nb: ['alabama', 'georgia'] },
    { s: 'georgia', n: 'Georgia', a: 'GA', nb: ['alabama', 'florida', 'north-carolina', 'south-carolina', 'tennessee'] },
    { s: 'hawaii', n: 'Hawaii', a: 'HI', nb: [] },
    { s: 'idaho', n: 'Idaho', a: 'ID', nb: ['montana', 'nevada', 'oregon', 'utah', 'washington', 'wyoming'] },
    { s: 'illinois', n: 'Illinois', a: 'IL', nb: ['indiana', 'iowa', 'kentucky', 'missouri', 'wisconsin'] },
    { s: 'indiana', n: 'Indiana', a: 'IN', nb: ['illinois', 'kentucky', 'michigan', 'ohio'] },
    { s: 'iowa', n: 'Iowa', a: 'IA', nb: ['illinois', 'minnesota', 'missouri', 'nebraska', 'south-dakota', 'wisconsin'] },
    { s: 'kansas', n: 'Kansas', a: 'KS', nb: ['colorado', 'missouri', 'nebraska', 'oklahoma'] },
    { s: 'kentucky', n: 'Kentucky', a: 'KY', nb: ['illinois', 'indiana', 'missouri', 'ohio', 'tennessee', 'virginia', 'west-virginia'] },
    { s: 'louisiana', n: 'Louisiana', a: 'LA', nb: ['arkansas', 'mississippi', 'texas'] },
    { s: 'maine', n: 'Maine', a: 'ME', nb: ['new-hampshire'] },
    { s: 'maryland', n: 'Maryland', a: 'MD', nb: ['delaware', 'pennsylvania', 'virginia', 'west-virginia'] },
    { s: 'massachusetts', n: 'Massachusetts', a: 'MA', nb: ['connecticut', 'new-hampshire', 'new-york', 'rhode-island', 'vermont'] },
    { s: 'michigan', n: 'Michigan', a: 'MI', nb: ['indiana', 'ohio', 'wisconsin'] },
    { s: 'minnesota', n: 'Minnesota', a: 'MN', nb: ['iowa', 'north-dakota', 'south-dakota', 'wisconsin'] },
    { s: 'mississippi', n: 'Mississippi', a: 'MS', nb: ['alabama', 'arkansas', 'louisiana', 'tennessee'] },
    { s: 'missouri', n: 'Missouri', a: 'MO', nb: ['arkansas', 'illinois', 'iowa', 'kansas', 'kentucky', 'nebraska', 'oklahoma', 'tennessee'] },
    { s: 'montana', n: 'Montana', a: 'MT', nb: ['idaho', 'north-dakota', 'south-dakota', 'wyoming'] },
    { s: 'nebraska', n: 'Nebraska', a: 'NE', nb: ['colorado', 'iowa', 'kansas', 'missouri', 'south-dakota', 'wyoming'] },
    { s: 'nevada', n: 'Nevada', a: 'NV', nb: ['arizona', 'california', 'idaho', 'oregon', 'utah'] },
    { s: 'new-hampshire', n: 'New Hampshire', a: 'NH', nb: ['maine', 'massachusetts', 'vermont'] },
    { s: 'new-jersey', n: 'New Jersey', a: 'NJ', nb: ['delaware', 'new-york', 'pennsylvania'] },
    { s: 'new-mexico', n: 'New Mexico', a: 'NM', nb: ['arizona', 'colorado', 'oklahoma', 'texas', 'utah'] },
    { s: 'new-york', n: 'New York', a: 'NY', nb: ['connecticut', 'massachusetts', 'new-jersey', 'pennsylvania', 'vermont'] },
    { s: 'north-carolina', n: 'North Carolina', a: 'NC', nb: ['georgia', 'south-carolina', 'tennessee', 'virginia'] },
    { s: 'north-dakota', n: 'North Dakota', a: 'ND', nb: ['minnesota', 'montana', 'south-dakota'] },
    { s: 'ohio', n: 'Ohio', a: 'OH', nb: ['indiana', 'kentucky', 'michigan', 'pennsylvania', 'west-virginia'] },
    { s: 'oklahoma', n: 'Oklahoma', a: 'OK', nb: ['arkansas', 'colorado', 'kansas', 'missouri', 'new-mexico', 'texas'] },
    { s: 'oregon', n: 'Oregon', a: 'OR', nb: ['california', 'idaho', 'nevada', 'washington'] },
    { s: 'pennsylvania', n: 'Pennsylvania', a: 'PA', nb: ['delaware', 'maryland', 'new-jersey', 'new-york', 'ohio', 'west-virginia'] },
    { s: 'rhode-island', n: 'Rhode Island', a: 'RI', nb: ['connecticut', 'massachusetts'] },
    { s: 'south-carolina', n: 'South Carolina', a: 'SC', nb: ['georgia', 'north-carolina'] },
    { s: 'south-dakota', n: 'South Dakota', a: 'SD', nb: ['iowa', 'minnesota', 'montana', 'nebraska', 'north-dakota', 'wyoming'] },
    { s: 'tennessee', n: 'Tennessee', a: 'TN', nb: ['alabama', 'arkansas', 'georgia', 'kentucky', 'mississippi', 'missouri', 'north-carolina', 'virginia'] },
    { s: 'texas', n: 'Texas', a: 'TX', nb: ['arkansas', 'louisiana', 'new-mexico', 'oklahoma'] },
    { s: 'utah', n: 'Utah', a: 'UT', nb: ['arizona', 'colorado', 'idaho', 'nevada', 'new-mexico', 'wyoming'] },
    { s: 'vermont', n: 'Vermont', a: 'VT', nb: ['massachusetts', 'new-hampshire', 'new-york'] },
    { s: 'virginia', n: 'Virginia', a: 'VA', nb: ['kentucky', 'maryland', 'north-carolina', 'tennessee', 'west-virginia'] },
    { s: 'washington', n: 'Washington', a: 'WA', nb: ['idaho', 'oregon'] },
    { s: 'west-virginia', n: 'West Virginia', a: 'WV', nb: ['kentucky', 'maryland', 'ohio', 'pennsylvania', 'virginia'] },
    { s: 'wisconsin', n: 'Wisconsin', a: 'WI', nb: ['illinois', 'iowa', 'michigan', 'minnesota'] },
    { s: 'wyoming', n: 'Wyoming', a: 'WY', nb: ['colorado', 'idaho', 'montana', 'nebraska', 'south-dakota', 'utah'] }
];

// Lookup state name by slug
const nameMap = {};
states.forEach(s => { nameMap[s.s] = s.n; });

// ─── SHARED COMPONENTS ───

// Header - EXACT Vercel nav order: Community Service, State Programs, FAQ, How It Works, Contact Us
const HDR = `<div class="tfc-header"><div class="tfc-header-inner"><a href="/" class="tfc-logo"><span class="tfc-logo-icon">TFC</span><span>The Foundation of Change</span></a><nav class="tfc-nav"><a href="/community">Community Service</a><a href="/states">State Programs</a><a href="/faq">FAQ</a><a href="/how-it-works">How It Works</a><a href="/contact-us">Contact Us</a><a href="${APP}/login" class="tfc-login">Log In</a><a href="${APP}/how-to-register" class="tfc-get-started">Get Started</a></nav></div></div>`;

// Footer - EXACT Vercel 3-column structure
const FTR = `<div class="tfc-footer"><div class="tfc-footer-grid"><div class="tfc-footer-col"><h3>About the Program</h3><ul><li><a href="/community">Community Service Program</a></li><li><a href="/how-it-works">How It Works</a></li><li><a href="/faq">Frequently Asked Questions</a></li><li><a href="/court-acceptance">Court Acceptance</a></li><li><a href="/program-details">Program Details</a></li><li><a href="/states">State Programs</a></li><li><a href="${APP}/dashboard">My Dashboard</a></li><li><a href="${APP}/coursework">My Coursework</a></li></ul></div><div class="tfc-footer-col"><h3>Verification &amp; Documents</h3><ul><li><a href="${APP}/certificate-verification">Verify a Certificate</a></li><li><a href="/enrollment-letter">Sample Enrollment Letter</a></li><li><a href="/terms-of-service">Attendance Policy</a></li><li><a href="/refund-policy">Refund Policy</a></li></ul></div><div class="tfc-footer-col"><h3>Contact Us</h3><div class="tfc-footer-contact"><a href="mailto:info@thefoundationofchange.org">info@thefoundationofchange.org</a><a href="tel:+17348346934">734-834-6934</a><a href="/contact-us">Secure Contact Form</a></div></div></div><div class="tfc-partner-section"><p class="tfc-partner-label">Other Programs — In Partnership With Schroeder Counseling</p><div class="tfc-partner-links"><a href="https://www.schroedercounseling.com/court-approved-anger-management-classes" target="_blank" rel="noopener">Anger Management Classes</a><a href="https://www.schroedercounseling.com/substance-abuse-asssessments" target="_blank" rel="noopener">Substance Abuse Assessments</a><a href="https://www.schroedercounseling.com/drug-and-alcohol" target="_blank" rel="noopener">Alcohol Education Classes</a><a href="https://www.schroedercounseling.com/theft-awareness-class" target="_blank" rel="noopener">Theft Awareness Classes</a></div></div><div class="tfc-bottom-bar"><p class="tfc-copyright">&copy; 2025 The Foundation of Change — 501(c)(3) Nonprofit — EIN: 33-5003265</p><div class="tfc-legal-links"><a href="/privacy-policy-2">Privacy</a><a href="/terms-of-service">Terms &amp; Conditions</a><a href="/refund-policy">Refund Policy</a></div></div></div>`;

// ─── STATE PAGE BUILDER ───
function buildStatePage(st) {
    const { s, n, a, nb } = st;

    // Nearby states HTML
    let nearbyHTML = '';
    if (nb.length > 0) {
        const links = nb.map(slug => {
            const name = nameMap[slug] || slug;
            return `<a href="/${slug}" class="tfc-nearby-link">Online Community Service in ${name}</a>`;
        }).join('');
        nearbyHTML = `<div class="tfc-nearby"><div class="tfc-nearby-inner"><h3>Community Service in Nearby States</h3><div class="tfc-nearby-grid">${links}</div><p style="margin-top:1rem;text-align:center"><a href="/states" style="opacity:0.8">View all 50 state programs →</a></p></div></div>`;
    }

    return `${HDR}
<div class="tfc-hero"><div class="tfc-hero-overlay"></div><div class="tfc-hero-content"><div class="tfc-badges"><span class="tfc-badge">✓ Court-Approved</span><span class="tfc-badge">✓ Probation-Compliant</span><span class="tfc-badge">✓ ${n} Accepted</span></div><h1>Complete Your Community Service Hours in ${n}<span class="tfc-accent"> — 100% Online</span></h1><p>A verified 501(c)(3) nonprofit program accepted by ${n} courts, probation officers, and schools. Start from home — finish on your schedule.</p><div class="tfc-hero-cta"><a href="${APP}/how-to-register" class="tfc-cta-primary">Enroll Now — Start Your ${a} Hours Today</a><a href="/contact-us" class="tfc-cta-secondary">Have Questions? Contact Us</a></div></div></div>

<div class="tfc-stats"><div class="tfc-stats-inner"><div class="tfc-stat-item"><span class="tfc-stat-value">10,000+</span><span class="tfc-stat-label">HOURS COMPLETED</span></div><div class="tfc-stat-item"><span class="tfc-stat-value">50</span><span class="tfc-stat-label">STATES COVERED</span></div><div class="tfc-stat-item"><span class="tfc-stat-value">4.9★</span><span class="tfc-stat-label">SATISFACTION RATING</span></div><div class="tfc-stat-item"><span class="tfc-stat-value">501(c)(3)</span><span class="tfc-stat-label">VERIFIED NONPROFIT</span></div></div></div>

<div class="tfc-section"><div class="container"><h2 class="tfc-section-title">How Online Community Service Works in ${n}</h2><p class="tfc-section-subtitle">Three simple steps to complete your community service requirement from anywhere in ${n}.</p><div class="tfc-steps"><div class="tfc-step-card"><div class="tfc-step-number">1</div><span class="tfc-step-icon">📋</span><h3>Choose Your Hours</h3><p>Select the exact number of community service hours you need — from 1 to 1,000.</p></div><div class="tfc-step-card"><div class="tfc-step-number">2</div><span class="tfc-step-icon">💻</span><h3>Complete Coursework</h3><p>Work through self-paced educational modules on accountability, personal growth, and community awareness.</p></div><div class="tfc-step-card"><div class="tfc-step-number">3</div><span class="tfc-step-icon">📜</span><h3>Download Certificate</h3><p>Instantly receive your verified certificate of completion with a unique verification code.</p></div></div></div></div>

<div class="tfc-section-alt"><div class="container"><h2 class="tfc-section-title">Is This Program Right For You?</h2><p class="tfc-section-subtitle">Whatever your situation in ${n}, we're here to help you move forward.</p><div class="tfc-audience-grid"><div class="tfc-audience-card"><span class="tfc-audience-icon">⚖️</span><h3>Court-Ordered Hours in ${n}?</h3><p>Fulfill your court-mandated community service through our verified online program. Accepted by ${n} courts across the state.</p><a href="${APP}/how-to-register" class="tfc-audience-cta">Start Your ${n} Court Hours →</a></div><div class="tfc-audience-card"><span class="tfc-audience-icon">🎓</span><h3>${n} Graduation Requirement?</h3><p>Earn service credit for graduation on your own schedule from anywhere in ${n}. Accepted by schools statewide.</p><a href="${APP}/how-to-register" class="tfc-audience-cta">Earn Your ${n} Credit →</a></div><div class="tfc-audience-card"><span class="tfc-audience-icon">🤝</span><h3>${n} Probation Requirement?</h3><p>Complete probation-mandated community service from the comfort of home. Certificates accepted by ${n} probation departments.</p><a href="${APP}/how-to-register" class="tfc-audience-cta">Get ${a} Compliant →</a></div></div></div></div>

<div class="tfc-mid-cta"><div class="container" style="text-align:center"><p class="tfc-mid-cta-text">Ready to start? Most ${n} participants finish within 1–2 weeks.</p><a href="${APP}/how-to-register" class="tfc-cta-primary">Complete Your ${n} Hours Now →</a></div></div>

<div class="tfc-section-alt"><div class="container"><h2 class="tfc-section-title">Why ${n} Residents Choose The Foundation of Change</h2><p class="tfc-section-subtitle">Everything you need to complete your community service with confidence.</p><div class="tfc-trust-grid"><div class="tfc-trust-card"><span class="tfc-trust-icon">🏛️</span><h3>Court Compliant</h3><p>Accepted by ${n} courts and probation departments statewide.</p></div><div class="tfc-trust-card"><span class="tfc-trust-icon">🔒</span><h3>Audit Ready</h3><p>Tamper-proof time tracking with verification logs for every session.</p></div><div class="tfc-trust-card"><span class="tfc-trust-icon">📄</span><h3>501(c)(3) Nonprofit</h3><p>Registered nonprofit — your hours carry legitimate weight.</p></div><div class="tfc-trust-card"><span class="tfc-trust-icon">⏰</span><h3>Self-Paced</h3><p>No deadlines. Complete hours at your pace from anywhere in ${n}.</p></div></div></div></div>

<div class="tfc-section"><div class="container"><h2 class="tfc-section-title">Frequently Asked Questions</h2><p class="tfc-section-subtitle">${n} Community Service — Answered</p><div class="tfc-faq-list"><div class="tfc-faq-item"><button class="tfc-faq-q" onclick="this.parentElement.classList.toggle('open')"><span>Is online community service accepted by ${n} courts?</span><span class="tfc-faq-chevron">+</span></button><div class="tfc-faq-a"><p>Our 501(c)(3) nonprofit program provides verified certificates with unique verification codes. Many ${n} courts accept online community service programs. We recommend confirming with your specific court or probation officer before enrolling.</p></div></div><div class="tfc-faq-item"><button class="tfc-faq-q" onclick="this.parentElement.classList.toggle('open')"><span>How do I prove my hours to my ${n} probation officer?</span><span class="tfc-faq-chevron">+</span></button><div class="tfc-faq-a"><p>You receive a certificate of completion and detailed hour log, both with a verification code your probation officer can verify through our online verification portal.</p></div></div><div class="tfc-faq-item"><button class="tfc-faq-q" onclick="this.parentElement.classList.toggle('open')"><span>How many hours can I complete per day?</span><span class="tfc-faq-chevron">+</span></button><div class="tfc-faq-a"><p>Up to 8 hours per day. The daily limit resets at midnight in your local timezone to ensure meaningful engagement.</p></div></div><div class="tfc-faq-item"><button class="tfc-faq-q" onclick="this.parentElement.classList.toggle('open')"><span>How long do I have to finish?</span><span class="tfc-faq-chevron">+</span></button><div class="tfc-faq-a"><p>There is no deadline. Complete hours at your own pace. Progress saves automatically.</p></div></div><div class="tfc-faq-item"><button class="tfc-faq-q" onclick="this.parentElement.classList.toggle('open')"><span>What does the coursework cover?</span><span class="tfc-faq-chevron">+</span></button><div class="tfc-faq-a"><p>Coursework covers accountability, emotional regulation, decision-making, community awareness, and personal growth through self-paced educational modules and written reflections.</p></div></div></div></div></div>

<div class="tfc-final-cta"><div class="tfc-final-cta-glow"></div><div class="tfc-final-cta-content"><h2>Start Your ${n} Community Service Hours Today</h2><p>Join participants across ${n} who have completed their hours online through our verified nonprofit program.</p><a href="${APP}/how-to-register" class="tfc-cta-primary">Complete Your ${n} Hours — Enroll Now</a></div></div>

${nearbyHTML}
${FTR}`;
}

// ─── STATES INDEX PAGE ───
function buildStatesIndex() {
    const cards = states.map(st => {
        return `<a href="/${st.s}" class="tfc-state-card"><span class="tfc-state-abbr">${st.a}</span><span class="tfc-state-name">${st.n}</span><span class="tfc-state-arrow">→</span></a>`;
    }).join('');

    return `${HDR}
<div class="tfc-hero"><div class="tfc-hero-overlay"></div><div class="tfc-hero-content"><div class="tfc-badges"><span class="tfc-badge">✓ Court-Approved</span><span class="tfc-badge">✓ All 50 States</span><span class="tfc-badge">✓ 501(c)(3) Nonprofit</span></div><h1>Online Community Service<span class="tfc-accent">Available in Every State</span></h1><p>Select your state to learn about court-approved online community service programs, requirements, and how to get started.</p></div></div>

<div class="tfc-section"><div class="container"><div class="tfc-search-bar"><input type="text" placeholder="Search your state..." class="tfc-search-input" id="state-search" oninput="filterStates(this.value)"></div><div class="tfc-states-grid" id="states-grid">${cards}</div></div></div>

<div class="tfc-section-alt"><div class="container"><h2 class="tfc-section-title">Why Choose The Foundation of Change?</h2><p class="tfc-section-subtitle">Trusted by participants across all 50 states for court-approved online community service.</p><div class="tfc-trust-grid"><div class="tfc-trust-card"><span class="tfc-trust-icon">🏛️</span><h3>Court Accepted Nationwide</h3><p>Our 501(c)(3) certificates are accepted by courts and probation departments in all 50 states.</p></div><div class="tfc-trust-card"><span class="tfc-trust-icon">⏰</span><h3>Complete On Your Schedule</h3><p>Self-paced with no deadlines. Up to 8 hours per day. Progress saves automatically.</p></div><div class="tfc-trust-card"><span class="tfc-trust-icon">📜</span><h3>Instant Certificates</h3><p>Download your verified certificate immediately upon completion. Includes verification code.</p></div><div class="tfc-trust-card"><span class="tfc-trust-icon">🔒</span><h3>Tamper-Proof Tracking</h3><p>Idle detection, anti-cheat measures, and detailed hour logs ensure audit-ready records.</p></div></div></div></div>

<div class="tfc-final-cta"><div class="tfc-final-cta-glow"></div><div class="tfc-final-cta-content"><h2>Ready to Get Started?</h2><p>Select your state above to learn more, or enroll now and begin your hours today.</p><a href="${APP}/how-to-register" class="tfc-cta-primary">Enroll Now — Get Started Today</a></div></div>

<script>function filterStates(q){var g=document.getElementById('states-grid');var cards=g.querySelectorAll('.tfc-state-card');cards.forEach(function(c){var name=c.querySelector('.tfc-state-name').textContent.toLowerCase();var abbr=c.querySelector('.tfc-state-abbr').textContent.toLowerCase();c.style.display=(name.includes(q.toLowerCase())||abbr.includes(q.toLowerCase()))?'':'none';});}</script>

${FTR}`;
}

// ─── HOMEPAGE ───
function buildHomepage() {
    return `${HDR}
<div class="tfc-hero"><div class="tfc-hero-overlay"></div><div class="tfc-hero-content"><div class="tfc-badges"><span class="tfc-badge">✓ Court-Approved</span><span class="tfc-badge">✓ 501(c)(3) Nonprofit</span></div><h1>Court-Accepted Community Service<span class="tfc-accent">You Can Complete 100% Online</span></h1><p>The Foundation of Change provides verified, trackable online community service hours accepted by courts, probation offices, and schools in all 50 states. Self-paced. Time-verified. Certificate upon completion.</p><div class="tfc-hero-cta"><a href="${APP}/how-to-register" class="tfc-cta-primary">Enroll Now — Get Started Today</a><a href="/how-it-works" class="tfc-cta-secondary">See How It Works</a></div></div></div>

<div class="tfc-stats"><div class="tfc-stats-inner"><div class="tfc-stat-item"><span class="tfc-stat-value">50</span><span class="tfc-stat-label">STATES SERVED</span></div><div class="tfc-stat-item"><span class="tfc-stat-value">501(c)(3)</span><span class="tfc-stat-label">NONPROFIT STATUS</span></div><div class="tfc-stat-item"><span class="tfc-stat-value">$28.99</span><span class="tfc-stat-label">STARTING PRICE</span></div><div class="tfc-stat-item"><span class="tfc-stat-value">100%</span><span class="tfc-stat-label">ONLINE</span></div></div></div>

<div class="tfc-section"><div class="container"><h2 class="tfc-section-title">How It Works</h2><p class="tfc-section-subtitle">Complete your hours in three simple steps.</p><div class="tfc-steps"><div class="tfc-step-card"><div class="tfc-step-number">1</div><span class="tfc-step-icon">📋</span><h3>Choose Your Hours</h3><p>Select the exact number of hours you need — from 1 to 1,000.</p></div><div class="tfc-step-card"><div class="tfc-step-number">2</div><span class="tfc-step-icon">💻</span><h3>Complete Coursework</h3><p>Work through self-paced modules on accountability and community awareness.</p></div><div class="tfc-step-card"><div class="tfc-step-number">3</div><span class="tfc-step-icon">📜</span><h3>Download Certificate</h3><p>Instantly receive your verified certificate with a unique verification code.</p></div></div></div></div>

<div class="tfc-section-alt"><div class="container"><h2 class="tfc-section-title">Who Is This For?</h2><p class="tfc-section-subtitle">Our program serves a wide range of needs.</p><div class="tfc-audience-grid"><div class="tfc-audience-card"><span class="tfc-audience-icon">⚖️</span><h3>Court-Ordered Community Service</h3><p>Fulfill your court-mandated hours through our verified 501(c)(3) nonprofit program. Accepted by courts nationwide.</p><a href="${APP}/how-to-register" class="tfc-audience-cta">Get Started →</a></div><div class="tfc-audience-card"><span class="tfc-audience-icon">🎓</span><h3>School Graduation Requirement</h3><p>Earn service credit for graduation on your schedule. Accepted by schools in all 50 states.</p><a href="${APP}/how-to-register" class="tfc-audience-cta">Start Now →</a></div><div class="tfc-audience-card"><span class="tfc-audience-icon">🤝</span><h3>Probation Compliance</h3><p>Complete probation-mandated community service from home. Verified certificates accepted by probation departments.</p><a href="${APP}/how-to-register" class="tfc-audience-cta">Enroll Today →</a></div></div></div></div>

<div class="tfc-section"><div class="container"><h2 class="tfc-section-title">Why Choose The Foundation of Change</h2><p class="tfc-section-subtitle">Everything you need to complete your service with confidence.</p><div class="tfc-trust-grid"><div class="tfc-trust-card"><span class="tfc-trust-icon">🏛️</span><h3>Court Compliant</h3><p>Accepted by courts and probation departments in all 50 states.</p></div><div class="tfc-trust-card"><span class="tfc-trust-icon">🔒</span><h3>Audit Ready</h3><p>Tamper-proof time tracking and verification logs for every session.</p></div><div class="tfc-trust-card"><span class="tfc-trust-icon">📄</span><h3>501(c)(3) Nonprofit</h3><p>Registered nonprofit — your hours carry legitimate weight.</p></div><div class="tfc-trust-card"><span class="tfc-trust-icon">⏰</span><h3>Self-Paced</h3><p>No deadlines. Complete hours at your pace from anywhere.</p></div></div></div></div>

<div class="tfc-final-cta"><div class="tfc-final-cta-glow"></div><div class="tfc-final-cta-content"><h2>Ready to Complete Your Community Service Hours?</h2><p>Join thousands of participants who have completed their hours online through our verified nonprofit program.</p><a href="${APP}/how-to-register" class="tfc-cta-primary">Enroll Now — Get Started Today</a></div></div>

${FTR}`;
}

// ─── GENERATE BATCH SCRIPTS ───
// Build a function that generates the update script for batches of pages
function generateBatchScript(pages, batchNum) {
    const data = {};
    pages.forEach(([slug, title, content]) => {
        data[slug] = { title, content };
    });

    return `(async function(){
var sm={};var all=[];var pg=1;
while(true){var r=await fetch('/wp-json/wp/v2/pages?per_page=100&page='+pg+'&_fields=id,slug',{headers:{'X-WP-Nonce':wpApiSettings.nonce}});if(!r.ok)break;var d=await r.json();if(!d.length)break;all=all.concat(d);pg++;}
all.forEach(function(p){sm[p.slug]=p.id;});
var pages=${JSON.stringify(data)};
var ok=0,errs=[];
for(var slug in pages){var p=pages[slug];var id=sm[slug];
try{if(id){var r=await fetch('/wp-json/wp/v2/pages/'+id,{method:'PUT',headers:{'Content-Type':'application/json','X-WP-Nonce':wpApiSettings.nonce},body:JSON.stringify({title:p.title,content:p.content,status:'publish'})});if(r.ok)ok++;else errs.push(slug+':'+r.status);}
else{var r=await fetch('/wp-json/wp/v2/pages',{method:'POST',headers:{'Content-Type':'application/json','X-WP-Nonce':wpApiSettings.nonce},body:JSON.stringify({title:p.title,slug:slug,content:p.content,status:'publish'})});if(r.ok)ok++;else errs.push(slug+':NEW'+r.status);}}
catch(e){errs.push(slug+':'+e.message);}
document.title='B${batchNum}: '+ok+'/'+Object.keys(pages).length;
await new Promise(function(r){setTimeout(r,500);});}
document.title='B${batchNum} DONE: '+ok+' ok'+( errs.length ? ', ERRS:'+errs.join(';') : '');
})();`;
}

// Build all pages
const allPages = [];

// Homepage
allPages.push(['home', 'The Easiest Way to Complete Your Community Service Hours', buildHomepage()]);

// States index
allPages.push(['states', 'Online Community Service — Available in Every State', buildStatesIndex()]);

// All 50 state pages
states.forEach(st => {
    allPages.push([st.s, `Online Community Service Hours in ${st.n}`, buildStatePage(st)]);
});

// Generate batches of 5 (smaller batches = better reliability)
const batchSize = 5;
for (let i = 0; i < allPages.length; i += batchSize) {
    const batch = allPages.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const script = generateBatchScript(batch, batchNum);
    const outPath = path.join(__dirname, `wp-fix-batch-${batchNum}.js`);
    fs.writeFileSync(outPath, script, 'utf8');
    const slugs = batch.map(b => b[0]);
    console.log(`Batch ${batchNum}: ${slugs.join(', ')} (${(Buffer.byteLength(script) / 1024).toFixed(1)} KB)`);
}

console.log(`\nTotal: ${Math.ceil(allPages.length / batchSize)} batches, ${allPages.length} pages`);
