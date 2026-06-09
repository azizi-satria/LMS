"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Role } from "@/types";

interface SidebarProps {
  user: { name: string; email: string; role: Role };
}

const navItemsByRole: Record<Role, { href: string; label: string }[]> = {
  ADMIN: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/admin/users", label: "Manajemen Pengguna" },
    { href: "/admin/courses", label: "Semua Kursus" },
  ],
  DOSEN: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/instructor/courses", label: "Kursus Saya" },
    { href: "/instructor/courses/new", label: "Buat Kursus" },
  ],
  MAHASISWA: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/courses", label: "Jelajahi Kursus" },
  ],
};

const roleLabels: Record<Role, string> = {
  ADMIN: "Administrator",
  DOSEN: "Dosen",
  MAHASISWA: "Mahasiswa",
};

const roleBadgeColors: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-700",
  DOSEN: "bg-purple-100 text-purple-700",
  MAHASISWA: "bg-green-100 text-green-700",
};

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[user.role] || [];

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="px-6 py-5 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">LMS</p>
            <p className="text-xs text-gray-500 mt-0.5">Universitas</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-200">
        <div className="px-3 py-3 rounded-lg bg-gray-50 mb-3">
          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
          <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColors[user.role]}`}>
            {roleLabels[user.role]}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          Keluar
        </button>
      </div>
    </div>
  );
}
