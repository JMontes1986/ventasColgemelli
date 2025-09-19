
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { RoleGate } from "../role-gate";
import { navItems, adminNavItems } from "./sidebar-nav";

export function TopNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();
  const allNavItems = [...navItems, ...adminNavItems];

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {allNavItems.map((item) => (
        <RoleGate key={item.href} allowedRoles={item.allowedRoles}>
          <Link
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        </RoleGate>
      ))}
    </nav>
  );
}
