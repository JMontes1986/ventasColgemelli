
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PermissionGate } from "../permission-gate";
import { navItems, adminNavItems } from "./sidebar-nav";

// Combine all nav items
const allNavItems = [
  ...navItems,
  ...adminNavItems,
];

export function TopNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("hidden items-center space-x-4 lg:space-x-6 md:flex", className)}
      {...props}
    >
      {allNavItems.map((item) => (
        <PermissionGate key={item.href} requiredPermission={item.permission}>
          <Link
            href={item.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              pathname === item.href ? "text-primary" : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        </PermissionGate>
      ))}
    </nav>
  );
}
