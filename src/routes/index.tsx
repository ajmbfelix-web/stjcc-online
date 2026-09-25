import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Ban,
  Beaker,
  Car,
  Check,
  FileStack,
  FlaskConical,
  FolderOpen,
  Landmark,
  Shuffle,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import {
  CATALOG,
  FLEET_ANNUAL_CENTS,
  money,
  perDriverAnnualCents,
  priceLabel,
} from "@/lib/billing/catalog";
import { canonical, DEFAULT_DESCRIPTION, pageTitle } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: pageTitle("Fleet consortium and hire screens") },
      { name: "description", content: DEFAULT_DESCRIPTION },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
  }),
  component: Home,
});

const steps = [
  ["Enroll", "A fleet of two or more pays the year. A hire screen skips membership. One driver is referred, not charged."],
  ["Roster", "Your drivers sit on your company file. Accepted fleets join the single SJCC pool."],
  ["Order", "A test is paid before it is sent. Coming-soon services stay on the page and off the card."],
  ["Collect", "Quest and LabCorp, through our testing partner. More than 20,000 sites. None of them are ours."],
  ["File", "The result returns to your portal. We do not file the Clearinghouse unless you designate us and that designation is accepted."],
];

const faqs = [
  ["What is the pool?", "Accepted fleets share one random pool at 50% drug and 10% alcohol. Your portal shows only your drivers and your selections."],
  ["What does $299 cover?", "A year of consortium membership for unlimited testing drivers: the pool, the private file, and a certificate after the roster is on file. Tests are extra."],
  ["Can one driver join?", "No. A pool of one is not valid. The owner-operator page is a referral, and it discloses that SJCC may receive a fee."],
  ["Who buys query credits?", "The employer, on the FMCSA Clearinghouse, at $1.25 each. We cannot buy them."],
  ["Are the clinics yours?", "No. Collection is Quest and LabCorp through a testing partner. SJCC does not own a clinic and does not hand out a laboratory login."],
];

const services: { to: "/non-dot" | "/testing" | "/randoms" | "/mvr" | "/clearinghouse" | "/backgrounds" | "/physicals" | "/filings" | "/driver-files"; title: string; badge: string; body: string; wide?: boolean; icon: LucideIcon }[] = [
  { to: "/non-dot", title: "Non-DOT panels", badge: "Live", body: "5-, 9-, and 10-panel urine, plus hair, for staffing and offices.", wide: true, icon: Beaker },
  { to: "/testing", title: "DOT testing", badge: "Live", body: "Urine, breath alcohol, same visit, and observed collections.", icon: FlaskConical },
  { to: "/randoms", title: "Random pool", badge: "Live", body: "One combined draw. Private files stay private.", icon: Shuffle },
  { to: "/mvr", title: "Driving records", badge: "Live", body: "From $19 plus the state fee.", icon: Car },
  { to: "/clearinghouse", title: "Clearinghouse", badge: "Soon", body: "Admin prices are published. Credits stay with the employer.", icon: Landmark },
  { to: "/backgrounds", title: "Backgrounds", badge: "Soon", body: "National, county, premium, and PSP. Contact, not a charge.", icon: FolderOpen },
  { to: "/physicals", title: "Physicals", badge: "Soon", body: "A referral. We do not perform the exam.", icon: Stethoscope },
  { to: "/filings", title: "BOC-3 and UCR", badge: "Soon", body: "Quoted. Not filed from a checkout button.", icon: FileStack },
  { to: "/driver-files", title: "Qualification files", badge: "Soon", body: "The portal roster is not a finished DQ file.", icon: FolderOpen },
];

const doors = [
  {
    id: "fleet",
    label: "Fleet",
    kicker: "Two or more",
    title: "One pool. A private file.",
    body: "Accepted fleets share the SJCC random draw. Your portal still lists only your drivers, your selections, and your orders.",
    points: [
      "50% drug and 10% alcohol of the combined pool",
      "Certificate after the year is paid and the roster is on file",
      "Unlimited testing drivers on the $299 year",
      "Tests prepaid on top. Setup is $0",
    ],
    rows: [
      ["Membership", priceLabel(FLEET_ANNUAL_CENTS) + " / yr"],
      ["DOT urine", priceLabel(CATALOG.dot_drug.cents)],
      ["Breath alcohol", priceLabel(CATALOG.dot_alcohol.cents)],
      ["Same visit", priceLabel(CATALOG.dot_combo.cents)],
      ["Setup", "$0"],
    ],
    href: "/onboarding/fleet" as const,
    cta: "Enroll a fleet",
  },
  {
    id: "staff",
    label: "Staffing",
    kicker: "No pool",
    title: "Order the screen. Skip the year.",
    body: "A staffing firm or office pays for the test it names. There is no consortium membership and no random draw.",
    points: [
      "Non-DOT 5, 9, and 10-panel urine",
      "Hair, when the window is longer than a urine test",
      "A DOT test only if the job is safety-sensitive",
      "Result reported to the email you give us",
    ],
    rows: [
      ["Membership", "$0"],
      ["Non-DOT 5", priceLabel(CATALOG.nondot_urine_5.cents)],
      ["Non-DOT 10", priceLabel(CATALOG.nondot_urine_10.cents)],
      ["Hair", priceLabel(CATALOG.hair.cents)],
      ["MVR", priceLabel(CATALOG.mvr.cents) + " + state"],
    ],
    href: "/hire" as const,
    cta: "Open hire screens",
  },
  {
    id: "one",
    label: "One driver",
    kicker: "Not sold",
    title: "A pool of one is refused.",
    body: "A single testing driver cannot join SJCC. We do not charge that carrier. The referral page says if we may receive a fee.",
    points: [
      "Fleet enrollment stops at a headcount of one",
      "No membership, no certificate, no checkout",
      "Hire screens are a different door, for an employer ordering a test",
      "The referral is disclosed before anyone leaves",
    ],
    rows: [
      ["SJCC charge", "$0"],
      ["Membership", "Not offered"],
      ["Checkout", "Closed"],
      ["Next step", "Referral"],
    ],
    href: "/owner-operators" as const,
    cta: "Read the stop",
  },
];

const rules = [
  ["A pool of one is not a pool.", "FMCSA random testing is a rate across a group. SJCC will not invent a consortium out of a single driver, and will not take that payment."],
  ["The test is paid before it moves.", "A collection is not dispatched until the live price is collected. Coming-soon rows stay on the page so the price is visible, and off the card so it cannot be charged."],
  ["Credits stay on the federal site.", "Clearinghouse query credits are bought by the employer. Our published query prices, when checkout opens, are administration only."],
];

function QuoteDesk() {
  const [door, setDoor] = useState<"fleet" | "staff">("fleet");
  const [drivers, setDrivers] = useState(4);
  const blocked = door === "fleet" && drivers < 2;
  const alternate = door === "fleet" ? perDriverAnnualCents(drivers) : null;
  const year = blocked ? "—" : door === "fleet" ? priceLabel(FLEET_ANNUAL_CENTS) : "$0";

  return (
    <div className="desk">
      <div className="desk-bar">
        <span className="desk-dots" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="font-mono text-xs uppercase tracking-widest">Pricing desk</span>
        <span className="ml-auto hidden font-mono text-xs sm:inline">stjcc.online</span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent/20 px-2.5 py-1 text-xs font-medium">Live prices</span>
          <span className="text-xs text-muted-foreground">No card on this desk</span>
        </div>
        <h2 className="mt-4 text-2xl">What the year actually costs.</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Fleet membership is flat. Tests are extra. A headcount of one stops the quote.
        </p>
        <div className="mt-5 grid grid-cols-2 rounded-full bg-muted p-1">
          {(
            [
              ["fleet", "Fleet"],
              ["staff", "Staffing"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={door === id}
              onClick={() => setDoor(id)}
              className={`h-10 rounded-full text-sm font-medium ${door === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {door === "fleet" ? (
          <label className="mt-4 block">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Testing drivers</span>
            <input
              type="number"
              min={1}
              max={80}
              value={drivers}
              onChange={(event) => setDrivers(Number(event.target.value) || 1)}
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            />
          </label>
        ) : (
          <p className="mt-4 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
            Staffing does not buy a year. You pay the screen you name.
          </p>
        )}
        {blocked ? (
          <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/70 p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Ban className="size-4" aria-hidden />
              One driver cannot enroll
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Raise the count to two, or leave through the referral. Nothing here charges a card.
            </p>
          </div>
        ) : null}
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
            <span>{door === "fleet" ? "Fleet membership" : "Membership"}</span>
            <span className="font-medium tabular-nums">{year}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
            <span>{door === "fleet" ? "DOT urine" : "Non-DOT 5-panel"}</span>
            <span className="font-medium tabular-nums">
              {priceLabel(door === "fleet" ? CATALOG.dot_drug.cents : CATALOG.nondot_urine_5.cents)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
            <span>{door === "fleet" ? "Breath alcohol" : "Hair"}</span>
            <span className="font-medium tabular-nums">
              {priceLabel(door === "fleet" ? CATALOG.dot_alcohol.cents : CATALOG.hair.cents)}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-3 pt-1">
            <span className="text-muted-foreground">Annual membership</span>
            <span className="text-4xl tabular-nums tracking-tight">{year}</span>
          </div>
        </div>
        {alternate !== null ? (
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            On request for {drivers} testing drivers: {money(alternate)} that year. Public checkout sells the flat {priceLabel(FLEET_ANNUAL_CENTS)}.
          </p>
        ) : null}
        <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {["Certificate after roster", "Private company file", "Quest and LabCorp", "Tests not included"].map((item) => (
            <li key={item} className="flex items-start gap-1.5">
              <Check className="mt-0.5 size-3.5 shrink-0 text-ok" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
        <Button asChild className="mt-5 w-full rounded-full">
          <Link to={blocked ? "/owner-operators" : door === "fleet" ? "/onboarding/fleet" : "/hire"}>
            {blocked ? "See the referral" : door === "fleet" ? "Enroll this fleet" : "Order a hire screen"}
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Home() {
  const [who, setWho] = useState(doors[0].id);
  const active = doors.find((door) => door.id === who) ?? doors[0];

  return (
    <PublicShell>
      <section className="relative overflow-hidden border-b border-border">
        <div className="grid-paper pointer-events-none absolute inset-0 opacity-80" />
        <div className="pointer-events-none absolute -left-24 top-16 size-80 rounded-full border border-accent/30" />
        <div className="pointer-events-none absolute left-8 top-28 size-28 rounded-full bg-accent/20" />
        <div className="pointer-events-none absolute left-24 top-44 size-10 rounded-full border border-foreground/15 bg-card" />
        <div className="relative mx-auto grid max-w-7xl items-start gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-card px-3 py-1 font-mono text-xs uppercase tracking-widest">
              <span className="size-1.5 rounded-full bg-accent" />
              Southeast Michigan · one consortium
            </p>
            <h1 className="mt-6 max-w-xl text-5xl sm:text-7xl">
              The file for fleets that <span className="mark">share a pool.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Flint, Genesee, and Oakland. Two or more testing drivers join one SJCC consortium. Staffing orders a non-DOT panel. A single driver is referred, not enrolled.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/onboarding/fleet">Enroll a fleet</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-card">
                <Link to="/non-dot">Order a non-DOT screen</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                ["50%", "drug"],
                ["10%", "alcohol"],
                ["$299", "year"],
                ["$0", "setup"],
                ["20k+", "clinics"],
              ].map(([value, label]) => (
                <span key={label} className="inline-flex items-baseline gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                  <span className="text-base font-medium tabular-nums">{value}</span>
                  <span className="text-xs text-muted-foreground">{label}</span>
                </span>
              ))}
            </div>
            <nav className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm" aria-label="On this page">
              {[
                ["#plan", "The plan"],
                ["#shelf", "Services"],
                ["#programs", "Who it fits"],
                ["#pricing", "Pricing"],
                ["#questions", "Questions"],
              ].map(([href, label]) => (
                <a key={href} href={href} className="text-muted-foreground underline decoration-border decoration-2 underline-offset-4 hover:text-foreground hover:decoration-accent">
                  {label}
                </a>
              ))}
            </nav>
          </div>
          <QuoteDesk />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 lg:grid-cols-3">
        <Link to="/consortium" className="soft-card pop-card group relative overflow-hidden p-6">
          <span className="absolute -right-6 -top-8 font-mono text-8xl text-muted">01</span>
          <p className="relative text-xs font-medium uppercase tracking-widest text-accent">Fleet</p>
          <p className="relative mt-6 text-4xl">2 or more drivers</p>
          <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">One combined random pool. Your portal still shows only your company. Tests are prepaid on top of the year.</p>
          <span className="relative mt-8 inline-flex items-center gap-1 text-sm font-medium">
            See the consortium <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </Link>
        <Link to="/hire" className="soft-card pop-card group relative overflow-hidden p-6">
          <span className="absolute -right-6 -top-8 font-mono text-8xl text-muted">02</span>
          <p className="relative text-xs font-medium uppercase tracking-widest text-accent">Staffing</p>
          <p className="relative mt-6 text-4xl">Non-DOT first</p>
          <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">5-, 9-, and 10-panel urine, or hair. A DOT test only if the job is safety-sensitive.</p>
          <span className="relative mt-8 inline-flex items-center gap-1 text-sm font-medium">
            Hire screens <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </Link>
        <Link to="/owner-operators" className="group relative overflow-hidden rounded-[22px] border border-dashed border-border bg-muted/70 p-6">
          <span className="absolute -right-6 -top-8 font-mono text-8xl text-border">03</span>
          <p className="relative text-xs font-medium uppercase tracking-widest text-muted-foreground">One driver</p>
          <p className="relative mt-6 text-4xl">Referral only</p>
          <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">Not an SJCC product. No charge on this site. The page says if we may receive a fee.</p>
          <span className="relative mt-8 inline-flex items-center gap-1 text-sm font-medium">
            Read the stop <ArrowUpRight className="size-4" />
          </span>
        </Link>
      </section>

      <section id="plan" className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Process</p>
          <h2 className="mt-2 max-w-xl text-4xl sm:text-5xl">Five moves, and a hard stop at one driver.</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-5">
            {steps.map(([label, detail], index) => (
              <li key={label} className="soft-card relative p-5">
                <span className="flex size-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background">{index + 1}</span>
                <p className="mt-5 text-xl">{label}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="shelf" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Shelf</p>
            <h2 className="mt-2 text-4xl sm:text-5xl">Live where we can fulfill it.</h2>
          </div>
          <Link to="/services" className="text-sm font-medium underline decoration-accent decoration-2 underline-offset-4">
            All services
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            const featured = service.wide;
            return (
              <Link
                key={service.to}
                to={service.to}
                className={`soft-card pop-card group flex flex-col p-5 ${featured ? "bg-foreground text-background sm:col-span-2" : ""}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`flex size-11 items-center justify-center rounded-2xl ${featured ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${featured ? "bg-background/15 text-background" : service.badge === "Live" ? "bg-accent/20 text-foreground" : "bg-muted text-muted-foreground"}`}>
                    {service.badge === "Live" ? "Live" : "Coming soon"}
                  </span>
                </div>
                <h3 className="mt-5 text-2xl">{service.title}</h3>
                <p className={`mt-2 flex-1 text-sm leading-relaxed ${featured ? "text-background/75" : "text-muted-foreground"}`}>{service.body}</p>
                <ArrowUpRight className="mt-6 size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            );
          })}
        </div>
      </section>

      <section id="programs" className="border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Programs</p>
          <h2 className="mt-2 max-w-2xl text-4xl sm:text-5xl">Built for the way the company actually runs.</h2>
          <p className="mt-4 max-w-xl text-muted-foreground">Pick a door. The price panel on the right is the same shelf as checkout, including the door we refuse.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {doors.map((door) => (
              <button
                key={door.id}
                type="button"
                aria-pressed={who === door.id}
                onClick={() => setWho(door.id)}
                className={`h-11 rounded-full px-4 text-sm font-medium ${who === door.id ? "bg-foreground text-background" : "border border-border bg-card text-foreground"}`}
              >
                {door.label}
              </button>
            ))}
          </div>
          <div className="soft-card mt-5 overflow-hidden lg:grid lg:grid-cols-[1.3fr_0.7fr]">
            <div className="p-6 sm:p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-accent">{active.kicker}</p>
              <h3 className="mt-3 text-3xl sm:text-4xl">{active.title}</h3>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">{active.body}</p>
              <ul className="mt-6 space-y-3">
                {active.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/20">
                      <Check className="size-3" aria-hidden />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8 rounded-full">
                <Link to={active.href}>{active.cta}</Link>
              </Button>
            </div>
            <div className="bg-foreground p-6 text-background sm:p-8">
              <p className="font-mono text-xs uppercase tracking-widest text-primary">What you pay</p>
              <ul className="mt-5 space-y-3">
                {active.rows.map(([label, value]) => (
                  <li key={label} className="flex items-baseline justify-between gap-3 border-b border-background/15 pb-3 text-sm last:border-0">
                    <span className="text-background/70">{label}</span>
                    <span className="font-medium tabular-nums">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Pricing</p>
        <h2 className="mt-2 text-4xl sm:text-5xl">Flat year. No pool of one.</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <article className="soft-card relative p-6 sm:p-7 lg:col-span-1">
            <span className="absolute right-5 top-5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">Checkout</span>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Fleet</p>
            <p className="mt-4 text-6xl tabular-nums tracking-tight">{priceLabel(FLEET_ANNUAL_CENTS)}</p>
            <p className="mt-1 text-sm text-muted-foreground">per year · unlimited testing drivers</p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>Combined random pool</li>
              <li>Private company file</li>
              <li>Certificate after the roster is on file</li>
              <li>Tests, MVRs, and add-ons extra</li>
            </ul>
            <Button asChild className="mt-6 w-full rounded-full">
              <Link to="/onboarding/fleet">Start enrollment</Link>
            </Button>
          </article>
          <article className="soft-card p-6 sm:p-7">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Hire screen</p>
            <p className="mt-4 text-6xl tabular-nums tracking-tight">{priceLabel(CATALOG.nondot_urine_5.cents)}</p>
            <p className="mt-1 text-sm text-muted-foreground">non-DOT 5-panel · no membership</p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>DOT urine {priceLabel(CATALOG.dot_drug.cents)}</li>
              <li>Breath alcohol {priceLabel(CATALOG.dot_alcohol.cents)}</li>
              <li>Hair {priceLabel(CATALOG.hair.cents)}</li>
              <li>MVR {priceLabel(CATALOG.mvr.cents)} plus the state fee</li>
            </ul>
            <Button asChild variant="outline" className="mt-6 w-full rounded-full bg-card">
              <Link to="/pricing">Open the full shelf</Link>
            </Button>
          </article>
          <article className="rounded-[22px] border border-dashed border-border bg-muted/60 p-6 sm:p-7">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">One driver</p>
            <p className="mt-4 text-6xl tabular-nums tracking-tight">$0</p>
            <p className="mt-1 text-sm text-muted-foreground">not a product · referral only</p>
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              A carrier with one testing driver is stopped before payment. If they enroll through the referral, SJCC may receive a fee. That sentence is on the page.
            </p>
            <Button asChild variant="outline" className="mt-6 w-full rounded-full bg-card">
              <Link to="/owner-operators">Read the referral</Link>
            </Button>
          </article>
        </div>
      </section>

      <section className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <p className="text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">Collection partners</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {["Quest", "LabCorp", "20,000+ sites", "Not SJCC clinics"].map((name) => (
              <span key={name} className="rounded-full border border-border bg-card px-5 py-3 text-sm font-medium tracking-wide">
                {name}
              </span>
            ))}
          </div>
          <p className="mx-auto mt-5 max-w-xl text-center text-sm text-muted-foreground">
            Specimens go to a SAMHSA-certified laboratory through our testing partner. SJCC administers the order. We do not own the sites.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Desk rules</p>
        <h2 className="mt-2 max-w-xl text-4xl sm:text-5xl">What this office will say out loud.</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {rules.map(([title, body], index) => (
            <article key={title} className="soft-card flex flex-col p-6">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent/20 font-mono text-xs">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-5 text-2xl">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="questions" className="mx-auto grid max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Questions</p>
          <h2 className="mt-2 text-4xl sm:text-5xl">Asked on the first call.</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">The longer answers live on their own pages, with the regulation linked when a rule is the point.</p>
          <Button asChild variant="outline" className="mt-6 rounded-full bg-card">
            <Link to="/faq">The longer FAQ</Link>
          </Button>
        </div>
        <div className="space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="soft-card group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-medium">
                {q}
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-lg leading-none text-muted-foreground group-open:bg-foreground group-open:text-background">+</span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="ink-band">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Two or more</p>
            <h2 className="mt-3 max-w-lg text-4xl text-background sm:text-5xl">Put the fleet on the pool.</h2>
            <p className="mt-3 max-w-lg text-sm text-background/70">$299 for the year. Tests extra. One driver cannot pay this.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/onboarding/fleet">Start enrollment</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-background/20 bg-transparent text-background hover:bg-background/10">
              <Link to="/contact">Ask the office</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
