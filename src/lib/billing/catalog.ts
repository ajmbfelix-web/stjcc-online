/**
 * SJCC commercial catalog. Live rows can be charged. Coming-soon rows are
 * published prices only — checkout refuses them until a partner can fulfill.
 * Lab product codes stay off the marketing site.
 */

export const FLEET_ANNUAL_CENTS = 29900;
export const FIRST_DRIVER_ANNUAL_CENTS = 8900;
export const ADDITIONAL_DRIVER_ANNUAL_CENTS = 2900;
export const REFERRAL_URL = "https://members.verticalidentity.com/enroll?ref=mdy0yja";
export const REFERRAL_DISCLOSURE =
  "A one-driver carrier cannot be a random pool of one. We refer those carriers to Vertical Identity’s consortium. If they enroll through this link, SJCC may receive a referral fee.";

export type Sku =
  | "dot_drug"
  | "dot_alcohol"
  | "dot_combo"
  | "dot_observed"
  | "nondot_urine_5"
  | "nondot_urine_9"
  | "nondot_urine_10"
  | "hair"
  | "oral_fluid"
  | "mvr"
  | "ch_setup"
  | "ch_query"
  | "ch_full"
  | "psp"
  | "bg_basic"
  | "bg_county_pack"
  | "bg_premium"
  | "bg_sor"
  | "bg_ssn"
  | "bg_employment"
  | "bg_education"
  | "prehire"
  | "training"
  | "policy"
  | "physical"
  | "boc3"
  | "ucr"
  | "dq_file"
  | "followup";

export type CatalogItem = {
  sku: Sku;
  label: string;
  cents: number;
  estimatedCostCents: number;
  clearinghouse: boolean;
  dot: boolean;
  /** False means the page may quote the price, but nothing may charge it. */
  live: boolean;
  /** Empty or omitted when this is not a laboratory product. */
  ltsProductCode?: string;
  note?: string;
};

export const CATALOG: Record<Sku, CatalogItem> = {
  dot_drug: { sku: "dot_drug", label: "DOT urine drug test", cents: 7300, estimatedCostCents: 4800, clearinghouse: true, dot: true, live: true, ltsProductCode: "LTS-DOT-URINE-5" },
  dot_alcohol: { sku: "dot_alcohol", label: "DOT breath alcohol test", cents: 6300, estimatedCostCents: 3500, clearinghouse: true, dot: true, live: true, ltsProductCode: "LTS-BAT" },
  dot_combo: { sku: "dot_combo", label: "DOT drug and BAT, same visit", cents: 12900, estimatedCostCents: 8300, clearinghouse: true, dot: true, live: true, ltsProductCode: "", note: "One charge. Dispatched as a drug order and a breath-alcohol order." },
  dot_observed: { sku: "dot_observed", label: "Observed or follow-up DOT drug test", cents: 10900, estimatedCostCents: 7000, clearinghouse: true, dot: true, live: true, ltsProductCode: "LTS-DOT-URINE-OBS" },
  nondot_urine_5: { sku: "nondot_urine_5", label: "Non-DOT urine 5-panel", cents: 6900, estimatedCostCents: 4200, clearinghouse: false, dot: false, live: true, ltsProductCode: "LTS-NDOT-URINE-5", note: "Employer policy. Does not satisfy a required DOT test." },
  nondot_urine_9: { sku: "nondot_urine_9", label: "Non-DOT urine 9-panel", cents: 7900, estimatedCostCents: 5200, clearinghouse: false, dot: false, live: true, ltsProductCode: "LTS-NDOT-URINE-9", note: "Employer policy. Not a DOT panel." },
  nondot_urine_10: { sku: "nondot_urine_10", label: "Non-DOT urine 10-panel", cents: 8900, estimatedCostCents: 6000, clearinghouse: false, dot: false, live: true, ltsProductCode: "LTS-NDOT-URINE-10", note: "Employer policy. Not a DOT panel." },
  hair: { sku: "hair", label: "Hair follicle", cents: 14900, estimatedCostCents: 11000, clearinghouse: false, dot: false, live: true, ltsProductCode: "LTS-HAIR", note: "Not a substitute for a required DOT urine test." },
  oral_fluid: { sku: "oral_fluid", label: "Oral fluid drug test", cents: 7900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false, note: "Coming soon. Not a DOT urine substitute." },
  mvr: { sku: "mvr", label: "Motor vehicle record", cents: 1900, estimatedCostCents: 900, clearinghouse: false, dot: false, live: true, ltsProductCode: "LTS-MVR", note: "SJCC fee. The state DMV fee is extra and passed through." },
  ch_setup: { sku: "ch_setup", label: "Assisted Clearinghouse setup", cents: 20900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false },
  ch_query: { sku: "ch_query", label: "Clearinghouse query administration", cents: 1900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false, note: "SJCC admin fee per driver per year. FMCSA credits are bought by the employer." },
  ch_full: { sku: "ch_full", label: "Clearinghouse full query", cents: 2900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false, note: "SJCC admin fee. FMCSA credits are bought by the employer." },
  psp: { sku: "psp", label: "PSP record", cents: 2900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false },
  bg_basic: { sku: "bg_basic", label: "Basic background", cents: 4900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false },
  bg_county_pack: { sku: "bg_county_pack", label: "Background and county", cents: 7900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false },
  bg_premium: { sku: "bg_premium", label: "Premium background", cents: 14900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false },
  bg_sor: { sku: "bg_sor", label: "Sex offender registry", cents: 1900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false },
  bg_ssn: { sku: "bg_ssn", label: "SSN trace", cents: 1900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false },
  bg_employment: { sku: "bg_employment", label: "Employment verification", cents: 3900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false },
  bg_education: { sku: "bg_education", label: "Education verification", cents: 3900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false },
  prehire: { sku: "prehire", label: "Pre-hire pack", cents: 10900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false, note: "Basic background plus a non-DOT 5-panel." },
  training: { sku: "training", label: "Supervisor reasonable-suspicion training", cents: 5900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false },
  policy: { sku: "policy", label: "Written drug and alcohol policy", cents: 4900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false },
  physical: { sku: "physical", label: "DOT physical referral", cents: 13900, estimatedCostCents: 0, clearinghouse: false, dot: true, live: false, note: "Scheduling only. SJCC does not perform the exam." },
  boc3: { sku: "boc3", label: "BOC-3 filing", cents: 6900, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false },
  ucr: { sku: "ucr", label: "UCR filing assist", cents: 0, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false, note: "Contact. Not a checkout." },
  dq_file: { sku: "dq_file", label: "Driver qualification file", cents: 0, estimatedCostCents: 0, clearinghouse: false, dot: false, live: false, note: "Contact. Not a checkout." },
  followup: { sku: "followup", label: "Post-SAP follow-up management", cents: 24900, estimatedCostCents: 0, clearinghouse: false, dot: true, live: false, note: "Per year. Tests are still prepaid." },
};

export function catalogItem(sku: string): CatalogItem | null {
  if (sku in CATALOG) return CATALOG[sku as Sku];
  return null;
}

export function liveCatalog(): CatalogItem[] {
  return Object.values(CATALOG).filter((item) => item.live);
}

export function requireLiveItem(sku: string): CatalogItem {
  const item = catalogItem(sku);
  if (!item) throw new Error("Unknown service");
  if (!item.live) throw new Error("That service is coming soon and cannot be charged yet.");
  return item;
}

/** Alternate quote for a fleet of 2–8. Checkout sells the flat annual membership. */
export function perDriverAnnualCents(driverCount: number): number | null {
  if (!Number.isInteger(driverCount) || driverCount < 2 || driverCount > 8) return null;
  return FIRST_DRIVER_ANNUAL_CENTS + (driverCount - 1) * ADDITIONAL_DRIVER_ANNUAL_CENTS;
}

export function money(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}

export function priceLabel(cents: number): string {
  if (cents <= 0) return "Contact";
  return `$${Math.round(cents / 100)}`;
}
