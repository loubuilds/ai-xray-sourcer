import { getSupabaseConfigError, supabase } from "./supabaseClient";

export default async function Home() {
  let result = { data: null, error: null };
  const configError = getSupabaseConfigError();

  if (configError) {
    result = { data: null, error: configError };
  } else {
    try {
      const { data, error } = await supabase.from("test").select("*").limit(1);
      result = { data, error };
    } catch (error) {
      result = {
        data: null,
        error: {
          message: error?.message || "Unknown error",
        },
      };
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Deployed ✅</h1>
      <p>AI X-ray Sourcer</p>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </main>
  );
}
