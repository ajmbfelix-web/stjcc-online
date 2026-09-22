import { getSql } from "../db";
import { getSessionUser, type VerifiedUser } from "../auth/verify.server";

export type PortalAccess = {
  user: VerifiedUser;
  kind: "owner" | "client" | "unassigned";
  onboardingId?: string;
  role?: string;
};

export async function getPortalAccess(request: Request): Promise<PortalAccess | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const user = await getSessionUser(token);
  if (!user) return null;

  const ownerEmail = process.env.SJCC_OWNER_EMAIL?.trim().toLowerCase();
  if (ownerEmail && user.email?.toLowerCase() === ownerEmail) return { user, kind: "owner" };

  const sql = await getSql();
  const rows = await sql.query<{ onboarding_id: string; role: string }>(
    `select onboarding_id, role from client_user_access where user_id = $1`,
    [user.id],
  );
  if (rows[0]) return { user, kind: "client", onboardingId: rows[0].onboarding_id, role: rows[0].role };
  return { user, kind: "unassigned" };
}

export async function requirePortalAccess(request: Request): Promise<PortalAccess> {
  const access = await getPortalAccess(request);
  if (!access) throw new Error("Authentication required");
  return access;
}