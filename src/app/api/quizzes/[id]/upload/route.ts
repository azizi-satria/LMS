export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Bulk upload questions via JSON
// Format: [{ text, points, explanation, options: [{ text, isCorrect }] }]
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
    const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { course: true } });
    if (!quiz || quiz.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const questions = await req.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Format tidak valid. Harus array of questions." }, { status: 400 });
    }

    // Validate each question
    for (const q of questions) {
      if (!q.text) return NextResponse.json({ error: `Soal tanpa teks ditemukan.` }, { status: 400 });
      if (!q.options || q.options.length < 2) return NextResponse.json({ error: `Soal "${q.text}" butuh minimal 2 pilihan.` }, { status: 400 });
      if (!q.options.some((o: { isCorrect: boolean }) => o.isCorrect)) return NextResponse.json({ error: `Soal "${q.text}" tidak punya jawaban benar.` }, { status: 400 });
    }

    const startOrder = await prisma.question.count({ where: { quizId } });

    // Bulk insert
    const created = await prisma.$transaction(
      questions.map((q, idx) =>
        prisma.question.create({
          data: {
            quizId,
            text: q.text,
            points: q.points ?? 1,
            explanation: q.explanation || null,
            order: startOrder + idx + 1,
            options: {
              create: q.options.map((o: { text: string; isCorrect: boolean }, oidx: number) => ({
                text: o.text,
                isCorrect: o.isCorrect,
                order: oidx + 1,
              })),
            },
          },
        })
      )
    );

    return NextResponse.json({ inserted: created.length }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
