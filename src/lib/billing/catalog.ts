export const DRIVER_MONTHLY_CENTS = 700;

export type Sku = "dot_drug" | "dot_alcohol" | "dot_combo" | "mvr";

export type CatalogItem = {
  sku: Sku;
  label: string;
  cents: number;
  estimatedCostCents: number;
  clearinghouse: boolean;
};

/** Published 2026 shelf: under FleetCollect's $8 seat and Evergreen's $10 seat, and under Vertical Identity's $69 test, without matching a $60 test that leaves no lab margin. */
export const CATALOG: Record<Sku, CatalogItem> = {
  dot_drug: { sku: "dot_drug", label: "DOT drug test", cents: 6500, estimatedCostCents: 4800, clearinghouse: true },
  dot_alcohol: { sku: "dot_alcohol", label: "DOT breath alcohol test", cents: 5500, estimatedCostCents: 3500, clearinghouse: true },
  dot_combo: { sku: "dot_combo", label: "DOT drug and alcohol", cents: 11000, estimatedCostCents: 7800, clearinghouse: true },
  mvr: { sku: "mvr", label: "Motor vehicle record", cents: 1500, estimatedCostCents: 900, clearinghouse: false },
};

export function catalogItem(sku: string): CatalogItem | null {
  return sku in CATALOG ? CATALOG[sku as Sku] : null;
}

export function money(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}
