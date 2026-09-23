import { annualTarget } from "../automation/policy.ts";

export type BriefOrder = {
  status: string;
  clearinghouse?: string | null;
  resultSummary?: string | null;
  reason?: string | null;
};

export type DailyBrief = {
  newClients: number;
  driversAdded: number;
  pool: number;
  drugDraws: number;
  drugExpected: number;
  alcoholDraws: number;
  alcoholExpected: number;
  paidNotSent: number;
  resultsWaiting: number;
  positives: number;
  refusals: number;
  pastDueCards: number;
};

/** Year-to-date selections the 50% / 10% rates require by this quarter. */
export function paceTarget(pool: number, rate: number, quarter: number): number {
  const annual = annualTarget(pool, rate);
  const current = Math.min(4, Math.max(1, quarter));
  return Math.min(annual, Math.ceil((annual * current) / 4 - 1e-9));
}

export function isRefusal(order: BriefOrder): boolean {
  const text = `${order.resultSummary ?? ""} ${order.reason ?? ""}`.toLowerCase();
  return text.includes("refus");
}

export function dailyBrief(input: {
  pool: number;
  quarter: number;
  newClients: number;
  driversAdded: number;
  drugDraws: number;
  alcoholDraws: number;
  pastDueCards: number;
  orders: BriefOrder[];
}): DailyBrief {
  let paidNotSent = 0;
  let resultsWaiting = 0;
  let positives = 0;
  let refusals = 0;
  for (const order of input.orders) {
    if (order.status === "paid" || order.status === "dispatch_pending") paidNotSent += 1;
    if (order.status === "sent") resultsWaiting += 1;
    if (order.clearinghouse !== "awaiting_owner") continue;
    if (isRefusal(order)) refusals += 1;
    else positives += 1;
  }
  return {
    newClients: input.newClients,
    driversAdded: input.driversAdded,
    pool: input.pool,
    drugDraws: input.drugDraws,
    drugExpected: paceTarget(input.pool, 0.5, input.quarter),
    alcoholDraws: input.alcoholDraws,
    alcoholExpected: paceTarget(input.pool, 0.1, input.quarter),
    paidNotSent,
    resultsWaiting,
    positives,
    refusals,
    pastDueCards: input.pastDueCards,
  };
}

export function briefLines(brief: DailyBrief, quarter: number): string[] {
  return [
    `New clients this week: ${brief.newClients}. Drivers added this week: ${brief.driversAdded}.`,
    `Q${quarter} random pace, against the drivers in the pool: drug ${brief.drugDraws} of ${brief.drugExpected} at 50%, alcohol ${brief.alcoholDraws} of ${brief.alcoholExpected} at 10%.`,
    `Tests paid but not sent to the lab: ${brief.paidNotSent}. Results still out: ${brief.resultsWaiting}.`,
    `Positives waiting for your Clearinghouse decision: ${brief.positives}. Refusals waiting for that same decision: ${brief.refusals}. Cards past due: ${brief.pastDueCards}.`,
  ];
}
