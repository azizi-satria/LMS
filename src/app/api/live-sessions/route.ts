export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const sessions = await prisma.liveSession.findMany({
      where: courseId ? { courseId } : {},
      orderBy: { startAt: "asc" },
    });

    return NextResponse.json(sessions);
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

    const { courseId, title, description, zoomLink, startAt, endAt } = await req.json();

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const liveSession = await prisma.liveSession.create({
      data: { courseId, title, description, zoomLink, startAt: new Date(startAt), endAt: new Date(endAt) },
    });

    return NextResponse.json(liveSession, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
