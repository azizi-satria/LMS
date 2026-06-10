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
    const { action } = await req.json();

    if (!["CONFIRMED", "REJECTED"].includes(action)) {
      return NextResponse.json({ error: "Action tidak valid." }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment || payment.status !== "PENDING") {
      return NextResponse.json({ error: "Pembayaran tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.payment.update({
      where: { id },
      data: {
        status: action,
        confirmedBy: session.user.id,
        confirmedAt: new Date(),
      },
    });

    if (action === "CONFIRMED") {
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: { userId: payment.userId, courseId: payment.courseId },
        },
        update: {},
        create: {
          userId: payment.userId,
          courseId: payment.courseId,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/admin/payments/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
