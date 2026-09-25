import { FLEET_ANNUAL_CENTS, money } from "../billing/catalog.ts";

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
  const annual = money(FLEET_ANNUAL_CENTS);
  const driverLine = `Driver: ${input.driverName}\nCDL: ${input.cdl}`;
  if (input.added > 0) {
    return [
      `${input.organizationName} added ${input.driverName} to testing.`,
      "",
      driverLine,
      "Charged today for a seat: $0.00",
      `Fleet consortium membership stays ${annual} per year for unlimited testing drivers.`,
      "Tests are prepaid when ordered. Membership is not unlimited collections.",
    ].join("\n");
  }
  return [
    `${input.organizationName} removed ${input.driverName} from testing.`,
    "",
    driverLine,
    "The annual membership was not refunded.",
    `Fleet consortium membership stays ${annual} per year.`,
  ].join("\n");
}
