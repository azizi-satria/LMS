import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.platformSettings.upsert({
      where: { id: "global" },
      update: {},
      create: { id: "global" },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bankName, vaPrefix, vaExpiryHours } = await req.json();

    const settings = await prisma.platformSettings.upsert({
      where: { id: "global" },
      update: {
        bankName: bankName ?? undefined,
        vaPrefix: vaPrefix ?? undefined,
        vaExpiryHours: vaExpiryHours ?? undefined,
      },
      create: {
        id: "global",
        bankName: bankName ?? "BCA Virtual Account",
        vaPrefix: vaPrefix ?? "8808",
        vaExpiryHours: vaExpiryHours ?? 24,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
