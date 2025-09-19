
"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserRole, User } from "@/lib/types";
import { getUsers } from "@/lib/services/user-service";

const MOCK_AUTH_KEY = "mock_user_role";
const USERS_CACHE_KEY = "all_users";

export function useMockAuth() {
  const [role, setRole] = useState<UserRole>('readonly');
  const [users, setUsers] = useState<User[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    async function loadAuth() {
        try {
            const storedRole = localStorage.getItem(MOCK_AUTH_KEY) as UserRole;
            if (storedRole) {
                setRole(storedRole);
            }

            // Attempt to get users from cache first
            const cachedUsers = sessionStorage.getItem(USERS_CACHE_KEY);
            if (cachedUsers) {
                setUsers(JSON.parse(cachedUsers));
            } else {
                // If not in cache, fetch from DB
                const fetchedUsers = await getUsers();
                setUsers(fetchedUsers);
                sessionStorage.setItem(USERS_CACHE_KEY, JSON.stringify(fetchedUsers));
            }
        } catch (error) {
            console.warn("Could not read mock auth role from localStorage or fetch users", error);
        } finally {
            setIsMounted(true);
        }
    }
    loadAuth();
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

  return { role: isMounted ? role : 'readonly', users, setMockRole, isMounted };
}
