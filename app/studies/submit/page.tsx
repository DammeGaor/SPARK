"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  Upload, FileText, X, CheckCircle2, Loader2, ChevronRight,
  BookOpen, Tag, User, Calendar, Building2, GraduationCap, Hash, Link as LinkIcon, AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Category {
  id: string;
  name: string;
  color: string;
}

// ─── Schema ──────────────────────────────────────────────────────────────────
const submitSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(300),
  abstract: z.string().min(100, "Abstract must be at least 100 characters.").max(5000),
  adviser: z.string().min(2, "Please enter the adviser's name."),
  date_completed: z.string().min(1, "Please select a completion date."),
  keywords: z.string().min(1, "Please enter at least one keyword.").refine(
    (val) => val.split(",").filter((k) => k.trim()).length >= 3,
    "Please enter at least 3 keywords, separated by commas."
  ),
  citation: z.string().optional(),
  course: z.string().min(1, "Please enter your course."),
  department: z.string().min(1, "Please enter your department."),
  category_id: z.string().min(1, "Please select a category."),
});

type SubmitInput = z.infer<typeof submitSchema>;

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, error, hint, children, required }: {
  label: string; error?: string; hint?: string; children: React.ReactNode; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-maroon-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-maroon-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Input styles ─────────────────────────────────────────────────────────────
const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-maroon-200 bg-white text-maroon-900 placeholder-maroon-300 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-all";

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-maroon-100 overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-maroon-50"
        style={{ background: "linear-gradient(135deg, #fdf6f0, #fff)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #8f153520, #6b0f2420)" }}>
          <Icon size={15} className="text-maroon-600" />
        </div>
        <h2 className="font-serif text-base font-semibold text-maroon-800">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

// ─── Main form ────────────────────────────────────────────────────────────────
function SubmitForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SubmitInput>({
    resolver: zodResolver(submitSchema),
  });

  const abstractValue = watch("abstract", "");
  const keywordsValue = watch("keywords", "");
  const keywordCount = keywordsValue.split(",").filter((k) => k.trim()).length;

  // Load categories & check auth
  useEffect(() => {
    async function init() {
      const supabase = createClient();

      // Auth check
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to submit a study.");
        router.push("/login?redirectTo=/studies/submit");
        return;
      }

      // Fetch categories
      const { data } = await supabase.from("categories").select("id, name, color").order("name");
      if (data) setCategories(data);
    }
    init();
  }, [router]);

  // PDF handling
  function handlePdfSelect(file: File) {
    setPdfError(null);
    if (file.type !== "application/pdf") {
      setPdfError("Only PDF files are accepted.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setPdfError("File must be under 20 MB.");
      return;
    }
    setPdfFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePdfSelect(file);
  }

  // Submit
  async function onSubmit(data: SubmitInput) {
    if (!pdfFile) {
      setPdfError("Please upload your study as a PDF.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1. Upload PDF to storage
      setUploadProgress(20);
      const fileExt = "pdf";
      const fileName = `${user.id}/${Date.now()}-${pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("study-files")
        .upload(fileName, pdfFile, { cacheControl: "3600", upsert: false });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
      setUploadProgress(60);

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("study-files")
        .getPublicUrl(uploadData.path);

      setUploadProgress(80);

      // 3. Insert study record
      const keywords = data.keywords.split(",").map((k) => k.trim()).filter(Boolean);

      const { error: insertError } = await supabase.from("studies").insert({
        title: data.title.trim(),
        abstract: data.abstract.trim(),
        adviser: data.adviser.trim(),
        co_authors: null,
        date_completed: data.date_completed,
        keywords,
        citation: data.citation?.trim() || null,
        year_level: null,
        course: data.course.trim(),
        department: data.department.trim(),
        category_id: data.category_id,
        file_url: publicUrl,
        file_name: pdfFile.name,
        file_size_bytes: pdfFile.size,
        author_id: user.id,
        status: "pending",
        is_published: false,
      });

      if (insertError) throw new Error(`Submission failed: ${insertError.message}`);

      setUploadProgress(100);
      setIsSuccess(true);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }

  // ── Success state ────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-parchment-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ background: "linear-gradient(135deg, #2E7D32, #1b5e20)" }}>
            <CheckCircle2 size={36} className="text-white" />
          </div>
          <h1 className="font-serif text-3xl text-maroon-800 font-bold mb-3">Study Submitted!</h1>
          <p className="text-maroon-500 text-sm leading-relaxed mb-2">
            Your study has been submitted successfully and is now <strong className="text-maroon-700">pending validation</strong> by a faculty member.
          </p>
          <p className="text-maroon-400 text-xs mb-8">
            You will be notified once your submission has been reviewed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/studies")}
              className="px-6 py-2.5 rounded-xl text-parchment-50 text-sm font-medium shadow-sm hover:shadow-md transition-all"
              style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}
            >
              Browse Studies
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="px-6 py-2.5 rounded-xl border-2 border-maroon-200 text-maroon-700 text-sm font-medium hover:bg-maroon-50 transition-all"
            >
              View My Submissions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-parchment-50">

      {/* Header */}
      <div className="border-b border-maroon-100 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
                <span className="text-parchment-100 font-serif font-bold text-xs">SP</span>
              </div>
              <span className="font-serif font-bold text-maroon-800 text-base">SPARK</span>
            </a>
            <ChevronRight size={14} className="text-maroon-300" />
            <span className="text-sm text-maroon-500 font-medium">Submit Study</span>
          </div>
          <a href="/studies" className="text-xs text-maroon-400 hover:text-maroon-700 transition-colors">
            Cancel
          </a>
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #6b0f24 0%, #8f1535 60%, #5a0c1c 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #faf3e0 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }} />
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-upgreen-500" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
          <p className="text-upgreen-300 text-xs tracking-widest uppercase mb-2">Research Repository</p>
          <h1 className="font-serif text-3xl text-parchment-100 font-bold mb-2">Submit Your Study</h1>
          <p className="text-parchment-400 text-sm max-w-lg leading-relaxed">
            Fill in your research details below. Your submission will be reviewed by a faculty validator before being published.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Basic Info */}
        <Section icon={BookOpen} title="Basic Information">
          <Field label="Title" error={errors.title?.message} required
            hint="Enter the full title of your special problem or research.">
            <input
              {...register("title")}
              placeholder="e.g. Development of a Machine Learning Model for..."
              className={inputCls}
            />
          </Field>

          <Field label="Abstract" error={errors.abstract?.message} required
            hint={`${abstractValue.length}/5000 characters · minimum 100`}>
            <textarea
              {...register("abstract")}
              rows={6}
              placeholder="Provide a comprehensive summary of your research, including objectives, methodology, and findings..."
              className={`${inputCls} resize-none leading-relaxed`}
            />
          </Field>

          <Field label="Category" error={errors.category_id?.message} required>
            <select {...register("category_id")} className={inputCls}>
              <option value="">Select a research category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </Field>
        </Section>

        {/* Research Details */}
        <Section icon={GraduationCap} title="Research Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Adviser" error={errors.adviser?.message} required>
              <input
                {...register("adviser")}
                placeholder="e.g. Prof. Juan dela Cruz"
                className={inputCls}
              />
            </Field>

            <Field label="Date Completed" error={errors.date_completed?.message} required>
              <input
                {...register("date_completed")}
                type="date"
                max={new Date().toISOString().split("T")[0]}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Course" error={errors.course?.message} required
              hint="e.g. BS Computer Science">
              <input
                {...register("course")}
                placeholder="e.g. BS Computer Science"
                className={inputCls}
              />
            </Field>

            <Field label="Department" error={errors.department?.message} required
              hint="e.g. DCSC, DMATH">
              <input
                {...register("department")}
                placeholder="e.g. Department of Computer Science"
                className={inputCls}
              />
            </Field>
          </div>
        </Section>

        {/* Keywords & Citation */}
        <Section icon={Tag} title="Keywords & Citation">
          <Field label="Keywords" error={errors.keywords?.message} required
            hint={`${keywordCount} keyword${keywordCount !== 1 ? "s" : ""} · separate with commas · minimum 3`}>
            <input
              {...register("keywords")}
              placeholder="e.g. machine learning, neural networks, image classification"
              className={inputCls}
            />
          </Field>

          {keywordsValue && (
            <div className="flex flex-wrap gap-2">
              {keywordsValue.split(",").filter((k) => k.trim()).map((kw, i) => (
                <span key={i}
                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-maroon-50 border border-maroon-100 text-xs text-maroon-700 font-medium">
                  <Hash size={10} className="mr-1 opacity-60" />
                  {kw.trim()}
                </span>
              ))}
            </div>
          )}

          <Field label="Citation" error={errors.citation?.message}
            hint="APA, MLA, or Chicago format recommended. Leave blank if not yet available.">
            <textarea
              {...register("citation")}
              rows={3}
              placeholder="e.g. dela Cruz, J. (2024). Title of study. University of the Philippines."
              className={`${inputCls} resize-none`}
            />
          </Field>
        </Section>

        {/* PDF Upload */}
        <Section icon={FileText} title="Study File">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !pdfFile && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer
              ${pdfFile
                ? "border-upgreen-300 bg-upgreen-50/50 cursor-default"
                : isDragging
                  ? "border-maroon-500 bg-maroon-50 scale-[1.01]"
                  : "border-maroon-200 bg-parchment-50 hover:border-maroon-400 hover:bg-maroon-50/30"
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handlePdfSelect(e.target.files[0])}
            />

            {pdfFile ? (
              <div className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #2E7D3220, #1b5e2020)", border: "1.5px solid #2E7D3240" }}>
                  <FileText size={22} className="text-upgreen-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-maroon-800 truncate">{pdfFile.name}</p>
                  <p className="text-xs text-maroon-400 mt-0.5">
                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB · PDF
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPdfFile(null); setPdfError(null); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-maroon-400 hover:text-red-600 hover:bg-red-50 transition-all flex-shrink-0"
                >
                  <X size={15} />
                </button>
              </div>
            ) : (
              <div className="p-10 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg, #8f153515, #6b0f2415)", border: "1.5px solid #8f153525" }}>
                  <Upload size={24} className="text-maroon-500" />
                </div>
                <p className="text-sm font-medium text-maroon-700 mb-1">
                  {isDragging ? "Drop your PDF here" : "Drag & drop your PDF here"}
                </p>
                <p className="text-xs text-maroon-400 mb-4">or click to browse files</p>
                <span className="inline-flex items-center px-4 py-2 rounded-xl border border-maroon-200 bg-white text-xs font-medium text-maroon-600 shadow-sm">
                  Choose PDF file
                </span>
                <p className="text-xs text-maroon-300 mt-4">PDF only · Maximum 20 MB</p>
              </div>
            )}
          </div>

          {pdfError && (
            <p className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertCircle size={12} /> {pdfError}
            </p>
          )}
        </Section>

        {/* Notice */}
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-200">
          <AlertCircle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Your submission will be marked as <strong>pending</strong> and will not be publicly visible until a faculty member validates and approves it.
          </p>
        </div>

        {/* Upload progress */}
        {isSubmitting && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-maroon-500">
              <span>{uploadProgress < 60 ? "Uploading PDF..." : uploadProgress < 90 ? "Saving study..." : "Finalizing..."}</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1.5 bg-maroon-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${uploadProgress}%`,
                  background: "linear-gradient(90deg, #8f1535, #6b0f24)",
                }}
              />
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-parchment-50 font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
          style={{ background: isSubmitting ? "#a01c3a" : "linear-gradient(135deg, #8f1535 0%, #6b0f24 100%)" }}
        >
          {isSubmitting ? (
            <><Loader2 size={18} className="animate-spin" /> Submitting Study...</>
          ) : (
            <><Upload size={18} /> Submit for Validation</>
          )}
        </button>

      </form>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-parchment-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-maroon-600" />
      </div>
    }>
      <SubmitForm />
    </Suspense>
  );
}
