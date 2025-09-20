
"use client";

import { useState, useEffect, useCallback } from "react";
import type { ModulePermission, User } from "@/lib/types";
import { getUsers, authenticateUser } from "@/lib/services/user-service";

const AUTH_USER_KEY = "auth_user_id";
const USERS_CACHE_KEY = "all_users";

export function useMockAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    async function loadAuth() {
        try {
            const storedUserId = localStorage.getItem(AUTH_USER_KEY);
            const cachedUsers = sessionStorage.getItem(USERS_CACHE_KEY);
            
            let allUsers: User[] = [];
            if (cachedUsers) {
                allUsers = JSON.parse(cachedUsers);
            } else {
                allUsers = await getUsers();
                sessionStorage.setItem(USERS_CACHE_KEY, JSON.stringify(allUsers));
            }
            setUsers(allUsers);

            if (storedUserId) {
                const user = allUsers.find(u => u.id === storedUserId);
                setCurrentUser(user || null);
            }

        } catch (error) {
            console.warn("Could not read auth state from localStorage or fetch users", error);
        } finally {
            setIsMounted(true);
        }
    }
    loadAuth();
  }, []);

  const login = useCallback((user: User) => {
    try {
      localStorage.setItem(AUTH_USER_KEY, user.id);
      setCurrentUser(user);
    } catch (error) {
      console.warn("Could not set auth state in localStorage", error);
      setCurrentUser(user);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_USER_KEY);
      setCurrentUser(null);
    } catch (error) {
       console.warn("Could not clear auth state from localStorage", error);
       setCurrentUser(null);
    }
  }, []);

  const hasPermission = (requiredPermission: ModulePermission) => {
      if (!isMounted || !currentUser) return false;
      return currentUser.permissions?.includes(requiredPermission) ?? false;
  }

  const permissions = isMounted && currentUser ? currentUser.permissions : [];

  return { 
      currentUser, 
      users, 
      login,
      logout,
      isMounted,
      hasPermission,
      permissions,
  };
}
