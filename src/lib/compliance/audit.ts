import { randomUUID } from "node:crypto";

type Sql = {
  query<T = Record<string, unknown>>(text: string, params?: unknown[]): Promise<T[]>;
};

export type AuditInput = {
  onboardingId?: string | null;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

const REDACTED = new Set(["result", "resultSummary", "summary", "body", "ssn", "password"]);

function safeMetadata(metadata: Record<string, unknown> | undefined): string {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata ?? {})) {
    if (REDACTED.has(key)) continue;
    clean[key] = value;
  }
  return JSON.stringify(clean);
}

/** Append-only operational audit. Unknown organization ids are stored as null, not invented. */
export async function recordAudit(sql: Sql, input: AuditInput): Promise<void> {
  const id = `aud_${randomUUID()}`;
  await sql.query(
    `insert into compliance_audit_events (id, onboarding_id, actor_user_id, action, entity_type, entity_id, metadata)
     select $1, o.id, $3, $4, $5, $6, $7::jsonb
     from (select $2::text as wanted) w
     left join client_onboarding o on o.id = w.wanted`,
    [
      id,
      input.onboardingId ?? null,
      input.actorUserId ?? null,
      input.action,
      input.entityType,
      input.entityId ?? null,
      safeMetadata(input.metadata),
    ],
  );
}
