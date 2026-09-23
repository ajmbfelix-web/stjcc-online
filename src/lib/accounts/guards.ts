import type { AccessKind } from "../automation/policy.ts";

export function scopeClientHistory(
  access: { kind: AccessKind; onboardingId?: string },
  requestedId?: string | null,
): { ok: true; onboardingId: string } | { ok: false; status: number; error: string } {
  if (access.kind !== "active_client" || !access.onboardingId) {
    return { ok: false, status: 403, error: "An active organization workspace is required" };
  }
  if (requestedId && requestedId !== access.onboardingId) {
    return { ok: false, status: 403, error: "That organization is not yours" };
  }
  return { ok: true, onboardingId: access.onboardingId };
}

export function scopeOwnerNote(kind: AccessKind, body: string): { ok: true; body: string } | { ok: false; status: number; error: string } {
  if (kind !== "owner") return { ok: false, status: 403, error: "SJCC owner access required" };
  const note = body.trim();
  if (!note) return { ok: false, status: 400, error: "A note is required" };
  return { ok: true, body: note };
}

export function scopeAcknowledge(kind: AccessKind, note: string): { ok: true; note: string } | { ok: false; status: number; error: string } {
  if (kind !== "owner") return { ok: false, status: 403, error: "SJCC owner access required" };
  const body = note.trim();
  if (!body) return { ok: false, status: 400, error: "A note is required to acknowledge an exception" };
  return { ok: true, note: body };
}
