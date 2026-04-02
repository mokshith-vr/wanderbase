"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const NAV_ITEMS = [
  { label: "Explore", href: "/cities" },
  { label: "Visa Checker", href: "/visa-checker" },
  { label: "Cost Calculator", href: "/cost-calculator" },
  { label: "Blog", href: "/blog" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled
        ? "bg-white/95 backdrop-blur-xl border-b border-border shadow-sm"
        : "bg-transparent border-b border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-primary-glow"
              style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
              W
            </div>
            <span className="font-black text-lg tracking-tight group-hover:text-primary transition-colors"
              style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Wanderbase
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}
                  className={cn(
                    "px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-primary-light text-primary"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-2"
                  )}>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {!loading && (
              user ? (
                <div className="flex items-center gap-2">
                  <Link href="/dashboard"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="avatar"
                        className="w-7 h-7 rounded-full ring-2 ring-primary/20" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary-light flex items-center justify-center text-primary text-xs font-bold">
                        {(user.user_metadata?.full_name ?? user.email ?? "?")[0].toUpperCase()}
                      </div>
                    )}
                    <span className="hidden sm:inline text-sm text-text-secondary font-medium">Dashboard</span>
                  </Link>
                  <button onClick={signOut}
                    className="text-xs text-text-muted hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors font-medium">
                    Sign out
                  </button>
                </div>
              ) : (
                <Link href="/login" className="btn-primary text-sm py-2 px-4">
                  Sign in →
                </Link>
              )
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-surface-2 text-text-muted transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu">
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={cn("block h-0.5 bg-current rounded transition-all duration-300",
                  mobileOpen ? "rotate-45 translate-y-[7px]" : "")} />
                <span className={cn("block h-0.5 bg-current rounded transition-all duration-300",
                  mobileOpen ? "opacity-0" : "")} />
                <span className={cn("block h-0.5 bg-current rounded transition-all duration-300",
                  mobileOpen ? "-rotate-45 -translate-y-[7px]" : "")} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-80 pb-4" : "max-h-0"
        )}>
          <div className="pt-2 space-y-0.5 border-t border-border mt-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary-light text-primary"
                    : "text-text-muted hover:text-text-primary hover:bg-surface-2"
                )}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
