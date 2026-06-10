export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOSEN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { courseId, title, order } = await req.json();
    if (!courseId || !title) return NextResponse.json({ error: "courseId dan title wajib diisi." }, { status: 400 });
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course || course.instructorId !== session.user.id) return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    const module = await prisma.module.create({ data: { courseId, title, order: order ?? 0 } });
    return NextResponse.json(module, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
