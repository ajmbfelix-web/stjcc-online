export type LedgerOrder = {
  status: string;
  amountCents: number;
  estimatedCostCents: number;
  paidAt?: string | null;
};

export type BookSnapshot = {
  seatBookCents: number;
  collectedThisMonthCents: number;
  prepaidCents: number;
  estimatedVendorCents: number;
  retainedCents: number;
  awaitingCharge: number;
  paidNotSent: number;
  pastDueClients: number;
};

function inMonth(iso: string | null | undefined, now: Date): boolean {
  if (!iso) return false;
  const date = new Date(iso);
  return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth();
}

export function bookSnapshot(input: {
  seatBookCents: number;
  orders: LedgerOrder[];
  pastDueClients: number;
  now: Date;
}): BookSnapshot {
  let collected = 0;
  let prepaid = 0;
  let vendor = 0;
  let awaiting = 0;
  let held = 0;
  for (const order of input.orders) {
    if (order.status === "unpaid") {
      awaiting += 1;
      continue;
    }
    const paid = order.status !== "canceled";
    if (!paid) continue;
    if (inMonth(order.paidAt, input.now)) collected += order.amountCents;
    if (order.status === "paid" || order.status === "dispatch_pending") {
      prepaid += order.amountCents;
      held += 1;
    }
    if (order.status === "sent" || order.status === "result" || order.status === "exception") {
      if (inMonth(order.paidAt, input.now)) vendor += order.estimatedCostCents;
    }
  }
  return {
    seatBookCents: input.seatBookCents,
    collectedThisMonthCents: collected + input.seatBookCents,
    prepaidCents: prepaid,
    estimatedVendorCents: vendor,
    retainedCents: collected + input.seatBookCents - vendor,
    awaitingCharge: awaiting,
    paidNotSent: held,
    pastDueClients: input.pastDueClients,
  };
}
