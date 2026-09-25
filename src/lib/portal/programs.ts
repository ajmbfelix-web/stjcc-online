/** Fleets join at two testing drivers. A pool of one is referred out, never charged. */
export function refuseFleetSeats(driverCount: number): string | null {
  if (driverCount === 1) {
    return "A one-driver company cannot join the SJCC consortium. A pool of one is not valid.";
  }
  if (!Number.isFinite(driverCount) || driverCount < 2) {
    return "A fleet program requires at least two testing drivers.";
  }
  return null;
}