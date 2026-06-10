export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action, adminNotes, finalPrice } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "Action tidak valid." }, { status: 400 });
    }

    const approval = await prisma.courseApproval.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!approval || approval.status !== "PENDING") {
      return NextResponse.json({ error: "Persetujuan tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.courseApproval.update({
      where: { id },
      data: {
        status: action,
        adminNotes: adminNotes ?? null,
        finalPrice: action === "APPROVED" ? (finalPrice ?? approval.suggestedPrice ?? 0) : null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    if (action === "APPROVED") {
      await prisma.course.update({
        where: { id: approval.courseId },
        data: {
          visibility: "PUBLIC",
          isApproved: true,
          price: finalPrice ?? approval.suggestedPrice ?? 0,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/admin/approvals/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
