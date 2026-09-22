import { getSql } from "../db";
import { getSessionUser, type VerifiedUser } from "../auth/verify.server";

export async function requireOwner(request: Request): Promise<VerifiedUser> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const user = await getSessionUser(token);
  if (!user) throw new Error("Owner authentication required");

  const configuredOwner = process.env.SJCC_OWNER_EMAIL?.trim().toLowerCase();
  if (configuredOwner && user.email?.toLowerCase() === configuredOwner) return user;

  const sql = await getSql();
  const rows = await sql.query<{ user_id: string }>(
    `select user_id from sjcc_admin_users where user_id = $1`,
    [user.id],
  );
  if (!rows[0]) throw new Error("SJCC owner access required");
  return user;
}