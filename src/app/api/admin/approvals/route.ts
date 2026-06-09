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
    const status = searchParams.get("status") || "PENDING";

    const approvals = await prisma.courseApproval.findMany({
      where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
      include: {
        course: {
          include: {
            instructor: { select: { name: true, email: true } },
          },
        },
        requester: { select: { name: true, email: true } },
        reviewer: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(approvals);
  } catch (error) {
    console.error("GET /api/admin/approvals error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
