import type { Topic } from "@/lib/site/topic-types";

const ecfr382 = "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-382";
const ecfr40 = "https://www.ecfr.gov/current/title-49/subtitle-A/part-40";

export const extraTopics: Record<string, Topic> = {
  hire: {
    eyebrow: "Hire screens",
    title: "Staffing orders are usually non-DOT.",
    lede: "A warehouse, office, or staffing firm does not need a DOT urine panel unless the job is safety-sensitive under FMCSA. Order the panel the employer actually wrote into its policy.",
    description: "Non-DOT hire screens for staffing firms. No consortium membership. DOT tests only when the job requires them.",
    orderHref: "/screen",
    blocks: [
      {
        h: "Two different rules",
        p: [
          "A non-DOT screen follows the employer’s own policy. It is not reported to the FMCSA Clearinghouse, and it does not place anyone in the SJCC consortium.",
          "A DOT test is for a person who will perform a safety-sensitive function under 49 CFR Part 382. Using a non-DOT panel for that job does not meet 49 CFR 382.301. Using a DOT panel for a desk job is usually the wrong product.",
        ],
      },
      {
        h: "Order these now",
        prices: ["nondot_urine_5", "nondot_urine_9", "nondot_urine_10", "hair", "mvr", "dot_drug", "dot_alcohol"],
      },
    ],
    steps: [
      { icon: "clipboard", title: "Name the panel", body: "Pick the non-DOT panel in the employer’s policy. Add a DOT test only if the person will drive under FMCSA rules." },
      { icon: "file", title: "Pay first", body: "The order stays with SJCC until the testing partner accepts it. We do not invent a barcode." },
      { icon: "pin", title: "Send them to a clinic", body: "Collection is at a Quest or LabCorp site on the partner network. Those clinics are not SJCC offices." },
      { icon: "bell", title: "Result to the email you named", body: "The staffing firm or employer receives the status. There is no random draw and no annual seat." },
    ],
    faqs: [
      { q: "Does a staffing firm need the $299 consortium?", a: "No. Hire screens are prepaid tests. Consortium membership is for a motor carrier with two or more DOT testing drivers." },
      { q: "Will a non-DOT result hit the Clearinghouse?", a: "No. Clearinghouse reporting is a DOT employer duty. A non-DOT screen is not that event." },
      { q: "Can I still order a DOT test from this door?", a: "Yes, if the job is actually DOT. It is listed on the order form. It still does not enroll the person in a random pool." },
      { q: "What about a background check with the drug test?", a: "The pre-hire pack is quoted and marked coming soon. We will not charge it until a consumer reporting agency can fulfill it." },
    ],
    cites: [
      { label: "49 CFR 382.301 — pre-employment DOT testing", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-382/subpart-C/section-382.301" },
      { label: "FMCSA drug and alcohol overview", href: "https://www.fmcsa.dot.gov/regulations/drug-alcohol-testing/overview-drug-and-alcohol-rules" },
    ],
    related: [
      { href: "/non-dot", label: "Non-DOT panels" },
      { href: "/hair", label: "Hair testing" },
      { href: "/pre-employment", label: "DOT pre-employment" },
      { href: "/backgrounds", label: "Backgrounds" },
    ],
  },
  testing: {
    eyebrow: "Testing",
    title: "The test has to match the job.",
    lede: "DOT urine, breath alcohol, non-DOT panels, and hair are different products. A staffing order and a consortium random are not the same checkout.",
    description: "DOT and non-DOT drug and alcohol testing through Quest and LabCorp. SJCC explains which rule applies.",
    blocks: [
      {
        p: [
          "Federal testing under 49 CFR Part 40 and Part 382 uses a defined urine panel and, when alcohol is required, an evidential breath test. Employer policy can ask for more, but it cannot swap a hair test in for a required DOT urine test.",
          "Collection is on a national clinic network, Quest and LabCorp through our testing partner. SJCC does not own the sites and does not hand you a laboratory login.",
        ],
      },
      {
        h: "Live now",
        prices: ["dot_drug", "dot_alcohol", "dot_combo", "dot_observed", "nondot_urine_5", "nondot_urine_9", "nondot_urine_10", "hair"],
      },
      { h: "Quoted, not charged yet", prices: ["oral_fluid"], soon: true },
    ],
    steps: [
      { icon: "scale", title: "Decide the rule", body: "Part 382 if the person performs a DOT safety-sensitive function. Employer policy if they do not." },
      { icon: "flask", title: "Pay the published price", body: "A same-visit drug test and breath alcohol is one SJCC charge and two collections." },
      { icon: "pin", title: "Collect", body: "The donor brings a photo ID. The collector follows the form for that test type." },
      { icon: "shield", title: "Review", body: "A non-negative DOT result waits for the medical review officer. SJCC does not clear it early." },
    ],
    faqs: [
      { q: "What is on the DOT urine panel?", a: "Marijuana metabolites, cocaine metabolites, amphetamines, opioids, and phencyclidine. That list is set in 49 CFR Part 40, not by SJCC." },
      { q: "Does state-legal marijuana change the DOT panel?", a: "No. A state cannabis law does not remove marijuana from the federal DOT panel." },
      { q: "Who is the MRO?", a: "The medical review officer talks with the donor before a non-negative laboratory result is verified. SJCC is not the MRO." },
      { q: "Can the donor reschedule a random?", a: "A random selection is not a courtesy appointment. Refusing or failing to appear as directed is not the same thing as picking a better day." },
    ],
    cites: [
      { label: "49 CFR Part 40 — testing procedures", href: ecfr40 },
      { label: "49 CFR Part 382 — FMCSA drug and alcohol", href: ecfr382 },
      { label: "49 CFR 40.85 — DOT drug panel", href: "https://www.ecfr.gov/current/title-49/subtitle-A/part-40/subpart-F/section-40.85" },
    ],
    related: [
      { href: "/dot-urine", label: "DOT urine" },
      { href: "/non-dot", label: "Non-DOT panels" },
      { href: "/breath-alcohol", label: "Breath alcohol" },
      { href: "/hair", label: "Hair" },
    ],
  },
  "non-dot": {
    eyebrow: "Non-DOT",
    title: "Panels for jobs that are not under Part 382.",
    lede: "Staffing firms, shops, and offices order a 5-, 9-, or 10-panel urine test, or hair, under their own policy. These screens do not join the consortium.",
    description: "Non-DOT 5-, 9-, and 10-panel urine tests and how they differ from a DOT test.",
    orderHref: "/screen",
    blocks: [
      {
        h: "What the panels usually cover",
        p: [
          "A non-DOT 5-panel looks at the same five familiar classes people expect: marijuana, cocaine, amphetamines, opiates, and PCP. It is still not a DOT custody test, and a negative on it does not qualify someone for a safety-sensitive driving job.",
          "A 9-panel commonly adds benzodiazepines, barbiturates, methadone, and propoxyphene. A 10-panel commonly adds methaqualone on top of that set. Laboratories name their own panels. The order you place is the panel code, not a custom drug list built on this website.",
        ],
        list: [
          "Use non-DOT when the employer’s handbook says so.",
          "Use DOT urine when 49 CFR 382.301 or a random, post-accident, suspicion, or return-to-duty rule applies.",
          "Do not send a hair result upstairs as if it were the federal urine test.",
        ],
      },
      { h: "Prices", prices: ["nondot_urine_5", "nondot_urine_9", "nondot_urine_10", "hair"] },
    ],
    steps: [
      { icon: "clipboard", title: "Match the handbook", body: "The staffing contract or employee policy names the panel. Order that one." },
      { icon: "user", title: "Identify the person", body: "We need the person’s name and an email, plus the company that should receive the result." },
      { icon: "pin", title: "Clinic visit", body: "Photo ID. The collector is at Quest or LabCorp, not at SJCC." },
      { icon: "file", title: "Report", body: "Status goes to the result email. No Clearinghouse entry is created from this product." },
    ],
    faqs: [
      { q: "Is non-DOT cheaper because it is weaker?", a: "It is a different rule set, not a discount DOT test. The laboratory still runs the panel you bought." },
      { q: "Can I add alcohol?", a: "Breath alcohol is its own live product. It is not silently included in a urine panel." },
      { q: "Do you read a cup in the office?", a: "No. SJCC orders laboratory tests. We do not sell an instant cup that we interpret ourselves." },
      { q: "What if the donor has a prescription?", a: "On a non-DOT test the employer’s policy and the laboratory’s review process decide what happens next. It is not an FMCSA medical review officer case unless the test was ordered as DOT." },
    ],
    related: [
      { href: "/hire", label: "Hire screens" },
      { href: "/dot-urine", label: "DOT urine" },
      { href: "/oral-fluid", label: "Oral fluid (coming soon)" },
      { href: "/screen", label: "Order a screen" },
    ],
  },
  "dot-urine": {
    eyebrow: "DOT urine",
    title: "The federal panel, prepaid.",
    lede: "One price for a DOT urine drug test, whatever the DOT reason: pre-employment, random, post-accident, suspicion, or return-to-duty. Observed and follow-up collections are a different price.",
    description: "DOT urine drug testing at $73. The federal five-class panel under 49 CFR Part 40.",
    orderHref: "/screen",
    blocks: [
      {
        p: [
          "The panel is marijuana metabolites, cocaine metabolites, amphetamines (including methamphetamine and MDMA), opioids (including the semi-synthetic opioids in the federal panel), and phencyclidine. Cutoffs are the ones in Part 40.",
          "A verified non-negative result is an employer problem under the Clearinghouse rules. SJCC does not file that report unless you have designated us and the designation is accepted. Today, checkout does not sell the filing.",
        ],
      },
      { prices: ["dot_drug", "dot_observed", "dot_combo"] },
    ],
    steps: [
      { icon: "clipboard", title: "Pick the reason", body: "The reason changes the paperwork and, for return-to-duty and follow-up, whether the collection is observed." },
      { icon: "flask", title: "Pay $73, or $109 if observed", body: "The order is not released to the clinic network until it is paid." },
      { icon: "pin", title: "Collect", body: "The donor completes the federal form at the site. Shy bladder procedures, if they ever apply, are the collector’s, under Part 40, not a tip sheet from us." },
      { icon: "shield", title: "MRO, then the employer", body: "The MRO calls the donor before a non-negative is verified. The employer acts on the verified result." },
    ],
    faqs: [
      { q: "Is random the same price as pre-employment?", a: "Yes. The specimen and the panel are the same product. The reason code changes. The price does not." },
      { q: "What if the donor cannot provide a specimen?", a: "Part 40 has a shy-bladder process of up to three hours, with fluids. That is the collector’s procedure. It is not a reason to cancel a random and try next week." },
      { q: "Do you ship a kit to the truck?", a: "No. The person goes to a clinic on the partner network." },
    ],
    cites: [
      { label: "49 CFR 40.85 — drugs tested", href: "https://www.ecfr.gov/current/title-49/subtitle-A/part-40/subpart-F/section-40.85" },
      { label: "49 CFR Part 382", href: ecfr382 },
    ],
    related: [
      { href: "/pre-employment", label: "Pre-employment" },
      { href: "/randoms", label: "Randoms" },
      { href: "/return-to-duty", label: "Return to duty" },
    ],
  },
  "breath-alcohol": {
    eyebrow: "Breath alcohol",
    title: "A breath test is not a line on the urine form.",
    lede: "DOT alcohol testing uses an evidential breath device. A screening result under 0.02 ends it. A higher screen needs a confirmation test.",
    description: "DOT breath alcohol testing. Confirmation rules and the 0.02 and 0.04 thresholds.",
    orderHref: "/screen",
    blocks: [
      {
        p: [
          "Under the FMCSA rules, a confirmation result of 0.04 or more is a violation. A result from 0.02 through 0.039 is not that violation, but the driver is removed from safety-sensitive duty for a period — the rule drivers usually feel as the next 24 hours, in 49 CFR 382.505.",
          "Ordering drug and alcohol together is $129 on one invoice. Internally they remain two collections.",
        ],
      },
      { prices: ["dot_alcohol", "dot_combo"] },
    ],
    steps: [
      { icon: "clipboard", title: "Confirm alcohol is required", body: "Random alcohol, post-accident alcohol, and reasonable-suspicion alcohol are different triggers. Pre-employment alcohol is optional for the employer. Pre-employment drug testing is not." },
      { icon: "flask", title: "Screen", body: "A screening test below 0.02 is the end of the alcohol test." },
      { icon: "scale", title: "Confirm", body: "At 0.02 or above, a confirmation test is required. The confirmation number is the one that counts." },
      { icon: "bell", title: "Stand down if the rule says so", body: "The employer, not the clinic front desk, removes the driver from duty when the result requires it." },
    ],
    faqs: [
      { q: "Can a urine EtG replace the breath test?", a: "No. A DOT alcohol test is a breath test on an evidential device, not a urine alcohol marker." },
      { q: "Is 0.02 a Clearinghouse violation?", a: "The FMCSA violation threshold is 0.04. The 0.02 to 0.039 band is still a removal from safety-sensitive functions under 382.505. Do not treat them as the same event." },
      { q: "Why is the combo not double the two prices?", a: "Same-visit drug and alcohol is priced as one visit. It is not a discount that merges the science into one specimen." },
    ],
    cites: [
      { label: "49 CFR 382.505 — removal for 0.02 to 0.039", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-382/subpart-E/section-382.505" },
      { label: "49 CFR Part 40, Subpart M — alcohol confirmation", href: "https://www.ecfr.gov/current/title-49/subtitle-A/part-40/subpart-M" },
    ],
    related: [
      { href: "/post-accident", label: "Post-accident windows" },
      { href: "/randoms", label: "Random alcohol rate" },
    ],
  },
  hair: {
    eyebrow: "Hair",
    title: "A longer look back. Not a DOT substitute.",
    lede: "Hair testing is a live non-DOT option for employers who want a wider window than urine. It does not satisfy a required DOT urine test.",
    description: "Hair follicle drug testing for non-DOT hiring. Not a substitute for FMCSA urine testing.",
    orderHref: "/screen",
    blocks: [
      {
        p: [
          "Head hair of about an inch and a half is often described as roughly a 90-day window. That is a rule of thumb about growth, not a promise that every use in that window will appear. Body hair grows differently and is a weaker clock.",
          "If the federal rule requires urine, order urine. Hair can sit beside it as an employer-policy test. It does not replace it.",
        ],
      },
      { prices: ["hair"] },
    ],
    steps: [
      { icon: "clipboard", title: "Confirm it is non-DOT", body: "If Part 382 requires the test, stop and order DOT urine instead." },
      { icon: "user", title: "Collector takes the sample", body: "The site follows the laboratory’s hair protocol. SJCC does not cut hair in our office." },
      { icon: "flask", title: "Laboratory", body: "The sample goes to the laboratory on the partner order, not to a mailer we print at home." },
      { icon: "file", title: "Employer result", body: "The result email is the one you entered. No consortium selection is created." },
    ],
    faqs: [
      { q: "Will a shaved head cancel the test?", a: "The collection site follows the laboratory’s alternative-site rules. It is not an automatic pass." },
      { q: "Is hair better than urine?", a: "It answers a different question. Urine is the federal DOT specimen. Hair is an employer-policy look further back." },
    ],
    related: [
      { href: "/non-dot", label: "Urine panels" },
      { href: "/hire", label: "Staffing orders" },
    ],
  },
  "oral-fluid": {
    eyebrow: "Oral fluid",
    title: "A saliva test is on the menu, not at the register.",
    lede: "Oral fluid is a real workplace specimen. SJCC is not charging it until the testing partner can take the order. It is not a stand-in for DOT urine today.",
    description: "Oral fluid drug testing, quoted and not yet charged.",
    contactOnly: true,
    blocks: [
      {
        p: [
          "Oral fluid is useful when an employer wants a short detection window and a collection that does not need a restroom. Federal DOT oral-fluid rules exist on paper. The collection system an employer can actually use still depends on approved devices and laboratories. We will not pretend a checkout button is that approval.",
          "Until this product is live, order a urine panel or hair.",
        ],
      },
      { prices: ["oral_fluid"], soon: true },
    ],
    faqs: [
      { q: "Can I pay for it now and wait?", a: "No. Coming-soon products are not charged." },
      { q: "Does this replace a DOT random?", a: "No." },
    ],
    cites: [
      { label: "49 CFR Part 40", href: ecfr40 },
    ],
    related: [
      { href: "/non-dot", label: "Non-DOT urine" },
      { href: "/testing", label: "All testing" },
    ],
  },
  randoms: {
    eyebrow: "Randoms",
    title: "One pool. Half the drivers, a tenth for alcohol, across the year.",
    lede: "Accepted fleets share the SJCC consortium. The annual minimums are 50 percent drug and 10 percent alcohol of that combined pool. Your portal still lists only your own people.",
    description: "How the SJCC consortium random draw works under 49 CFR 382.305.",
    blocks: [
      {
        p: [
          "49 CFR 382.305 sets the minimum annual rates. The Department of Transportation left the FMCSA rates at 50 percent for drugs and 10 percent for alcohol for 2026. Fifty percent means tests equal to half the pool over the year. It does not mean each driver has a coin-flip chance on January 1, and it does not mean half the drivers will fail.",
          "SJCC draws once, on the combined list of testing drivers at member companies that have at least two. A one-driver company is not in that list. Selections are stored on the driver’s own company file.",
          "We spread the count through the year so December is not the whole program. A driver already selected for that test type stays out of later draws that year.",
        ],
      },
    ],
    steps: [
      { icon: "user", title: "Keep the roster honest", body: "A driver who left should come off. A new testing driver should go on. We cannot draw a name you never sent." },
      { icon: "scale", title: "The quarter’s count", body: "The annual number is paced by quarter. The seed is the consortium, the year, the quarter, and the test type." },
      { icon: "bell", title: "Tell the driver", body: "The employer sends the person. The selection is unannounced until you notify them." },
      { icon: "flask", title: "Prepaid collection", body: "The random drug test is the same $73 DOT urine test. Alcohol, when selected, is the breath test." },
    ],
    faqs: [
      { q: "Is my company its own 50 percent?", a: "No. The rate is on the combined pool. A two-driver fleet should not expect one drug test every year as a private quota. Some years your file will show more selections, some years fewer." },
      { q: "Can I see who else was drawn?", a: "No. Other companies’ names, rosters, and results are not on your portal." },
      { q: "What if I only have one driver left?", a: "That company comes out of the draw. A pool of one is not valid. The owner-operator page is a referral, not a sale." },
      { q: "Do you test everyone who is selected?", a: "You do. Substituting a different driver, or waiting for a slow week, breaks the selection." },
    ],
    cites: [
      { label: "49 CFR 382.305 — random testing", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-382/subpart-C/section-382.305" },
      { label: "DOT random testing rates", href: "https://www.transportation.gov/odapc/random-testing-rates" },
    ],
    related: [
      { href: "/consortium", label: "Consortium membership" },
      { href: "/owner-operators", label: "One-driver referral" },
      { href: "/dot-urine", label: "The urine test" },
    ],
  },
  "pre-employment": {
    eyebrow: "Pre-employment",
    title: "A negative DOT drug test before the first trip.",
    lede: "49 CFR 382.301 requires a negative drug test result before a driver performs a safety-sensitive function for you. Alcohol before hire is the employer’s choice, not the federal minimum.",
    description: "DOT pre-employment drug testing, and the non-DOT alternative for staffing.",
    blocks: [
      {
        p: [
          "The DOT pre-employment test is a urine drug test. It is $73, paid before the order goes to the clinic. A prior employer’s old result is not your pre-employment test.",
          "Staffing a non-driving job? Use a non-DOT panel. Do not buy a DOT test to look thorough.",
          "Clearinghouse full query, before the person starts, is a separate employer duty. We explain it. We do not charge a query until that service is actually live, and we do not buy FMCSA credits.",
        ],
      },
      { h: "DOT or not", prices: ["dot_drug", "nondot_urine_5", "nondot_urine_10", "hair"] },
    ],
    steps: [
      { icon: "scale", title: "Is the job safety-sensitive under FMCSA?", body: "If yes, DOT urine. If no, non-DOT." },
      { icon: "file", title: "Pay, then schedule", body: "No specimen is ordered on a promise to pay later." },
      { icon: "flask", title: "Negative before duty", body: "The driver does not perform the safety-sensitive function while the result is open." },
      { icon: "shield", title: "Query, separately", body: "A full Clearinghouse query is the employer’s, with consent. It is not included in the $73." },
    ],
    faqs: [
      { q: "Is a pre-employment alcohol test required?", a: "FMCSA does not require one. Drug testing before safety-sensitive duty is required. You may add alcohol if your policy says so." },
      { q: "Can the previous consortium’s random count?", a: "No. Pre-employment is a new test for the new employer." },
      { q: "What if they were just tested last week for someone else?", a: "Still yours to order, unless a specific exception in 382.301 actually applies. Read the section before you skip it. We will not skip it for you on a hunch." },
    ],
    cites: [
      { label: "49 CFR 382.301", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-382/subpart-C/section-382.301" },
    ],
    related: [
      { href: "/non-dot", label: "Non-DOT for staffing" },
      { href: "/clearinghouse", label: "Clearinghouse queries" },
      { href: "/hire", label: "Hire screens" },
    ],
  },
  "post-accident": {
    eyebrow: "Post-accident",
    title: "The clock is in the rule. The decision is the employer’s.",
    lede: "Not every fender bend is a DOT test. When 49 CFR 382.303 does apply, alcohol and drugs are on different clocks.",
    description: "Post-accident DOT testing windows under 49 CFR 382.303, without pretending every crash qualifies.",
    orderHref: "/screen",
    blocks: [
      {
        h: "Windows, if a test is required",
        list: [
          "Alcohol: as soon as practicable. If it does not happen within two hours, document why. Stop trying after eight hours.",
          "Drugs: as soon as practicable. Stop trying after 32 hours.",
          "The table in 382.303 — fatality, injury with a citation, disabling damage with a citation — is what decides whether a test is required. The employer applies that table. SJCC does not declare the accident qualifying from a phone summary.",
        ],
        p: [
          "Order the DOT urine test, and breath alcohol if the alcohol window is still open. Same-visit pricing applies if both are ordered together.",
        ],
      },
      { prices: ["dot_drug", "dot_alcohol", "dot_combo"] },
    ],
    steps: [
      { icon: "scale", title: "Read 382.303 against the facts", body: "Fatality is different from a tow, and a citation matters for some rows. Do not test “just in case” and call it DOT." },
      { icon: "bell", title: "Move", body: "The alcohol window is the short one. Waiting for the next business day can end it." },
      { icon: "pin", title: "Clinic, not the shoulder", body: "Send the driver to a collection site. We do not dispatch a van to the scene." },
      { icon: "file", title: "Write down a miss", body: "If the test does not happen in time, the employer’s record has to say why. That note is yours." },
    ],
    faqs: [
      { q: "Is every tow a test?", a: "No. Disabling damage with a citation is one path. A tow alone is not a slogan you can follow. Use the regulation’s table." },
      { q: "Can the driver keep working while you decide?", a: "Do not leave a person in a safety-sensitive seat if your duty is to test and remove. The regulation, not this page, is the instruction." },
      { q: "Do you file the accident with FMCSA?", a: "No. Post-accident testing is not a crash report, and we do not file either one from this checkout." },
    ],
    cites: [
      { label: "49 CFR 382.303 — post-accident testing", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-382/subpart-C/section-382.303" },
    ],
    related: [
      { href: "/breath-alcohol", label: "Alcohol thresholds" },
      { href: "/reasonable-suspicion", label: "Reasonable suspicion" },
    ],
  },
  "reasonable-suspicion": {
    eyebrow: "Reasonable suspicion",
    title: "A trained supervisor writes down what they saw.",
    lede: "49 CFR 382.307 is not a hunch and not a customer complaint. It is contemporaneous observations of appearance, behavior, speech, or body odors, by a supervisor trained under 382.603.",
    description: "Reasonable-suspicion DOT testing and the supervisor training rule.",
    orderHref: "/screen",
    blocks: [
      {
        p: [
          "The observations have to be specific and made just before, during, or just after the driver was performing safety-sensitive functions. The supervisor documents them. A test ordered with no observations is not this product.",
          "The drug test is the DOT urine test. Alcohol, if the observations support it, is the breath test. Training for the supervisors who make these calls is quoted separately and is not a live checkout yet.",
        ],
      },
      { prices: ["dot_drug", "dot_alcohol", "dot_combo", "training"] },
    ],
    steps: [
      { icon: "user", title: "Trained supervisor only", body: "The person who decides needs the alcohol and drug training in 382.603. A dispatcher who “knows the look” is not automatically that person." },
      { icon: "file", title: "Write the observations", body: "What you saw, heard, or smelled. Not a conclusion with no facts under it." },
      { icon: "pin", title: "Test promptly", body: "Alcohol suspicion has a short fuse. Do not send them home to sleep it off and test in the morning." },
      { icon: "shield", title: "Remove from duty as required", body: "The employer controls the keys. The clinic does not." },
    ],
    faqs: [
      { q: "Is a tip from another driver enough?", a: "A tip can start you looking. The test needs the supervisor’s own observations, documented." },
      { q: "Do you provide the training?", a: "The seat is priced at $59 and marked coming soon. We will not charge it until the course can actually be completed here." },
      { q: "Can SJCC decide the driver looks impaired?", a: "No. We are not on your yard." },
    ],
    cites: [
      { label: "49 CFR 382.307", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-382/subpart-C/section-382.307" },
      { label: "49 CFR 382.603 — supervisor training", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-382/subpart-F/section-382.603" },
    ],
    related: [
      { href: "/supervisor-training", label: "Supervisor training" },
      { href: "/breath-alcohol", label: "Breath alcohol" },
    ],
  },
  "return-to-duty": {
    eyebrow: "Return to duty",
    title: "After a violation, the SAP goes first.",
    lede: "SJCC is not a substance abuse professional. A return-to-duty test happens only after the SAP evaluation and the education or treatment the SAP requires. The collection is directly observed.",
    description: "Return-to-duty and follow-up testing under 49 CFR Part 40. SJCC is not a SAP.",
    blocks: [
      {
        p: [
          "Return-to-duty is an observed DOT urine test. Follow-up tests after that are also observed. The SAP sets the follow-up schedule: at least six tests in the first twelve months, and the schedule can run as long as sixty months. Employers do not invent a lighter plan.",
          "Follow-up management — tracking that schedule for you — is a separate coming-soon service. The test itself can be ordered now at the observed price.",
        ],
      },
      { prices: ["dot_observed", "followup"] },
    ],
    steps: [
      { icon: "scale", title: "SAP, not SJCC", body: "Evaluation and treatment recommendations come from the SAP. We do not play that role." },
      { icon: "flask", title: "Observed return-to-duty test", body: "Directly observed, under Part 40. A regular unobserved screen is the wrong product." },
      { icon: "bell", title: "Follow-up calendar", body: "The SAP’s schedule is the employer’s to keep. Unannounced means unannounced." },
      { icon: "shield", title: "Clearinghouse stays the employer’s", body: "Return-to-duty reporting is a Clearinghouse duty. We do not claim the filing is included." },
    ],
    faqs: [
      { q: "Can you recommend a SAP?", a: "We are not a SAP network and we do not steer you to one. FMCSA explains how a driver finds a SAP." },
      { q: "Is a negative return-to-duty test the end?", a: "No. Follow-up testing is part of the return. Skipping it is its own problem." },
      { q: "Why is observed more expensive?", a: "The collection procedure is different and the price is published as its own line. It is not a surcharge we invent at the clinic door." },
    ],
    cites: [
      { label: "49 CFR 40.305 — return-to-duty", href: "https://www.ecfr.gov/current/title-49/subtitle-A/part-40/subpart-O/section-40.305" },
      { label: "49 CFR 40.307 — follow-up", href: "https://www.ecfr.gov/current/title-49/subtitle-A/part-40/subpart-O/section-40.307" },
      { label: "FMCSA drug and alcohol overview", href: "https://www.fmcsa.dot.gov/regulations/drug-alcohol-testing/overview-drug-and-alcohol-rules" },
    ],
    related: [
      { href: "/dot-urine", label: "DOT urine" },
      { href: "/clearinghouse", label: "Clearinghouse" },
    ],
  },
  "supervisor-training": {
    eyebrow: "Training",
    title: "Sixty minutes of alcohol. Sixty minutes of drugs.",
    lede: "Supervisors who will make reasonable-suspicion decisions need the training in 49 CFR 382.603. The seat is priced. Checkout opens when the course can be finished here.",
    description: "Reasonable-suspicion supervisor training under 49 CFR 382.603. Coming soon.",
    contactOnly: true,
    blocks: [
      {
        p: [
          "The rule is specific: at least 60 minutes on alcohol misuse and at least 60 minutes on controlled substances use. The signs are physical, behavioral, speech, and performance cues. A printed handout in the break room is not the training.",
          "Until the seat is live, do not pay SJCC for it. Use a course that can actually issue the record you will show an auditor.",
        ],
      },
      { prices: ["training"], soon: true },
    ],
    faqs: [
      { q: "Does every driver need this?", a: "No. The supervisors designated to make reasonable-suspicion calls need it." },
      { q: "Is it included in the $299?", a: "No. Membership is the consortium. Training is a separate line, and it is not charged yet." },
    ],
    cites: [
      { label: "49 CFR 382.603", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-382/subpart-F/section-382.603" },
    ],
    related: [{ href: "/reasonable-suspicion", label: "Reasonable suspicion tests" }],
  },
  backgrounds: {
    eyebrow: "Backgrounds",
    title: "Employment screens, quoted under the FCRA.",
    lede: "National criminal, county, sex offender, SSN trace, employment, and education checks are real products. None of them charge today. A consumer reporting agency has to be on the order before money moves.",
    description: "Background screening menu. Prices published. Checkout closed until a CRA is live.",
    contactOnly: true,
    blocks: [
      {
        p: [
          "If you use a background report to decide on a job, the Fair Credit Reporting Act wants a disclosure, written authorization, and a proper adverse-action process when you turn someone down because of the report. SJCC will not skip that by calling the report a “quick look.”",
          "These are not DOT drug tests and they are not motor vehicle records. Order the record that matches the question you are asking.",
        ],
      },
      {
        h: "Menu",
        prices: ["bg_basic", "bg_county_pack", "bg_premium", "bg_sor", "bg_ssn", "bg_employment", "bg_education", "prehire", "psp"],
        soon: true,
      },
    ],
    steps: [
      { icon: "clipboard", title: "Disclose and authorize", body: "Standalone disclosure. A signature that is actually consent. Not a sentence buried in the application." },
      { icon: "shield", title: "We place the search when we can", body: "Today the button does not take a card. Asking us to run it anyway will get a no." },
      { icon: "file", title: "Read the report", body: "A hit is not automatically a bar to hire. The employer applies its policy and the law." },
      { icon: "bell", title: "Adverse action, if you take it", body: "Pre-adverse notice, a copy of the report, a summary of rights, then a wait, then the final notice. That sequence is yours." },
    ],
    faqs: [
      { q: "What is basic versus county?", a: "Basic is a national criminal screen. County adds courthouse-level searching where the national pointer file is not enough. Premium stacks more of those pieces. The exact sources are whatever the CRA returns, and we will say so on the report when it exists." },
      { q: "Is an SSN trace a credit check?", a: "No. It is an identity and address history used to know where to search. It is not a score." },
      { q: "Can I add this to a non-DOT drug test?", a: "The pre-hire pack is basic background plus a non-DOT 5-panel, priced at $109, and it is coming soon. You can order the drug test alone today." },
    ],
    cites: [
      { label: "FTC — using consumer reports for employment", href: "https://www.ftc.gov/business-guidance/resources/using-consumer-reports-what-employers-need-know" },
    ],
    related: [
      { href: "/mvr", label: "Driving records" },
      { href: "/psp", label: "PSP" },
      { href: "/hire", label: "Drug screens you can order now" },
    ],
  },
  psp: {
    eyebrow: "PSP",
    title: "Crash and inspection history. Not the state MVR.",
    lede: "FMCSA’s Pre-Employment Screening Program shows five years of crash data and three years of inspection data from the federal record. The driver has to consent. The state driving record is a different order.",
    description: "FMCSA PSP records, explained and not yet charged.",
    contactOnly: true,
    blocks: [
      {
        p: [
          "Carriers use PSP, when the driver authorizes it, to see roadside inspection and crash history before hire. It does not replace the motor vehicle record from the state of licensure, and it does not replace the drug test.",
          "The SJCC admin price is $29. Checkout is closed until we can place the request properly.",
        ],
      },
      { prices: ["psp"], soon: true },
    ],
    faqs: [
      { q: "Can I pull PSP without the driver?", a: "No. Consent is part of the program." },
      { q: "Does a clean PSP mean a clean license?", a: "No. Order the MVR too. They are different databases." },
    ],
    cites: [{ label: "FMCSA Pre-Employment Screening Program", href: "https://www.psp.fmcsa.dot.gov/" }],
    related: [
      { href: "/mvr", label: "State MVR" },
      { href: "/pre-employment", label: "Pre-employment drug test" },
    ],
  },
  mvr: {
    eyebrow: "Driving records",
    title: "The state record, plus the state fee.",
    lede: "An MVR is the licensing state’s driver record. SJCC charges $19 to place it. The state DMV fee is extra and passed through. A date typed on a roster is not this product.",
    description: "Motor vehicle records for hiring and the annual review under 49 CFR 391.",
    orderHref: "/screen",
    blocks: [
      {
        p: [
          "49 CFR 391.23 is part of the safety performance history for a new driver. 49 CFR 391.25 is the annual review of the driving record. Ordering the record and reviewing it are both the carrier’s duty. We can place the order. We do not sign the review for you.",
          "There is no honest 50-state price list on this page. Fees change, and some states add copies or status letters. You see the state fee before it is a surprise, or the order waits.",
        ],
      },
      { prices: ["mvr"] },
    ],
    steps: [
      { icon: "user", title: "License state and number", body: "The record comes from the state that issued the license, not from a national mashup we invent." },
      { icon: "file", title: "Pay the SJCC fee", body: "$19, plus the state fee when it is known." },
      { icon: "shield", title: "Read it", body: "Suspensions, crashes, and serious offenses are the carrier’s to judge against 49 CFR 391.15 and the company’s own standard." },
      { icon: "bell", title: "Review again each year", body: "Put the review date on the file when a person actually reviewed it. The portal field is a reminder, not the record." },
    ],
    faqs: [
      { q: "Is this continuous monitoring?", a: "Not yet. This product is an order for a record. Monitoring with alerts is a different service and we do not sell it as if it were included." },
      { q: "Do staffing firms need MVRs?", a: "If you are placing someone in a driving job, yes, you should look. If you are placing a picker in a warehouse, the drug panel matters more than a license abstract." },
    ],
    cites: [
      { label: "49 CFR 391.23", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-391/subpart-C/section-391.23" },
      { label: "49 CFR 391.25 — annual review", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-391/subpart-C/section-391.25" },
    ],
    related: [
      { href: "/psp", label: "PSP" },
      { href: "/driver-files", label: "Qualification files" },
    ],
  },
  clearinghouse: {
    eyebrow: "Clearinghouse",
    title: "Queries and reports stay a carrier duty until we are designated.",
    lede: "Employers buy FMCSA query credits themselves, at $1.25. SJCC can quote administration. We do not sell the credit, and we do not file a violation from a checkout button.",
    description: "FMCSA Drug and Alcohol Clearinghouse queries, consent, and what SJCC will not file.",
    contactOnly: true,
    blocks: [
      {
        h: "The three moments carriers mix up",
        list: [
          "Full query before a driver performs safety-sensitive work for you, with specific consent.",
          "Limited query at least once a year for current drivers. If it finds a record, you need a full query and consent.",
          "Reporting: the employer reports drug and alcohol violations, negative return-to-duty tests, and the actual knowledge events the rule names. A note in our portal is not that report.",
        ],
        p: [
          "Assisted setup, annual query administration, and a full-query admin fee are priced below so a safety manager can budget. Paying us does not buy FMCSA credits. Those are purchased in the Clearinghouse by the employer.",
        ],
      },
      { prices: ["ch_setup", "ch_query", "ch_full"], soon: true },
    ],
    steps: [
      { icon: "user", title: "Employer registers", body: "The company needs its own Clearinghouse account. A driver registration is not the company’s." },
      { icon: "shield", title: "Consent", body: "Limited-query consent can be on file. Full queries need the specific electronic consent in the system." },
      { icon: "scale", title: "Query", body: "Pre-employment full. Annual limited. Another full if the limited query is not clean." },
      { icon: "file", title: "Report, yourselves, unless designated", body: "If you later designate SJCC and FMCSA accepts it, the scope will be written down. It is not implied by membership." },
    ],
    faqs: [
      { q: "Does the $299 include queries?", a: "No. Queries are FMCSA credits plus, when we offer it, an admin fee. Neither is inside the membership today." },
      { q: "Can you buy the $1.25 credits for me?", a: "No. The employer purchases them." },
      { q: "A driver says they have no violations. Is that the query?", a: "No. A conversation is not a query." },
    ],
    cites: [
      { label: "49 CFR 382.701", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-382/subpart-G/section-382.701" },
      { label: "FMCSA Clearinghouse", href: "https://clearinghouse.fmcsa.dot.gov/" },
    ],
    related: [
      { href: "/pre-employment", label: "Pre-employment test" },
      { href: "/return-to-duty", label: "Return to duty" },
    ],
  },
  "driver-files": {
    eyebrow: "Driver files",
    title: "A qualification file is a set of documents, not a login.",
    lede: "49 CFR 391.51 lists what a motor carrier keeps. The SJCC roster can remind you. It is not, by itself, the driver qualification file. That product is coming soon and is not charged.",
    description: "What belongs in a driver qualification file, and what SJCC does not store as a finished DQ product yet.",
    contactOnly: true,
    blocks: [
      {
        list: [
          "Application for employment.",
          "Road test certificate, or the exception the rule allows, such as a current CDL in the cases the section names.",
          "Motor vehicle record and the annual review.",
          "Medical examiner’s certificate, and the National Registry verification the rule requires.",
          "The safety performance history you were required to investigate.",
        ],
        p: [
          "Drug test results and Clearinghouse records have their own retention rules. They are not “in the DQ file” as a shortcut that mixes confidential testing records into a folder anyone in the shop can flip through.",
        ],
      },
    ],
    faqs: [
      { q: "If I type the medical expiration into the portal, is the card on file?", a: "No. You typed a date. The certificate is the document." },
      { q: "Will you build the file for me?", a: "Not as a paid product yet. Contact us if you want to be told when that work is real." },
    ],
    cites: [
      { label: "49 CFR 391.51", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-391/subpart-F/section-391.51" },
    ],
    related: [
      { href: "/mvr", label: "MVR" },
      { href: "/physicals", label: "Medical cards" },
    ],
  },
  physicals: {
    eyebrow: "Physicals",
    title: "We can point at an exam. We do not perform one.",
    lede: "A DOT medical card comes from a examiner on the National Registry, under 49 CFR 391.41 and 391.43. The referral price is $139. Checkout is off until scheduling is real.",
    description: "DOT physical referrals. SJCC does not issue medical cards.",
    contactOnly: true,
    blocks: [
      {
        p: [
          "The exam is the examiner’s. The certification length — up to 24 months, often shorter — is the examiner’s call under the standards. SJCC does not change a card, extend one, or tell a driver they will pass.",
          "Carriers keep the certificate and verify the examiner on the National Registry. A date in our roster does not do that verification.",
        ],
      },
      { prices: ["physical"], soon: true },
    ],
    faqs: [
      { q: "Is this included in consortium membership?", a: "No." },
      { q: "Can the driver use any clinic?", a: "The examiner has to be listed on FMCSA’s National Registry. A general urgent care visit is not automatically a DOT exam." },
    ],
    cites: [
      { label: "49 CFR 391.41", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-391/subpart-E/section-391.41" },
      { label: "National Registry of Certified Medical Examiners", href: "https://nationalregistry.fmcsa.dot.gov/" },
    ],
    related: [{ href: "/driver-files", label: "Qualification files" }],
  },
  filings: {
    eyebrow: "Filings",
    title: "Authority paperwork is not a drug test.",
    lede: "BOC-3 and UCR are quoted as services we intend to handle. They are not charged now. Form 2290 heavy-vehicle tax and the MCS-150 update are the carrier’s filings with other agencies. We do not sell those as a checkout.",
    description: "BOC-3, UCR, and the filings SJCC will not pretend to submit.",
    contactOnly: true,
    blocks: [
      {
        list: [
          "BOC-3: designation of process agents under 49 CFR Part 366. A one-time filing until you change it. Quoted at $69, not charged.",
          "UCR: annual registration. The fee depends on the fleet-size bracket the UCR board publishes. We do not invent that bracket price.",
          "MCS-150: the biennial update is filed by the carrier in FMCSA systems. We will remind you. We will not tell you we updated it if we did not.",
          "Form 2290: highway use tax is an IRS form. SJCC is not a tax preparer and there is no button for it.",
        ],
      },
    ],
    faqs: [
      { q: "Does new authority come with the consortium?", a: "No. You can join the consortium without buying filings, and you should not buy filings from a page that says coming soon." },
      { q: "Can you get my DOT number?", a: "No. USDOT numbers come from FMCSA." },
    ],
    cites: [
      { label: "49 CFR Part 366 — process agents", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-366" },
      { label: "Unified Carrier Registration", href: "https://www.ucr.gov/" },
    ],
    related: [
      { href: "/boc-3", label: "BOC-3" },
      { href: "/ucr", label: "UCR" },
    ],
  },
  policy: {
    eyebrow: "Policy",
    title: "A written policy is required. A template is not legal advice.",
    lede: "49 CFR 382.601 says the employer provides educational materials and a policy. SJCC can sell a written policy when that document is actually ready. The price is $49. It is not charged today, and it is not a law firm’s opinion.",
    description: "DOT drug and alcohol policy documents. Coming soon. Not legal advice.",
    contactOnly: true,
    blocks: [
      {
        p: [
          "Drivers have to be told the basics: who the person to contact is, what conduct is prohibited, what happens after a positive or a refusal, and how testing works. The materials are the employer’s to hand out and the driver’s to receive. A PDF in a shared drive that nobody opened is a weak file.",
          "Membership does not currently include a custom policy. When the product is live, it will be a standard document you adopt, not a brief written for your last audit.",
        ],
      },
      { prices: ["policy"], soon: true },
    ],
    faqs: [
      { q: "Are you my lawyer if I buy it?", a: "No. The agreement already says SJCC is not a law firm. A policy template does not change that." },
      { q: "Do non-DOT staffing firms need a Part 382 policy?", a: "They need a workplace policy if they test. They do not need the FMCSA policy unless they employ people in safety-sensitive driving jobs." },
    ],
    cites: [
      { label: "49 CFR 382.601", href: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-382/subpart-F/section-382.601" },
    ],
    related: [{ href: "/consortium", label: "Consortium" }],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Short answers, with the rule nearby.",
    lede: "The pages under Testing, Records, and Filings go further. This is the list safety managers ask on the first call.",
    description: "SJCC answers on the consortium, non-DOT staffing tests, prices, and what we do not file.",
    blocks: [
      {
        h: "Program",
        p: [
          "Fleets of two or more testing drivers can join one SJCC consortium for $299 a year. Tests are extra. One-driver companies are referred and not charged. Hire screens are a separate door with no pool.",
        ],
      },
    ],
    faqs: [
      { q: "What does $299 buy?", a: "A year of membership for unlimited testing drivers: the combined random pool, the private company file, and a certificate once the roster is on file. It does not buy unlimited drug tests." },
      { q: "What do tests cost?", a: "DOT urine $73. Breath alcohol $63. Both at the same visit $129. Observed or follow-up DOT drug test $109. Non-DOT 5-panel $69, 9-panel $79, 10-panel $89. Hair $149. MVR $19 plus the state fee." },
      { q: "Why would a staffing firm order a DOT test?", a: "Only if the placed worker will perform an FMCSA safety-sensitive function. Otherwise order non-DOT." },
      { q: "Where is the collection?", a: "Quest and LabCorp sites through our testing partner. We do not own them." },
      { q: "Do you file the Clearinghouse?", a: "Not as part of membership, and not from a button on this site. The carrier reports unless a designation is accepted later." },
      { q: "Are backgrounds for sale?", a: "They are explained and priced. They are not charged until a consumer reporting agency can fulfill them." },
      { q: "Is marijuana legal in Michigan a DOT defense?", a: "No. The federal panel still includes marijuana." },
      { q: "Who is the random pool?", a: "Every testing driver at every accepted member fleet, drawn together. Your login shows only your company." },
    ],
    related: [
      { href: "/services", label: "Full service index" },
      { href: "/pricing", label: "Pricing" },
      { href: "/testing", label: "Testing" },
    ],
  },
  services: {
    eyebrow: "Services",
    title: "Everything on the shelf, including what we will not charge yet.",
    lede: "If our testing partner can run it, or a filing desk can finish it, it has a page. Live means you can pay. Coming soon means you can read the rule and you cannot pay.",
    description: "Index of SJCC drug testing, records, and filing services.",
    blocks: [
      {
        h: "You can order",
        list: [
          "DOT urine, breath alcohol, same-visit pair, observed DOT drug test.",
          "Non-DOT 5-, 9-, and 10-panel urine, and hair, for staffing and other employer-policy jobs.",
          "Motor vehicle record, $19 plus the state fee.",
          "Consortium membership for fleets of two or more.",
        ],
      },
      {
        h: "Explained, not charged",
        list: [
          "Oral fluid.",
          "Background searches, employment and education verification, PSP.",
          "Clearinghouse setup and query administration.",
          "Supervisor training, written policy, DOT physical referral, qualification-file support.",
          "BOC-3, UCR, and post-SAP follow-up management.",
        ],
      },
    ],
    related: [
      { href: "/non-dot", label: "Non-DOT panels" },
      { href: "/dot-urine", label: "DOT urine" },
      { href: "/breath-alcohol", label: "Breath alcohol" },
      { href: "/hair", label: "Hair" },
      { href: "/randoms", label: "Randoms" },
      { href: "/pre-employment", label: "Pre-employment" },
      { href: "/post-accident", label: "Post-accident" },
      { href: "/reasonable-suspicion", label: "Reasonable suspicion" },
      { href: "/return-to-duty", label: "Return to duty" },
      { href: "/mvr", label: "MVR" },
      { href: "/backgrounds", label: "Backgrounds" },
      { href: "/clearinghouse", label: "Clearinghouse" },
      { href: "/physicals", label: "Physicals" },
      { href: "/driver-files", label: "Driver files" },
      { href: "/filings", label: "Filings" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
};
