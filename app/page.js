"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "./supabaseClient";

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
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/reset`
            : undefined,
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
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/reset`
            : undefined,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setMessage("Check your email to confirm your account.");
  }

  async function handleForgotPassword() {
    setError("");
    setMessage("");

    if (!email) {
      setError("Enter your email first.");
      return;
    }

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/reset`
          : undefined,
    });

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setMessage("Check your email for the password reset link.");
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
              onClick={handleForgotPassword}
              style={ghostButtonStyle}
            >
              Forgot password
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
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <section
        style={{
          width: 520,
          maxWidth: "92vw",
          padding: 24,
          background: "var(--panel)",
          borderRadius: 12,
          border: "1px solid var(--border)",
        }}
      >
        <h1 style={{ marginTop: 0 }}>AI X-ray Sourcer</h1>
        <p style={{ color: "var(--muted)" }}>
          Signed in as <strong>{session?.user?.email}</strong>
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <Link href="/projects" style={primaryButtonStyle}>
            Go to Projects
          </Link>
          <Link href="/profile" style={secondaryButtonStyle}>
            Profile
          </Link>
        </div>
        <button
          onClick={handleSignOut}
          style={{ ...ghostButtonStyle, marginTop: 16 }}
        >
          Sign out
        </button>
      </section>
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
