
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
  UserCog,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMockAuth } from "@/hooks/use-mock-auth";
import type { UserRole } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleGate } from "../role-gate";

const roleTranslations: Record<UserRole, string> = {
  admin: "Admin",
  cashier: "Cajero",
  seller: "Vendedor",
  auditor: "Auditor",
  readonly: "Solo Lectura",
};

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel", allowedRoles: ['admin', 'cashier', 'seller', 'auditor', 'readonly'] },
  { href: "/dashboard/sales", icon: ShoppingCart, label: "Ventas", allowedRoles: ['admin', 'cashier', 'seller'] },
  { href: "/dashboard/tickets", icon: UserCog, label: "Autogestión", allowedRoles: ['admin', 'seller', 'cashier', 'auditor', 'readonly'] },
  { href: "/dashboard/products", icon: Package, label: "Productos", allowedRoles: ['admin', 'cashier'] },
  { href: "/dashboard/redeem", icon: QrCode, label: "Canjear", allowedRoles: ['admin', 'auditor'] },
  { href: "/dashboard/cashbox", icon: Archive, label: "Caja", allowedRoles: ['admin', 'cashier'] },
];

const adminNavItems = [
    { href: "/dashboard/users", icon: Users, label: "Usuarios", allowedRoles: ['admin'] },
    { href: "/dashboard/audit", icon: ClipboardList, label: "Auditoría", allowedRoles: ['admin'] },
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
            <Label htmlFor="role-switcher" className="text-xs text-sidebar-foreground/70">Selector de Rol (Demo)</Label>
            <Select value={role} onValueChange={(value) => setMockRole(value as UserRole)}>
                <SelectTrigger id="role-switcher" className="bg-sidebar-accent border-sidebar-border text-sidebar-accent-foreground">
                    <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="admin">{roleTranslations.admin}</SelectItem>
                    <SelectItem value="cashier">{roleTranslations.cashier}</SelectItem>
                    <SelectItem value="seller">{roleTranslations.seller}</SelectItem>
                    <SelectItem value="auditor">{roleTranslations.auditor}</SelectItem>
                    <SelectItem value="readonly">{roleTranslations.readonly}</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton icon={LogOut}>Cerrar Sesión</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
