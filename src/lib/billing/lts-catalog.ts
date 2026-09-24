/**
 * Frozen Lab Testing Solutions allowlist.
 *
 * SJCC only sells what LTS documents as a fulfillable product. Product codes are
 * placeholders until LTS publishes API codes. Do not invent a second vendor.
 *
 * Confirmed on the LTS partner surface (https://partner.labtestingsolutions.com/),
 * not by a published order schema:
 * - Drug and alcohol: 5, 9, and 10-panel urine, hair follicle, breath alcohol, DOT-regulated panels
 * - Background: national criminal, county criminal, sex offender registry, SSN trace,
 *   employment verification, education verification
 * - MVR / driving records
 *
 * Not sold, even if a date field exists on driver_roster:
 * - Medical card / DOT physical fulfillment (no LTS physical product was confirmed)
 * - Driver qualification file management
 * - Consortium membership or a multi-employer pool
 * - eScreen products (eCup, eCCF, MyeScreen)
 * - A single laboratory SKU that pretends to be drug + BAT
 * - CDL Clearinghouse query. The partner page names queries beside consortium
 *   management. No API was found that places a query and returns a result.
 *   SJCC does not file FMCSA Clearinghouse reports. The owner records that decision.
 *
 * Client prices for DOT urine, breath alcohol, and MVR are the existing published
 * shelf. Other prices are provisional until an LTS invoice replaces estimated cost.
 * The $7 seat is SJCC administration, not an LTS SKU.
 */

export const DRIVER_MONTHLY_CENTS = 700;

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
] as const;

export type LtsSku =
  | "dot_drug"
  | "dot_alcohol"
  | "nondot_urine_5"
  | "nondot_urine_9"
  | "nondot_urine_10"
  | "hair"
  | "mvr"
  | "bg_national"
  | "bg_county"
  | "bg_sex_offender"
  | "bg_ssn"
  | "bg_employment"
  | "bg_education";

export type LtsCatalogItem = {
  sku: LtsSku;
  label: string;
  /** Placeholder. Not a live LTS product code. */
  ltsProductCode: string;
  cents: number;
  estimatedCostCents: number;
  dot: boolean;
  /** Non-negative or refusal waits for an owner Clearinghouse decision. Not an LTS filing. */
  clearinghouse: boolean;
  offered: true;
};

export const LTS_ALLOWLIST: readonly LtsCatalogItem[] = [
  { sku: "dot_drug", label: "DOT urine drug test", ltsProductCode: "LTS-DOT-URINE-5", cents: 6500, estimatedCostCents: 4800, dot: true, clearinghouse: true, offered: true },
  { sku: "dot_alcohol", label: "Breath alcohol test", ltsProductCode: "LTS-BAT", cents: 5500, estimatedCostCents: 3500, dot: true, clearinghouse: true, offered: true },
  { sku: "nondot_urine_5", label: "Non-DOT urine 5-panel", ltsProductCode: "LTS-NDOT-URINE-5", cents: 6500, estimatedCostCents: 4200, dot: false, clearinghouse: false, offered: true },
  { sku: "nondot_urine_9", label: "Non-DOT urine 9-panel", ltsProductCode: "LTS-NDOT-URINE-9", cents: 7500, estimatedCostCents: 5200, dot: false, clearinghouse: false, offered: true },
  { sku: "nondot_urine_10", label: "Non-DOT urine 10-panel", ltsProductCode: "LTS-NDOT-URINE-10", cents: 8500, estimatedCostCents: 6000, dot: false, clearinghouse: false, offered: true },
  { sku: "hair", label: "Hair follicle", ltsProductCode: "LTS-HAIR", cents: 14500, estimatedCostCents: 11000, dot: false, clearinghouse: false, offered: true },
  { sku: "mvr", label: "Motor vehicle record", ltsProductCode: "LTS-MVR", cents: 1500, estimatedCostCents: 900, dot: false, clearinghouse: false, offered: true },
  { sku: "bg_national", label: "National criminal", ltsProductCode: "LTS-BG-NAT", cents: 2500, estimatedCostCents: 1200, dot: false, clearinghouse: false, offered: true },
  { sku: "bg_county", label: "County criminal", ltsProductCode: "LTS-BG-CTY", cents: 3500, estimatedCostCents: 1800, dot: false, clearinghouse: false, offered: true },
  { sku: "bg_sex_offender", label: "Sex offender registry", ltsProductCode: "LTS-BG-SOR", cents: 1500, estimatedCostCents: 600, dot: false, clearinghouse: false, offered: true },
  { sku: "bg_ssn", label: "SSN trace", ltsProductCode: "LTS-BG-SSN", cents: 1200, estimatedCostCents: 400, dot: false, clearinghouse: false, offered: true },
  { sku: "bg_employment", label: "Employment verification", ltsProductCode: "LTS-BG-EMP", cents: 2500, estimatedCostCents: 1000, dot: false, clearinghouse: false, offered: true },
  { sku: "bg_education", label: "Education verification", ltsProductCode: "LTS-BG-EDU", cents: 2500, estimatedCostCents: 1000, dot: false, clearinghouse: false, offered: true },
];

export const ONBOARDING_SERVICES = [
  {
    id: "dot_testing",
    label: "DOT drug and alcohol testing",
    detail: "DOT urine panel and breath alcohol. Random selections run on this company only.",
  },
  {
    id: "nondot_testing",
    label: "Non-DOT urine and hair testing",
    detail: "Non-DOT 5-, 9-, and 10-panel urine, and hair, ordered through the testing partner.",
  },
  {
    id: "mvr",
    label: "Motor vehicle records",
    detail: "Driving-record orders placed with the testing partner. Not a typed date.",
  },
  {
    id: "background",
    label: "Background screening",
    detail: "National criminal, county criminal, sex offender registry, SSN trace, employment verification, and education verification.",
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

/** Legacy strings still on older organizations, plus the current service ids. */
export function serviceRunsRandom(services: readonly string[]): boolean {
  const text = services.join(" | ").toLowerCase();
  return /dot_testing|drug and alcohol|random pool|random testing/.test(text);
}
