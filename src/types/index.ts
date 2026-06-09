export type Role = "ADMIN" | "DOSEN" | "MAHASISWA" | "UMUM";
export type MaterialType = "VIDEO" | "PDF" | "DOCUMENT" | "LINK";
export type CourseVisibility = "DRAFT" | "INTERNAL" | "PUBLIC";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PaymentStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "EXPIRED";

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
  visibility: CourseVisibility;
  price: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
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

export interface CourseApproval {
  id: string;
  courseId: string;
  requestedBy: string;
  targetVisibility: CourseVisibility;
  suggestedPrice?: number | null;
  requesterNotes?: string | null;
  status: ApprovalStatus;
  adminNotes?: string | null;
  finalPrice?: number | null;
  reviewedBy?: string | null;
  createdAt: Date;
  reviewedAt?: Date | null;
  course?: Course;
  requester?: User;
  reviewer?: User;
}

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  vaNumber: string;
  bankName: string;
  status: PaymentStatus;
  confirmedBy?: string | null;
  confirmedAt?: Date | null;
  expiredAt: Date;
  createdAt: Date;
  user?: User;
  course?: Course;
}

export interface PlatformSettings {
  id: string;
  bankName: string;
  vaPrefix: string;
  vaExpiryHours: number;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
