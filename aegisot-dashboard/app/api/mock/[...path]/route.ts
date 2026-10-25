import { NextRequest, NextResponse } from "next/server";
import {
  auditLog,
  clearEstop,
  decide,
  latestTelemetry,
  openIncidents,
  pendingApprovals,
  reset,
  snapshot,
  triggerEstop,
  type Metric,
} from "@/lib/mockStore";

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const key = path.join("/");
  const sp = req.nextUrl.searchParams;

  switch (key) {
    case "telemetry/latest":
      return NextResponse.json(
        latestTelemetry(
          sp.get("deviceId") ?? undefined,
          (sp.get("metric") as Metric | null) ?? undefined
        )
      );

    case "telemetry/snapshot":
      return NextResponse.json(snapshot());

    case "incidents":
      return NextResponse.json({ data: openIncidents() });

    case "approvals/pending":
      return NextResponse.json({ data: pendingApprovals() });

    case "audit":
      return NextResponse.json({
        data: auditLog(Number(sp.get("limit") ?? 20)),
      });
  }

  return NextResponse.json({ message: `Unknown GET ${key}` }, { status: 404 });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const key = path.join("/");
  const body = await req.json().catch(() => ({} as Record<string, string>));

  if (key === "reset") {
    return NextResponse.json(reset());
  }

  if (key === "commands/estop") {
    return NextResponse.json(
      triggerEstop(
        body.actor ?? "unknown",
        body.actorRole ?? "unknown",
        body.reason ?? "Emergency stop"
      )
    );
  }

  if (key === "commands/estop/clear") {
    const result = clearEstop(
      body.actor ?? "unknown",
      body.actorRole ?? "unknown",
      body.reason ?? "Line restored"
    );

    if (!result.ok) {
      return NextResponse.json(
        { message: "الخط ليس في حالة إيقاف طارئ" },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  if (path[0] === "approvals" && path[2] === "decide") {
    const result = decide(
      path[1],
      body.decision as "approve" | "reject",
      body.reason ?? "",
      body.actor ?? "unknown",
      body.actorRole ?? "unknown"
    );

    if (!result.ok) {
      return NextResponse.json(
        {
          message:
            result.code === 409
              ? "تم اتخاذ القرار في هذا الطلب بالفعل"
              : "الطلب غير موجود",
        },
        { status: result.code }
      );
    }

    return NextResponse.json(result.approval);
  }

  return NextResponse.json({ message: `Unknown POST ${key}` }, { status: 404 });
}