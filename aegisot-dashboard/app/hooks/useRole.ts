"use client";

import { useSession } from "next-auth/react";
import { can, type Permission, type Role } from "@/lib/permissions";

export function useRole() {
  const { data: session, status } = useSession();
  const role = session?.user?.role as Role | undefined;

  return {
    role,
    user: session?.user,
    isLoading: status === "loading",
    can: (permission: Permission) => can(role, permission),
  };
}