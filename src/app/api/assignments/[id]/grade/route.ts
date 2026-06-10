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
    if (!session?.user || session.user.role !== "DOSEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await params;
    const { userId, score, feedback } = await req.json();

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { module: { include: { course: true } } },
    });
    if (!assignment || assignment.module.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.assignmentSubmission.update({
      where: { assignmentId_userId: { assignmentId, userId } },
      data: { score, feedback, status: "GRADED", gradedAt: new Date() },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
