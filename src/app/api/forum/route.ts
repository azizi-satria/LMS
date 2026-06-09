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

    const threads = await prisma.forumThread.findMany({
      where: { courseId },
      include: {
        user: { select: { name: true, role: true } },
        _count: { select: { replies: true } },
      },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(threads);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { courseId, title, content } = await req.json();

    const thread = await prisma.forumThread.create({
      data: { courseId, userId: session.user.id, title, content },
      include: { user: { select: { name: true, role: true } } },
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
