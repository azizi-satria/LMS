"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "./ThemeProvider";

export default function PublicNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <header className="public-nav">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>LMS Universitas</span>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/", label: "Beranda" },
            { href: "/browse", label: "Kursus" },
          ].map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: active ? "var(--accent-purple-light)" : "var(--text-muted)",
                  background: active ? (isDark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.08)") : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {session ? (
            <Link
              href="/dashboard"
              className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: "var(--text-muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="gradient-btn px-4 py-2 rounded-xl text-sm font-semibold"
              >
                Daftar Gratis
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
