import { supabase } from "./supabase"

export default async function Home() {
  const { data, error } = await supabase
    .from("test")
    .select("*")
    .limit(1)

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>AI X-ray Sourcer</h1>

      <pre>
        {JSON.stringify({ data, error }, null, 2)}
      </pre>
    </main>
  )
}
