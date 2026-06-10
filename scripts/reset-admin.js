const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = "admin@lms.ac.id";
  const password = "admin123";
  const name = "Administrator";

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashed,
      role: "ADMIN",
      isVerified: true,
    },
    create: {
      name,
      email,
      password: hashed,
      role: "ADMIN",
      isVerified: true,
    },
  });

  console.log("✅ Admin berhasil dibuat/diperbarui:");
  console.log("   Email   :", user.email);
  console.log("   Password: admin123");
  console.log("   Role    :", user.role);

  // Also fix all existing users - set isVerified = true
  const updated = await prisma.user.updateMany({
    where: { isVerified: false, role: { not: "DOSEN" } },
    data: { isVerified: true },
  });
  console.log(`✅ ${updated.count} user lain diset isVerified = true`);

  // Fix existing DOSEN - set isVerified = true (so existing dosen can still login)
  const dosenUpdated = await prisma.user.updateMany({
    where: { role: "DOSEN" },
    data: { isVerified: true },
  });
  console.log(`✅ ${dosenUpdated.count} dosen existing diset isVerified = true`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
