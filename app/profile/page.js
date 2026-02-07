"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../supabaseClient";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user || null);
      const meta = data.user?.user_metadata || {};
      setDisplayName(meta.display_name || "");
      setPhone(meta.phone || "");
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        display_name: displayName,
        phone,
      },
    });

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Profile updated.");
  }

  return (
    <main style={{ padding: 32, maxWidth: 720, margin: "0 auto" }}>
      <Link href="/">← Back</Link>
      <h1 style={{ marginTop: 16 }}>Profile</h1>
      <p style={{ color: "var(--muted)" }}>
        Signed in as <strong>{user?.email}</strong>
      </p>

      <form onSubmit={handleSave} style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <label style={{ display: "grid", gap: 6 }}>
          Display name
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 6 }}>
          Phone (optional)
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            style={inputStyle}
          />
        </label>
        <button style={primaryButtonStyle} type="submit">
          Save profile
        </button>
        {message ? <p style={{ color: "#1b7f4d" }}>{message}</p> : null}
        {error ? <p style={{ color: "#b42318" }}>{error}</p> : null}
      </form>
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
