
"use client";

import { useState, useEffect, useCallback } from "react";
import type { ModulePermission, User } from "@/lib/types";
import { getUsers } from "@/lib/services/user-service";

const AUTH_USER_KEY = "auth_user_id";

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Function to load authentication state from localStorage
  const loadAuth = useCallback(async () => {
    try {
      const storedUserId = localStorage.getItem(AUTH_USER_KEY);
      if (storedUserId) {
        // Fetch fresh user data on every load to prevent stale data issues.
        // This is crucial for environments like Netlify.
        const allUsers = await getUsers();
        const user = allUsers.find(u => u.id === storedUserId);
        
        if (user) {
          console.log("Auth hook: Found user in DB:", user.name);
          setCurrentUser(user);
        } else {
          console.warn("Auth hook: User ID in storage not found in DB. Clearing storage.");
          localStorage.removeItem(AUTH_USER_KEY);
          setCurrentUser(null);
        }
      }
    } catch (error) {
      console.warn("Could not read auth state from localStorage or fetch users.", error);
    } finally {
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  // Function to handle user login
  const login = useCallback((user: User) => {
    try {
      localStorage.setItem(AUTH_USER_KEY, user.id);
      setCurrentUser(user);
    } catch (error) {
      console.warn("Could not set auth state in localStorage", error);
      // Still set the user in state for the current session
      setCurrentUser(user);
    }
  }, []);

  // Function to handle user logout
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (error) {
       console.warn("Could not clear auth state from localStorage", error);
    }
    setCurrentUser(null);
  }, []);

  const hasPermission = (requiredPermission: ModulePermission) => {
      if (!isMounted || !currentUser) return false;
      return currentUser.permissions?.includes(requiredPermission) ?? false;
  }

  const permissions = isMounted && currentUser ? currentUser.permissions : [];

  return { 
      currentUser, 
      login,
      logout,
      isMounted,
      hasPermission,
      permissions,
  };
}
