import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { studyId, message } = await req.json();
    if (!studyId) return NextResponse.json({ error: "Missing studyId" }, { status: 400 });

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    // Fetch study + author profile
    const { data: study } = await supabase
      .from("studies")
      .select(`id, title, author:profiles!studies_author_id_fkey(id, full_name)`)
      .eq("id", studyId)
      .single();

    if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 });

    const author = study.author as { id: string; full_name: string } | null;
    if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });

    // Upsert the access request (idempotent)
    const { error: upsertError } = await supabaseAdmin
      .from("study_access_requests")
      .upsert({
        study_id: studyId,
        requester_id: user.id,
        status: "pending",
        message: message ?? null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "study_id,requester_id" });

    if (upsertError) {
      console.error("upsert error:", upsertError);
      return NextResponse.json({ error: "Failed to save request" }, { status: 500 });
    }

    // Get requester's name and email
    const { data: requesterProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    const requesterName = requesterProfile?.full_name ?? "Someone";

    // Get author's email from auth.users
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(author.id);
    const authorEmail = authUser?.user?.email;

    if (authorEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://spark.up.edu.ph";
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@spark.up.edu.ph";
      const respondUrl = `${appUrl}/profile/submissions`;

      await resend.emails.send({
        from: `SPARK <${fromEmail}>`,
        to: authorEmail,
        subject: `Someone requested access to your study on SPARK`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #3b0a18;">
            <div style="margin-bottom: 24px;">
              <img src="${appUrl}/spark-logo.svg" alt="SPARK" style="height: 36px;" />
            </div>
            <h2 style="font-size: 20px; margin-bottom: 12px;">Access request received</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #5a1a2a;">Hi ${author.full_name},</p>
            <p style="font-size: 15px; line-height: 1.6; color: #5a1a2a;">
              <strong>${requesterName}</strong> has requested access to your study:
            </p>
            <div style="background: #fdf6f0; border-left: 4px solid #8f1535; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 15px; font-weight: bold; color: #3b0a18;">${study.title}</p>
            </div>
            ${message ? `
            <div style="background: #f9f9f9; border: 1px solid #e5e5e5; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 6px; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.05em;">Their message</p>
              <p style="margin: 0; font-size: 14px; color: #444; font-style: italic;">"${message}"</p>
            </div>` : ""}
            <p style="font-size: 14px; color: #5a1a2a; margin-bottom: 20px;">
              You can approve or deny this request from your Submissions page.
            </p>
            <a href="${respondUrl}"
               style="display: inline-block; padding: 10px 22px; background: #8f1535; color: #faf3e0; text-decoration: none; border-radius: 8px; font-size: 14px;">
              Manage Requests →
            </a>
            <p style="font-size: 13px; color: #999; margin-top: 32px;">
              You're receiving this because you have an author account on SPARK.
            </p>
          </div>
        `,
      });
    }

    // In-app notification for author
    await supabaseAdmin.from("notifications").insert({
      user_id: author.id,
      type: "access_request",
      study_id: studyId,
      message: `${requesterName} requested access to your study "${study.title}".`,
      is_read: false,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("request-access error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
