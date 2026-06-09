import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOSEN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { moduleId, title, type, contentUrl, order } = await req.json();
    if (!moduleId || !title || !type || !contentUrl) return NextResponse.json({ error: "moduleId, title, type, dan contentUrl wajib diisi." }, { status: 400 });
    const validTypes = ["VIDEO", "PDF", "DOCUMENT", "LINK"];
    if (!validTypes.includes(type)) return NextResponse.json({ error: "Tipe materi tidak valid." }, { status: 400 });
    const module = await prisma.module.findUnique({ where: { id: moduleId }, include: { course: true } });
    if (!module || module.course.instructorId !== session.user.id) return NextResponse.json({ error: "Modul tidak ditemukan." }, { status: 404 });
    const material = await prisma.material.create({ data: { moduleId, title, type, contentUrl, order: order ?? 0 } });
    return NextResponse.json(material, { status: 201 });
  } catch (error) { console.error(error); return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
