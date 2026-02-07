"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "../../../../../lib/client";

export default function CapturePage({ params }) {
  const [profiles, setProfiles] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    current_company: "",
    current_title: "",
    location: "",
    linkedin_url: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchWithAuth(
          `/api/profiles?searchId=${params.searchId}`
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
  }, [params.searchId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const data = await fetchWithAuth("/api/profiles", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          projectId: params.projectId,
          searchId: params.searchId,
        }),
      });
      setProfiles([data.profile, ...profiles]);
      setForm({
        full_name: "",
        current_company: "",
        current_title: "",
        location: "",
        linkedin_url: "",
        notes: "",
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <Link href={`/projects/${params.projectId}/searches/${params.searchId}`}>
        ← Back to search
      </Link>
      <h1 style={{ marginTop: 16 }}>Capture workspace</h1>
      <p style={{ color: "var(--muted)" }}>
        Paste LinkedIn URLs manually. Dedupe is handled by URL.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <input
            placeholder="Full name"
            value={form.full_name}
            onChange={(event) => setForm({ ...form, full_name: event.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Company"
            value={form.current_company}
            onChange={(event) => setForm({ ...form, current_company: event.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Title"
            value={form.current_title}
            onChange={(event) => setForm({ ...form, current_title: event.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Location"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
            style={inputStyle}
          />
        </div>
        <input
          placeholder="LinkedIn URL"
          value={form.linkedin_url}
          onChange={(event) => setForm({ ...form, linkedin_url: event.target.value })}
          style={inputStyle}
          required
        />
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          rows={3}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <button style={primaryButtonStyle} type="submit">
          Add profile
        </button>
        {error ? <p style={{ color: "#b42318" }}>{error}</p> : null}
      </form>

      <section style={{ marginTop: 32 }}>
        <h2>Captured profiles</h2>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                <th>Name</th>
                <th>Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 0" }}>{profile.full_name}</td>
                  <td>{profile.current_title}</td>
                  <td>{profile.current_company}</td>
                  <td>{profile.location}</td>
                  <td>{profile.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
};

const primaryButtonStyle = {
  background: "var(--accent)",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
};
