"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Role } from "@/types";

interface SidebarProps {
  user: { name: string; email: string; role: Role };
  mahasiswaHasNoCourses?: boolean;
}

const navItemsByRole: Record<Role, { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Manajemen Pengguna" },
    { href: "/admin/courses", label: "Semua Kursus" },
    { href: "/profile", label: "Profil Saya" },
  ],
  DOSEN: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/instructor/courses", label: "Kursus Saya" },
    { href: "/instructor/courses/new", label: "Buat Kursus" },
    { href: "/profile", label: "Profil Saya" },
  ],
  MAHASISWA: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/courses", label: "Jelajahi Kursus" },
    { href: "/profile", label: "Profil Saya" },
  ],
};

const roleLabels: Record<Role, string> = { ADMIN: "Administrator", DOSEN: "Dosen", MAHASISWA: "Mahasiswa" };
const roleColors: Record<Role, string> = { ADMIN: "#ef4444", DOSEN: "#a855f7", MAHASISWA: "#10b981" };

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function Sidebar({ user, mahasiswaHasNoCourses }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[user.role] || [];

  return (
    <div className="flex flex-col h-full" style={{ background: "#0d0d14", borderRight: "1px solid #1e1e2e" }}>
      <div className="px-5 py-5" style={{ borderBottom: "1px solid #1e1e2e" }}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: "#f1f5f9" }}>LMS</p>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Universitas</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const showBadge = item.href === "/dashboard" && user.role === "MAHASISWA" && mahasiswaHasNoCourses;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative"
              style={isActive ? { background: "linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))", borderLeft: "2px solid #a855f7", color: "#f1f5f9", boxShadow: "0 0 12px rgba(124,58,237,0.15)", paddingLeft: "10px" } : { color: "#64748b", borderLeft: "2px solid transparent" }}
            >
              <span>{item.label}</span>
              {showBadge && <span className="ml-auto w-2 h-2 rounded-full" style={{ background: "#f59e0b", boxShadow: "0 0 6px rgba(245,158,11,0.6)" }} />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: "1px solid #1e1e2e" }}>
        <div className="px-3 py-3 rounded-xl mb-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", color: "white" }}>
              {getInitials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: "#f1f5f9" }}>{user.name}</p>
              <p className="text-xs truncate" style={{ color: "#64748b" }}>{user.email}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: `${roleColors[user.role]}20`, color: roleColors[user.role], border: `1px solid ${roleColors[user.role]}40` }}>
              {roleLabels[user.role]}
            </span>
          </div>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl transition-all font-medium" style={{ color: "#ef4444" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Keluar
        </button>
      </div>
    </div>
  );
}
