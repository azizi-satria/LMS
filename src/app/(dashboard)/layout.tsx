import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  let mahasiswaHasNoCourses = false;
  if (session.user.role === "MAHASISWA") {
    const count = await prisma.enrollment.count({ where: { userId: session.user.id } });
    mahasiswaHasNoCourses = count === 0;
  }

  return (
    <div className="flex h-screen" style={{ background: "var(--bg-base)" }}>
      <div className="w-64 flex-shrink-0 h-full">
        <Sidebar
          user={{
            name: session.user.name || "",
            email: session.user.email || "",
            role: session.user.role,
          }}
          mahasiswaHasNoCourses={mahasiswaHasNoCourses}
        />
      </div>
      <div className="flex-1 overflow-y-auto" style={{ background: "var(--bg-base)" }}>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
