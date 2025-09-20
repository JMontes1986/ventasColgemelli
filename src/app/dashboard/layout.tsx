
"use client";

import { Header } from "@/components/dashboard/header";
import { Sidebar, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { useMockAuth } from "@/hooks/use-mock-auth";
import type { ModulePermission } from "@/lib/types";
import { navItems, adminNavItems } from "@/components/dashboard/sidebar-nav";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const allNavItems = [...navItems, ...adminNavItems];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isMounted } = useMockAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isMounted) {
      if (!currentUser) {
        router.push("/");
      } else {
        setAuthorized(true);
      }
    }
  }, [isMounted, currentUser, router]);

  const accessibleNavItems = allNavItems.filter(item => 
    currentUser?.permissions?.includes(item.permission)
  );

  if (!authorized) {
    // Puedes mostrar un skeleton/loader aquí
    return <div>Cargando...</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarNav navItems={accessibleNavItems} />
        </Sidebar>
        <SidebarInset>
          <Header navItems={accessibleNavItems} />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
