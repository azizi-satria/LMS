import PublicNavbar from "@/components/PublicNavbar";

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <PublicNavbar />
      <main>{children}</main>
      <footer
        className="py-10 mt-20"
        style={{ borderTop: "1px solid var(--border-color)", background: "var(--bg-surface)" }}
      >
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} LMS Universitas &mdash; Platform Pembelajaran Digital
          </p>
        </div>
      </footer>
    </div>
  );
}
