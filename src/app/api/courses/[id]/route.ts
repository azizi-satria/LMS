export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { name: true, email: true } },
        modules: {
          orderBy: { order: "asc" },
          include: {
            materials: { orderBy: { order: "asc" } },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    if (!session?.user) {
      if (course.visibility !== "PUBLIC" || !course.isApproved) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else if (session.user.role === "DOSEN" && course.instructorId !== session.user.id) {
      if (course.visibility === "DRAFT") {
        return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
      }
    } else if (session.user.role === "UMUM") {
      if (course.visibility !== "PUBLIC" || !course.isApproved) {
        return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
      }
    }

    let isEnrolled = false;
    let completedMaterialIds: string[] = [];
    let payment = null;

    if (session?.user) {
      if (session.user.role === "MAHASISWA" || session.user.role === "UMUM") {
        const enrollment = await prisma.enrollment.findUnique({
          where: { userId_courseId: { userId: session.user.id, courseId: id } },
        });
        isEnrolled = !!enrollment;

        if (!isEnrolled && course.price > 0) {
          payment = await prisma.payment.findUnique({
            where: { userId_courseId: { userId: session.user.id, courseId: id } },
          });
        }

        if (isEnrolled) {
          const progress = await prisma.materialProgress.findMany({
            where: { userId: session.user.id },
            select: { materialId: true },
          });
          completedMaterialIds = progress.map((p) => p.materialId);
        }
      } else if (session.user.role === "DOSEN") {
        isEnrolled = course.instructorId === session.user.id;
      } else if (session.user.role === "ADMIN") {
        isEnrolled = true;
      }
    }

    return NextResponse.json({ course, isEnrolled, completedMaterialIds, payment });
  } catch (error) {
    console.error("GET /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "DOSEN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, semester, visibility, price } = await req.json();

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.instructorId !== session.user.id) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { title, description, semester };

    if (visibility === "INTERNAL" && course.visibility === "DRAFT") {
      updateData.visibility = "INTERNAL";
    } else if (visibility === "DRAFT") {
      updateData.visibility = "DRAFT";
      updateData.isApproved = false;
    } else if (visibility) {
      updateData.visibility = visibility;
    }

    if (typeof price === "number") {
      updateData.price = price;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    const canDelete =
      session.user.role === "ADMIN" ||
      (session.user.role === "DOSEN" && course.instructorId === session.user.id);

    if (!canDelete) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ message: "Kursus berhasil dihapus." });
  } catch (error) {
    console.error("DELETE /api/courses/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
