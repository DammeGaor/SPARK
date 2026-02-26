// ─────────────────────────────────────────────
// ENUMS (mirror Supabase enums)
// ─────────────────────────────────────────────
export type UserRole = "student" | "faculty" | "admin";
export type StudyStatus = "pending" | "approved" | "rejected" | "revision_requested";
export type NotificationType = "download" | "comment" | "validation" | "system";

// ─────────────────────────────────────────────
// ENTITIES
// ─────────────────────────────────────────────
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department: string | null;
  student_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
}

export interface Study {
  id: string;
  title: string;
  abstract: string;
  author_id: string;
  co_authors: string[] | null;
  adviser: string;
  date_completed: string;
  keywords: string[];
  citation: string | null;
  year_level: string | null;
  course: string | null;
  department: string | null;
  category_id: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  status: StudyStatus;
  is_published: boolean;
  submitted_at: string;
  published_at: string | null;
  updated_at: string;
  // Joined
  author?: Profile;
  category?: Category;
  _count?: {
    comments: number;
    downloads: number;
  };
}

export interface Comment {
  id: string;
  study_id: string;
  user_id: string;
  body: string;
  parent_id: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  user?: Profile;
  replies?: Comment[];
}

export interface Download {
  id: string;
  study_id: string;
  downloader_id: string | null;
  downloaded_at: string;
}

export interface Validation {
  id: string;
  study_id: string;
  faculty_id: string;
  status: StudyStatus;
  notes: string | null;
  reviewed_at: string;
  // Joined
  faculty?: Profile;
  study?: Study;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  study_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────
// FORM SCHEMAS (used with react-hook-form + zod)
// ─────────────────────────────────────────────
export interface StudySubmitForm {
  title: string;
  abstract: string;
  adviser: string;
  co_authors: string;         // comma-separated, parsed before submit
  date_completed: string;
  keywords: string;           // comma-separated, parsed before submit
  citation: string;
  year_level: string;
  course: string;
  department: string;
  category_id: string;
  file: FileList;
}

export interface SearchFilters {
  query: string;
  category_id?: string;
  year_from?: number;
  year_to?: number;
  adviser?: string;
  keywords?: string[];
  sort_by?: "relevance" | "date_desc" | "date_asc" | "downloads";
}

// ─────────────────────────────────────────────
// API RESPONSES
// ─────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}
