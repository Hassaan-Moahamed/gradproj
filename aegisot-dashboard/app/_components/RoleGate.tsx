"use client";

import type { Permission } from "@/lib/permissions";
import { useRole } from "@/app/hooks/useRole";

export default function RoleGate({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { can, isLoading } = useRole();

  if (isLoading) return null;
  if (!can(permission)) return <>{fallback}</>;
  return <>{children}</>;
}