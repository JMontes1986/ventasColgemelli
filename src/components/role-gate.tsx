"use client";

import type { UserRole } from "@/lib/types";
import { useMockAuth } from "@/hooks/use-mock-auth";

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const { role, isMounted } = useMockAuth();

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  const isAllowed = allowedRoles.includes(role);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
