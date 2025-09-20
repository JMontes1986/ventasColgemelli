
"use client";

import { Header } from "@/components/dashboard/header";
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
    <div className="flex min-h-screen flex-col">
      <Header navItems={accessibleNavItems} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
