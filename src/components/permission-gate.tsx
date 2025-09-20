
"use client";

import type { ModulePermission } from "@/lib/types";
import { useMockAuth } from "@/hooks/use-mock-auth";

interface PermissionGateProps {
  requiredPermission: ModulePermission;
  children: React.ReactNode;
}

export function PermissionGate({ requiredPermission, children }: PermissionGateProps) {
  const { hasPermission, isMounted } = useMockAuth();

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  if (!hasPermission(requiredPermission)) {
    return null;
  }

  return <>{children}</>;
}
