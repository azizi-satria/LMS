export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const withAnswers = searchParams.get("withAnswers") === "true";

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            options: {
              orderBy: { order: "asc" },
              select: {
                id: true,
                text: true,
                order: true,
                // Only include isCorrect for instructors/admin
                ...(session.user.role === "DOSEN" || session.user.role === "ADMIN" || withAnswers
                  ? { isCorrect: true }
                  : {}),
              },
            },
          },
        },
      },
    });

    if (!quiz) return NextResponse.json({ error: "Quiz tidak ditemukan." }, { status: 404 });

    // Get user's best attempt
    let bestAttempt = null;
    if (session.user.role === "MAHASISWA" || session.user.role === "UMUM") {
      bestAttempt = await prisma.quizAttempt.findFirst({
        where: { quizId: id, userId: session.user.id },
        orderBy: { score: "desc" },
      });
    }

    return NextResponse.json({ quiz, bestAttempt });
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
    const { title, description, passingScore, timeLimit, randomize } = await req.json();

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!quiz || quiz.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updated = await prisma.quiz.update({
      where: { id },
      data: { title, description, passingScore, timeLimit, randomize },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

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
    const quiz = await prisma.quiz.findUnique({ where: { id }, include: { course: true } });
    if (!quiz || quiz.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.quiz.delete({ where: { id } });
    return NextResponse.json({ message: "Quiz dihapus." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
