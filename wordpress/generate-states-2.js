const fs = require('fs');
const path = require('path');

const states = [
    { name: 'Montana', slug: 'montana', abbr: 'MT', capital: 'Helena', cities: ['Billings', 'Missoula', 'Great Falls', 'Bozeman'], courts: 'District Courts across 22 judicial districts and Justice Courts', neighbors: ['Idaho', 'North Dakota', 'South Dakota', 'Wyoming'], uniqueAngles: "Montana is the fourth-largest state by area but ranks near the bottom in population density. Many Montana communities are hours from the nearest courthouse or community service organization, making online alternatives not just convenient but necessary. Our program serves Montana residents from Billings to remote ranch communities in the eastern plains." },
    { name: 'Nebraska', slug: 'nebraska', abbr: 'NE', capital: 'Lincoln', cities: ['Omaha', 'Bellevue', 'Grand Island', 'Kearney'], courts: 'District Courts across 12 judicial districts and County Courts', neighbors: ['Colorado', 'Iowa', 'Kansas', 'Missouri', 'South Dakota', 'Wyoming'], uniqueAngles: "Nebraska's 12 judicial districts serve 93 counties, many of them rural agricultural communities where in-person community service options are limited. The Douglas County District Court in Omaha handles the largest case volume, but our program equally serves residents in western Nebraska's sprawling cattle country where the next town may be an hour away." },
    { name: 'Nevada', slug: 'nevada', abbr: 'NV', capital: 'Carson City', cities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas'], courts: 'District Courts across 11 judicial districts, Justice Courts, and Municipal Courts', neighbors: ['Arizona', 'California', 'Idaho', 'Oregon', 'Utah'], uniqueAngles: "Nevada's court system, particularly in Clark County (Las Vegas) and Washoe County (Reno), processes an enormous volume of cases where community service is ordered. Las Vegas Justice Court alone is one of the busiest in the nation. Nevada's 24/7 economy and shift-work culture make self-paced online community service especially appealing for residents who cannot commit to traditional daytime volunteer schedules." },
    { name: 'New Hampshire', slug: 'new-hampshire', abbr: 'NH', capital: 'Concord', cities: ['Manchester', 'Nashua', 'Dover', 'Rochester'], courts: 'Circuit Courts serving all 10 counties', neighbors: ['Maine', 'Massachusetts', 'Vermont'], uniqueAngles: "New Hampshire's Circuit Courts serve all 10 counties in a state where harsh winters and rural geography can make in-person community service challenging. The state's proximity to Boston means many residents commute across state lines for work, making flexible online hours particularly practical. Our program serves New Hampshire residents from the seacoast to the White Mountains." },
    { name: 'New Jersey', slug: 'new-jersey', abbr: 'NJ', capital: 'Trenton', cities: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth'], courts: 'Superior Courts across 21 counties, organized into 15 vicinages', neighbors: ['Delaware', 'New York', 'Pennsylvania'], uniqueAngles: "New Jersey's densely populated counties generate a high volume of court cases where community service is assigned. The Superior Court system, organized into 15 vicinages across 21 counties, routinely uses community service in Pre-Trial Intervention (PTI) programs and conditional discharge agreements. New Jersey residents, many of whom face long commutes, value completing hours on their own schedule." },
    { name: 'New Mexico', slug: 'new-mexico', abbr: 'NM', capital: 'Santa Fe', cities: ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Roswell'], courts: 'District Courts across 13 judicial districts and Magistrate Courts', neighbors: ['Arizona', 'Colorado', 'Oklahoma', 'Texas', 'Utah'], uniqueAngles: "New Mexico's 13 judicial districts cover vast desert and mountain terrain. Many communities, including tribal lands and remote rural areas, have limited access to traditional volunteer organizations. Our online program serves New Mexico residents across all demographics — from urban Albuquerque to the isolated communities of the Navajo Nation and southern New Mexico borderlands." },
    { name: 'New York', slug: 'new-york', abbr: 'NY', capital: 'Albany', cities: ['New York City', 'Buffalo', 'Rochester', 'Syracuse'], courts: 'Supreme Courts, County Courts, City Courts, and Town and Village Courts across 62 counties', neighbors: ['Connecticut', 'Massachusetts', 'New Jersey', 'Pennsylvania', 'Vermont'], uniqueAngles: "New York's court system is one of the most complex in the nation, with Supreme Courts, County Courts, City Courts, and Town and Village Courts spanning 62 counties. New York City's five boroughs alone process millions of cases annually. From Manhattan Criminal Court to upstate Town Courts, community service is a staple of alternative sentencing. New York residents across the state appreciate our program's convenience and accessibility." },
    { name: 'North Carolina', slug: 'north-carolina', abbr: 'NC', capital: 'Raleigh', cities: ['Charlotte', 'Greensboro', 'Durham', 'Winston-Salem'], courts: 'District Courts and Superior Courts across 100 counties organized into 50 judicial districts', neighbors: ['Georgia', 'South Carolina', 'Tennessee', 'Virginia'], uniqueAngles: "North Carolina's 100 counties and 50 judicial districts create a vast court system where community service is commonly assigned. Mecklenburg County (Charlotte) and Wake County (Raleigh) handle the largest volumes, but our program equally serves residents in the Appalachian mountain communities and Outer Banks coastal areas where local options may be limited." },
    { name: 'North Dakota', slug: 'north-dakota', abbr: 'ND', capital: 'Bismarck', cities: ['Fargo', 'Grand Forks', 'Minot', 'West Fargo'], courts: 'District Courts across seven judicial districts serving all 53 counties', neighbors: ['Minnesota', 'Montana', 'South Dakota'], uniqueAngles: "North Dakota's seven judicial districts cover 53 counties across one of the most sparsely populated states in the nation. Extreme weather conditions — with temperatures regularly dropping below minus 30° in winter — can make in-person community service impractical for months at a time. Our year-round online program ensures North Dakota residents can complete their hours regardless of weather or geography." },
    { name: 'Ohio', slug: 'ohio', abbr: 'OH', capital: 'Columbus', cities: ['Cleveland', 'Cincinnati', 'Toledo', 'Akron'], courts: 'Courts of Common Pleas, Municipal Courts, and County Courts across 88 counties', neighbors: ['Indiana', 'Kentucky', 'Michigan', 'Pennsylvania', 'West Virginia'], uniqueAngles: "Ohio's 88 counties each maintain a Court of Common Pleas, and the state's Municipal Courts handle a massive volume of misdemeanor cases where community service is commonly ordered. Cuyahoga County (Cleveland), Franklin County (Columbus), and Hamilton County (Cincinnati) process the most cases, but all Ohio counties benefit from our verified online program." },
    { name: 'Oklahoma', slug: 'oklahoma', abbr: 'OK', capital: 'Oklahoma City', cities: ['Tulsa', 'Norman', 'Broken Arrow', 'Edmond'], courts: 'District Courts across 26 judicial districts serving all 77 counties', neighbors: ['Arkansas', 'Colorado', 'Kansas', 'Missouri', 'New Mexico', 'Texas'], uniqueAngles: "Oklahoma's 26 judicial districts serve 77 counties, with Oklahoma and Tulsa counties handling the highest case volumes. Oklahoma courts commonly use deferred sentencing with community service requirements. The state's mix of urban areas and vast rural western regions means many residents face long distances to community service organizations — our online program bridges that gap." },
    { name: 'Oregon', slug: 'oregon', abbr: 'OR', capital: 'Salem', cities: ['Portland', 'Eugene', 'Bend', 'Medford'], courts: 'Circuit Courts across 27 judicial districts serving all 36 counties', neighbors: ['California', 'Idaho', 'Nevada', 'Washington'], uniqueAngles: "Oregon's 27 judicial districts serve terrain from the rainy Pacific Coast to the high desert east of the Cascades. Multnomah County (Portland) handles the state's largest case volume, but eastern Oregon's ranching and farming communities particularly benefit from online alternatives. Oregon's community courts and restorative justice programs frequently incorporate community service as part of their approach." },
    { name: 'Pennsylvania', slug: 'pennsylvania', abbr: 'PA', capital: 'Harrisburg', cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie'], courts: 'Courts of Common Pleas across 60 judicial districts, Magisterial District Courts, and Municipal Courts', neighbors: ['Delaware', 'Maryland', 'New Jersey', 'New York', 'Ohio', 'West Virginia'], uniqueAngles: "Pennsylvania's court system includes Courts of Common Pleas across 60 judicial districts plus Philadelphia's Municipal Court — one of the busiest in the nation. The state's Accelerated Rehabilitative Disposition (ARD) program frequently requires community service hours. Pennsylvania residents from urban Philadelphia to rural central Pennsylvania communities use our verified program." },
    { name: 'Rhode Island', slug: 'rhode-island', abbr: 'RI', capital: 'Providence', cities: ['Cranston', 'Warwick', 'Pawtucket', 'East Providence'], courts: 'Superior Courts and District Courts serving all 5 counties', neighbors: ['Connecticut', 'Massachusetts'], uniqueAngles: "Despite being the smallest state, Rhode Island's court system regularly assigns community service in Superior and District Court cases. The state's compact size means our online program offers a unique advantage — while distances are short, many Rhode Island residents work across state lines in Massachusetts or Connecticut, making self-paced online hours more convenient than coordinating with local organizations." },
    { name: 'South Carolina', slug: 'south-carolina', abbr: 'SC', capital: 'Columbia', cities: ['Charleston', 'Greenville', 'Rock Hill', 'Mount Pleasant'], courts: 'Circuit Courts across 16 judicial circuits, Magistrate Courts, and Municipal Courts across 46 counties', neighbors: ['Georgia', 'North Carolina'], uniqueAngles: "South Carolina's 16 judicial circuits serve 46 counties, with community service commonly ordered in both Circuit and Magistrate Courts. From Charleston's busy courts to rural Upstate communities, our program serves participants across the Palmetto State. South Carolina's Pre-Trial Intervention (PTI) programs frequently include community service as a mandatory condition." },
    { name: 'South Dakota', slug: 'south-dakota', abbr: 'SD', capital: 'Pierre', cities: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings'], courts: 'Circuit Courts across seven judicial circuits serving all 66 counties', neighbors: ['Iowa', 'Minnesota', 'Montana', 'Nebraska', 'North Dakota', 'Wyoming'], uniqueAngles: "South Dakota's seven judicial circuits cover 66 counties spread across a state where the nearest courthouse can be a multi-hour drive. Western South Dakota's vast ranch lands and the Black Hills region have particularly limited community service options. Our online program ensures all South Dakota residents can complete their hours without the burden of long-distance travel." },
    { name: 'Tennessee', slug: 'tennessee', abbr: 'TN', capital: 'Nashville', cities: ['Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'], courts: 'Circuit Courts, Criminal Courts, and General Sessions Courts across 31 judicial districts and 95 counties', neighbors: ['Alabama', 'Arkansas', 'Georgia', 'Kentucky', 'Mississippi', 'Missouri', 'North Carolina', 'Virginia'], uniqueAngles: "Tennessee's 31 judicial districts serve 95 counties, with Shelby County (Memphis) and Davidson County (Nashville) handling the highest case volumes. Tennessee courts, including Criminal Courts and General Sessions Courts, regularly assign community service. The state's geographic diversity — from Appalachian east Tennessee to the Mississippi River Delta — means our online program serves communities with vastly different local resources." },
    { name: 'Texas', slug: 'texas', abbr: 'TX', capital: 'Austin', cities: ['Houston', 'Dallas', 'San Antonio', 'Fort Worth'], courts: 'District Courts, County Courts, and Justice of the Peace Courts across 254 counties — the most of any state', neighbors: ['Arkansas', 'Louisiana', 'New Mexico', 'Oklahoma'], uniqueAngles: "Texas has more counties than any other state — 254 — each with its own court system. Harris County (Houston) alone has one of the largest court systems in the world. From the sprawling DFW metroplex to remote West Texas communities hundreds of miles from the nearest city, our online program provides Texas residents with unmatched flexibility. Texas courts frequently use community service in deferred adjudication agreements." },
    { name: 'Utah', slug: 'utah', abbr: 'UT', capital: 'Salt Lake City', cities: ['West Valley City', 'Provo', 'West Jordan', 'Orem'], courts: 'District Courts across eight judicial districts and Justice Courts', neighbors: ['Arizona', 'Colorado', 'Idaho', 'Nevada', 'New Mexico', 'Wyoming'], uniqueAngles: "Utah's eight judicial districts serve 29 counties, with the majority of cases concentrated along the Wasatch Front. Utah's Justice Courts handle a significant volume of misdemeanor cases where community service is ordered. Our online program is especially useful for Utah residents in rural southern and eastern Utah communities where the nearest volunteer organization may be a lengthy drive away." },
    { name: 'Vermont', slug: 'vermont', abbr: 'VT', capital: 'Montpelier', cities: ['Burlington', 'South Burlington', 'Rutland', 'Barre'], courts: 'Superior Courts across 14 counties organized into five units', neighbors: ['Massachusetts', 'New Hampshire', 'New York'], uniqueAngles: "Vermont's small population and rural character mean that community service organizations can be scarce, especially in the state's more remote areas. Vermont's community justice centers and restorative justice programs frequently incorporate community service requirements. Our online program provides Vermont residents with a verified alternative that meets court standards without requiring travel to larger population centers." },
    { name: 'Virginia', slug: 'virginia', abbr: 'VA', capital: 'Richmond', cities: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Arlington'], courts: 'Circuit Courts and General District Courts across 120 jurisdictions including independent cities', neighbors: ['Kentucky', 'Maryland', 'North Carolina', 'Tennessee', 'West Virginia'], uniqueAngles: "Virginia's unique system of independent cities and counties creates 120 court jurisdictions — more than almost any other state. Fairfax County, Virginia Beach, and the Richmond area handle the largest case volumes. Virginia courts commonly assign community service in first-offender programs and deferred disposition agreements. The Hampton Roads and Northern Virginia areas, where many residents commute to D.C., particularly value our flexible online format." },
    { name: 'Washington', slug: 'washington', abbr: 'WA', capital: 'Olympia', cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver'], courts: 'Superior Courts across 39 counties, District Courts, and Municipal Courts', neighbors: ['Idaho', 'Oregon'], uniqueAngles: "Washington state's court system includes Superior Courts, District Courts, and Municipal Courts across 39 counties. King County (Seattle) has one of the largest court systems on the West Coast. Washington's geography creates a stark divide between urban Puget Sound communities and rural eastern Washington farming towns, but our online program serves both equally. The state's progressive approach to alternative sentencing frequently includes community service." },
    { name: 'West Virginia', slug: 'west-virginia', abbr: 'WV', capital: 'Charleston', cities: ['Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'], courts: 'Circuit Courts across 31 judicial circuits and Magistrate Courts in all 55 counties', neighbors: ['Kentucky', 'Maryland', 'Ohio', 'Pennsylvania', 'Virginia'], uniqueAngles: "West Virginia's mountainous terrain and rural character create significant barriers to traditional community service. Many of the state's 55 counties have limited nonprofit organizations and volunteer opportunities. Transportation challenges in Appalachian communities make in-person community service particularly difficult. Our online program provides West Virginia residents with reliable access to verified community service regardless of their location." },
    { name: 'Wisconsin', slug: 'wisconsin', abbr: 'WI', capital: 'Madison', cities: ['Milwaukee', 'Green Bay', 'Kenosha', 'Racine'], courts: 'Circuit Courts across 10 judicial administrative districts serving all 72 counties', neighbors: ['Illinois', 'Iowa', 'Michigan', 'Minnesota'], uniqueAngles: "Wisconsin's 72 counties are served by Circuit Courts organized into 10 judicial districts. Milwaukee County handles the largest case volume, but rural northern Wisconsin communities face unique challenges accessing community service organizations, particularly during the long winter months. Wisconsin's deferred prosecution agreements frequently include community service requirements, making our self-paced online program an ideal solution." },
    { name: 'Wyoming', slug: 'wyoming', abbr: 'WY', capital: 'Cheyenne', cities: ['Casper', 'Laramie', 'Gillette', 'Rock Springs'], courts: 'District Courts across nine judicial districts, Circuit Courts, and Municipal Courts', neighbors: ['Colorado', 'Idaho', 'Montana', 'Nebraska', 'South Dakota', 'Utah'], uniqueAngles: "Wyoming is the least populated state in the nation, and its nine judicial districts cover an area larger than all of New England combined. Many Wyoming residents live hours from the nearest town, let alone a community service organization. Our online program is an essential resource for Wyoming residents who need to complete court-ordered or probation-mandated community service without traveling hundreds of miles." },
];

const template = (s) => `<!DOCTYPE html>
<html lang="en">
<head>
<title>Online Community Service Hours in ${s.name} | The Foundation of Change</title>
<meta name="description" content="Complete court-approved community service hours online in ${s.name}. 501(c)(3) nonprofit program accepted by ${s.name} courts and probation departments. Start today.">
<meta name="keywords" content="online community service hours ${s.name}, court-approved community service ${s.name}, community service online ${s.name}, probation community service ${s.name}">
</head>
<body>
<section class="hero">
<div class="hero-badges"><span>✓ Court-Approved</span><span>✓ Probation-Compliant</span><span>✓ ${s.name} Accepted</span></div>
<h1>Complete Your Community Service Hours in ${s.name} <span class="accent">— 100% Online</span></h1>
<p class="subtitle">A verified 501(c)(3) nonprofit program accepted by ${s.name} courts, probation officers, and schools. Start from home — finish on your schedule.</p>
<a href="https://app.thefoundationofchange.org/start-now" class="btn-primary">Enroll Now — Start Your ${s.name} Hours Today</a>
</section>

<section class="stats-bar">
<div class="stat"><strong>10,000+</strong><span>Hours Completed</span></div>
<div class="stat"><strong>50</strong><span>States Covered</span></div>
<div class="stat"><strong>4.9★</strong><span>Satisfaction Rating</span></div>
<div class="stat"><strong>501(c)(3)</strong><span>Verified Nonprofit</span></div>
</section>

<section>
<h2>How Online Community Service Works in ${s.name}</h2>
<div class="steps">
<div class="step"><span>1</span><h3>Choose Your Hours</h3><p>Select the exact number of community service hours you need — from 1 to 1,000.</p></div>
<div class="step"><span>2</span><h3>Complete Coursework</h3><p>Work through self-paced educational modules on accountability, personal growth, and community awareness.</p></div>
<div class="step"><span>3</span><h3>Download Your Certificate</h3><p>Instantly receive your verified certificate with a unique verification code.</p></div>
</div>
</section>

<section>
<h2>Is This Program Right For You?</h2>
<div class="audience-grid">
<div class="card"><h3>⚖️ Court-Ordered Hours in ${s.name}?</h3><p>Fulfill your court-mandated community service through our verified online program. Accepted by ${s.name} ${s.courts}.</p></div>
<div class="card"><h3>🎓 ${s.name} Graduation Requirement?</h3><p>Earn service credit for graduation on your own schedule from anywhere in ${s.name}.</p></div>
<div class="card"><h3>🤝 ${s.name} Probation Requirement?</h3><p>Complete probation-mandated community service from home. Certificates accepted by ${s.name} probation departments.</p></div>
</div>
</section>

<section>
<h2>Online Community Service in ${s.name} — What You Need to Know</h2>
<p>${s.name} residents who need to complete community service hours — whether for court requirements, probation conditions, school graduation, or personal development — can fulfill their obligations entirely online through The Foundation of Change. Our 501(c)(3) nonprofit program provides a structured, self-paced educational experience accepted by courts and probation departments throughout ${s.name}.</p>

<h3>${s.name} Court System and Community Service</h3>
<p>${s.name}'s court system includes ${s.courts}. Courts in <strong>${s.cities[0]}</strong>, <strong>${s.cities[1]}</strong>, <strong>${s.cities[2]}</strong>, and <strong>${s.cities[3]}</strong> regularly assign community service as part of sentencing for misdemeanor offenses, DUI cases, and first-time offender programs. Our certificate provides the verified documentation ${s.name} courts require.</p>

<h3>Why ${s.name} Residents Choose Online Community Service</h3>
<p>${s.uniqueAngles}</p>

<h3>Verification and Acceptance</h3>
<p>Every certificate includes a unique verification code that ${s.name} courts and probation officers can independently verify through our online portal. We provide detailed hour logs showing dates, times, and hours completed. Our 501(c)(3) nonprofit status provides the legitimacy ${s.name} courts expect from community service providers.</p>

<h3>Getting Started in ${s.name}</h3>
<p>Enroll today and begin your hours immediately. There are no deadlines — work at your own pace with an 8-hour daily maximum. Your progress is saved automatically on any device. Upon completion, your certificate and hour log are instantly available. <a href="https://app.thefoundationofchange.org/start-now">Start your ${s.name} community service hours now</a>.</p>
</section>

<section>
<h2>Why ${s.name} Residents Choose The Foundation of Change</h2>
<div class="trust-grid">
<div><h4>🏛️ Court Compliant</h4><p>Accepted by ${s.name} courts and probation departments statewide.</p></div>
<div><h4>🔒 Audit Ready</h4><p>Tamper-proof time tracking with verification logs for every session.</p></div>
<div><h4>📄 501(c)(3) Nonprofit</h4><p>Registered nonprofit — your hours carry legitimate weight.</p></div>
<div><h4>⏰ Self-Paced</h4><p>No deadlines. Complete hours at your own pace from anywhere in ${s.name}.</p></div>
</div>
</section>

<section>
<h2>Frequently Asked Questions — ${s.name} Community Service</h2>
<details><summary>Is online community service accepted by ${s.name} courts?</summary><p>Our 501(c)(3) nonprofit program provides verified certificates with unique verification codes. Many ${s.name} courts accept online community service programs. We recommend confirming with your specific court or probation officer before enrolling.</p></details>
<details><summary>How do I prove my hours to my ${s.name} probation officer?</summary><p>You receive a certificate of completion and detailed hour log, both with a verification code your probation officer can verify through our online verification portal.</p></details>
<details><summary>How many hours can I complete per day?</summary><p>Up to 8 hours per day. The daily limit resets at midnight in your local timezone to ensure meaningful engagement.</p></details>
<details><summary>How long do I have to finish?</summary><p>There is no deadline. Complete hours at your own pace. Progress saves automatically.</p></details>
<details><summary>What does the coursework cover?</summary><p>Coursework covers accountability, emotional regulation, decision-making, community awareness, and personal growth through self-paced educational modules and written reflections.</p></details>
</section>

<section class="final-cta">
<h2>Start Your ${s.name} Community Service Hours Today</h2>
<p>Join participants across ${s.name} who have completed their hours online through our verified nonprofit program.</p>
<a href="https://app.thefoundationofchange.org/start-now" class="btn-primary">Enroll Now</a>
</section>

<section><h3>Community Service in Nearby States</h3>
<ul>${s.neighbors.map(n => `<li><a href="/community-service-in-${n.toLowerCase().replace(/ /g, '-')}">${n}</a></li>`).join('')}</ul>
</section>

<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
{"@type":"Question","name":"Is online community service accepted by ${s.name} courts?","acceptedAnswer":{"@type":"Answer","text":"Our 501(c)(3) nonprofit program provides verified certificates with unique verification codes. Many ${s.name} courts accept online community service. We recommend confirming with your specific court or probation officer before enrolling."}},
{"@type":"Question","name":"How do I prove my hours to my ${s.name} probation officer?","acceptedAnswer":{"@type":"Answer","text":"You receive a certificate of completion and detailed hour log, both with a verification code your probation officer can verify online."}},
{"@type":"Question","name":"How many hours can I complete per day?","acceptedAnswer":{"@type":"Answer","text":"Up to 8 hours per day. The daily limit resets at midnight in your local timezone."}},
{"@type":"Question","name":"How long do I have to finish?","acceptedAnswer":{"@type":"Answer","text":"No deadline. Complete hours at your own pace. Progress saves automatically."}}
]}
</script>
</body>
</html>`;

const outDir = path.join(__dirname, 'state-pages');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const state of states) {
    const html = template(state);
    fs.writeFileSync(path.join(outDir, `${state.slug}.html`), html, 'utf-8');
    console.log(`✓ Generated ${state.name}`);
}

console.log(`\nDone! Generated ${states.length} state pages.`);
