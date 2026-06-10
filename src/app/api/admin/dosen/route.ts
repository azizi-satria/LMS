import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // "pending" | "verified" | all

    const where: Record<string, unknown> = { role: "DOSEN" };
    if (status === "pending") where.isVerified = false;
    if (status === "verified") where.isVerified = true;

    const users = await prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, nip: true, isVerified: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
