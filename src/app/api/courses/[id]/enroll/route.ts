import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateVaNumber(vaPrefix: string, userId: string, courseId: string) {
  const input = courseId + userId;
  const hash = Array.from(input).reduce(
    (acc, c) => Math.imul(31, acc) + c.charCodeAt(0),
    0
  );
  const hashPart = Math.abs(hash % 100000000).toString().padStart(8, "0");
  return vaPrefix + hashPart;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !["MAHASISWA", "UMUM"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    const course = await prisma.course.findUnique({ where: { id: courseId } });

    if (
      !course ||
      !course.isApproved ||
      (session.user.role === "UMUM" && course.visibility !== "PUBLIC") ||
      (session.user.role === "MAHASISWA" &&
        !["INTERNAL", "PUBLIC"].includes(course.visibility))
    ) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Sudah terdaftar di kursus ini." }, { status: 409 });
    }

    if (course.price === 0) {
      const enrollment = await prisma.enrollment.create({
        data: { userId: session.user.id, courseId },
      });
      return NextResponse.json({ enrolled: true, enrollment }, { status: 201 });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });

    if (existingPayment && existingPayment.status === "PENDING") {
      return NextResponse.json({ enrolled: false, payment: existingPayment }, { status: 200 });
    }

    const settings = await prisma.platformSettings.upsert({
      where: { id: "global" },
      update: {},
      create: { id: "global" },
    });

    const vaNumber = generateVaNumber(settings.vaPrefix, session.user.id, courseId);
    const expiredAt = new Date(Date.now() + settings.vaExpiryHours * 60 * 60 * 1000);

    const payment = await prisma.payment.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      update: { status: "PENDING", vaNumber, amount: course.price, bankName: settings.bankName, expiredAt },
      create: {
        userId: session.user.id,
        courseId,
        amount: course.price,
        vaNumber,
        bankName: settings.bankName,
        expiredAt,
      },
    });

    return NextResponse.json({ enrolled: false, payment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses/[id]/enroll error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
