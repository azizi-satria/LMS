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

    const cert = await prisma.certificate.findFirst({
      where: { id, userId: session.user.id },
      include: {
        user: { select: { name: true } },
        course: {
          include: { instructor: { select: { name: true } } },
        },
      },
    });

    if (!cert) return NextResponse.json({ error: "Sertifikat tidak ditemukan" }, { status: 404 });

    const issuedDate = new Date(cert.issuedAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Generate simple HTML-based PDF-like content using SVG
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e1b4b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#312e81;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#f59e0b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d97706;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="560" fill="url(#bg)" />

  <!-- Border -->
  <rect x="20" y="20" width="760" height="520" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="8,4" rx="12" />
  <rect x="30" y="30" width="740" height="500" fill="none" stroke="#f59e0b" stroke-width="1" opacity="0.4" rx="8" />

  <!-- Gold top bar -->
  <rect x="20" y="20" width="760" height="8" fill="url(#gold)" rx="4" />

  <!-- Trophy icon area -->
  <circle cx="400" cy="110" r="50" fill="#f59e0b" opacity="0.15" />
  <text x="400" y="128" font-family="Arial" font-size="52" text-anchor="middle" fill="#f59e0b">🏆</text>

  <!-- Certificate of Completion -->
  <text x="400" y="195" font-family="Georgia, serif" font-size="14" text-anchor="middle" fill="#a5b4fc" letter-spacing="4" text-transform="uppercase">SERTIFIKAT PENYELESAIAN</text>

  <!-- Divider -->
  <line x1="240" y1="208" x2="560" y2="208" stroke="#f59e0b" stroke-width="1" opacity="0.6" />

  <!-- This certifies -->
  <text x="400" y="240" font-family="Georgia, serif" font-size="14" text-anchor="middle" fill="#c7d2fe">Ini menyatakan bahwa</text>

  <!-- Name -->
  <text x="400" y="285" font-family="Georgia, serif" font-size="32" text-anchor="middle" fill="#ffffff" font-weight="bold">${escapeXml(cert.user.name)}</text>

  <!-- Divider under name -->
  <line x1="200" y1="300" x2="600" y2="300" stroke="#f59e0b" stroke-width="1" opacity="0.4" />

  <!-- has successfully -->
  <text x="400" y="328" font-family="Georgia, serif" font-size="14" text-anchor="middle" fill="#c7d2fe">telah berhasil menyelesaikan</text>

  <!-- Course title -->
  <text x="400" y="368" font-family="Georgia, serif" font-size="20" text-anchor="middle" fill="#f59e0b" font-weight="bold">${escapeXml(cert.course.title)}</text>

  <!-- Instructor -->
  <text x="400" y="402" font-family="Arial, sans-serif" font-size="13" text-anchor="middle" fill="#a5b4fc">Instruktur: ${escapeXml(cert.course.instructor.name)}</text>

  <!-- Date and Code -->
  <text x="200" y="460" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#a5b4fc">Diterbitkan: ${issuedDate}</text>
  <text x="600" y="460" font-family="Arial, sans-serif" font-size="11" text-anchor="middle" fill="#6366f1">Kode: ${cert.code}</text>

  <!-- Bottom bar -->
  <rect x="20" y="512" width="760" height="8" fill="url(#gold)" rx="4" />
</svg>`;

    return new NextResponse(svgContent, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="Sertifikat-${cert.code}.svg"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
