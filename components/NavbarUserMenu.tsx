"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, User, BookMarked, LogOut, Shield, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Props {
  fullName: string;
  role: string;
}

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  admin: { label: "Admin", icon: Shield, color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  faculty: { label: "Faculty", icon: GraduationCap, color: "text-upgreen-700", bg: "bg-upgreen-50 border-upgreen-200" },
  student: { label: "Student", icon: User, color: "text-maroon-700", bg: "bg-maroon-50 border-maroon-200" },
};

export default function NavbarUserMenu({ fullName, role }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out.");
    router.push("/");
    router.refresh();
  }

  const roleCfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.student;
  const RoleIcon = roleCfg.icon;

  // First name only for display
  const firstName = fullName.split(" ")[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-maroon-200 bg-white hover:bg-maroon-50 transition-all shadow-sm group"
      >
        {/* Avatar initials */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold text-parchment-100"
          style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}
        >
          {fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
        </div>

        {/* Name + role */}
        <div className="hidden sm:flex flex-col items-start leading-none">
          <span className="text-sm font-medium text-maroon-800">{firstName}</span>
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${roleCfg.color}`}>
            {roleCfg.label}
          </span>
        </div>

        <ChevronDown
          size={13}
          className={`text-maroon-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-maroon-100 shadow-xl overflow-hidden z-50 animate-fade-in">

          {/* User info header */}
          <div className="px-4 py-3 border-b border-maroon-50">
            <p className="text-sm font-semibold text-maroon-800 truncate">{fullName}</p>
            <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wide ${roleCfg.bg} ${roleCfg.color}`}>
              <RoleIcon size={9} />
              {roleCfg.label}
            </span>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-maroon-700 hover:bg-parchment-50 transition-colors"
            >
              <User size={14} className="text-maroon-400" />
              View Profile
            </Link>
            <Link
              href="/profile/submissions"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-maroon-700 hover:bg-parchment-50 transition-colors"
            >
              <BookMarked size={14} className="text-maroon-400" />
              My Submissions
            </Link>

            {/* Admin link — only for admin/faculty */}
            {["admin", "faculty"].includes(role) && (
              <>
                <div className="my-1 mx-4 border-t border-maroon-50" />
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-maroon-700 hover:bg-parchment-50 transition-colors"
                >
                  <RoleIcon size={14} className={roleCfg.color} />
                  Admin Panel
                </Link>
              </>
            )}
          </div>

          {/* Sign out */}
          <div className="border-t border-maroon-50 py-1.5">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
