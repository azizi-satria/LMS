export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const users = await prisma.user.findMany({
      where: role ? { role: role as "ADMIN" | "DOSEN" | "MAHASISWA" } : {},
      select: { id: true, name: true, email: true, role: true, nim: true, nip: true, createdAt: true, _count: { select: { enrollments: true, courses: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(users);
  } catch (error) { console.error(error); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
