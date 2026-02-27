"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardCheck, BookOpen, Users, Tag,
  LogOut, Menu, X, ChevronRight, Shield, GraduationCap, Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  role: string;
  fullName: string;
  email: string;
}

export default function AdminSidebar({ role, fullName, email }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isAdmin = role === "admin";

  const navItems = [
    {
      href: "/admin/submissions",
      icon: ClipboardCheck,
      label: "Pending Validation",
      roles: ["admin", "faculty"],
    },
    {
      href: "/admin/studies",
      icon: BookOpen,
      label: "All Studies",
      roles: ["admin"],
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "Users",
      roles: ["admin"],
    },
    {
      href: "/admin/categories",
      icon: Tag,
      label: "Categories",
      roles: ["admin"],
    },
  ].filter((item) => item.roles.includes(role));

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full relative overflow-hidden">

      {/* Background — matches home page dot grid style */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Maroon glow — top */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, #6b0f2420 0%, transparent 70%)" }} />
        {/* Green glow — bottom */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full"
          style={{ background: "radial-gradient(circle, #2E7D3218 0%, transparent 70%)" }} />
        {/* Dot grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #6b0f2414 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />
        {/* Top hairline */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, #6b0f2430, #2E7D3220, transparent)" }} />
        {/* Bottom hairline */}
        <div className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #2E7D3220, #6b0f2430)" }} />
      </div>

      {/* Logo */}
      <div className="relative px-5 pt-5 pb-4 border-b border-maroon-100">
        <Link href="/" className="flex flex-col gap-0.5 group">
          <Image src="/spark-logo.svg" alt="SPARK" width={130} height={41} priority />
          <p className="text-maroon-400 text-[10px] tracking-widest uppercase ml-0.5">
            Admin Panel
          </p>
        </Link>
      </div>

      {/* Role badge */}
      <div className="relative px-4 py-3">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold tracking-wide uppercase
          ${isAdmin
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          {isAdmin
            ? <Shield size={13} className="text-amber-500 flex-shrink-0" />
            : <GraduationCap size={13} className="text-green-600 flex-shrink-0" />
          }
          {isAdmin ? "Administrator" : "Faculty Validator"}
        </div>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${active
                  ? "text-maroon-800 shadow-sm"
                  : "text-maroon-500 hover:text-maroon-800 hover:bg-maroon-50/80"
                }`}
              style={
                active
                  ? {
                      background: "linear-gradient(135deg, #8f153512, #6b0f2406)",
                      border: "1px solid #8f153322",
                    }
                  : {}
              }
            >
              <Icon
                size={16}
                className={active ? "text-maroon-600" : "text-maroon-400 group-hover:text-maroon-600"}
              />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={13} className="text-maroon-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User info + sign out */}
      <div className="relative px-3 py-4 border-t border-maroon-100 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-maroon-50/60 border border-maroon-100">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-parchment-100"
            style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-maroon-800 text-sm font-medium truncate">{fullName}</p>
            <p className="text-maroon-400 text-xs truncate">{email}</p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-maroon-400 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100 transition-all font-medium disabled:opacity-60"
        >
          {signingOut
            ? <Loader2 size={15} className="animate-spin" />
            : <LogOut size={15} />
          }
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col z-30 bg-parchment-50 border-r border-maroon-100 shadow-sm"
      >
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}
      >
        <Menu size={18} className="text-parchment-100" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 h-full flex flex-col z-10 bg-parchment-50 border-r border-maroon-100 shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-maroon-400 hover:text-maroon-800 hover:bg-maroon-50 transition-all z-10"
            >
              <X size={16} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
