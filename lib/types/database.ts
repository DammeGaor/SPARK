// This file is a placeholder for Supabase generated types.
// To generate the full typed version, run:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          role: "student" | "faculty" | "admin";
          department: string | null;
          student_id: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          role?: "student" | "faculty" | "admin";
          department?: string | null;
          student_id?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          role?: "student" | "faculty" | "admin";
          department?: string | null;
          student_id?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      studies: {
        Row: {
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
          status: "pending" | "approved" | "rejected" | "revision_requested";
          is_published: boolean;
          submitted_at: string;
          published_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          abstract: string;
          author_id: string;
          co_authors?: string[] | null;
          adviser: string;
          date_completed: string;
          keywords?: string[];
          citation?: string | null;
          year_level?: string | null;
          course?: string | null;
          department?: string | null;
          category_id?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          file_size_bytes?: number | null;
          status?: "pending" | "approved" | "rejected" | "revision_requested";
          is_published?: boolean;
          submitted_at?: string;
          published_at?: string | null;
          updated_at?: string;
        };
        Update: {
          title?: string;
          abstract?: string;
          adviser?: string;
          date_completed?: string;
          keywords?: string[];
          citation?: string | null;
          year_level?: string | null;
          course?: string | null;
          department?: string | null;
          category_id?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          file_size_bytes?: number | null;
          status?: "pending" | "approved" | "rejected" | "revision_requested";
          is_published?: boolean;
          published_at?: string | null;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          color?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          color?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          study_id: string;
          user_id: string;
          body: string;
          parent_id: string | null;
          is_deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          study_id: string;
          user_id: string;
          body: string;
          parent_id?: string | null;
          is_deleted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          is_deleted?: boolean;
          updated_at?: string;
        };
      };
      downloads: {
        Row: {
          id: string;
          study_id: string;
          downloader_id: string | null;
          downloaded_at: string;
        };
        Insert: {
          id?: string;
          study_id: string;
          downloader_id?: string | null;
          downloaded_at?: string;
        };
        Update: Record<string, never>;
      };
      validations: {
        Row: {
          id: string;
          study_id: string;
          faculty_id: string;
          status: "pending" | "approved" | "rejected" | "revision_requested";
          notes: string | null;
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          study_id: string;
          faculty_id: string;
          status: "pending" | "approved" | "rejected" | "revision_requested";
          notes?: string | null;
          reviewed_at?: string;
        };
        Update: {
          status?: "pending" | "approved" | "rejected" | "revision_requested";
          notes?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: "download" | "comment" | "validation" | "system";
          study_id: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "download" | "comment" | "validation" | "system";
          study_id?: string | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "student" | "faculty" | "admin";
      study_status: "pending" | "approved" | "rejected" | "revision_requested";
      notification_type: "download" | "comment" | "validation" | "system";
    };
  };
}
