"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardCheck, BookOpen, Users, Tag,
  LogOut, Menu, X, ChevronRight, Shield, GraduationCap,
} from "lucide-react";

interface Props {
  role: string;
  fullName: string;
  email: string;
}

export default function AdminSidebar({ role, fullName, email }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = role === "admin";

  const navItems = [
    // Faculty + Admin
    {
      href: "/admin/submissions",
      icon: ClipboardCheck,
      label: "Pending Validation",
      badge: true,
      roles: ["admin", "faculty"],
    },
    // Admin only
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-maroon-800/30">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-parchment-300/20"
            style={{ background: "rgba(250,243,224,0.1)" }}>
            <span className="text-parchment-200 font-serif font-bold text-xs">SP</span>
          </div>
          <div>
            <p className="text-parchment-100 font-serif font-bold text-sm leading-none">SPARK</p>
            <p className="text-parchment-500 text-[10px] leading-tight mt-0.5">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: "rgba(250,243,224,0.06)" }}>
          {isAdmin
            ? <Shield size={13} className="text-amber-400 flex-shrink-0" />
            : <GraduationCap size={13} className="text-upgreen-400 flex-shrink-0" />
          }
          <span className={`text-xs font-semibold tracking-wide uppercase ${isAdmin ? "text-amber-300" : "text-upgreen-300"}`}>
            {isAdmin ? "Administrator" : "Faculty Validator"}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
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
                  ? "bg-white/15 text-parchment-100 shadow-sm"
                  : "text-parchment-400 hover:bg-white/10 hover:text-parchment-200"
                }`}
            >
              <Icon size={16} className={active ? "text-parchment-200" : "text-parchment-500 group-hover:text-parchment-300"} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={13} className="text-parchment-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User + signout */}
      <div className="px-3 py-4 border-t border-maroon-800/30 space-y-1">
        <div className="px-3 py-2.5 rounded-xl" style={{ background: "rgba(250,243,224,0.06)" }}>
          <p className="text-parchment-200 text-sm font-medium truncate">{fullName}</p>
          <p className="text-parchment-500 text-xs truncate mt-0.5">{email}</p>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-parchment-400 hover:bg-white/10 hover:text-red-300 transition-all font-medium">
            <LogOut size={15} />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col z-30"
        style={{ background: "linear-gradient(180deg, #5a0c1c 0%, #6b0f24 40%, #4a0a18 100%)" }}>
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
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full flex flex-col z-10"
            style={{ background: "linear-gradient(180deg, #5a0c1c 0%, #6b0f24 40%, #4a0a18 100%)" }}>
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-parchment-400 hover:text-parchment-100 hover:bg-white/10 transition-all">
              <X size={16} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
