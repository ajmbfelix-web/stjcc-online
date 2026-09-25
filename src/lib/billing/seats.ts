export { money } from "./catalog.ts";

/**
 * Fleet membership is a flat annual price. Adding or removing a testing driver
 * does not change the subscription quantity and does not create a seat charge.
 */
export function seatDelta(input: { billed: number; before: number; after: number }): {
  nextBilled: number;
  chargeCents: number;
  added: number;
} {
  const billed = Math.max(0, input.billed);
  return { nextBilled: billed, chargeCents: 0, added: input.after - input.before };
}
