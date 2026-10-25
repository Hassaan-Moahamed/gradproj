"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/twin", label: "Digital Twin" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const role = session?.user?.role;

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4">
        <span className="font-semibold tracking-tight">AegisOT</span>

        <div className="flex items-center gap-1">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {status === "authenticated" ? (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{session.user?.name}</span>
                {role ? <Badge variant="secondary">{role}</Badge> : null}
              </div>
              <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: "/login" })}>
                Sign out
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => signIn()}>
              Sign in
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}