import { DRIVER_MONTHLY_CENTS, money } from "../billing/catalog.ts";

export function operationalLetter(body: string): string {
  return `${body.trim()}\n\n—\nSt. Joseph Compliance Company\nThis message was sent automatically. Reply if a driver, date, or charge looks wrong.`;
}

export function seatChangeLetter(input: {
  organizationName: string;
  driverName: string;
  cdl: string;
  chargedCents: number;
  billedDrivers: number;
  added: number;
}): string {
  const monthly = money(input.billedDrivers * DRIVER_MONTHLY_CENTS);
  const driverLine = `Driver: ${input.driverName}\nCDL: ${input.cdl}`;
  if (input.added > 0 && input.chargedCents > 0) {
    return [
      `${input.organizationName} added ${input.driverName} to testing.`,
      "",
      driverLine,
      `Charged today: ${money(input.chargedCents)}`,
      `Monthly testing seats: ${input.billedDrivers} × ${money(DRIVER_MONTHLY_CENTS)} = ${monthly}`,
      "",
      "The new seat is paid up front. It is not added unless this charge succeeds. The monthly amount is collected at the start of each billing period.",
    ].join("\n");
  }
  if (input.added > 0) {
    return [
      `${input.organizationName} assigned ${input.driverName} to a testing seat that was already paid.`,
      "",
      driverLine,
      `Charged today: $0.00`,
      `Monthly testing seats remain ${input.billedDrivers} × ${money(DRIVER_MONTHLY_CENTS)} = ${monthly}.`,
    ].join("\n");
  }
  return [
    `${input.organizationName} removed ${input.driverName} from testing.`,
    "",
    driverLine,
    `This month was already paid, so nothing was refunded.`,
    `Next month's testing seats: ${input.billedDrivers} × ${money(DRIVER_MONTHLY_CENTS)} = ${monthly}.`,
  ].join("\n");
}
