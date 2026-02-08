import { NextResponse } from "next/server";
import { createServiceClient, requireUserFromRequest } from "../../../../lib/supabaseServer";
import { buildQueriesFromSpec } from "../../../../lib/utils";

export async function POST(request, { params }) {
  const { user, error } = await requireUserFromRequest(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const braveKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!braveKey) {
    return NextResponse.json(
      { error: "Missing BRAVE_SEARCH_API_KEY in server environment." },
      { status: 500 }
    );
  }

  const supabase = createServiceClient();
  const { data: specRow, error: specError } = await supabase
    .from("search_specs")
    .select("spec_json")
    .eq("search_id", params.searchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (specError) {
    return NextResponse.json({ error: specError.message }, { status: 500 });
  }

  const spec = specRow?.spec_json || {};
  const queries = buildQueriesFromSpec(spec);
  const queryText = queries[0]?.query_text;

  if (!queryText) {
    return NextResponse.json(
      { error: "Add at least one title, company, or keyword before running the search." },
      { status: 400 }
    );
  }

  const url = new URL("https://api.search.brave.com/res/v1/web/search");
  url.searchParams.set("q", queryText);
  url.searchParams.set("count", "10");
  url.searchParams.set("search_lang", "en");
  url.searchParams.set("country", "gb");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": braveKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: `Brave search failed: ${errorText}` },
      { status: 500 }
    );
  }

  const data = await response.json();
  const results = data?.web?.results || data?.results || [];

  return NextResponse.json({
    query: queryText,
    results: results.map((item) => ({
      title: item.title,
      url: item.url,
      description: item.description || item.snippet || "",
    })),
  });
}
