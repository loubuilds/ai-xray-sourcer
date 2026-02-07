"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "../../../lib/client";

export default function ShortlistPage({ params }) {
  const [profiles, setProfiles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchWithAuth(
          `/api/profiles?projectId=${params.projectId}&status=shortlisted`
        );
        if (!mounted) return;
        setProfiles(data.profiles || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [params.projectId]);

  async function handleExport() {
    try {
      const response = await fetch(`/api/export?projectId=${params.projectId}&status=shortlisted`, {
        headers: { "Content-Type": "text/csv" },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "shortlist.csv";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Export failed");
    }
  }

  return (
    <main style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <Link href={`/projects/${params.projectId}`}>← Back to searches</Link>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ marginTop: 16 }}>Shortlist</h1>
        <button style={primaryButtonStyle} onClick={handleExport}>
          Export CSV
        </button>
      </div>

      {error ? <p style={{ color: "#b42318" }}>{error}</p> : null}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)" }}>
              <th>Name</th>
              <th>Role</th>
              <th>Company</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 0" }}>{profile.full_name}</td>
                <td>{profile.current_title}</td>
                <td>{profile.current_company}</td>
                <td>{profile.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const primaryButtonStyle = {
  background: "var(--accent)",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
};
