"use client";

import { useState } from "react";
import { toast } from "sonner";
import RoleGate from "@/app/_components/RoleGate";
import { useDecideApproval, usePendingApprovals } from "@/app/hooks/useApprovals";
import { useRole } from "@/app/hooks/useRole";
import { SchemaApprovalDecisionInput } from "@/app/schema/SchemaApproval";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ApprovalForm() {
  const { approval } = usePendingApprovals();
  const { user, role } = useRole();
  const decide = useDecideApproval();
  const [reason, setReason] = useState("");

  if (!approval) return null;

  function submit(decision: "approve" | "reject") {
    const parsed = SchemaApprovalDecisionInput.safeParse({ decision, reason });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    decide.mutate(
      {
        approvalId: approval!.approvalId,
        payload: {
          decision,
          reason,
          actor: user?.name ?? "unknown",
          actorRole: role ?? "unknown",
        },
      },
      {
        onSuccess: () => {
          toast.success(
            decision === "approve" ? "تم تنفيذ الإجراء" : "تم رفض الإجراء"
          );
          setReason("");
        },
        onError: (e) => toast.error((e as Error).message),
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Action awaiting approval
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted p-3 text-sm">
          <p className="font-medium">{approval.action.label}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {approval.approvalId} · requested by {approval.requestedBy}
          </p>
        </div>

        <RoleGate
          permission="approval.decide"
          fallback={
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              دورك ({role ?? "guest"}) مش مصرّح له باتخاذ القرار. مطلوب:
              admin أو operator.
            </p>
          }
        >
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="اكتب سبب القرار…"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => submit("approve")}
              disabled={decide.isPending}
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => submit("reject")}
              disabled={decide.isPending}
            >
              Reject
            </Button>
          </div>
        </RoleGate>
      </CardContent>
    </Card>
  );
}