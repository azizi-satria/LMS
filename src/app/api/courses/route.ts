import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const visibilityParam = searchParams.get("visibility");

    let where: Record<string, unknown> = {};

    if (!session?.user) {
      where = { visibility: "PUBLIC", isApproved: true };
    } else if (session.user.role === "DOSEN") {
      where = { instructorId: session.user.id };
    } else if (session.user.role === "MAHASISWA") {
      where = { visibility: { in: ["INTERNAL", "PUBLIC"] }, isApproved: true };
    } else if (session.user.role === "UMUM") {
      where = { visibility: "PUBLIC", isApproved: true };
    } else if (session.user.role === "ADMIN") {
      if (visibilityParam) where = { visibility: visibilityParam };
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: { select: { name: true, email: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET /api/courses error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOSEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, semester } = await req.json();

    if (!title || !description || !semester) {
      return NextResponse.json(
        { error: "Judul, deskripsi, dan semester wajib diisi." },
        { status: 400 }
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        semester,
        visibility: "DRAFT",
        price: 0,
        instructorId: session.user.id,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("POST /api/courses error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
