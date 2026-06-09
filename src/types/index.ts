export type Role = "ADMIN" | "DOSEN" | "MAHASISWA";
export type MaterialType = "VIDEO" | "PDF" | "DOCUMENT" | "LINK";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  nim?: string | null;
  nip?: string | null;
  createdAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  semester: string;
  isPublished: boolean;
  createdAt: Date;
  instructor?: User;
  modules?: Module[];
  enrollments?: Enrollment[];
  _count?: { enrollments: number; modules: number };
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  order: number;
  materials?: Material[];
}

export interface Material {
  id: string;
  moduleId: string;
  title: string;
  type: MaterialType;
  contentUrl: string;
  order: number;
  progress?: MaterialProgress[];
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  user?: User;
  course?: Course;
}

export interface MaterialProgress {
  id: string;
  userId: string;
  materialId: string;
  completedAt: Date;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
