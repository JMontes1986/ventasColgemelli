"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserRole } from "@/lib/types";

const MOCK_AUTH_KEY = "mock_user_role";

export function useMockAuth() {
  const [role, setRole] = useState<UserRole>('readonly');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const storedRole = localStorage.getItem(MOCK_AUTH_KEY) as UserRole;
      if (storedRole) {
        setRole(storedRole);
      }
    } catch (error) {
      console.warn("Could not read mock auth role from localStorage", error);
    }
    setIsMounted(true);
  }, []);

  const setMockRole = useCallback((newRole: UserRole) => {
    try {
      localStorage.setItem(MOCK_AUTH_KEY, newRole);
      setRole(newRole);
    } catch (error) {
      console.warn("Could not set mock auth role in localStorage", error);
      setRole(newRole);
    }
  }, []);

  return { role: isMounted ? role : 'readonly', setMockRole, isMounted };
}
