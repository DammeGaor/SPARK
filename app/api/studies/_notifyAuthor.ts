import { createClient as createAdminClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function notifyAuthor(
  studyId: string,
  study: { id: string; title: string },
  author: { id: string; full_name: string },
  viewer: { id: string } | null,
  type: "study_view" | "study_download"
) {
  // dedup: skip if same viewer already triggered this notification type in last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabaseAdmin
    .from("notifications")
    .select("id")
    .eq("study_id", studyId)
    .eq("type", type)
    .eq("viewer_id", viewer?.id ?? "anonymous")
    .gte("created_at", since)
    .limit(1);

  if (recent && recent.length > 0) return;

  // Get author email from auth.users
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(author.id);
  if (authError || !authUser?.user?.email) return;
  const authorEmail = authUser.user.email;

  // Resolve viewer label
  let viewerLabel = "An anonymous visitor";
  if (viewer) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", viewer.id)
      .single();
    viewerLabel = profile?.full_name ?? "Someone";
  }

  const action = type === "study_view" ? "viewed" : "downloaded";
  const message = `${viewerLabel} ${action} your study "${study.title}".`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://spark-repository.site";
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@spark-repository.site";

  // Insert in-app notification
  await supabaseAdmin.from("notifications").insert({
    user_id: author.id,
    viewer_id: viewer?.id ?? "anonymous",
    type,
    study_id: studyId,
    message,
    is_read: false,
  });

  // Send email
  await resend.emails.send({
    from: `SPARK <${fromEmail}>`,
    to: authorEmail,
    subject: `Your study was ${action} on SPARK`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #3b0a18;">
        <div style="margin-bottom: 24px;">
          <img src="${appUrl}/spark-logo.svg" alt="SPARK" style="height: 36px;" />
        </div>
        <h2 style="font-size: 20px; margin-bottom: 12px;">Your study was ${action}</h2>
        <p style="font-size: 15px; line-height: 1.6; color: #5a1a2a;">
          Hi ${author.full_name},
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #5a1a2a;">
          <strong>${viewerLabel}</strong> just ${action} your study:
        </p>
        <div style="background: #fdf6f0; border-left: 4px solid #8f1535; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 15px; font-weight: bold; color: #3b0a18;">${study.title}</p>
        </div>
        <a href="${appUrl}/studies/${study.id}"
           style="display: inline-block; margin-top: 8px; padding: 10px 22px; background: #8f1535; color: #faf3e0; text-decoration: none; border-radius: 8px; font-size: 14px;">
          View your study →
        </a>
        <p style="font-size: 13px; color: #999; margin-top: 32px;">
          You're receiving this because you have an author account on SPARK.
        </p>
      </div>
    `,
  });
}
