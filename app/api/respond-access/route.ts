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
    const { requestId, decision } = await req.json(); // decision: "approved" | "denied"
    if (!requestId || !["approved", "denied"].includes(decision)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

    // Fetch the request and verify the current user is the study author
    const { data: accessReq } = await supabaseAdmin
      .from("study_access_requests")
      .select(`
        id, status, requester_id, message,
        study:studies!study_access_requests_study_id_fkey(id, title, author_id)
      `)
      .eq("id", requestId)
      .single();

    if (!accessReq) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const study = accessReq.study as { id: string; title: string; author_id: string } | null;
    if (!study) return NextResponse.json({ error: "Study not found" }, { status: 404 });
    if (study.author_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Update the request status
    await supabaseAdmin
      .from("study_access_requests")
      .update({ status: decision, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    // Get requester's email to notify them of the decision
    const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(accessReq.requester_id);
    const requesterEmail = authUser?.user?.email;

    const { data: requesterProfile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", accessReq.requester_id)
      .single();
    const requesterName = requesterProfile?.full_name ?? "Researcher";

    if (requesterEmail) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://spark.up.edu.ph";
      const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@spark.up.edu.ph";
      const studyUrl = `${appUrl}/studies/${study.id}`;

      const isApproved = decision === "approved";

      await resend.emails.send({
        from: `SPARK <${fromEmail}>`,
        to: requesterEmail,
        subject: isApproved
          ? `Your access request was approved — ${study.title}`
          : `Your access request was not approved — ${study.title}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #3b0a18;">
            <div style="margin-bottom: 24px;">
              <img src="${appUrl}/spark-logo.svg" alt="SPARK" style="height: 36px;" />
            </div>
            <h2 style="font-size: 20px; margin-bottom: 12px;">
              ${isApproved ? "Access granted ✓" : "Access request update"}
            </h2>
            <p style="font-size: 15px; line-height: 1.6; color: #5a1a2a;">Hi ${requesterName},</p>
            <p style="font-size: 15px; line-height: 1.6; color: #5a1a2a;">
              ${isApproved
                ? "The author has <strong>approved</strong> your request to access:"
                : "The author was unable to approve your request for:"
              }
            </p>
            <div style="background: #fdf6f0; border-left: 4px solid #8f1535; padding: 16px 20px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 15px; font-weight: bold; color: #3b0a18;">${study.title}</p>
            </div>
            ${isApproved ? `
            <a href="${studyUrl}"
               style="display: inline-block; padding: 10px 22px; background: #8f1535; color: #faf3e0; text-decoration: none; border-radius: 8px; font-size: 14px;">
              View Study & PDF →
            </a>` : ""}
            <p style="font-size: 13px; color: #999; margin-top: 32px;">
              You're receiving this because you requested access to a study on SPARK.
            </p>
          </div>
        `,
      });
    }

    // In-app notification for the requester
    await supabaseAdmin.from("notifications").insert({
      user_id: accessReq.requester_id,
      type: "access_response",
      study_id: study.id,
      message: decision === "approved"
        ? `Your request to access "${study.title}" was approved.`
        : `Your request to access "${study.title}" was not approved.`,
      is_read: false,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("respond-access error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
