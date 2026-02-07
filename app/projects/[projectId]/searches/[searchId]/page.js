"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "../../../../lib/client";

const emptySpec = {
  companies: [],
  job_titles: [],
  locations: [],
  keywords: [],
  exclusions: [],
  ranking_criteria: [],
};

export default function SearchDetail({ params }) {
  const [spec, setSpec] = useState(emptySpec);
  const [queries, setQueries] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const specData = await fetchWithAuth(`/api/searches/${params.searchId}/spec`);
        const queryData = await fetchWithAuth(`/api/searches/${params.searchId}/queries`);
        if (!mounted) return;
        setSpec(specData.spec?.spec_json || emptySpec);
        setQueries(queryData.queries || []);
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

  async function saveSpec() {
    setError("");
    try {
      await fetchWithAuth(`/api/searches/${params.searchId}/spec`, {
        method: "PATCH",
        body: JSON.stringify({ spec_json: spec }),
      });
      const queryData = await fetchWithAuth(`/api/searches/${params.searchId}/queries`, {
        method: "POST",
        body: JSON.stringify({ spec_json: spec }),
      });
      setQueries(queryData.queries || []);
    } catch (err) {
      setError(err.message);
    }
  }

  function addChip(key, value) {
    if (!value) return;
    setSpec((prev) => ({
      ...prev,
      [key]: Array.from(new Set([...(prev[key] || []), value])),
    }));
  }

  function removeChip(key, value) {
    setSpec((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((item) => item !== value),
    }));
  }

  if (loading) {
    return <main style={{ padding: 32 }}>Loading…</main>;
  }

  return (
    <main style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <Link href={`/projects/${params.projectId}`}>← Back to searches</Link>
          <h1 style={{ marginTop: 16 }}>Search filters</h1>
        </div>
        <button style={primaryButtonStyle} onClick={saveSpec}>
          Save Changes
        </button>
      </div>

      {error ? <p style={{ color: "#b42318" }}>{error}</p> : null}

      <section style={{ marginTop: 24, display: "grid", gap: 20 }}>
        <FilterEditor
          title="Companies"
          items={spec.companies}
          onAdd={(value) => addChip("companies", value)}
          onRemove={(value) => removeChip("companies", value)}
        />
        <FilterEditor
          title="Job titles"
          items={spec.job_titles}
          onAdd={(value) => addChip("job_titles", value)}
          onRemove={(value) => removeChip("job_titles", value)}
        />
        <FilterEditor
          title="Locations"
          items={spec.locations}
          onAdd={(value) => addChip("locations", value)}
          onRemove={(value) => removeChip("locations", value)}
        />
        <FilterEditor
          title="Keywords"
          items={spec.keywords}
          onAdd={(value) => addChip("keywords", value)}
          onRemove={(value) => removeChip("keywords", value)}
        />
        <FilterEditor
          title="Exclusions"
          items={spec.exclusions}
          onAdd={(value) => addChip("exclusions", value)}
          onRemove={(value) => removeChip("exclusions", value)}
        />
        <FilterEditor
          title="Ranking criteria"
          items={spec.ranking_criteria}
          onAdd={(value) => addChip("ranking_criteria", value)}
          onRemove={(value) => removeChip("ranking_criteria", value)}
        />
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Query packs</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {queries.map((query) => (
            <div key={query.id || query.query_text} style={panelStyle}>
              <div style={{ fontWeight: 600 }}>{query.label}</div>
              <code style={{ display: "block", marginTop: 8 }}>{query.query_text}</code>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <Link
          href={`/projects/${params.projectId}/searches/${params.searchId}/capture`}
          style={primaryLinkStyle}
        >
          Go to Capture Workspace
        </Link>
      </section>
    </main>
  );
}

function FilterEditor({ title, items, onAdd, onRemove }) {
  const [value, setValue] = useState("");

  return (
    <section style={panelStyle}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(items || []).map((item) => (
          <span key={item} style={chipStyle}>
            {item}
            <button onClick={() => onRemove(item)} style={chipButtonStyle}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={`Add ${title.toLowerCase()}`}
          style={inputStyle}
        />
        <button
          style={secondaryButtonStyle}
          onClick={() => {
            onAdd(value.trim());
            setValue("");
          }}
          type="button"
        >
          Add
        </button>
      </div>
    </section>
  );
}

const panelStyle = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 16,
};

const inputStyle = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
};

const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "6px 10px",
  borderRadius: 999,
  background: "var(--accent-soft)",
  color: "var(--accent)",
  fontSize: 12,
  fontWeight: 600,
};

const chipButtonStyle = {
  border: "none",
  background: "transparent",
  color: "var(--accent)",
  cursor: "pointer",
  fontSize: 14,
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

const secondaryButtonStyle = {
  background: "white",
  color: "var(--accent)",
  border: "1px solid var(--accent)",
  borderRadius: 10,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryLinkStyle = {
  display: "inline-block",
  background: "var(--accent)",
  color: "white",
  padding: "10px 16px",
  borderRadius: 10,
  fontWeight: 600,
};
