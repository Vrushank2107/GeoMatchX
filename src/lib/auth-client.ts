"use client";

import { useState, useEffect } from "react";

export type User = {
  id: number;
  name: string;
  email: string;
  userType: "WORKER" | "SME";
  phone?: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isWorker: user?.userType === "WORKER",
    isSME: user?.userType === "SME",
    logout,
    refresh: checkAuth,
  };
}

