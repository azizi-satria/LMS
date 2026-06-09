import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Submit quiz attempt
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: quizId } = await params;
    // answers: [{ questionId, optionId }]
    const { answers } = await req.json();

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: { options: true },
        },
      },
    });

    if (!quiz) return NextResponse.json({ error: "Quiz tidak ditemukan." }, { status: 404 });

    // Calculate score
    let earnedPoints = 0;
    let totalPoints = 0;
    const answerDetails: {
      questionId: string;
      optionId: string;
      isCorrect: boolean;
    }[] = [];

    for (const q of quiz.questions) {
      totalPoints += q.points;
      const userAnswer = answers.find((a: { questionId: string }) => a.questionId === q.id);
      if (userAnswer) {
        const option = q.options.find((o) => o.id === userAnswer.optionId);
        const isCorrect = option?.isCorrect ?? false;
        if (isCorrect) earnedPoints += q.points;
        answerDetails.push({
          questionId: q.id,
          optionId: userAnswer.optionId,
          isCorrect,
        });
      }
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassed = score >= quiz.passingScore;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: session.user.id,
        score,
        totalPoints,
        isPassed,
        completedAt: new Date(),
        answers: {
          create: answerDetails,
        },
      },
      include: {
        answers: {
          include: {
            question: { include: { options: true } },
            option: true,
          },
        },
      },
    });

    // If post-test passed, auto-generate certificate
    if (quiz.type === "POST_TEST" && isPassed) {
      const existingCert = await prisma.certificate.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: quiz.courseId } },
      });
      if (!existingCert) {
        const code = `CERT-${quiz.courseId.slice(-6).toUpperCase()}-${session.user.id.slice(-6).toUpperCase()}-${Date.now()}`;
        await prisma.certificate.create({
          data: { userId: session.user.id, courseId: quiz.courseId, code },
        });
      }
    }

    return NextResponse.json({ attempt, score, isPassed, earnedPoints, totalPoints });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Get attempts for current user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: quizId } = await params;

    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId, userId: session.user.id },
      orderBy: { startedAt: "desc" },
      include: {
        answers: {
          include: {
            question: true,
            option: true,
          },
        },
      },
    });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
