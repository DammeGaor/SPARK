import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { notifyAuthor } from "@/app/api/studies/_notifyAuthor";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: study } = await supabase
    .from("studies")
    .select(`id, title, file_url, file_name, allow_download, author:profiles!studies_author_id_fkey(id, full_name)`)
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (!study?.file_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const author = study.author as { id: string; full_name: string };
  const isAuthor = user?.id === author?.id;

  // Check access for restricted files
  if (!study.allow_download && !isAuthor) {
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: accessReq } = await supabase
      .from("study_access_requests")
      .select("status")
      .eq("study_id", id)
      .eq("requester_id", user.id)
      .single();
    if (accessReq?.status !== "approved") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  }

  // Run notification and file fetch in parallel — await both before responding
  // (fire-and-forget gets killed by Next.js when the response closes)
  const [fileRes] = await Promise.all([
    fetch(study.file_url),
    isAuthor ? Promise.resolve() : notifyAuthor(id, study, author, user, "study_view").catch(console.error),
  ]);
  if (!fileRes.ok) {
    return NextResponse.json({ error: "File fetch failed" }, { status: 502 });
  }

  return new NextResponse(fileRes.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${study.file_name ?? "study.pdf"}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
