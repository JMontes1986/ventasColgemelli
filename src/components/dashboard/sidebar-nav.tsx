
"use client";

import {
  SidebarContent,
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
  ShoppingCart,
  QrCode,
  Archive,
  Users,
  ClipboardList,
  LogOut,
  Package,
  UserCog,
  Undo2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useMockAuth } from "@/hooks/use-mock-auth";
import type { ModulePermission } from "@/lib/types";
import { PermissionGate } from "../permission-gate";

type NavItem = {
  href: string;
  icon: React.ElementType;
  label: string;
  permission: ModulePermission;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel", permission: 'dashboard' },
  { href: "/dashboard/sales", icon: ShoppingCart, label: "Ventas", permission: 'sales' },
  { href: "/dashboard/self-service", icon: UserCog, label: "Autogestión", permission: 'self-service' },
  { href: "/dashboard/products", icon: Package, label: "Productos", permission: 'products' },
  { href: "/dashboard/redeem", icon: QrCode, label: "Canjear", permission: 'redeem' },
  { href: "/dashboard/cashbox", icon: Archive, label: "Caja", permission: 'cashbox' },
  { href: "/dashboard/returns", icon: Undo2, label: "Devoluciones", permission: 'returns' },
];

export const adminNavItems: NavItem[] = [
    { href: "/dashboard/users", icon: Users, label: "Usuarios", permission: 'users' },
    { href: "/dashboard/audit", icon: ClipboardList, label: "Auditoría", permission: 'audit' },
]

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useMockAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  }

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
            <PermissionGate key={item.href} requiredPermission={item.permission}>
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
            </PermissionGate>
          ))}
        </SidebarMenu>
        <PermissionGate requiredPermission="users">
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
        </PermissionGate>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton icon={LogOut} onClick={handleLogout}>Cerrar Sesión</SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
