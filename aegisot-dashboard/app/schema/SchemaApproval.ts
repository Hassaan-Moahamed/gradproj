import { z } from "zod";

export const SchemaApproval = z.object({
  approvalId: z.string(),
  incidentId: z.string(),
  action: z.object({
    code: z.string(),
    label: z.string(),
  }),
  requestedBy: z.string(),
  requestedAt: z.string(),
  status: z.enum(["pending", "approved", "rejected"]),
});

export const SchemaApprovalList = z.object({
  data: z.array(SchemaApproval),
});

export const SchemaApprovalDecisionInput = z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string().min(3, "لازم تكتب سبب القرار"),
});

export type Approval = z.infer<typeof SchemaApproval>;
export type ApprovalDecisionInput = z.infer<typeof SchemaApprovalDecisionInput>;