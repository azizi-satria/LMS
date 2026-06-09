import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      nim: true,
      nip: true,
      createdAt: true,
      _count: { select: { enrollments: true, courses: true } },
    },
  });

  const roleLabels = { ADMIN: "Admin", DOSEN: "Dosen", MAHASISWA: "Mahasiswa" };
  const roleStyles: Record<string, { bg: string; color: string; border: string }> = {
    ADMIN: { bg: "rgba(239,68,68,0.12)", color: "#f87171", border: "rgba(239,68,68,0.25)" },
    DOSEN: { bg: "rgba(168,85,247,0.12)", color: "#c084fc", border: "rgba(168,85,247,0.25)" },
    MAHASISWA: { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.25)" },
  };

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#f1f5f9" }}>Manajemen Pengguna</h1>
          <p className="mt-1" style={{ color: "#64748b" }}>Total {users.length} pengguna terdaftar</p>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #1e1e2e" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid #1e1e2e" }}>
                {["Pengguna", "Peran", "NIM/NIP", "Aktivitas", "Bergabung"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "#64748b" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => {
                const rs = roleStyles[user.role] || roleStyles.MAHASISWA;
                return (
                  <tr
                    key={user.id}
                    className="transition-all"
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                      background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #7c3aed40, #06b6d440)", color: "#a855f7" }}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: "#f1f5f9" }}>{user.name}</p>
                          <p className="text-sm" style={{ color: "#64748b" }}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}
                      >
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: "#94a3b8" }}>
                        {user.nim || user.nip || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: "#94a3b8" }}>
                        {user.role === "MAHASISWA" && `${user._count.enrollments} kursus diikuti`}
                        {user.role === "DOSEN" && `${user._count.courses} kursus dibuat`}
                        {user.role === "ADMIN" && "Administrator"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm" style={{ color: "#64748b" }}>
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="py-12 text-center" style={{ color: "#64748b" }}>
            Belum ada pengguna terdaftar.
          </div>
        )}
      </div>
    </div>
  );
}
