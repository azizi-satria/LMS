import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOSEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const { suggestedPrice, requesterNotes } = await req.json();

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    // Check no pending approval
    const pending = await prisma.courseApproval.findFirst({
      where: { courseId, status: "PENDING" },
    });
    if (pending) {
      return NextResponse.json(
        { error: "Sudah ada permintaan yang sedang diproses." },
        { status: 409 }
      );
    }

    const approval = await prisma.courseApproval.create({
      data: {
        courseId,
        requestedBy: session.user.id,
        targetVisibility: "PUBLIC",
        suggestedPrice: suggestedPrice ?? 0,
        requesterNotes: requesterNotes ?? null,
        status: "PENDING",
      },
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses/[id]/request-publish error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
