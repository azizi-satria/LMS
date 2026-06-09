import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

    const assignments = await prisma.assignment.findMany({
      where: { module: { courseId } },
      include: { module: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assignments);
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

    const { moduleId, title, description, deadline, maxScore } = await req.json();

    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { course: true },
    });
    if (!module || module.course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        moduleId,
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        maxScore: maxScore ?? 100,
      },
      include: { module: { select: { title: true } } },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
