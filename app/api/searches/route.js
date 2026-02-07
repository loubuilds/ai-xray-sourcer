import { NextResponse } from "next/server";
import { createServiceClient, requireUserFromRequest } from "../../lib/supabaseServer";
import { buildQueriesFromSpec, defaultSpecFromPrompt } from "../../lib/utils";

export async function POST(request) {
  const { user, error } = await requireUserFromRequest(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, nlPrompt, name } = body || {};

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const searchName = name || "New Search";
  const spec = defaultSpecFromPrompt(nlPrompt || "");

  const { data: search, error: searchError } = await supabase
    .from("searches")
    .insert({
      project_id: projectId,
      name: searchName,
      nl_prompt: nlPrompt || "",
      summary: "I set these filters based on your prompt.",
      user_id: user.id,
    })
    .select("*")
    .single();

  if (searchError) {
    return NextResponse.json({ error: searchError.message }, { status: 500 });
  }

  const { error: specError } = await supabase
    .from("search_specs")
    .insert({
      search_id: search.id,
      spec_json: spec,
      version: 1,
    });

  if (specError) {
    return NextResponse.json({ error: specError.message }, { status: 500 });
  }

  const queries = buildQueriesFromSpec(spec);
  if (queries.length) {
    const { error: queryError } = await supabase.from("queries").insert(
      queries.map((query) => ({
        search_id: search.id,
        ...query,
      }))
    );

    if (queryError) {
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ search });
}

export async function GET(request) {
  const { user, error } = await requireUserFromRequest(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error: dbError } = await supabase
    .from("searches")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ searches: data });
}
