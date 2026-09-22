import { getSql } from "../db";
import { classifyAccess, type AccessKind } from "../automation/policy";
import { ownerInbox } from "../automation/owner";
import { getSessionUser, type VerifiedUser } from "../auth/verify.server";

export type PortalAccess = {
  user: VerifiedUser;
  kind: AccessKind;
  onboardingId?: string;
  role?: string;
  status?: string;
  billingStatus?: string;
};

export async function isOwnerUser(user: VerifiedUser): Promise<boolean> {
  if (user.email?.toLowerCase() === ownerInbox()) return true;
  const sql = await getSql();
  const rows = await sql.query<{ user_id: string }>(
    `select user_id from sjcc_admin_users where user_id = $1 or lower(email) = lower($2) limit 1`,
    [user.id, user.email ?? ""],
  );
  return Boolean(rows[0]);
}

export async function getPortalAccess(request: Request): Promise<PortalAccess | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const user = await getSessionUser(token);
  if (!user) return null;
  if (await isOwnerUser(user)) return { user, kind: "owner" };

  const sql = await getSql();
  const rows = await sql.query<{ onboarding_id: string; role: string; status: string; billing_status: string }>(
    `select a.onboarding_id, a.role, o.status, o.billing_status
     from client_user_access a
     join client_onboarding o on o.id = a.onboarding_id
     where a.user_id = $1`,
    [user.id],
  );
  const row = rows[0];
  if (!row) return { user, kind: "unassigned" };
  return {
    user,
    kind: classifyAccess({ isOwner: false, onboardingId: row.onboarding_id, status: row.status }),
    onboardingId: row.onboarding_id,
    role: row.role,
    status: row.status,
    billingStatus: row.billing_status,
  };
}

export async function requirePortalAccess(request: Request): Promise<PortalAccess> {
  const access = await getPortalAccess(request);
  if (!access) throw new Error("Authentication required");
  return access;
}
