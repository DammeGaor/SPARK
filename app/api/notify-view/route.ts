import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Supabase admin client — needed to read auth.users emails
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  console.log("🔔 notify-view hit");
  try {
    const { studyId } = await req.json();
    console.log("📖 studyId:", studyId);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    console.log("👤 viewer user:", user?.id ?? "anonymous");

    const { data: study, error: studyError } = await supabase
      .from("studies")
      .select(`id, title, author:profiles!studies_author_id_fkey(id, full_name)`)
      .eq("id", studyId)
      .single();

    console.log("📚 study:", study, "error:", studyError);

    if (studyError || !study) {
      return NextResponse.json({ error: "Study not found" }, { status: 404 });
    }

    const author = study.author as { id: string; full_name: string } | null;
    console.log("✍️ author:", author);

    if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });

    if (user?.id === author.id) {
      console.log("⏭️ skipped: viewer is author");
      return NextResponse.json({ skipped: true });
    }

    // dedup check
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recent } = await supabaseAdmin
      .from("notifications")
      .select("id")
      .eq("study_id", studyId)
      .eq("type", "study_view")
      .eq("viewer_id", user?.id ?? "anonymous")
      .gte("created_at", since)
      .limit(1);

    console.log("🔁 dedup recent:", recent);

    if (recent && recent.length > 0) {
      console.log("⏭️ skipped: dedup");
      return NextResponse.json({ skipped: true, reason: "dedup" });
    }

    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(author.id);
    console.log("📧 authUser email:", authUser?.user?.email, "error:", authError);
    if (authError || !authUser?.user?.email) {
      return NextResponse.json({ error: "Author email not found" }, { status: 404 });
    }
    const authorEmail = authUser.user.email;

    // ── Resolve viewer label ───────────────────────────────────────────────
    const viewerLabel = user
      ? (await supabase.from("profiles").select("full_name").eq("id", user.id).single()).data?.full_name ?? "Someone"
      : "An anonymous visitor";

    const message = `${viewerLabel} viewed your study "${study.title}".`;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "spark-repository.site";
    const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@spark-repository.site";

    // ── Insert in-app notification ─────────────────────────────────────────
    await supabaseAdmin.from("notifications").insert({
      user_id: author.id,
      viewer_id: user?.id ?? "anonymous", // store so dedup works
      type: "study_view",
      study_id: studyId,
      message,
      is_read: false,
    });

    // ── Send email via Resend ──────────────────────────────────────────────
    await resend.emails.send({
      from: `SPARK <${fromEmail}>`,
      to: authorEmail,
      subject: `Your study was viewed on SPARK`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #3b0a18;">
          <div style="margin-bottom: 24px;">
            <img src="${appUrl}/spark-logo.svg" alt="SPARK" style="height: 36px;" />
          </div>
          <h2 style="font-size: 20px; margin-bottom: 12px;">Your study was viewed</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #5a1a2a;">
            Hi ${author.full_name},
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #5a1a2a;">
            <strong>${viewerLabel}</strong> just viewed the PDF of your study:
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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("notify-view error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
