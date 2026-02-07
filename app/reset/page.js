"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../supabaseClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setMessage("");
    setError("");
  }, []);

  async function handleReset(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated. You can sign in now.");
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <section
        style={{
          width: 420,
          maxWidth: "92vw",
          padding: 24,
          background: "var(--panel)",
          borderRadius: 12,
          border: "1px solid var(--border)",
        }}
      >
        <Link href="/">← Back to sign in</Link>
        <h1 style={{ marginTop: 12 }}>Reset password</h1>
        <form onSubmit={handleReset} style={{ display: "grid", gap: 12 }}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            style={inputStyle}
          />
          <button style={primaryButtonStyle} type="submit">
            Update password
          </button>
          {message ? <p style={{ color: "#1b7f4d" }}>{message}</p> : null}
          {error ? <p style={{ color: "#b42318" }}>{error}</p> : null}
        </form>
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
