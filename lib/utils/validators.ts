import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Full name must be at least 2 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm_password: z.string(),
    department: z.string().min(1, "Please enter your department."),
    student_id: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export const studySubmitSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(300),
  abstract: z.string().min(100, "Abstract must be at least 100 characters.").max(5000),
  adviser: z.string().min(2, "Please enter the adviser's name."),
  co_authors: z.string().optional(),
  date_completed: z.string().min(1, "Please select a completion date."),
  keywords: z
    .string()
    .min(1, "Please enter at least one keyword.")
    .refine(
      (val) => val.split(",").filter(Boolean).length >= 3,
      "Please enter at least 3 keywords separated by commas."
    ),
  citation: z.string().optional(),
  year_level: z.string().optional(),
  course: z.string().optional(),
  department: z.string().min(1, "Please enter your department."),
  category_id: z.string().uuid("Please select a valid category."),
});

export const commentSchema = z.object({
  body: z
    .string()
    .min(3, "Comment must be at least 3 characters.")
    .max(2000, "Comment cannot exceed 2000 characters."),
});

export const validationSchema = z.object({
  status: z.enum(["approved", "rejected", "revision_requested"]),
  notes: z.string().max(2000).optional(),
});

export const searchSchema = z.object({
  query: z.string().optional(),
  category_id: z.string().uuid().optional(),
  year_from: z.coerce.number().min(1900).max(2100).optional(),
  year_to: z.coerce.number().min(1900).max(2100).optional(),
  adviser: z.string().optional(),
  sort_by: z
    .enum(["relevance", "date_desc", "date_asc", "downloads"])
    .optional()
    .default("relevance"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type StudySubmitInput = z.infer<typeof studySubmitSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type ValidationInput = z.infer<typeof validationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
