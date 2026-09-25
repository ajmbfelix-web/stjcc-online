/**
 * Laboratory products the testing partner can fulfill.
 * Public pages never print these codes or the partner's name.
 * Membership, filings, physicals, and screening packages are not laboratory SKUs.
 */

export type LtsSku =
  | "dot_drug"
  | "dot_alcohol"
  | "dot_observed"
  | "nondot_urine_5"
  | "nondot_urine_9"
  | "nondot_urine_10"
  | "hair"
  | "mvr";

export type LtsCatalogItem = {
  sku: LtsSku;
  label: string;
  ltsProductCode: string;
  cents: number;
  estimatedCostCents: number;
  dot: boolean;
  clearinghouse: boolean;
  offered: true;
};

export const LTS_REFUSED = [
  "dot_combo",
  "medical_card",
  "dot_physical",
  "dq_file",
  "consortium",
  "ecup",
  "eccf",
  "myescreen",
  "clearinghouse_query",
  "ch_setup",
  "ch_query",
  "ch_full",
  "bg_basic",
  "boc3",
  "ucr",
] as const;

export const LTS_ALLOWLIST: readonly LtsCatalogItem[] = [
  { sku: "dot_drug", label: "DOT urine drug test", ltsProductCode: "LTS-DOT-URINE-5", cents: 7300, estimatedCostCents: 4800, dot: true, clearinghouse: true, offered: true },
  { sku: "dot_alcohol", label: "DOT breath alcohol test", ltsProductCode: "LTS-BAT", cents: 6300, estimatedCostCents: 3500, dot: true, clearinghouse: true, offered: true },
  { sku: "dot_observed", label: "Observed or follow-up DOT drug test", ltsProductCode: "LTS-DOT-URINE-OBS", cents: 10900, estimatedCostCents: 7000, dot: true, clearinghouse: true, offered: true },
  { sku: "nondot_urine_5", label: "Non-DOT urine 5-panel", ltsProductCode: "LTS-NDOT-URINE-5", cents: 6900, estimatedCostCents: 4200, dot: false, clearinghouse: false, offered: true },
  { sku: "nondot_urine_9", label: "Non-DOT urine 9-panel", ltsProductCode: "LTS-NDOT-URINE-9", cents: 7900, estimatedCostCents: 5200, dot: false, clearinghouse: false, offered: true },
  { sku: "nondot_urine_10", label: "Non-DOT urine 10-panel", ltsProductCode: "LTS-NDOT-URINE-10", cents: 8900, estimatedCostCents: 6000, dot: false, clearinghouse: false, offered: true },
  { sku: "hair", label: "Hair follicle", ltsProductCode: "LTS-HAIR", cents: 14900, estimatedCostCents: 11000, dot: false, clearinghouse: false, offered: true },
  { sku: "mvr", label: "Motor vehicle record", ltsProductCode: "LTS-MVR", cents: 1900, estimatedCostCents: 900, dot: false, clearinghouse: false, offered: true },
];

export const ONBOARDING_SERVICES = [
  {
    id: "dot_testing",
    label: "DOT drug and alcohol testing",
    detail: "Random selections run on the SJCC consortium. This company's file stays private. Tests are prepaid.",
  },
  {
    id: "nondot_testing",
    label: "Hire and non-DOT screens",
    detail: "Non-DOT urine panels and hair for staffing and offices. Not a DOT random program and not a Clearinghouse event.",
  },
  {
    id: "mvr",
    label: "Motor vehicle records",
    detail: "From $19 plus the state DMV fee. Ordered when paid. Not a typed date.",
  },
  {
    id: "background",
    label: "Background screening",
    detail: "Quoted on the site. Checkout stays closed until a consumer reporting agency is live.",
  },
] as const;

export type OnboardingServiceId = (typeof ONBOARDING_SERVICES)[number]["id"];

const ALLOWED_SERVICE_IDS = new Set<string>(ONBOARDING_SERVICES.map((service) => service.id));

export function invalidOnboardingServices(services: readonly string[]): string[] {
  return services.filter((service) => !ALLOWED_SERVICE_IDS.has(service));
}

export function ltsItem(sku: string): LtsCatalogItem | null {
  return LTS_ALLOWLIST.find((item) => item.sku === sku) ?? null;
}

export function assertAllowlistedSku(sku: string): LtsCatalogItem {
  const item = ltsItem(sku);
  if (!item) throw new Error("That service is not on the SJCC catalog");
  return item;
}

export function serviceRunsRandom(services: readonly string[]): boolean {
  const text = services.join(" | ").toLowerCase();
  return /dot_testing|drug and alcohol|random pool|random testing/.test(text);
}
