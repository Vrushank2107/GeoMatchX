"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkle, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-client";

const navItems = [
  { href: "/", label: "Home", public: true },
  { href: "/search", label: "Search", requiresAuth: true },
  { href: "/map", label: "Map", requiresAuth: true },
  { href: "/candidates", label: "Candidates", requiresAuth: true },
  { href: "/post-job", label: "Post a Job", requiresAuth: true, smeOnly: true },
  { href: "/sme/dashboard", label: "Dashboard", requiresAuth: true, smeOnly: true },
  { href: "/sme/applications", label: "Applications", requiresAuth: true, smeOnly: true },
  { href: "/applications", label: "Applications", requiresAuth: true, workerOnly: true },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true, workerOnly: true },
];

export function AppNavbar() {
  const pathname = usePathname();
  const { user, isLoading, isAuthenticated, isWorker, isSME, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const visibleNavItems = navItems.filter((item) => {
    if (item.public) return true;
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.smeOnly && !isSME) return false;
    if ((item as any).workerOnly && !isWorker) return false;
    return true;
  });

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
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          ) : isAuthenticated && user ? (
            <DropdownMenu
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 max-w-[180px] justify-between"
                  disabled={isLoggingOut}
                >
                  <span className="flex items-center gap-2 truncate">
                    <User className="h-4 w-4" />
                    <span className="truncate text-sm font-medium">
                      {user.name || (isSME ? "Company" : "Profile")}
                    </span>
                  </span>
                </Button>
              }
            >
              <DropdownMenuItem href={isSME ? "/sme/profile/me" : "/profile/me"}>
                <span className="flex flex-col">
                  <span className="font-medium">Show profile</span>
                  <span className="text-xs text-zinc-500">View how your profile appears</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem href={isSME ? "/sme/profile/edit" : "/profile/edit"}>
                <span className="flex flex-col">
                  <span className="font-medium">Edit profile</span>
                  <span className="text-xs text-zinc-500">Update your details and settings</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="border-t border-zinc-100 dark:border-zinc-800 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </span>
              </DropdownMenuItem>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button variant="default" size="sm" className="gap-2">
                Login
                <User className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}


