import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, nim, nip } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Semua kolom wajib diisi." },
        { status: 400 }
      );
    }

    if (!["MAHASISWA", "DOSEN", "UMUM"].includes(role)) {
      return NextResponse.json(
        { error: "Peran tidak valid." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Gunakan email lain." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        nim: role === "MAHASISWA" ? nim : null,
        nip: role === "DOSEN" ? nip : null,
        isVerified: role !== "DOSEN", // DOSEN requires admin approval
      },
    });

    if (role === "DOSEN") {
      return NextResponse.json(
        { message: "Pendaftaran berhasil. Akun Anda menunggu persetujuan admin sebelum bisa login." },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
