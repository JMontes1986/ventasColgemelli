
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

// Define which items should appear in the top navigation
const topNavLinks: ModulePermission[] = ['dashboard', 'sales', 'presale'];

export function TopNav({
  className,
  navItems: accessibleNavItems,
  ...props
}: TopNavProps) {
  const pathname = usePathname();

  // Filter the accessible items to only include the ones we want in the top nav
  const topNavItems = accessibleNavItems.filter(item => topNavLinks.includes(item.permission));

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {topNavItems.map((item) => (
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
