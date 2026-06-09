import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: assignmentId } = await params;
    const { content, fileUrl } = await req.json();

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) return NextResponse.json({ error: "Tugas tidak ditemukan." }, { status: 404 });

    if (assignment.deadline && new Date() > assignment.deadline) {
      return NextResponse.json({ error: "Batas waktu pengumpulan sudah lewat." }, { status: 400 });
    }

    const submission = await prisma.assignmentSubmission.upsert({
      where: { assignmentId_userId: { assignmentId, userId: session.user.id } },
      update: { content, fileUrl: fileUrl || null, status: "SUBMITTED", submittedAt: new Date() },
      create: {
        assignmentId,
        userId: session.user.id,
        content,
        fileUrl: fileUrl || null,
        status: "SUBMITTED",
      },
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
