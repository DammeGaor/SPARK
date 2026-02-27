import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, department, student_id, avatar_url, created_at")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { count: submissionsCount } = await supabase
    .from("studies")
    .select("*", { count: "exact", head: true })
    .eq("author_id", user.id);

  const { count: publishedCount } = await supabase
    .from("studies")
    .select("*", { count: "exact", head: true })
    .eq("author_id", user.id)
    .eq("is_published", true);

  return (
    <ProfileClient
      profile={profile}
      submissionsCount={submissionsCount ?? 0}
      publishedCount={publishedCount ?? 0}
    />
  );
}
