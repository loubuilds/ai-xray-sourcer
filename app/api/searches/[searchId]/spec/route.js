import { NextResponse } from "next/server";
import { createServiceClient, requireUserFromRequest } from "../../../../lib/supabaseServer";

export async function GET(request, { params }) {
  const { user, error } = await requireUserFromRequest(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error: dbError } = await supabase
    .from("search_specs")
    .select("*")
    .eq("search_id", params.searchId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ spec: data });
}

export async function PATCH(request, { params }) {
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
  const { data, error: dbError } = await supabase
    .from("search_specs")
    .insert({
      search_id: params.searchId,
      spec_json,
      version: 1,
    })
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ spec: data });
}
