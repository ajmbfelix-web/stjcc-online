export { DRIVER_MONTHLY_CENTS, money } from "./catalog.ts";
import { DRIVER_MONTHLY_CENTS } from "./catalog.ts";

export function seatDelta(input: { billed: number; before: number; after: number }): {
  nextBilled: number;
  chargeCents: number;
  added: number;
} {
  const billed = Math.max(0, input.billed);
  const delta = input.after - input.before;
  if (delta > 0) {
    const spare = Math.max(0, billed - input.before);
    const chargeable = Math.max(0, delta - spare);
    return { nextBilled: billed + chargeable, chargeCents: chargeable * DRIVER_MONTHLY_CENTS, added: delta };
  }
  if (delta < 0 && input.before >= billed) {
    return { nextBilled: Math.max(0, billed + delta), chargeCents: 0, added: delta };
  }
  return { nextBilled: billed, chargeCents: 0, added: delta };
}
