export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "MAHASISWA") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { materialId } = await req.json();
    if (!materialId) return NextResponse.json({ error: "materialId wajib diisi." }, { status: 400 });
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { module: { include: { course: { include: { enrollments: { where: { userId: session.user.id } } } } } } },
    });
    if (!material) return NextResponse.json({ error: "Materi tidak ditemukan." }, { status: 404 });
    if (material.module.course.enrollments.length === 0) return NextResponse.json({ error: "Anda belum terdaftar di kursus ini." }, { status: 403 });
    const progress = await prisma.materialProgress.upsert({
      where: { userId_materialId: { userId: session.user.id, materialId } },
      update: {},
      create: { userId: session.user.id, materialId },
    });
    return NextResponse.json(progress, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const where = courseId ? { userId: session.user.id, material: { module: { courseId } } } : { userId: session.user.id };
    const progress = await prisma.materialProgress.findMany({ where, select: { materialId: true, completedAt: true } });
    return NextResponse.json(progress);
  } catch (error) { console.error(error); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
