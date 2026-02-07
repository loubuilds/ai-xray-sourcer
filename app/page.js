"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const SAMPLE_COMPANIES = [
  "SG Fleet UK",
  "Holman",
  "Athlon",
  "Kinto UK",
  "Lex Autolease",
  "Leaseplan",
  "Arval UK",
  "Alphabet GB",
  "Zenith Vehicles",
  "Ayvens",
];

const SAMPLE_TITLES = [
  "Business Development Manager",
  "Corporate Sales Manager",
  "Strategic Account Manager",
  "Field Sales Manager",
  "Sales Director",
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const supabaseEnabled = useMemo(() => Boolean(supabase), []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      if (!supabase) {
        setError("Missing Supabase environment variables.");
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);

      const { data: listener } = supabase.auth.onAuthStateChange(
        (_event, nextSession) => {
          if (!mounted) return;
          setSession(nextSession ?? null);
        }
      );

      return listener;
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleMagicLink(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setMessage("Check your email for the magic link.");
  }

  async function handlePasswordSignIn(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }
  }

  async function handleSignUp(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("Check your email to confirm your account.");
  }

  async function handleSignOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <main style={{ padding: 48, textAlign: "center" }}>
        <p>Loading…</p>
      </main>
    );
  }

  if (!supabaseEnabled) {
    return (
      <main style={{ padding: 48, maxWidth: 520, margin: "0 auto" }}>
        <h1>AI X-ray Sourcer</h1>
        <p style={{ color: "var(--muted)" }}>
          Missing Supabase environment variables. Add them in Vercel and restart the app.
        </p>
      </main>
    );
  }

  if (!session) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <form
          onSubmit={handleMagicLink}
          style={{
            width: 420,
            maxWidth: "90vw",
            padding: 24,
            background: "var(--panel)",
            borderRadius: 12,
            border: "1px solid var(--border)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          }}
        >
          <h1 style={{ marginTop: 0 }}>AI X-ray Sourcer</h1>
          <p style={{ color: "var(--muted)" }}>
            Sign in to start building search packs.
          </p>

          <label style={{ display: "block", marginTop: 16 }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              required
              style={{
                width: "100%",
                marginTop: 6,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}
            />
          </label>

          <label style={{ display: "block", marginTop: 12 }}>
            Password (optional)
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create or use a password"
              style={{
                width: "100%",
                marginTop: 6,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid var(--border)",
              }}
            />
          </label>

          {message ? (
            <p style={{ marginTop: 12, color: "#1b7f4d" }}>{message}</p>
          ) : null}
          {error ? (
            <p style={{ marginTop: 12, color: "#b42318" }}>{error}</p>
          ) : null}

          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            <button
              type="submit"
              style={primaryButtonStyle}
            >
              Send magic link
            </button>
            <button
              type="button"
              onClick={handlePasswordSignIn}
              style={secondaryButtonStyle}
            >
              Sign in with password
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              style={ghostButtonStyle}
            >
              Create account
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex" }}>
      <aside
        style={{
          width: 240,
          background: "var(--panel)",
          borderRight: "1px solid var(--border)",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Workspace</div>
          <div style={{ fontWeight: 600 }}>Louise’s Workspace</div>
        </div>

        <nav style={{ display: "grid", gap: 10, color: "var(--muted)" }}>
          <strong style={{ color: "var(--text)" }}>Projects</strong>
          <span>Searches</span>
          <span>Shortlist</span>
          <span>Contacts</span>
          <span>Sequences</span>
        </nav>

        <button onClick={handleSignOut} style={ghostButtonStyle}>
          Sign out
        </button>
      </aside>

      <section style={{ flex: 1, padding: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "var(--muted)" }}>First Project · Searches</div>
            <h1 style={{ marginTop: 6 }}>Sales Managers UK Fleet</h1>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <a href="/projects" style={secondaryButtonStyle}>
              Go to Projects
            </a>
            <button style={primaryButtonStyle}>Save Changes</button>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "grid", gap: 20 }}>
          <section style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Edit Your Search Filters</h3>
            <div style={{ display: "grid", gap: 12 }}>
              <FilterRow title="Companies" chips={SAMPLE_COMPANIES} />
              <FilterRow title="Job Titles" chips={SAMPLE_TITLES} />
              <FilterRow title="Locations" chips={["Manchester", "Leeds", "Birmingham"]} />
            </div>
          </section>

          <section style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>I set these filters based on your request</h3>
            <p style={{ color: "var(--muted)" }}>
              Field sales, business development managers, corporate sales managers in the UK fleet
              space.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Chip label="Sales Growth Analyst +77" />
              <Chip label="Manchester" />
              <Chip label="SG Fleet UK, Holman, or 38 other companies" />
            </div>
          </section>

          <section style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Ranking Criteria</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <Chip label="Leasing" />
              <Chip label="Products" />
            </div>
          </section>

          <section style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Shortlist</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--muted)" }}>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Role</th>
                  <th>Company</th>
                </tr>
              </thead>
              <tbody>
                <TableRow name="Andy Higgins" role="Pan European Key Account" company="Ford" />
                <TableRow name="Oliver Rudd" role="Area Sales Manager" company="Ogilvie Fleet" />
                <TableRow name="Suanu Lebari" role="Sales Director" company="Chicane" />
              </tbody>
            </table>
          </section>
        </div>
      </section>
    </main>
  );
}

function FilterRow({ title, chips }) {
  return (
    <div>
      <div style={{ marginBottom: 6, fontWeight: 600 }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {chips.map((chip) => (
          <Chip key={chip} label={chip} />
        ))}
      </div>
    </div>
  );
}

function Chip({ label }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: "var(--accent-soft)",
        color: "var(--accent)",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}

function TableRow({ name, role, company }) {
  return (
    <tr style={{ borderTop: "1px solid var(--border)" }}>
      <td style={{ padding: "10px 0" }}>{name}</td>
      <td>Not Contacted</td>
      <td>{role}</td>
      <td>{company}</td>
    </tr>
  );
}

const panelStyle = {
  background: "var(--panel)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: 20,
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

const ghostButtonStyle = {
  background: "transparent",
  color: "var(--accent)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
};
