/**
 * Jalankan script ini SEKALI setelah deploy pertama ke production:
 *
 *   DATABASE_URL="postgresql://..." node scripts/deploy-setup.js
 *
 * Script ini akan:
 * 1. Menjalankan semua migration database
 * 2. Membuat akun admin pertama
 */

const { execSync } = require("child_process");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  console.log("🚀 Menjalankan migration database...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });

  const prisma = new PrismaClient();

  console.log("\n👤 Membuat akun admin...");
  const email = process.env.ADMIN_EMAIL || "admin@lms.ac.id";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { role: "ADMIN", isVerified: true, password: hashed },
    create: {
      name: "Administrator",
      email,
      password: hashed,
      role: "ADMIN",
      isVerified: true,
    },
  });

  // Fix existing users
  await prisma.user.updateMany({
    where: { isVerified: false },
    data: { isVerified: true },
  });

  console.log("✅ Selesai!");
  console.log(`   Admin email   : ${admin.email}`);
  console.log(`   Admin password: ${password}`);
  console.log("\n⚠️  Segera ganti password admin setelah login pertama!");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
