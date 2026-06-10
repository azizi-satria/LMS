"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Role } from "@/types";
import ThemeToggle from "./ThemeToggle";

interface SidebarProps {
  user: { name: string; email: string; role: Role };
  mahasiswaHasNoCourses?: boolean;
}

interface NavItem { href: string; label: string; icon: React.ReactNode; }

function BookIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}
function HomeIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function CogIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function AwardIcon() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

const navItemsByRole: Record<Role, NavItem[]> = {
  ADMIN: [
    { href: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { href: "/admin/users", label: "Manajemen Pengguna", icon: <UsersIcon /> },
    { href: "/admin/dosen", label: "Verifikasi Dosen", icon: <AwardIcon /> },
    { href: "/admin/courses", label: "Semua Kursus", icon: <BookIcon /> },
    { href: "/admin/approvals", label: "Persetujuan Kursus", icon: <CheckIcon /> },
    { href: "/admin/payments", label: "Pembayaran", icon: <CreditCardIcon /> },
    { href: "/admin/settings", label: "Pengaturan", icon: <CogIcon /> },
    { href: "/profile", label: "Profil Saya", icon: <UserIcon /> },
  ],
  DOSEN: [
    { href: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { href: "/instructor/courses", label: "Kursus Saya", icon: <BookIcon /> },
    { href: "/instructor/courses/new", label: "Buat Kursus", icon: <PlusIcon /> },
    { href: "/profile", label: "Profil Saya", icon: <UserIcon /> },
  ],
  MAHASISWA: [
    { href: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { href: "/courses", label: "Jelajahi Kursus", icon: <BookIcon /> },
    { href: "/browse", label: "Kursus Publik", icon: <GlobeIcon /> },
    { href: "/profile/certificates", label: "Sertifikat Saya", icon: <AwardIcon /> },
    { href: "/profile", label: "Profil Saya", icon: <UserIcon /> },
  ],
  UMUM: [
    { href: "/dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { href: "/courses", label: "Kursus Publik", icon: <BookIcon /> },
    { href: "/profile/certificates", label: "Sertifikat Saya", icon: <AwardIcon /> },
    { href: "/profile", label: "Profil Saya", icon: <UserIcon /> },
  ],
};

const roleLabels: Record<Role, string> = {
  ADMIN: "Administrator",
  DOSEN: "Dosen",
  MAHASISWA: "Mahasiswa",
  UMUM: "Umum",
};

const roleColors: Record<Role, string> = {
  ADMIN: "#ef4444",
  DOSEN: "#a855f7",
  MAHASISWA: "#10b981",
  UMUM: "#f59e0b",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function Sidebar({ user, mahasiswaHasNoCourses }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[user.role] || [];
  const [adminCounts, setAdminCounts] = useState<{ pendingApprovals: number; pendingPayments: number; pendingDosen: number } | null>(null);

  useEffect(() => {
    if (user.role === "ADMIN") {
      fetch("/api/admin/notifications")
        .then((r) => r.json())
        .then((d) => { if (!d.error) setAdminCounts(d); });
    }
  }, [user.role]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getBadge = (href: string) => {
    if (!adminCounts) return null;
    if (href === "/admin/dosen" && adminCounts.pendingDosen > 0) return adminCounts.pendingDosen;
    if (href === "/admin/approvals" && adminCounts.pendingApprovals > 0) return adminCounts.pendingApprovals;
    if (href === "/admin/payments" && adminCounts.pendingPayments > 0) return adminCounts.pendingPayments;
    return null;
  };

  return (
    <div
      className="flex flex-col h-full transition-colors duration-300"
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: "var(--text-primary)" }}>LMS</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Universitas</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const showBadge =
            item.href === "/dashboard" &&
            user.role === "MAHASISWA" &&
            mahasiswaHasNoCourses;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group"
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, rgba(124,58,237,0.18), rgba(6,182,212,0.1))",
                      borderLeft: "2px solid #a855f7",
                      color: "var(--text-primary)",
                      boxShadow: "0 0 12px rgba(124,58,237,0.12)",
                      paddingLeft: "10px",
                    }
                  : {
                      color: "var(--text-muted)",
                      borderLeft: "2px solid transparent",
                    }
              }
            >
              <span style={{ color: isActive ? "#a855f7" : "var(--text-muted)" }}>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.6)" }}
                />
              )}
              {getBadge(item.href) && (
                <span style={{ background: "#ef4444", color: "#fff", borderRadius: 20, fontSize: 11, fontWeight: 700, padding: "2px 7px", minWidth: 20, textAlign: "center" }}>
                  {getBadge(item.href)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle + User info + Logout */}
      <div
        className="px-3 py-4 space-y-2"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        {/* Theme Toggle Row */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-xl"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
        >
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Tema</span>
          <ThemeToggle />
        </div>

        {/* User info */}
        <div
          className="px-3 py-3 rounded-xl"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", color: "white" }}
            >
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{user.name}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
            </div>
          </div>
          <div className="mt-2">
            <span
              className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                background: `${roleColors[user.role]}20`,
                color: roleColors[user.role],
                border: `1px solid ${roleColors[user.role]}40`,
              }}
            >
              {roleLabels[user.role]}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl transition-all font-medium"
          style={{ color: "#ef4444" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>
      </div>
    </div>
  );
}
