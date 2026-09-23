import { DRIVER_MONTHLY_CENTS, LTS_ALLOWLIST, ltsItem, type LtsCatalogItem, type LtsSku } from "./lts-catalog.ts";

export { DRIVER_MONTHLY_CENTS };

export type Sku = LtsSku;

export type CatalogItem = {
  sku: Sku;
  label: string;
  cents: number;
  estimatedCostCents: number;
  clearinghouse: boolean;
  dot: boolean;
  ltsProductCode: string;
};

function toCatalogItem(item: LtsCatalogItem): CatalogItem {
  return {
    sku: item.sku,
    label: item.label,
    cents: item.cents,
    estimatedCostCents: item.estimatedCostCents,
    clearinghouse: item.clearinghouse,
    dot: item.dot,
    ltsProductCode: item.ltsProductCode,
  };
}

/** Offered shelf. Every entry is on the LTS allowlist. Combo is not a laboratory SKU. */
export const CATALOG: Record<Sku, CatalogItem> = Object.fromEntries(
  LTS_ALLOWLIST.map((item) => [item.sku, toCatalogItem(item)]),
) as Record<Sku, CatalogItem>;

export function catalogItem(sku: string): CatalogItem | null {
  const item = ltsItem(sku);
  return item ? toCatalogItem(item) : null;
}

export function money(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${(Math.abs(cents) / 100).toFixed(2)}`;
}
