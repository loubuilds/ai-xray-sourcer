"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "../lib/client";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchWithAuth("/api/projects");
        if (!mounted) return;
        setProjects(data.projects || []);
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
  }, []);

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    if (!name.trim()) return;

    try {
      const data = await fetchWithAuth("/api/projects", {
        method: "POST",
        body: JSON.stringify({ name, description }),
      });
      setProjects([data.project, ...projects]);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main style={{ padding: 32, maxWidth: 960, margin: "0 auto" }}>
      <h1>Projects</h1>
      <p style={{ color: "var(--muted)" }}>Create a project to start a new search.</p>

      <form onSubmit={handleCreate} style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <input
          placeholder="Project name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          style={inputStyle}
        />
        <input
          placeholder="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          style={inputStyle}
        />
        <button style={primaryButtonStyle} type="submit">
          Create project
        </button>
        {error ? (
          <p style={{ color: "#b42318" }}>{error}</p>
        ) : (
          <p style={{ color: "var(--muted)", marginTop: 8 }}>
            If this fails, check `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
          </p>
        )}
      </form>

      <section style={{ marginTop: 32 }}>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`} style={cardStyle}>
                <strong>{project.name}</strong>
                <span style={{ color: "var(--muted)" }}>{project.description}</span>
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
