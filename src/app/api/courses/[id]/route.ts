import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const course = await prisma.course.findUnique({
      where: { id },
      include: { instructor: { select: { name: true, email: true } }, modules: { orderBy: { order: "asc" }, include: { materials: { orderBy: { order: "asc" } } } }, _count: { select: { enrollments: true } } },
    });
    if (!course) return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    let isEnrolled = false;
    let completedMaterialIds: string[] = [];
    if (session.user.role === "MAHASISWA") {
      const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: session.user.id, courseId: id } } });
      isEnrolled = !!enrollment;
      if (isEnrolled) {
        const progress = await prisma.materialProgress.findMany({ where: { userId: session.user.id }, select: { materialId: true } });
        completedMaterialIds = progress.map((p) => p.materialId);
      }
    } else if (session.user.role === "DOSEN") {
      isEnrolled = course.instructorId === session.user.id;
    } else if (session.user.role === "ADMIN") {
      isEnrolled = true;
    }
    return NextResponse.json({ course, isEnrolled, completedMaterialIds });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOSEN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;
    const { title, description, semester, isPublished } = await req.json();
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.instructorId !== session.user.id) return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    const updated = await prisma.course.update({ where: { id }, data: { title, description, semester, isPublished } });
    return NextResponse.json(updated);
  } catch (error) { console.error(error); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
