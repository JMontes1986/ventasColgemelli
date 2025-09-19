
"use client";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import {
  LayoutDashboard,
  Ticket,
  ShoppingCart,
  QrCode,
  Archive,
  Users,
  ClipboardList,
  LogOut,
  Package,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMockAuth } from "@/hooks/use-mock-auth";
import type { UserRole } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleGate } from "../role-gate";


const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", allowedRoles: ['admin', 'cashier', 'seller', 'auditor', 'readonly'] },
  { href: "/dashboard/sales", icon: ShoppingCart, label: "Sales", allowedRoles: ['admin', 'cashier', 'seller'] },
  { href: "/dashboard/tickets", icon: Ticket, label: "Tickets", allowedRoles: ['admin', 'seller'] },
  { href: "/dashboard/products", icon: Package, label: "Products", allowedRoles: ['admin', 'cashier'] },
  { href: "/dashboard/redeem", icon: QrCode, label: "Redeem", allowedRoles: ['admin', 'auditor'] },
  { href: "/dashboard/cashbox", icon: Archive, label: "Cashbox", allowedRoles: ['admin', 'cashier'] },
];

const adminNavItems = [
    { href: "/dashboard/users", icon: Users, label: "Users", allowedRoles: ['admin'] },
    { href: "/dashboard/audit", icon: ClipboardList, label: "Audit Log", allowedRoles: ['admin'] },
]

export function SidebarNav() {
  const pathname = usePathname();
  const { role, setMockRole } = useMockAuth();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="size-8 text-sidebar-primary" />
          <span className="text-lg font-semibold text-sidebar-foreground">
            ColGemelli
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <RoleGate key={item.href} allowedRoles={item.allowedRoles}>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  icon={item.icon}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    {item.label}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </RoleGate>
          ))}
        </SidebarMenu>
        <RoleGate allowedRoles={['admin']}>
            <SidebarSeparator />
            <SidebarMenu>
            {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      icon={item.icon}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        {item.label}
                      </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
            </SidebarMenu>
        </RoleGate>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 p-2">
            <Label htmlFor="role-switcher" className="text-xs text-sidebar-foreground/70">Demo Role Switcher</Label>
            <Select value={role} onValueChange={(value) => setMockRole(value as UserRole)}>
                <SelectTrigger id="role-switcher" className="bg-sidebar-accent border-sidebar-border text-sidebar-accent-foreground">
                    <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                    <SelectItem value="readonly">Read-Only</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton icon={LogOut}>Log out</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
