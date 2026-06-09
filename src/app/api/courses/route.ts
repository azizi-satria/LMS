import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const published = searchParams.get("published");
    const where = session.user.role === "DOSEN" ? { instructorId: session.user.id } : session.user.role === "MAHASISWA" ? { isPublished: true } : published === "true" ? { isPublished: true } : {};
    const courses = await prisma.course.findMany({ where, include: { instructor: { select: { name: true, email: true } }, _count: { select: { enrollments: true, modules: true } } }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(courses);
  } catch (error) { console.error(error); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOSEN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { title, description, semester, isPublished } = await req.json();
    if (!title || !description || !semester) return NextResponse.json({ error: "Judul, deskripsi, dan semester wajib diisi." }, { status: 400 });
    const course = await prisma.course.create({ data: { title, description, semester, isPublished: isPublished ?? false, instructorId: session.user.id } });
    return NextResponse.json(course, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
