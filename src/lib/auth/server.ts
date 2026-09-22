import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getCookie } from "@tanstack/react-start/server";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
import { ensureDbReady, getPglite } from "../db";
import { emailAndPasswordEnabled } from "./email-password";
import { pgliteDialect } from "./pglite-dialect";

void ensureDbReady();

const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value || undefined;
};

const authDisabled = env("VITE_AUTH_ENABLED") === "false";
export const authConfigured = !authDisabled && emailAndPasswordEnabled;

const explicitBaseURL = env("BETTER_AUTH_URL");
const localOrigins = [
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://[::1]:8080",
];
const baseURL = explicitBaseURL ?? "http://localhost:8080";
const trustedOrigins = explicitBaseURL ? [explicitBaseURL, ...localOrigins] : localOrigins;
const databaseUrl = env("DATABASE_URL");
const database = databaseUrl
  ? new Pool({ connectionString: databaseUrl })
  : { dialect: pgliteDialect(() => getPglite()), type: "postgres" as const };

const globalAuthRef = globalThis as typeof globalThis & {
  __sjccAuthSecret__?: string;
};
function authSecret(): string {
  globalAuthRef.__sjccAuthSecret__ ??= randomBytes(32).toString("hex");
  return globalAuthRef.__sjccAuthSecret__;
}

export const SESSION_TOKEN_COOKIE = "__Host-sjcc-auth.session_token";

export const auth = betterAuth({
  baseURL,
  secret: env("BETTER_AUTH_SECRET") ?? authSecret(),
  database,
  trustedOrigins,
  emailAndPassword: { enabled: emailAndPasswordEnabled },
  session: { cookieCache: { enabled: true, maxAge: 300 } },
  advanced: {
    useSecureCookies: false,
    defaultCookieAttributes: { secure: true, sameSite: "lax", path: "/" },
    cookies: {
      session_token: { name: SESSION_TOKEN_COOKIE },
      session_data: { name: "__Host-sjcc-auth.session_data" },
      account_data: { name: "__Host-sjcc-auth.account_data" },
      dont_remember: { name: "__Host-sjcc-auth.dont_remember" },
    },
  },
  plugins: [bearer(), tanstackStartCookies()],
});

export function readSessionToken(): string | null {
  return getCookie(SESSION_TOKEN_COOKIE) ?? null;
}
