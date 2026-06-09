# LMS - Learning Management System

Sistem Manajemen Pembelajaran Digital Universitas

## Tech Stack
- Next.js 14 (App Router)
- Tailwind CSS
- PostgreSQL + Prisma ORM
- NextAuth.js v5
- TypeScript

## Roles
- **Admin** - Manajemen pengguna & kursus
- **Dosen** - Buat & kelola kursus, modul, materi
- **Mahasiswa** - Enroll kursus & tracking progress

## Getting Started

```bash
npm install
cp .env.example .env.local
# Isi DATABASE_URL dan AUTH_SECRET di .env.local
npx prisma migrate dev
npm run dev
```

## Environment Variables

```
DATABASE_URL=postgresql://user:password@localhost:5432/lms
AUTH_SECRET=your-secret-key
```
