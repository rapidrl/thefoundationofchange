const fs = require('fs');
const path = require('path');

const states = [
    { name: 'Alabama', slug: 'alabama', abbr: 'AL', capital: 'Montgomery', cities: ['Birmingham', 'Huntsville', 'Mobile', 'Tuscaloosa'], courts: 'circuit courts, district courts, and municipal courts across all 67 counties', neighbors: ['Florida', 'Georgia', 'Mississippi', 'Tennessee'], uniqueAngles: 'With 67 counties stretching from the Gulf Coast to the Appalachian foothills, Alabama residents benefit from the flexibility of completing community service online. Many rural communities in Alabama have limited access to traditional community service organizations, making our online program an ideal solution.' },
    { name: 'Alaska', slug: 'alaska', abbr: 'AK', capital: 'Juneau', cities: ['Anchorage', 'Fairbanks', 'Sitka', 'Wasilla'], courts: 'Superior Courts and District Courts serving communities from Barrow to Ketchikan', neighbors: ['Washington', 'Hawaii', 'Oregon'], uniqueAngles: "Alaska's vast geography and limited road connectivity make online community service especially practical. Many Alaskan communities are only accessible by air or water, and harsh winters can make in-person service challenging. Our online program eliminates these geographic barriers entirely." },
    { name: 'Arizona', slug: 'arizona', abbr: 'AZ', capital: 'Phoenix', cities: ['Tucson', 'Mesa', 'Chandler', 'Scottsdale'], courts: 'Superior Courts across all 15 counties, Justice Courts, and Municipal Courts', neighbors: ['California', 'Nevada', 'New Mexico', 'Utah'], uniqueAngles: "Arizona's Maricopa County alone handles over 250,000 court cases annually, many of which include community service as part of sentencing. Whether you're in the Phoenix metropolitan area or rural communities in northern Arizona, our program provides a convenient way to complete your hours in the desert heat without leaving home." },
    { name: 'Arkansas', slug: 'arkansas', abbr: 'AR', capital: 'Little Rock', cities: ['Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'], courts: 'Circuit Courts, District Courts, and City Courts across 75 counties', neighbors: ['Louisiana', 'Mississippi', 'Missouri', 'Oklahoma', 'Tennessee', 'Texas'], uniqueAngles: "Arkansas courts across all 75 counties frequently assign community service hours as part of alternative sentencing. From the Ozark Mountains to the Mississippi Delta, our online program serves Arkansas residents in communities where local volunteer opportunities may be scarce or transportation limited." },
    { name: 'California', slug: 'california', abbr: 'CA', capital: 'Sacramento', cities: ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose'], courts: 'Superior Courts across all 58 counties, the largest state court system in the nation', neighbors: ['Arizona', 'Nevada', 'Oregon'], uniqueAngles: "As the most populous state with the largest court system in the nation, California handles millions of cases annually. Los Angeles County Superior Court alone is the largest unified trial court in the United States. California residents from San Diego to the Oregon border choose our program for its flexibility and verified nonprofit status." },
    { name: 'Colorado', slug: 'colorado', abbr: 'CO', capital: 'Denver', cities: ['Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood'], courts: 'District Courts, County Courts, and Municipal Courts across 64 counties', neighbors: ['Arizona', 'Kansas', 'Nebraska', 'New Mexico', 'Utah', 'Wyoming'], uniqueAngles: "Colorado's judicial system frequently utilizes community service as an alternative to incarceration, particularly for misdemeanor offenses and first-time offenders. From the Front Range cities of Denver and Colorado Springs to mountain communities, our self-paced online program accommodates Colorado's diverse geography and active lifestyles." },
    { name: 'Connecticut', slug: 'connecticut', abbr: 'CT', capital: 'Hartford', cities: ['Bridgeport', 'New Haven', 'Stamford', 'Waterbury'], courts: 'Superior Courts serving 13 judicial districts statewide', neighbors: ['Massachusetts', 'New York', 'Rhode Island'], uniqueAngles: "Connecticut's judicial system operates through Superior Courts across 13 districts. The state frequently assigns community service as a condition of probation and accelerated rehabilitation programs. Connecticut residents value the convenience of completing verified community service hours online while maintaining their demanding schedules in the tri-state area." },
    { name: 'Delaware', slug: 'delaware', abbr: 'DE', capital: 'Dover', cities: ['Wilmington', 'Newark', 'Middletown', 'Smyrna'], courts: 'Superior Courts, Court of Common Pleas, and Justice of the Peace Courts', neighbors: ['Maryland', 'New Jersey', 'Pennsylvania'], uniqueAngles: "Delaware may be the second-smallest state, but its court system handles a significant volume of cases where community service is assigned. The Court of Common Pleas and Justice of the Peace Courts throughout New Castle, Kent, and Sussex counties commonly order community service hours. Our online program provides Delaware residents with a streamlined, verified path to completion." },
    { name: 'Florida', slug: 'florida', abbr: 'FL', capital: 'Tallahassee', cities: ['Miami', 'Jacksonville', 'Tampa', 'Orlando'], courts: 'Circuit Courts across all 20 judicial circuits and County Courts in all 67 counties', neighbors: ['Alabama', 'Georgia'], uniqueAngles: "Florida's 20 judicial circuits process an enormous volume of cases annually, with community service frequently ordered by both Circuit and County Courts. From Miami-Dade's massive court system to smaller rural counties in the Panhandle, Florida residents across all 67 counties use our program. Florida's large retiree and tourist populations also benefit from the flexibility of completing hours from anywhere." },
    { name: 'Georgia', slug: 'georgia', abbr: 'GA', capital: 'Atlanta', cities: ['Augusta', 'Columbus', 'Savannah', 'Athens'], courts: 'Superior Courts, State Courts, and Magistrate Courts across 159 counties', neighbors: ['Alabama', 'Florida', 'North Carolina', 'South Carolina', 'Tennessee'], uniqueAngles: "Georgia has 159 counties — more than any state except Texas — each with its own court system. From the bustling Fulton County courts in Atlanta to rural south Georgia communities, community service is a standard component of sentencing. Our online program is particularly valuable for Georgia residents in areas where local community service opportunities are limited." },
    { name: 'Hawaii', slug: 'hawaii', abbr: 'HI', capital: 'Honolulu', cities: ['Hilo', 'Kailua', 'Pearl City', 'Waipahu'], courts: 'Circuit Courts and District Courts across four judicial circuits', neighbors: ['Alaska', 'California'], uniqueAngles: "Hawaii's island geography creates unique challenges for community service compliance. Residents on neighbor islands may have fewer local organizations accepting volunteers, and inter-island travel for court-related obligations can be costly. Our online program allows Hawaii residents on Oahu, Maui, the Big Island, and Kauai to complete their hours without the added burden of travel." },
    { name: 'Idaho', slug: 'idaho', abbr: 'ID', capital: 'Boise', cities: ['Meridian', 'Nampa', 'Idaho Falls', 'Pocatello'], courts: 'District Courts across seven judicial districts and Magistrate Courts', neighbors: ['Montana', 'Nevada', 'Oregon', 'Utah', 'Washington', 'Wyoming'], uniqueAngles: "Idaho's seven judicial districts cover terrain ranging from densely populated Treasure Valley to remote wilderness areas. Many Idaho communities, particularly in the eastern and central regions, have limited access to community service organizations. Our online program bridges this gap, serving Idaho residents from Boise to rural mountain towns." },
    { name: 'Illinois', slug: 'illinois', abbr: 'IL', capital: 'Springfield', cities: ['Chicago', 'Aurora', 'Naperville', 'Rockford'], courts: 'Circuit Courts across 24 judicial circuits, with Cook County being the largest unified court system in the world', neighbors: ['Indiana', 'Iowa', 'Kentucky', 'Missouri', 'Wisconsin'], uniqueAngles: "Illinois is home to Cook County Circuit Court, the largest unified court system in the world, processing hundreds of thousands of cases annually. From Chicago's bustling metropolitan courts to rural downstate counties, community service is frequently assigned as an alternative sentencing option. Illinois residents across all 102 counties use our verified online program for its convenience and court-accepted documentation." },
    { name: 'Indiana', slug: 'indiana', abbr: 'IN', capital: 'Indianapolis', cities: ['Fort Wayne', 'Evansville', 'South Bend', 'Carmel'], courts: 'Circuit Courts, Superior Courts, and City and Town Courts across 92 counties', neighbors: ['Illinois', 'Kentucky', 'Michigan', 'Ohio'], uniqueAngles: "Indiana's 92 counties each maintain their own court systems, and community service is a standard condition in many sentencing agreements and probation orders. The state's Problem-Solving Courts, including drug courts and reentry courts, frequently incorporate community service into their programs. Indiana residents from Indianapolis to smaller communities choose our online program for its flexibility and verified nature." },
    { name: 'Iowa', slug: 'iowa', abbr: 'IA', capital: 'Des Moines', cities: ['Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'], courts: 'District Courts across eight judicial districts serving all 99 counties', neighbors: ['Illinois', 'Minnesota', 'Missouri', 'Nebraska', 'South Dakota', 'Wisconsin'], uniqueAngles: "Iowa's eight judicial districts serve all 99 counties, many of which are rural communities with limited community service placement options. Iowa courts regularly assign community service for misdemeanor offenses and as part of deferred judgments. Our online program is particularly valuable for Iowa residents in agricultural communities where in-person volunteer opportunities may be seasonal or scarce." },
    { name: 'Kansas', slug: 'kansas', abbr: 'KS', capital: 'Topeka', cities: ['Wichita', 'Overland Park', 'Kansas City', 'Olathe'], courts: 'District Courts across 31 judicial districts serving all 105 counties', neighbors: ['Colorado', 'Missouri', 'Nebraska', 'Oklahoma'], uniqueAngles: "Kansas operates 31 judicial districts covering 105 counties, from the urban courts of Wichita and Kansas City to rural western Kansas. Community service is commonly ordered for misdemeanor convictions and as a diversion program alternative. Many western Kansas communities have limited volunteer organizations, making our verified online community service program an essential resource for residents across the state." },
    { name: 'Kentucky', slug: 'kentucky', abbr: 'KY', capital: 'Frankfort', cities: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro'], courts: 'Circuit Courts and District Courts across 57 judicial circuits and 120 counties', neighbors: ['Illinois', 'Indiana', 'Missouri', 'Ohio', 'Tennessee', 'Virginia', 'West Virginia'], uniqueAngles: "Kentucky's 57 judicial circuits serve 120 counties, with community service frequently ordered by both Circuit and District Courts. Louisville's Jefferson County and Lexington's Fayette County handle the largest volumes, but rural Appalachian counties in eastern Kentucky particularly benefit from online alternatives where transportation and local opportunities can be challenging." },
    { name: 'Louisiana', slug: 'louisiana', abbr: 'LA', capital: 'Baton Rouge', cities: ['New Orleans', 'Shreveport', 'Lafayette', 'Lake Charles'], courts: 'District Courts across 42 judicial districts and 64 parishes', neighbors: ['Arkansas', 'Mississippi', 'Texas'], uniqueAngles: "Louisiana's unique parish-based system includes 42 judicial districts and 64 parishes, each with active courts that regularly assign community service. From New Orleans' Orleans Parish Criminal District Court to rural north Louisiana parishes, our program serves participants across the state. Louisiana's history of natural disasters has also highlighted the value of accessible online alternatives when in-person options may be disrupted." },
    { name: 'Maine', slug: 'maine', abbr: 'ME', capital: 'Augusta', cities: ['Portland', 'Lewiston', 'Bangor', 'South Portland'], courts: 'Superior Courts and District Courts across 16 counties', neighbors: ['New Hampshire', 'Massachusetts'], uniqueAngles: "Maine's vast rural landscape and small-town character mean many residents face long drives to reach community service organizations. With 16 counties stretching from Kittery to Fort Kent, our online program eliminates transportation barriers for Maine residents. The state's harsh winters can also make in-person community service challenging, making a self-paced online alternative especially practical." },
    { name: 'Maryland', slug: 'maryland', abbr: 'MD', capital: 'Annapolis', cities: ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg'], courts: 'Circuit Courts across 24 jurisdictions including Baltimore City', neighbors: ['Delaware', 'Pennsylvania', 'Virginia', 'West Virginia'], uniqueAngles: "Maryland's court system serves one of the most densely populated corridors on the East Coast, from Baltimore City to the Washington D.C. suburbs. Circuit Courts across 24 jurisdictions regularly assign community service, particularly in Baltimore City and the suburban counties of Montgomery and Prince George's. Maryland residents value our program's flexibility for completing hours around busy commuter schedules." },
    { name: 'Massachusetts', slug: 'massachusetts', abbr: 'MA', capital: 'Boston', cities: ['Worcester', 'Springfield', 'Cambridge', 'Lowell'], courts: 'District Courts, Superior Courts, and Boston Municipal Court', neighbors: ['Connecticut', 'Maine', 'New Hampshire', 'New York', 'Rhode Island', 'Vermont'], uniqueAngles: "Massachusetts operates one of the oldest court systems in the nation, with District Courts, Superior Courts, and the Boston Municipal Court regularly assigning community service. The state's continuation without a finding (CWOF) dispositions frequently include community service requirements. From urban Boston to rural western Massachusetts, our program provides a verified solution for Bay State residents." },
    { name: 'Michigan', slug: 'michigan', abbr: 'MI', capital: 'Lansing', cities: ['Detroit', 'Grand Rapids', 'Ann Arbor', 'Kalamazoo'], courts: 'Circuit Courts and District Courts across 83 counties', neighbors: ['Indiana', 'Ohio', 'Wisconsin'], uniqueAngles: "Michigan's 83 counties are divided between the Lower and Upper Peninsulas, creating logistical challenges for Upper Peninsula residents seeking community service opportunities. Wayne County (Detroit) alone processes an enormous volume of cases with community service components. Our online program serves Michigan residents in both peninsulas equally, from urban Detroit to the remote reaches of the Upper Peninsula." },
    { name: 'Minnesota', slug: 'minnesota', abbr: 'MN', capital: 'Saint Paul', cities: ['Minneapolis', 'Rochester', 'Duluth', 'Bloomington'], courts: 'District Courts across 10 judicial districts serving all 87 counties', neighbors: ['Iowa', 'North Dakota', 'South Dakota', 'Wisconsin'], uniqueAngles: "Minnesota's 10 judicial districts span 87 counties, from the Twin Cities metropolitan area to the Canadian border. Minnesota courts, particularly in Hennepin and Ramsey counties, frequently assign community service as part of sentence-to-service programs. The state's extreme winters can limit outdoor volunteer opportunities, making our year-round online program an attractive alternative for Minnesota residents." },
    { name: 'Mississippi', slug: 'mississippi', abbr: 'MS', capital: 'Jackson', cities: ['Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi'], courts: 'Circuit Courts, County Courts, and Justice Courts across 82 counties', neighbors: ['Alabama', 'Arkansas', 'Louisiana', 'Tennessee'], uniqueAngles: "Mississippi's 82 counties include many rural communities where traditional community service placements can be difficult to find. From Jackson's Hinds County courts to Gulf Coast municipal courts in Biloxi and Gulfport, community service is a common sentencing tool. Our online program is especially valuable for Mississippi residents in the Delta region and other underserved areas with limited local nonprofit organizations." },
    { name: 'Missouri', slug: 'missouri', abbr: 'MO', capital: 'Jefferson City', cities: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia'], courts: 'Circuit Courts across 46 judicial circuits serving 115 counties and the City of St. Louis', neighbors: ['Arkansas', 'Illinois', 'Iowa', 'Kansas', 'Kentucky', 'Nebraska', 'Oklahoma', 'Tennessee'], uniqueAngles: "Missouri's 46 judicial circuits serve 115 counties plus the independent City of St. Louis. Both Kansas City and St. Louis metropolitan courts handle significant case volumes where community service is assigned. Missouri's community supervision programs actively use community service as an alternative to incarceration, and our verified online program provides the documentation Missouri courts require." },
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
<p>Three simple steps to complete your community service requirement from anywhere in ${s.name}.</p>
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
