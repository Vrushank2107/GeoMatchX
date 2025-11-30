"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkle, User, Building2, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-client";

const navItems = [
  { href: "/", label: "Home", public: true },
  { href: "/search", label: "Search", requiresAuth: true },
  { href: "/map", label: "Map", requiresAuth: true },
  { href: "/workers", label: "Workers", requiresAuth: true },
  { href: "/recommendations", label: "Recommendations", requiresAuth: true },
  { href: "/post-job", label: "Post a Job", requiresAuth: true, smeOnly: true },
];

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, isWorker, isSME, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Filter nav items based on auth state
  const visibleNavItems = navItems.filter((item) => {
    // Public items (like Home) are always visible
    if (item.public) return true;
    
    // Items that require auth are only visible when authenticated
    if (item.requiresAuth && !isAuthenticated) return false;
    
    // SME-only items are only visible to SMEs
    if (item.smeOnly && !isSME) return false;
    
    return true;
  });

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-md dark:bg-black/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Sparkle className="h-5 w-5 text-indigo-500" />
          GeoMatchX
        </Link>
        <nav className="hidden items-center gap-2 text-sm font-medium text-zinc-600 md:flex">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 transition hover:bg-zinc-100 dark:hover:bg-zinc-900",
                pathname === item.href && "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 text-sm md:flex">
                {isSME ? (
                  <Building2 className="h-4 w-4 text-indigo-500" />
                ) : (
                  <User className="h-4 w-4 text-indigo-500" />
                )}
                <span className="text-zinc-600 dark:text-zinc-300">{user.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          ) : (
            <>
              <Link href="/auth/login-worker">
                <Button variant="ghost" size="sm">
                  Worker Login
                </Button>
              </Link>
              <Link href="/auth/login-sme">
                <Button size="sm">Company Login</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


