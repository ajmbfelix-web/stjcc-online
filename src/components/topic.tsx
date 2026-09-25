import { Link } from "@tanstack/react-router";
import { PublicShell, PageIntro } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import {
  CATALOG,
  FLEET_ANNUAL_CENTS,
  FIRST_DRIVER_ANNUAL_CENTS,
  ADDITIONAL_DRIVER_ANNUAL_CENTS,
  REFERRAL_DISCLOSURE,
  REFERRAL_URL,
  money,
  priceLabel,
  type Sku,
} from "@/lib/billing/catalog";

type Block = {
  h?: string;
  p?: string[];
  list?: string[];
  prices?: readonly Sku[];
  soon?: boolean;
};

export type Topic = {
  eyebrow: string;
  title: string;
  lede: string;
  description: string;
  blocks: Block[];
  referral?: boolean;
  contactOnly?: boolean;
};

function PriceRows({ skus, soon }: { skus: readonly Sku[]; soon?: boolean }) {
  return (
    <div className="mt-4 overflow-x-auto border border-border">
      <table className="w-full min-w-[28rem] text-left text-sm">
        <thead className="border-b border-border bg-muted font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Service</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Checkout</th>
          </tr>
        </thead>
        <tbody>
          {skus.map((sku) => {
            const item = CATALOG[sku];
            return (
              <tr key={sku} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div>{item.label}</div>
                  {item.note ? <div className="mt-1 text-xs text-muted-foreground">{item.note}</div> : null}
                </td>
                <td className="px-4 py-3 tabular-nums text-foreground">{priceLabel(item.cents)}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.live && !soon ? "Live" : "Coming soon"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
        Tests and add-ons are extra. Membership is the pool, the company file, and the certificate — not unlimited collections.
      </p>
    </div>
  );
}

export function TopicView({ topic }: { topic: Topic }) {
  return (
    <PublicShell>
      <PageIntro eyebrow={topic.eyebrow} title={topic.title} lede={topic.lede} />
      <article className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6">
        {topic.blocks.map((block) => (
          <section key={block.h ?? block.p?.[0]}>
            {block.h ? <h2 className="text-2xl">{block.h}</h2> : null}
            {block.p?.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {paragraph}
              </p>
            ))}
            {block.list ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-foreground">
                {block.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {block.prices ? <PriceRows skus={block.prices} soon={block.soon} /> : null}
          </section>
        ))}
        {topic.referral ? (
          <section className="border border-border bg-card p-6">
            <h2 className="text-2xl">Referral only</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{REFERRAL_DISCLOSURE}</p>
            <a href={REFERRAL_URL} className="mt-4 inline-flex min-h-11 items-center text-sm text-accent underline" rel="noopener noreferrer">
              Continue to the consortium referral
            </a>
            <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">{REFERRAL_DISCLOSURE}</p>
          </section>
        ) : topic.contactOnly ? (
          <Button asChild>
            <Link to="/contact">Contact</Link>
          </Button>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/onboarding">Start enrollment</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/contact">Contact</Link>
            </Button>
          </div>
        )}
      </article>
    </PublicShell>
  );
}

const membership = `Fleet consortium membership is ${money(FLEET_ANNUAL_CENTS)} per year for unlimited testing drivers. Setup is $0. Tests are prepaid and are not included.`;
const alternate = `A fleet of 2–8 testing drivers can ask for a per-driver quote instead: ${money(FIRST_DRIVER_ANNUAL_CENTS)} for the first testing driver and ${money(ADDITIONAL_DRIVER_ANNUAL_CENTS)} for each additional testing driver that year. The public checkout sells the flat ${money(FLEET_ANNUAL_CENTS)} year.`;

export const TOPICS = {
  consortium: {
    eyebrow: "Program",
    title: "One consortium. Private company files.",
    lede: "Accepted fleets of two or more testing drivers share one SJCC random pool. Your portal still shows only your drivers and your selections.",
    description: "SJCC consortium for motor carriers with at least two testing drivers. $299 per year. Tests extra.",
    blocks: [
      {
        h: "Who is in",
        p: [
          "A motor carrier with two or more drivers who need DOT random testing can join. The draw uses the combined pool: 50 percent drug and 10 percent alcohol of the testing drivers who are actually in it, under 49 CFR 382.305.",
          "Each member keeps a private file. A safety manager in Grand Blanc does not see another carrier’s roster, results, or notes.",
        ],
      },
      {
        h: "What the year includes",
        list: [
          membership,
          "Random administration on the combined pool, spread through the year.",
          "A certificate of enrollment after the membership is paid and the roster is on file.",
          "Quest and LabCorp collection through our testing partner. SJCC does not own the clinics.",
          alternate,
        ],
      },
      { h: "Live test menu", prices: ["dot_drug", "dot_alcohol", "dot_combo", "dot_observed", "mvr"] },
    ],
  },
  "owner-operators": {
    eyebrow: "Owner-operators",
    title: "One driver does not join SJCC.",
    lede: "A random pool of one is not a valid program. We do not enroll it, and we do not charge it.",
    description: "Owner-operators with one testing driver are referred out of SJCC. No charge.",
    referral: true,
    blocks: [
      {
        p: [
          "If your company has a single testing driver, stop here. The fleet enrollment will refuse a headcount of one.",
          "Hire screens are a different door, for a staffing firm or office ordering a prepaid test. That is not a random program.",
        ],
      },
    ],
  },
  hire: {
    eyebrow: "Hire screens",
    title: "Order the screen. Skip the consortium.",
    lede: "Staffing firms and offices pay for the test they name. There is no annual membership and no random draw.",
    description: "Prepaid hire screens. No SJCC consortium membership.",
    blocks: [
      {
        p: [
          "Name the person, pay the live price, and the result is reported to the email you give us. Collection is at Quest or LabCorp through our testing partner.",
          "Coming-soon packages are explained on their own pages. This door will not charge them.",
        ],
      },
      { h: "What you can order now", prices: ["dot_drug", "dot_alcohol", "dot_combo", "dot_observed", "mvr"] },
    ],
  },
  "how-it-works": {
    eyebrow: "Process",
    title: "Pay, then the file moves.",
    lede: "Membership opens the consortium file. Each test is a separate prepaid order.",
    description: "How an SJCC fleet or hire screen moves from request to result.",
    blocks: [
      {
        list: [
          "A fleet of two or more signs the Michigan agreement and pays $299 for the year.",
          "The roster goes on the private company file. Those drivers join the combined pool.",
          "When a test is ordered, it is paid first. It is not sent to a clinic until the testing partner accepts it.",
          "The person tests at a Quest or LabCorp site. The result returns to the SJCC portal.",
          "A one-driver company is stopped before payment and sent to the referral.",
        ],
      },
    ],
  },
  "service-area": {
    eyebrow: "Service area",
    title: "Southeast Michigan, and a national collection network.",
    lede: "The office is in the Flint, Genesee, and Oakland corridor. Collection sites are the partner’s, not ours.",
    description: "SJCC serves Southeast Michigan fleets. Collection is at Quest and LabCorp through a testing partner, 20,000+ sites.",
    blocks: [
      {
        p: [
          "Grand Blanc, Flint, Clarkston, Auburn Hills, Lake Orion, Waterford, and Troy are the home market. A carrier based here enrolls with SJCC. A driver can still collect at a partner site outside Michigan.",
          "Our testing partner’s network covers more than 20,000 collection sites, including Quest and LabCorp. SJCC does not own those clinics and does not hand out a laboratory login.",
        ],
      },
    ],
  },
  testing: {
    eyebrow: "Testing",
    title: "Prepaid DOT urine and breath alcohol.",
    lede: "The price is collected before the order. The site is a Quest or LabCorp location on the partner network.",
    description: "DOT urine $73, breath alcohol $63, same visit $129, observed drug $109.",
    blocks: [
      {
        p: [
          "Any DOT reason uses the same urine price. Random, pre-employment, post-accident, reasonable suspicion, return-to-duty, and follow-up are reasons, not different laboratory products, except the observed collection.",
          "A same-visit drug and breath alcohol test is one SJCC charge. Internally it can be two partner orders. We do not pretend it is a single laboratory SKU.",
        ],
      },
      { prices: ["dot_drug", "dot_alcohol", "dot_combo", "dot_observed"] },
    ],
  },
  randoms: {
    eyebrow: "Randoms",
    title: "50 percent drug. 10 percent alcohol. One pool.",
    lede: "The rates in 49 CFR 382.305 apply to the combined SJCC consortium, not to each company as its own hat.",
    description: "SJCC consortium random testing at the FMCSA 50% drug and 10% alcohol minimums.",
    blocks: [
      {
        p: [
          "The U.S. Department of Transportation left the FMCSA minimums unchanged for 2026: at least 50 percent of driver positions for controlled substances and 10 percent for alcohol, counted across the year. Fifty percent is a count of tests, not a coin flip that half the drivers fail.",
          "SJCC spreads selections through the quarters. A selection is stored on the driver’s own company, so that company’s portal lists only its people. The target itself is the combined pool.",
          "A company with one testing driver is not added to the hat.",
        ],
      },
    ],
  },
  "pre-employment": {
    eyebrow: "Pre-employment",
    title: "The test before safety-sensitive work.",
    lede: "A DOT pre-employment urine test is a live order. The background pack around it is not, yet.",
    description: "DOT pre-employment urine testing at $73. Background packs are coming soon.",
    blocks: [
      {
        p: [
          "Before a driver performs safety-sensitive work, the employer orders the pre-employment drug test the rule requires. SJCC takes that order after it is paid. We do not decide that the person is qualified to drive.",
          "A non-DOT hire can use the same door when the live catalog has the screen. The pre-hire pack that bundles a background with a non-DOT panel is quoted below and is not charged.",
        ],
      },
      { prices: ["dot_drug", "prehire"], soon: false },
    ],
  },
  "post-accident": {
    eyebrow: "Post-accident",
    title: "The employer decides whether the window applies.",
    lede: "SJCC can order the DOT urine and breath tests. We do not tell you that a crash meets the federal table.",
    description: "Post-accident DOT drug and alcohol orders. The employer decides whether testing is required.",
    blocks: [
      {
        p: [
          "Post-accident testing has time limits and conditions that are easy to get wrong. The employer, not this website, decides whether a test is required. If you order one, it is prepaid at the same DOT prices as any other DOT reason.",
          "A refusal is not a reschedule. If the collection does not happen, tell us. We do not file that fact in the Clearinghouse for you.",
        ],
      },
      { prices: ["dot_drug", "dot_alcohol", "dot_combo"] },
    ],
  },
  mvr: {
    eyebrow: "Records",
    title: "Motor vehicle records, from $19.",
    lede: "The SJCC fee is $19. The state DMV fee is passed through. We do not publish a fake 50-state table.",
    description: "Motor vehicle records from $19 plus the state fee. Live checkout.",
    blocks: [
      {
        p: [
          "An MVR is a driving record ordered from the state, not a date typed on a roster. Pay the SJCC fee first. The state fee is extra and depends on the state that holds the record.",
          "The same order is available on a fleet file and on a hire-screen account.",
        ],
      },
      { prices: ["mvr"] },
    ],
  },
  backgrounds: {
    eyebrow: "Records",
    title: "Background packages, not charged yet.",
    lede: "The prices are published. Checkout stays closed until a consumer reporting agency can fulfill them.",
    description: "Background screening prices. Checkout coming soon.",
    contactOnly: true,
    blocks: [
      {
        p: ["These are SJCC list prices for screening we intend to offer. Ordering one today will be refused. Contact us if you need a quote held."],
      },
      { prices: ["bg_basic", "bg_county_pack", "bg_premium", "psp", "prehire"], soon: true },
    ],
  },
  clearinghouse: {
    eyebrow: "Records",
    title: "Clearinghouse help, without pretending we already query.",
    lede: "Employers buy FMCSA query credits themselves. Our fee, when it is live, is administration only.",
    description: "Clearinghouse setup and query administration. Checkout coming soon. FMCSA credits stay with the employer.",
    contactOnly: true,
    blocks: [
      {
        p: [
          "FMCSA query credits are $1.25 each and must be purchased by the employer on clearinghouse.fmcsa.dot.gov. SJCC cannot buy those credits. The $19 and $29 figures are administration if you appoint us and we run the query.",
          "Designating an employer account is a walkthrough, not a product we charge. We do not claim a query or a violation report has been filed unless that designation is accepted in the federal system. Checkout for the paid rows is closed.",
        ],
      },
      { prices: ["ch_setup", "ch_query", "ch_full"], soon: true },
    ],
  },
  "driver-files": {
    eyebrow: "Records",
    title: "Driver qualification files are coming soon.",
    lede: "We do not sell a qualification-file product today. The company file in the portal is the testing roster, not a DQ file.",
    description: "Driver qualification files are coming soon and are not charged.",
    contactOnly: true,
    blocks: [
      {
        p: [
          "A driver qualification file is a set of records the motor carrier keeps. SJCC’s portal holds the testing roster, selections, and orders for that company. It is not a DQ file and it is not a medical card.",
          "When a DQ product exists, it will be priced here before anyone can pay for it. Until then, contact us. Nothing on this page charges a card.",
        ],
      },
      { prices: ["dq_file"], soon: true },
    ],
  },
  physicals: {
    eyebrow: "Records",
    title: "We do not perform the DOT exam.",
    lede: "A physical referral is scheduling help. The medical examiner does the exam. Checkout is not open.",
    description: "DOT physical referral at $139. SJCC does not perform the exam. Checkout coming soon.",
    contactOnly: true,
    blocks: [
      {
        p: ["The published referral price is $139. Paying it would book scheduling, not a card we issue and not an exam we conduct. The button to pay is intentionally absent."],
      },
      { prices: ["physical"], soon: true },
    ],
  },
  filings: {
    eyebrow: "Filings",
    title: "Authority paperwork is quoted, not sold at checkout.",
    lede: "BOC-3 has a price. UCR is contact-only. Neither takes a card on this site.",
    description: "BOC-3 and UCR filing assistance. Checkout coming soon.",
    contactOnly: true,
    blocks: [
      { p: ["New-authority paperwork is a different job from random testing. These pages explain the assist we may offer later. They do not file anything tonight."] },
      { prices: ["boc3", "ucr"], soon: true },
    ],
  },
  "boc-3": {
    eyebrow: "Filings",
    title: "BOC-3, coming soon.",
    lede: "A process-agent filing is $69 when we can actually file it. We cannot take that payment yet.",
    description: "BOC-3 filing at $69. Checkout coming soon.",
    contactOnly: true,
    blocks: [
      { p: ["A BOC-3 designates process agents in each state. SJCC is not filing that designation through this page. The price is here so a carrier can see it. The next step is contact, not a charge."] },
      { prices: ["boc3"], soon: true },
    ],
  },
  ucr: {
    eyebrow: "Filings",
    title: "UCR filing assist.",
    lede: "Unified Carrier Registration is contact-only. There is no price on a checkout button.",
    description: "UCR filing assistance. Contact SJCC. No checkout.",
    contactOnly: true,
    blocks: [
      { p: ["UCR fees are set outside this office and change by fleet size. We will not invent them. If you want help preparing the filing, write to us. This page does not charge."] },
      { prices: ["ucr"], soon: true },
    ],
  },
  about: {
    eyebrow: "Company",
    title: "A compliance office for small fleets.",
    lede: "St. Joseph Compliance Company is based in Southeast Michigan. The work is consortium administration, prepaid tests, and a private file for each carrier.",
    description: "About St. Joseph Compliance Company, a Southeast Michigan DOT compliance office.",
    blocks: [
      {
        p: [
          "SJCC runs one consortium for fleets of two or more testing drivers, and a separate hire-screen door for staffing firms. We do not enroll a one-driver carrier.",
          "Collection happens on a partner network of more than 20,000 sites, including Quest and LabCorp. Those sites are not SJCC clinics.",
        ],
      },
    ],
  },
  faq: {
    eyebrow: "Company",
    title: "Questions we actually get.",
    lede: "The pool, the one-driver stop, what $299 buys, and who pays for Clearinghouse credits.",
    description: "FAQ for the SJCC consortium, pricing, and one-driver referrals.",
    blocks: [
      {
        h: "What is the pool?",
        p: ["Accepted fleets share one random pool. The annual minimums are 50 percent drug and 10 percent alcohol of that combined group. Your portal lists only your company’s drivers and the selections that landed on them."],
      },
      {
        h: "Can a one-driver carrier join?",
        p: ["No. A pool of one is not valid. We do not charge that carrier. The owner-operator page sends them to a referral, and it says SJCC may receive a fee if they enroll through that link."],
      },
      {
        h: "What does $299 include?",
        p: [membership, "It does not include drug tests, breath alcohol, motor vehicle records, or any coming-soon package."],
      },
      {
        h: "Who buys Clearinghouse credits?",
        p: ["The employer, on the FMCSA site, at $1.25 each. SJCC cannot buy them. Our query prices, when checkout opens, are administration only."],
      },
    ],
  },
  legal: {
    eyebrow: "Company",
    title: "Michigan agreement, in plain sight.",
    lede: "The fleet enrollment is a consortium agreement. Michigan law governs it. Tests are prepaid. One driver cannot pay.",
    description: "SJCC consortium terms. Michigan law. One testing driver cannot enroll.",
    blocks: [
      {
        p: [
          "The full agreement is shown on the fleet enrollment page before anyone signs. It covers one combined pool, a private company file, a certificate after the year is paid and the roster is on file, and the $299 annual membership.",
          "SJCC does not claim to file Clearinghouse reports unless the carrier designates us and that designation is accepted in the federal system. A hire-screen enrollment is an addendum: no membership and no pool.",
          "Privacy and the shorter public terms are linked below. They are SJCC documents, not a reprint of another company’s contract.",
        ],
      },
    ],
  },
} satisfies Record<string, Topic>;

export type TopicSlug = keyof typeof TOPICS;

export function dollars(): { year: string; drug: string; alcohol: string } {
  return {
    year: money(FLEET_ANNUAL_CENTS),
    drug: money(CATALOG.dot_drug.cents),
    alcohol: money(CATALOG.dot_alcohol.cents),
  };
}
