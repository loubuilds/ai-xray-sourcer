import { getSupabaseConfigError, supabase } from "./supabaseClient";

export default async function Home() {
  let result = { data: null, error: null };
  const configError = getSupabaseConfigError();
  const hasConfig = !configError;

  if (configError) {
    result = { data: null, error: configError };
  } else if (supabase) {
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
  } else {
    result = {
      data: null,
      error: {
        message: "Supabase client not initialized.",
      },
    };
  }

  return (
    <main
      style={{
        padding: 24,
        fontFamily: "system-ui",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <h1>Deployed ✅</h1>
      <p style={{ marginTop: 4, color: "#555" }}>AI X-ray Sourcer</p>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          border: "1px solid #e5e5e5",
          borderRadius: 8,
          background: "#fafafa",
        }}
      >
        <strong>Supabase Status:</strong>{" "}
        {hasConfig ? "Configured" : "Missing env vars"}
        <div style={{ marginTop: 8 }}>
          <strong>Query:</strong> SELECT * FROM test LIMIT 1
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <strong>Result:</strong>
        <pre
          style={{
            marginTop: 8,
            padding: 12,
            background: "#111",
            color: "#f1f1f1",
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          {JSON.stringify(result, null, 2)}
        </pre>
      </section>
    </main>
  );
}
