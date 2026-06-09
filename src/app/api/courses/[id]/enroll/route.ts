import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MAHASISWA") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id: courseId } = await params;
    const course = await prisma.course.findUnique({ where: { id: courseId, isPublished: true } });
    if (!course) return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    const existing = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: session.user.id, courseId } } });
    if (existing) return NextResponse.json({ error: "Sudah terdaftar di kursus ini." }, { status: 409 });
    const enrollment = await prisma.enrollment.create({ data: { userId: session.user.id, courseId } });
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
