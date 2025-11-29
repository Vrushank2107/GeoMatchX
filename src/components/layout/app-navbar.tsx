"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/map", label: "Map" },
  { href: "/workers", label: "Workers" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/post-job", label: "Post a Job" },
];

export function AppNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/80 backdrop-blur-md dark:bg-black/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <Sparkle className="h-5 w-5 text-indigo-500" />
          GeoMatchX
        </Link>
        <nav className="hidden items-center gap-2 text-sm font-medium text-zinc-600 md:flex">
          {navItems.map((item) => (
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
          <Link href="/auth/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/auth/register-sme">
            <Button>Join beta</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}


