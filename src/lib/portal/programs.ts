/** Fleet seats start at two testing drivers. A pool of one is not a product. */
export function refuseFleetSeats(driverCount: number): string | null {
  if (driverCount === 1) {
    return "A one-driver company needs a consortium. SJCC does not run a pool of one and will not sell a fleet seat.";
  }
  if (!Number.isFinite(driverCount) || driverCount < 2) {
    return "A fleet program requires at least two testing drivers.";
  }
  return null;
}
