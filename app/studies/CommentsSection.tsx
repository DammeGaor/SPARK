"use client";

import { useState } from "react";
import { MessageSquare, Reply, Loader2, Trash2, User } from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface Comment {
  id: string;
  body: string;
  created_at: string;
  parent_id: string | null;
  author: { id: string; full_name: string } | null;
  replies?: Comment[];
}

interface Props {
  studyId: string;
  currentUserId: string | null;
  currentUserName: string | null;
  currentUserRole: string | null;
  initialComments: Comment[];
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const cls = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  return (
    <div className={`${cls} rounded-full flex items-center justify-center flex-shrink-0 font-bold text-parchment-100`}
      style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
      {initials}
    </div>
  );
}

function CommentItem({ comment, currentUserId, currentUserName, currentUserRole, studyId, depth = 0, onRefresh }: {
  comment: Comment; currentUserId: string | null; currentUserName: string | null;
  currentUserRole: string | null; studyId: string; depth?: number; onRefresh: () => Promise<void>;
}) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isAdmin = currentUserRole === "admin";

  async function submitReply() {
    if (!replyText.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("comments").insert({
      study_id: studyId, user_id: currentUserId, body: replyText.trim(), parent_id: comment.id,
    });
    if (error) toast.error("Failed to post reply.");
    else { toast.success("Reply posted."); setReplyText(""); setReplying(false); onRefresh(); }
    setSubmitting(false);
  }

  async function deleteComment() {
    if (!confirm("Delete this comment?")) return;
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("comments").delete().eq("id", comment.id);
    if (error) { toast.error("Failed to delete."); setDeleting(false); }
    else { toast.success("Deleted."); await onRefresh(); setDeleting(false); }
  }

  return (
    <div className={depth > 0 ? "ml-9 mt-3 pt-3 border-l-2 border-maroon-50 pl-4" : ""}>
      <div className="flex gap-3">
        <Avatar name={comment.author?.full_name ?? "?"} size={depth > 0 ? "sm" : "md"} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-maroon-800">{comment.author?.full_name ?? "Anonymous"}</span>
              <span className="text-xs text-maroon-400">{timeAgo(comment.created_at)}</span>
            </div>
            {isAdmin && (
              <button onClick={deleteComment} disabled={deleting} className="text-maroon-300 hover:text-red-500 transition-colors flex-shrink-0">
                {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              </button>
            )}
          </div>
          <p className="text-sm text-maroon-700 leading-relaxed break-words">{comment.body}</p>
          {currentUserId && depth === 0 && (
            <button onClick={() => setReplying(!replying)}
              className="flex items-center gap-1 mt-2 text-xs text-maroon-400 hover:text-maroon-700 transition-colors">
              <Reply size={11} /> Reply
            </button>
          )}
          {replying && (
            <div className="mt-3 flex gap-2">
              <Avatar name={currentUserName ?? "?"} size="sm" />
              <div className="flex-1">
                <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                  rows={2} placeholder="Write a reply..."
                  className="w-full px-3 py-2 rounded-xl border border-maroon-200 bg-parchment-50 text-sm text-maroon-800 placeholder-maroon-300 focus:outline-none focus:ring-2 focus:ring-maroon-400 resize-none transition-all" />
                <div className="flex gap-2 mt-2">
                  <button onClick={submitReply} disabled={submitting || !replyText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-parchment-50 disabled:opacity-60 transition-all"
                    style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
                    {submitting && <Loader2 size={11} className="animate-spin" />} Post Reply
                  </button>
                  <button onClick={() => { setReplying(false); setReplyText(""); }}
                    className="px-3 py-1.5 rounded-lg text-xs text-maroon-500 border border-maroon-200 hover:bg-maroon-50 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} currentUserId={currentUserId}
          currentUserName={currentUserName} currentUserRole={currentUserRole} studyId={studyId} depth={depth + 1} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

export default function CommentsSection({ studyId, currentUserId, currentUserName, currentUserRole, initialComments }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const threaded = comments
    .filter((c) => !c.parent_id)
    .map((c) => ({ ...c, replies: comments.filter((r) => r.parent_id === c.id) }));

  async function refresh(): Promise<void> {
    const supabase = createClient();
    const { data } = await supabase
      .from("comments")
      .select(`id, body, created_at, parent_id, author:profiles!comments_user_id_fkey(id, full_name)`)
      .eq("study_id", studyId)
      .order("created_at", { ascending: true });
    setComments((data as Comment[]) ?? []);
  }

  async function submitComment() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("comments").insert({
      study_id: studyId, user_id: currentUserId, body: newComment.trim(), parent_id: null,
    });
    if (error) toast.error("Failed to post comment.");
    else { toast.success("Comment posted."); setNewComment(""); refresh(); }
    setSubmitting(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-maroon-50" style={{ background: "linear-gradient(135deg, #fdf6f0, #fff)" }}>
        <h2 className="font-serif text-base font-semibold text-maroon-800 flex items-center gap-2">
          <MessageSquare size={15} className="text-maroon-500" />
          Comments
          {comments.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-maroon-100 text-maroon-600 text-xs font-bold">{comments.length}</span>
          )}
        </h2>
      </div>
      <div className="p-6 space-y-5">
        {currentUserId ? (
          <div className="flex gap-3">
            <Avatar name={currentUserName ?? "?"} />
            <div className="flex-1">
              <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)}
                rows={3} placeholder="Share your thoughts or feedback on this study..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-maroon-200 bg-parchment-50 text-sm text-maroon-800 placeholder-maroon-300 focus:outline-none focus:ring-2 focus:ring-maroon-400 resize-none transition-all" />
              <div className="flex justify-end mt-2">
                <button onClick={submitComment} disabled={submitting || !newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-parchment-50 text-sm font-medium disabled:opacity-60 transition-all shadow-sm hover:shadow-md"
                  style={{ background: "linear-gradient(135deg, #8f1535, #6b0f24)" }}>
                  {submitting && <Loader2 size={13} className="animate-spin" />} Post Comment
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-parchment-50 border border-maroon-100">
            <User size={15} className="text-maroon-400" />
            <p className="text-sm text-maroon-500">
              <a href="/login" className="text-maroon-700 font-medium underline underline-offset-2 hover:text-maroon-900">Sign in</a>
              {" "}to leave a comment.
            </p>
          </div>
        )}
        {threaded.length > 0 && <div className="border-t border-maroon-50" />}
        {threaded.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={28} className="text-maroon-200 mx-auto mb-2" />
            <p className="text-sm text-maroon-400">No comments yet. Be the first to share your thoughts.</p>
          </div>
        ) : (
          <div className="space-y-5 divide-y divide-maroon-50">
            {threaded.map((comment) => (
              <div key={comment.id} className="pt-5 first:pt-0">
                <CommentItem comment={comment} currentUserId={currentUserId}
                  currentUserName={currentUserName} currentUserRole={currentUserRole} studyId={studyId} depth={0} onRefresh={refresh} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
