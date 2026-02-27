import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "faculty"].includes(profile.role)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-parchment-50 flex">
      <AdminSidebar role={profile.role} fullName={profile.full_name} email={profile.email} />
      <main className="flex-1 min-w-0 lg:ml-64">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
