
"use client";

import { Header } from "@/components/dashboard/header";
import { useAuth } from "@/hooks/use-mock-auth";
import type { ModulePermission } from "@/lib/types";
import { navItems, adminNavItems } from "@/components/dashboard/sidebar-nav";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const allNavItems = [...navItems, ...adminNavItems];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isMounted } = useAuth();
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

  const accessibleNavItems = useMemo(() => {
    if (!currentUser?.permissions) {
      return [];
    }
    return allNavItems.filter(item => 
      currentUser.permissions.includes(item.permission)
    );
  }, [currentUser]);

  if (!authorized || !currentUser) {
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
