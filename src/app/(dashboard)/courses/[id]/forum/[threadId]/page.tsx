"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  user: { name: string; role: string };
  replies: Reply[];
}

interface Thread {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  user: { name: string; role: string };
  replies: Reply[];
}

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = params.id as string;
  const threadId = params.threadId as string;

  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = () => {
    fetch(`/api/forum/${threadId}`)
      .then((r) => r.json())
      .then((data) => { setThread(data); setLoading(false); });
  };

  useEffect(() => { load(); }, [threadId]);

  const submitReply = async (parentId?: string) => {
    if (!replyContent.trim()) return;
    setSending(true);
    await fetch(`/api/forum/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent, parentId: parentId || null }),
    });
    setReplyContent("");
    setReplyingTo(null);
    setSending(false);
    load();
  };

  const roleBadge = (role: string) => {
    const map: Record<string, { label: string; color: string }> = {
      DOSEN: { label: "Dosen", color: "#6366f1" },
      ADMIN: { label: "Admin", color: "#ef4444" },
      MAHASISWA: { label: "Mahasiswa", color: "#10b981" },
      UMUM: { label: "Umum", color: "#f59e0b" },
    };
    return map[role] || { label: role, color: "#6b7280" };
  };

  const ReplyItem = ({ reply, depth = 0 }: { reply: Reply; depth?: number }) => {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [localContent, setLocalContent] = useState("");
    const rb = roleBadge(reply.user.role);

    const sendNested = async () => {
      if (!localContent.trim()) return;
      await fetch(`/api/forum/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: localContent, parentId: reply.id }),
      });
      setLocalContent("");
      setShowReplyBox(false);
      load();
    };

    return (
      <div style={{ marginLeft: depth > 0 ? 28 : 0, borderLeft: depth > 0 ? "2px solid var(--border-color)" : "none", paddingLeft: depth > 0 ? 16 : 0 }}>
        <div style={{ background: depth === 0 ? "var(--card-bg)" : "var(--bg-secondary)", border: "1px solid var(--border-color)", borderRadius: 10, padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <span style={{ background: rb.color + "22", color: rb.color, padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{rb.label}</span>
            <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{reply.user.name}</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{new Date(reply.createdAt).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" })}</span>
          </div>
          <p style={{ margin: "0 0 10px", fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>{reply.content}</p>
          {depth < 2 && (
            <button onClick={() => setShowReplyBox((p) => !p)} style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", fontSize: 13, padding: 0 }}>
              {showReplyBox ? "Batal" : "↩ Balas"}
            </button>
          )}
          {showReplyBox && (
            <div style={{ marginTop: 10 }}>
              <textarea
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                rows={3}
                placeholder="Tulis balasan..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, resize: "none", boxSizing: "border-box" }}
              />
              <button onClick={sendNested} style={{ marginTop: 6, background: "var(--accent-primary)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                Kirim Balasan
              </button>
            </div>
          )}
        </div>
        {reply.replies?.map((r) => <ReplyItem key={r.id} reply={r} depth={depth + 1} />)}
      </div>
    );
  };

  if (loading) return <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>Memuat...</div>;
  if (!thread) return <div style={{ textAlign: "center", padding: 60 }}><p style={{ color: "var(--text-secondary)" }}>Thread tidak ditemukan.</p></div>;

  const rb = roleBadge(thread.user.role);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={() => router.push(`/courses/${courseId}/forum`)} style={{ background: "none", border: "none", color: "var(--accent-primary)", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>
        ← Forum Diskusi
      </button>

      {/* Thread */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 14, padding: 28, marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 14 }}>
          {thread.isPinned && <span>📌</span>}
          <span style={{ background: rb.color + "22", color: rb.color, padding: "2px 8px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{rb.label}</span>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>{thread.user.name}</span>
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>• {new Date(thread.createdAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 14px" }}>{thread.title}</h1>
        <p style={{ color: "var(--text-primary)", lineHeight: 1.7, margin: 0 }}>{thread.content}</p>
      </div>

      {/* Replies */}
      <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
        {thread.replies.length} Balasan
      </h3>

      {thread.replies.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          {thread.replies.map((r) => <ReplyItem key={r.id} reply={r} />)}
        </div>
      )}

      {/* Reply box */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 14, padding: 24 }}>
        <h4 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>Tulis Balasan</h4>
        <textarea
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          rows={4}
          placeholder="Bagikan pemikiran Anda..."
          style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border-color)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: 14, resize: "vertical", boxSizing: "border-box", marginBottom: 12 }}
        />
        <button
          onClick={() => submitReply()}
          disabled={sending || !replyContent.trim()}
          style={{ background: "var(--accent-primary)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontWeight: 600, cursor: "pointer", opacity: (sending || !replyContent.trim()) ? 0.6 : 1 }}
        >
          {sending ? "Mengirim..." : "Kirim Balasan"}
        </button>
      </div>
    </div>
  );
}
