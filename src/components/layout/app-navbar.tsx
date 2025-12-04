"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkle, User, Building2, LogOut, Settings, Edit, Eye, ChevronDown, Bell } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-client";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/", label: "Home", public: true },
  { href: "/search", label: "Search", requiresAuth: true },
  { href: "/map", label: "Map", requiresAuth: true },
  { href: "/workers", label: "Workers", requiresAuth: true },
  { href: "/post-job", label: "Post a Job", requiresAuth: true, smeOnly: true },
  { href: "/sme/dashboard", label: "Dashboard", requiresAuth: true, smeOnly: true },
  { href: "/sme/applications", label: "Applications", requiresAuth: true, smeOnly: true },
  { href: "/applications", label: "Applications", requiresAuth: true, workerOnly: true },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true, workerOnly: true },
];

export function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, isAuthenticated, isWorker, isSME, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Filter nav items based on auth state
  const visibleNavItems = navItems.filter((item) => {
    // Public items (like Home) are always visible
    if (item.public) return true;
    
    // Items that require auth are only visible when authenticated
    if (item.requiresAuth && !isAuthenticated) return false;
    
    // SME-only items are only visible to SMEs
    if (item.smeOnly && !isSME) return false;
    
    // Worker-only items are only visible to workers
    if ((item as any).workerOnly && !isWorker) return false;
    
    return true;
  });

  useEffect(() => {
    let interval: number | undefined;

    async function fetchNotifications() {
      if (!isAuthenticated) {
        setUnreadNotifications(0);
        return;
      }
      try {
        const res = await fetch("/api/notifications", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setUnreadNotifications(data.unreadCount || 0);
        }
      } catch {
        // fail silently; notifications are non-critical
      }
    }

    if (isAuthenticated && !isLoading) {
      fetchNotifications();
      interval = window.setInterval(fetchNotifications, 15000);
    }

    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [isAuthenticated, isLoading]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/90 backdrop-blur-xl shadow-sm dark:bg-black/80 dark:border-zinc-800/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight transition-transform hover:scale-105">
          <Sparkle className="h-5 w-5 text-indigo-500 animate-pulse" />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
          GeoMatchX
          </span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 md:flex">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 transition-all duration-200",
                pathname === item.href
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:from-indigo-500 hover:to-purple-500 dark:from-indigo-500 dark:to-purple-500"
                  : "hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated && !isLoading && (
            <Link href="/notifications" className="relative inline-flex items-center justify-center rounded-full p-2 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-zinc-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950/40 transition-colors">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              )}
            </Link>
          )}
          {isLoading ? (
            <div className="h-9 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {isWorker ? (
                <DropdownMenu
                  trigger={
                    <div className="hidden items-center gap-2 text-sm md:flex cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <User className="h-4 w-4 text-indigo-500" />
                      <span className="text-zinc-600 dark:text-zinc-300 font-medium">{user.name}</span>
                      <ChevronDown className="h-3 w-3 text-zinc-400" />
                    </div>
                  }
                  align="right"
                >
                  <DropdownMenuItem href="/profile/me">
                    <Eye className="h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem href="/profile/edit">
                    <Edit className="h-4 w-4" />
                    Edit Profile & Settings
                  </DropdownMenuItem>
                  <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenu>
              ) : isSME ? (
                <DropdownMenu
                  trigger={
                    <div className="hidden items-center gap-2 text-sm md:flex cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <Building2 className="h-4 w-4 text-indigo-500" />
                      <span className="text-zinc-600 dark:text-zinc-300 font-medium">{user.name}</span>
                      <ChevronDown className="h-3 w-3 text-zinc-400" />
                    </div>
                  }
                  align="right"
                >
                  <DropdownMenuItem href="/sme/profile/me">
                    <Eye className="h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem href="/sme/profile/edit">
                    <Edit className="h-4 w-4" />
                    Edit Profile & Settings
                  </DropdownMenuItem>
                  <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenu>
              ) : (
                <>
              <div className="hidden items-center gap-2 text-sm md:flex">
                  <Building2 className="h-4 w-4 text-indigo-500" />
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
                </>
              )}
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


