import { supabase } from "../supabaseClient";

export async function fetchWithAuth(url, options = {}) {
  const session = (await supabase?.auth.getSession())?.data?.session;
  const token = session?.access_token;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = data?.error || "Request failed";
    throw new Error(error);
  }

  return data;
}
