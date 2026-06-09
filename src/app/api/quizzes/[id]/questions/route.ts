import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Add single question
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOSEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: quizId } = await params;
    const { text, points, explanation, options } = await req.json();

    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { course: true } });
    if (!quiz || quiz.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!text || !options || options.length < 2) {
      return NextResponse.json({ error: "Soal butuh minimal 2 pilihan." }, { status: 400 });
    }

    if (!options.some((o: { isCorrect: boolean }) => o.isCorrect)) {
      return NextResponse.json({ error: "Harus ada minimal 1 jawaban benar." }, { status: 400 });
    }

    const count = await prisma.question.count({ where: { quizId } });

    const question = await prisma.question.create({
      data: {
        quizId,
        text,
        points: points ?? 1,
        explanation: explanation || null,
        order: count + 1,
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

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
