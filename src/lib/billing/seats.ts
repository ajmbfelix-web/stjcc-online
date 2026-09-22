export const DRIVER_MONTHLY_CENTS = 500;

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

export function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
