
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ModulePermission } from "@/lib/types";

export type NavItem = {
  href: string;
  label: string;
  permission: ModulePermission;
};

interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
    navItems: NavItem[];
}

export function TopNav({
  className,
  navItems: accessibleNavItems,
  ...props
}: TopNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {accessibleNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
