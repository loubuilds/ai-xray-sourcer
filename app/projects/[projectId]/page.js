"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "../../lib/client";

export default function ProjectDetail({ params }) {
  const [searches, setSearches] = useState([]);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchWithAuth(`/api/searches?projectId=${params.projectId}`);
        if (!mounted) return;
        setSearches(data.searches || []);
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

  async function handleCreate(event) {
    event.preventDefault();
    setError("");

    try {
      const data = await fetchWithAuth("/api/searches", {
        method: "POST",
        body: JSON.stringify({
          projectId: params.projectId,
          name: name || "New Search",
          nlPrompt: prompt,
        }),
      });
      setSearches([data.search, ...searches]);
      setName("");
      setPrompt("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main style={{ padding: 32, maxWidth: 960, margin: "0 auto" }}>
      <Link href="/projects">← Back to projects</Link>
      <h1 style={{ marginTop: 16 }}>Project searches</h1>
      <p style={{ color: "var(--muted)" }}>Create a new search to generate query packs.</p>

      <form onSubmit={handleCreate} style={{ display: "grid", gap: 12, maxWidth: 620 }}>
        <input
          placeholder="Search name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          style={inputStyle}
        />
        <textarea
          placeholder="Describe the people you want"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: "vertical" }}
        />
        <button style={primaryButtonStyle} type="submit">
          Create search
        </button>
        {error ? <p style={{ color: "#b42318" }}>{error}</p> : null}
      </form>

      <section style={{ marginTop: 32 }}>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {searches.map((search) => (
              <Link
                key={search.id}
                href={`/projects/${params.projectId}/searches/${search.id}`}
                style={cardStyle}
              >
                <strong>{search.name}</strong>
                <span style={{ color: "var(--muted)" }}>{search.summary}</span>
              </Link>
            ))}
          </div>
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

const cardStyle = {
  display: "grid",
  gap: 4,
  padding: 16,
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--panel)",
};
