"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User, Mail, Building2, Hash, Camera, Loader2, CheckCircle2,
  KeyRound, Eye, EyeOff, AlertCircle, BookMarked, ChevronRight,
  Shield, GraduationCap, ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string | null;
  student_id: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Props {
  profile: Profile;
  submissionsCount: number;
  publishedCount: number;
}

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; border: string }> = {
  admin: { label: "Administrator", icon: Shield, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  faculty: { label: "Faculty", icon: GraduationCap, color: "text-upgreen-700", bg: "bg-upgreen-50", border: "border-upgreen-200" },
  student: { label: "Student", icon: User, color: "text-maroon-700", bg: "bg-maroon-50", border: "border-maroon-200" },
};

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-maroon-200 bg-white text-maroon-900 placeholder-maroon-300 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent transition-all";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-maroon-50"
        style={{ background: "linear-gradient(135deg, #fdf6f0, #fff)" }}>
        <h2 className="font-serif text-base font-semibold text-maroon-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function ProfileClient({ profile, submissionsCount, publishedCount }: Props) {
  const router = useRouter();
  const roleCfg = ROLE_CONFIG[profile.role] ?? ROLE_CONFIG.student;
  const RoleIcon = roleCfg.icon;

  // Profile form state
  const [fullName, setFullName] = useState(profile.full_name);
  const [department, setDepartment] = useState(profile.department ?? "");
  const [studentId, setStudentId] = useState(profile.student_id ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const initials = profile.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  // ── Avatar upload ─────────────────────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, or WebP images are accepted.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB.");
      return;
    }

    setAvatarUploading(true);
    const supabase = createClient();
    const fileName = `avatars/${profile.id}/${Date.now()}.${file.name.split(".").pop()}`;

    const { data, error } = await supabase.storage
      .from("study-files")
      .upload(fileName, file, { upsert: true });

    if (error) {
      toast.error("Failed to upload avatar.");
      setAvatarUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("study-files").getPublicUrl(data.path);

    const { error: updateError } = await supabase
      .from("profiles").update({ avatar_url: publicUrl }).eq("id", profile.id);

    if (updateError) {
      toast.error("Failed to save avatar.");
    } else {
      setAvatarUrl(publicUrl);
      toast.success("Avatar updated!");
      router.refresh();
    }
    setAvatarUploading(false);
  }

  // ── Save profile ──────────────────────────────────────────────────────────
  async function handleSaveProfile() {
    if (!fullName.trim()) { toast.error("Name cannot be empty."); return; }
    setSavingProfile(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({
      full_name: fullName.trim(),
      department: department.trim() || null,
      student_id: studentId.trim() || null,
    }).eq("id", profile.id);

    if (error) {
      toast.error("Failed to save profile.");
    } else {
      toast.success("Profile updated!");
      router.refresh();
    }
    setSavingProfile(false);
  }

  // ── Change password ───────────────────────────────────────────────────────
  async function handleChangePassword() {
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match."); return; }

    setSavingPassword(true);
    const supabase = createClient();

    // Re-authenticate first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    });

    if (signInError) {
      toast.error("Current password is incorrect.");
      setSavingPassword(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPassword(false);
  }

  return (
    <div className="min-h-screen bg-parchment-50">

      {/* Header */}
      <div className="border-b border-maroon-100 bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group">
              <Image
                src="/spark-logo.svg"
                alt="SPARK"
                width={120}
                height={38}
                priority
              />
            </Link>
            <ChevronRight size={14} className="text-maroon-300" />
            <span className="text-sm text-maroon-500 font-medium">Profile</span>
          </div>
          <Link href="/" className="flex items-center gap-1.5 text-xs text-maroon-400 hover:text-maroon-700 transition-colors">
            <ArrowLeft size={13} /> Back to Home
          </Link>
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
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-parchment-300/30 shadow-lg">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-parchment-100"
                    style={{ background: "rgba(250,243,224,0.15)" }}>
                    {initials}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-lg flex items-center justify-center bg-white border border-maroon-200 shadow-md hover:bg-parchment-50 transition-all"
              >
                {avatarUploading
                  ? <Loader2 size={12} className="animate-spin text-maroon-500" />
                  : <Camera size={12} className="text-maroon-600" />
                }
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Info */}
            <div>
              <h1 className="font-serif text-2xl text-parchment-100 font-bold">{profile.full_name}</h1>
              <p className="text-parchment-400 text-sm mt-0.5">{profile.email}</p>
              <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full border text-xs font-semibold ${roleCfg.bg} ${roleCfg.border} ${roleCfg.color}`}>
                <RoleIcon size={10} />
                {roleCfg.label}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div>
              <p className="font-serif text-2xl font-bold text-parchment-100">{submissionsCount}</p>
              <p className="text-parchment-400 text-xs mt-0.5">Total Submissions</p>
            </div>
            <div className="w-px bg-parchment-400/20" />
            <div>
              <p className="font-serif text-2xl font-bold text-parchment-100">{publishedCount}</p>
              <p className="text-parchment-400 text-xs mt-0.5">Published</p>
            </div>
            <div className="w-px bg-parchment-400/20" />
            <div>
              <p className="font-serif text-2xl font-bold text-parchment-100">
                {new Date(profile.created_at).getFullYear()}
              </p>
              <p className="text-parchment-400 text-xs mt-0.5">Member Since</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/profile/submissions"
            className="flex items-center gap-3 bg-white rounded-2xl border border-maroon-100 p-4 hover:border-maroon-300 hover:shadow-md transition-all group shadow-sm">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #8f153515, #6b0f2415)", border: "1.5px solid #8f153525" }}>
              <BookMarked size={16} className="text-maroon-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-maroon-800">My Submissions</p>
              <p className="text-xs text-maroon-400">{submissionsCount} studies</p>
            </div>
            <ChevronRight size={14} className="text-maroon-300 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {["admin", "faculty"].includes(profile.role) && (
            <Link href="/admin"
              className="flex items-center gap-3 bg-white rounded-2xl border border-maroon-100 p-4 hover:border-maroon-300 hover:shadow-md transition-all group shadow-sm">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #92400e15, #78350f15)", border: "1.5px solid #92400e25" }}>
                <RoleIcon size={16} className={roleCfg.color} />
              </div>
              <div>
                <p className="text-sm font-semibold text-maroon-800">Admin Panel</p>
                <p className="text-xs text-maroon-400">{roleCfg.label} access</p>
              </div>
              <ChevronRight size={14} className="text-maroon-300 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {/* Edit Profile */}
        <Section title="Personal Information">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-maroon-600 mb-1.5">
                <User size={11} className="inline mr-1" /> Full Name
              </label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon-600 mb-1.5">
                <Mail size={11} className="inline mr-1" /> Email Address
              </label>
              <input value={profile.email} disabled
                className={`${inputCls} opacity-60 cursor-not-allowed bg-parchment-50`} />
              <p className="text-xs text-maroon-400 mt-1">Email cannot be changed.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-maroon-600 mb-1.5">
                  <Building2 size={11} className="inline mr-1" /> Department
                </label>
                <input value={department} onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. DCSC" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-maroon-600 mb-1.5">
                  <Hash size={11} className="inline mr-1" /> Student ID
                </label>
                <input value={studentId} onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 2024-00001" className={inputCls} />
              </div>
            </div>
            <button onClick={handleSaveProfile} disabled={savingProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-parchment-50 text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
              {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </Section>

        {/* Change Password */}
        <Section title="Change Password">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-maroon-600 mb-1.5">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon-600 mb-1.5">New Password</label>
              <div className="relative">
                <input type={showNew ? "text" : "password"} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters" className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-300 hover:text-maroon-600 transition-colors">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-maroon-600 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <input type={showConfirm ? "text" : "password"} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password" className={`${inputCls} pr-10`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-300 hover:text-maroon-600 transition-colors">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="flex items-center gap-1 text-xs text-red-600 mt-1.5">
                  <AlertCircle size={11} /> Passwords do not match.
                </p>
              )}
            </div>
            <button onClick={handleChangePassword} disabled={savingPassword || !currentPassword || !newPassword}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-parchment-50 text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
              {savingPassword ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </Section>

      </div>
    </div>
  );
}
