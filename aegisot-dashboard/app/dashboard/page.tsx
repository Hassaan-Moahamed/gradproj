"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTelemetry } from "@/app/hooks/useTelemetry";
import { useRole } from "@/app/hooks/useRole";
import { auditService } from "@/app/services/audit.service";
import { Button } from "@/components/ui/button";
import AlertBanner from "./AlertBanner";
import ApprovalForm from "./ApprovalForm";
import AuditLogTable from "./AuditLogTable";
import LiveChart from "./LiveChart";
import LiveValueCard from "./LiveValueCard";

export default function DashboardPage() {
  const router = useRouter();
  const { reading, series, isLoading } = useTelemetry();
  const { user, role } = useRole();

  async function resetDemo() {
    await auditService.resetScenario();
    toast.success("Scenario reset — اعمل refresh");
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AegisOT Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {user?.name ?? "Not signed in"} · {role ?? "no role"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetDemo}>
            Reset demo
          </Button>
        </div>
      </header>

      {/* ② بانر التنبيه */}
      <AlertBanner />

      {/* ① القيمة الحيّة + الرسم */}
      <div className="grid gap-6 md:grid-cols-2">
        <LiveValueCard reading={reading} isLoading={isLoading} />
        <LiveChart series={series} />
      </div>

      {/* ③ الموافقة */}
      <ApprovalForm />

      {/* ④ سجل التدقيق */}
      <AuditLogTable />
    </main>
  );
}