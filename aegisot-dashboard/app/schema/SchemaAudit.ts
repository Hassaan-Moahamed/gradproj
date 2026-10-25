import { z } from "zod";

export const SchemaAuditEntry = z.object({
  auditId: z.string(),
  eventType: z.string(),
  actor: z.string(),
  actorRole: z.string(),
  targetId: z.string().nullable().optional(),
  decision: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  result: z.enum(["success", "failed"]),
  timestamp: z.string(),
});

export const SchemaAuditList = z.object({
  data: z.array(SchemaAuditEntry),
});

export type AuditEntry = z.infer<typeof SchemaAuditEntry>;