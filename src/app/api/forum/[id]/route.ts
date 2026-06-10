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
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const thread = await prisma.forumThread.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, role: true } },
        replies: {
          where: { parentId: null },
          include: {
            user: { select: { name: true, role: true } },
            replies: {
              include: { user: { select: { name: true, role: true } } },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!thread) return NextResponse.json({ error: "Thread tidak ditemukan." }, { status: 404 });

    return NextResponse.json(thread);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: threadId } = await params;
    const { content, parentId } = await req.json();

    const reply = await prisma.forumReply.create({
      data: { threadId, userId: session.user.id, content, parentId: parentId || null },
      include: { user: { select: { name: true, role: true } } },
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
