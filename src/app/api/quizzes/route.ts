import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const moduleId = searchParams.get("moduleId");
    const type = searchParams.get("type");

    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;
    if (moduleId) where.moduleId = moduleId;
    if (type) where.type = type;

    const quizzes = await prisma.quiz.findMany({
      where,
      include: { _count: { select: { questions: true, attempts: true } } },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOSEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId, moduleId, type, title, description, passingScore, timeLimit, randomize } = await req.json();

    if (!courseId || !type || !title) {
      return NextResponse.json({ error: "courseId, type, dan title wajib diisi." }, { status: 400 });
    }

    // Verify ownership
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        courseId,
        moduleId: moduleId || null,
        type,
        title,
        description: description || null,
        passingScore: passingScore ?? 70,
        timeLimit: timeLimit || null,
        randomize: randomize ?? false,
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
