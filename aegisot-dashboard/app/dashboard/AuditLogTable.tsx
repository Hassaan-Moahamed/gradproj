"use client";

import { format } from "date-fns";
import { useAuditLog } from "@/app/hooks/useAuditLog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EVENT_LABEL } from "@/lib/constants";

export default function AuditLogTable() {
  const { data, isLoading } = useAuditLog(20);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Audit log</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Time</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="text-right">Result</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}

            {!isLoading && (data?.length ?? 0) === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No events yet.
                </TableCell>
              </TableRow>
            )}

            {data?.map((row) => (
              <TableRow key={row.auditId}>
                <TableCell className="tabular-nums text-xs">
                  {format(new Date(row.timestamp), "HH:mm:ss")}
                </TableCell>
                <TableCell className="text-sm">
                  {EVENT_LABEL[row.eventType] ?? row.eventType}
                </TableCell>
                <TableCell className="text-sm">
                  {row.actor}
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({row.actorRole})
                  </span>
                </TableCell>
                <TableCell className="max-w-[240px] truncate text-sm text-muted-foreground">
                  {row.reason ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={row.result === "success" ? "secondary" : "destructive"}
                  >
                    {row.result}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}