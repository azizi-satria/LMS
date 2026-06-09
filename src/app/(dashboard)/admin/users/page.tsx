import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, nim: true, nip: true, createdAt: true, _count: { select: { enrollments: true, courses: true } } },
  });

  const roleLabels = { ADMIN: "Admin", DOSEN: "Dosen", MAHASISWA: "Mahasiswa" };
  const roleBadgeColors = { ADMIN: "bg-red-100 text-red-700", DOSEN: "bg-purple-100 text-purple-700", MAHASISWA: "bg-green-100 text-green-700" };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna</h1>
        <p className="text-gray-500 mt-1">Total {users.length} pengguna terdaftar</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Pengguna", "Peran", "NIM/NIP", "Aktivitas", "Bergabung"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><p className="font-medium text-gray-900">{user.name}</p><p className="text-sm text-gray-500">{user.email}</p></td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadgeColors[user.role]}`}>{roleLabels[user.role]}</span></td>
                  <td className="px-6 py-4"><span className="text-sm text-gray-600">{user.nim || user.nip || "-"}</span></td>
                  <td className="px-6 py-4"><span className="text-sm text-gray-600">{user.role === "MAHASISWA" && `${user._count.enrollments} kursus`}{user.role === "DOSEN" && `${user._count.courses} kursus dibuat`}{user.role === "ADMIN" && "Administrator"}</span></td>
                  <td className="px-6 py-4"><span className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <div className="py-12 text-center text-gray-500">Belum ada pengguna terdaftar.</div>}
      </div>
    </div>
  );
}
