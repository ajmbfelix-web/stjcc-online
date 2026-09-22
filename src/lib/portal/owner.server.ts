import { isOwnerUser } from "./access.server";
import { getSessionUser, type VerifiedUser } from "../auth/verify.server";

export async function requireOwner(request: Request): Promise<VerifiedUser> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const user = await getSessionUser(token);
  if (!user) throw new Error("Owner authentication required");
  if (!(await isOwnerUser(user))) throw new Error("SJCC owner access required");
  return user;
}
