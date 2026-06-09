import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 flex-shrink-0 h-full">
        <Sidebar user={{ name: session.user.name || "", email: session.user.email || "", role: session.user.role }} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
