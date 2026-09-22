import { createAuthClient } from "better-auth/react";
import { runSignOut } from "../../../scripts/sign-out-plan.mjs";

export const authClient = createAuthClient({
  fetchOptions: {
    onRequest(ctx) {
      const token = getBearerToken();
      if (token) ctx.headers.set("Authorization", `Bearer ${token}`);
      return ctx;
    },
  },
});

export const authEnabled = import.meta.env.VITE_AUTH_ENABLED !== "false";
const BEARER_KEY = "sjcc-auth.bearer-token";

export function getBearerToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(BEARER_KEY);
  } catch {
    return null;
  }
}

function setBearerToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) window.sessionStorage.setItem(BEARER_KEY, token);
    else window.sessionStorage.removeItem(BEARER_KEY);
  } catch {
    /* Storage may be unavailable in restricted browsers. */
  }
}

export async function signInEmail(email: string, password: string): Promise<void> {
  const { error } = await authClient.signIn.email({ email, password });
  if (error) throw new Error(error.message ?? "Sign-in failed");
}

export async function signUpEmail(name: string, email: string, password: string): Promise<void> {
  const { error } = await authClient.signUp.email({ name, email, password });
  if (error) throw new Error(error.message ?? "Account creation failed");
}

export async function signOut(redirectTo = "/"): Promise<void> {
  await runSignOut({
    livePreview: false,
    hasBearer: Boolean(getBearerToken()),
    requestSignOut: async () => {
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message ?? "Sign-out failed");
    },
    clearToken: () => setBearerToken(null),
    redirect: () => {
      window.location.href = redirectTo;
    },
  });
}
