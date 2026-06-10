import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json(); // "approve" | "reject"

    if (action === "approve") {
      const user = await prisma.user.update({
        where: { id },
        data: { isVerified: true },
        select: { id: true, name: true, email: true },
      });
      return NextResponse.json({ message: "Dosen disetujui.", user });
    }

    if (action === "reject") {
      await prisma.user.delete({ where: { id } });
      return NextResponse.json({ message: "Pendaftaran ditolak dan akun dihapus." });
    }

    return NextResponse.json({ error: "Action tidak valid." }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
