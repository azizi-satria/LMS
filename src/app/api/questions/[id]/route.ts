export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOSEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const question = await prisma.question.findUnique({
      where: { id },
      include: { quiz: { include: { course: true } } },
    });

    if (!question || question.quiz.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ message: "Soal dihapus." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOSEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { text, points, explanation, options } = await req.json();

    const question = await prisma.question.findUnique({
      where: { id },
      include: { quiz: { include: { course: true } } },
    });

    if (!question || question.quiz.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete old options, recreate
    await prisma.questionOption.deleteMany({ where: { questionId: id } });

    const updated = await prisma.question.update({
      where: { id },
      data: {
        text,
        points: points ?? 1,
        explanation: explanation || null,
        options: {
          create: options.map((o: { text: string; isCorrect: boolean }, idx: number) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            order: idx + 1,
          })),
        },
      },
      include: { options: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
