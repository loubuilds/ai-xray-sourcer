import { NextResponse } from "next/server";
import { createServiceClient, requireUserFromRequest } from "../../../../lib/supabaseServer";
import { buildQueriesFromSpec } from "../../../../lib/utils";

export async function GET(request, { params }) {
  const { user, error } = await requireUserFromRequest(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error: dbError } = await supabase
    .from("queries")
    .select("*")
    .eq("search_id", params.searchId)
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ queries: data });
}

export async function POST(request, { params }) {
  const { user, error } = await requireUserFromRequest(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = await request.json();
  const { spec_json } = body || {};

  if (!spec_json) {
    return NextResponse.json({ error: "spec_json is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  await supabase.from("queries").delete().eq("search_id", params.searchId);

  const queries = buildQueriesFromSpec(spec_json);
  if (queries.length) {
    const { error: insertError } = await supabase.from("queries").insert(
      queries.map((query) => ({
        search_id: params.searchId,
        ...query,
      }))
    );

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ queries });
}
