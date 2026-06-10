import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [pendingApprovals, pendingPayments, pendingDosen] = await Promise.all([
      prisma.courseApproval.count({ where: { status: "PENDING" } }),
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { role: "DOSEN", isVerified: false } }),
    ]);

    return NextResponse.json({ pendingApprovals, pendingPayments, pendingDosen });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
