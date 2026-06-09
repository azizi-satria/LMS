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
    const status = searchParams.get("status");

    const payments = await prisma.payment.findMany({
      where: status ? { status: status as "PENDING" | "CONFIRMED" | "REJECTED" | "EXPIRED" } : {},
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true, semester: true } },
        confirmer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("GET /api/admin/payments error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
