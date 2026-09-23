import { paceTarget } from "../billing/brief.ts";
import { annualTarget, shouldDrawStandalone, trackingProfile } from "./policy.ts";

export type CompanyPaceInput = {
  id: string;
  organizationName: string;
  poolMode: string;
  pool: number;
  drugDraws: number;
  alcoholDraws: number;
  quarter: number;
  services: unknown;
  status: string;
};

export type CompanyPace = {
  id: string;
  organizationName: string;
  poolMode: string;
  pool: number;
  random: boolean;
  drugDraws: number;
  drugExpected: number;
  drugAnnual: number;
  alcoholDraws: number;
  alcoholExpected: number;
  alcoholAnnual: number;
  behind: boolean;
  smallFleet: boolean;
  eligible: boolean;
};

export function companyPace(input: CompanyPaceInput): CompanyPace {
  const random = (input.status === "active" || input.status === "past_due") && trackingProfile(input.services).random;
  const eligible = random && shouldDrawStandalone(input.pool, input.poolMode);
  const drugAnnual = eligible ? annualTarget(input.pool, 0.5) : 0;
  const alcoholAnnual = eligible ? annualTarget(input.pool, 0.1) : 0;
  const drugExpected = eligible ? paceTarget(input.pool, 0.5, input.quarter) : 0;
  const alcoholExpected = eligible ? paceTarget(input.pool, 0.1, input.quarter) : 0;
  return {
    id: input.id,
    organizationName: input.organizationName,
    poolMode: input.poolMode || "standalone",
    pool: input.pool,
    random,
    drugDraws: input.drugDraws,
    drugExpected,
    drugAnnual,
    alcoholDraws: input.alcoholDraws,
    alcoholExpected,
    alcoholAnnual,
    behind: eligible && (input.drugDraws < drugExpected || input.alcoholDraws < alcoholExpected),
    smallFleet: random && (input.poolMode || "standalone") === "standalone" && input.pool > 0 && input.pool < 2,
    eligible,
  };
}

export function paceRollup(rows: readonly CompanyPace[]): { behind: number; withPool: number } {
  const withPool = rows.filter((row) => row.eligible).length;
  const behind = rows.filter((row) => row.behind).length;
  return { behind, withPool };
}
