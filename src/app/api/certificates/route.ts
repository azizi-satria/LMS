export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session.user.id;

    const certificates = await prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          include: { instructor: { select: { name: true } } },
        },
      },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json(certificates);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
