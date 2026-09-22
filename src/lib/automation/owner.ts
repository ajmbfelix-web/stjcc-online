export function ownerInbox(): string {
  return process.env.SJCC_OWNER_EMAIL?.trim().toLowerCase() || "mary@stjcc.online";
}
