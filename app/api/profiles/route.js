import { NextResponse } from "next/server";
import { createServiceClient, requireUserFromRequest } from "../../lib/supabaseServer";
import { normalizeLinkedinUrl } from "../../lib/utils";

export async function GET(request) {
  const { user, error } = await requireUserFromRequest(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const searchId = searchParams.get("searchId");
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");

  if (!searchId && !projectId) {
    return NextResponse.json({ error: "searchId or projectId required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  let query = supabase.from("profiles").select("*").eq("user_id", user.id);

  if (searchId) query = query.eq("search_id", searchId);
  if (projectId) query = query.eq("project_id", projectId);
  if (status) query = query.eq("status", status);

  const { data, error: dbError } = await query.order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ profiles: data });
}

export async function POST(request) {
  const { user, error } = await requireUserFromRequest(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = await request.json();
  const {
    projectId,
    searchId,
    full_name,
    current_company,
    current_title,
    location,
    linkedin_url,
    notes,
  } = body || {};

  if (!projectId || !linkedin_url) {
    return NextResponse.json(
      { error: "projectId and linkedin_url are required" },
      { status: 400 }
    );
  }

  const normalised = normalizeLinkedinUrl(linkedin_url);
  const supabase = createServiceClient();

  const { data, error: upsertError } = await supabase
    .from("profiles")
    .upsert(
      {
        project_id: projectId,
        search_id: searchId,
        user_id: user.id,
        full_name,
        current_company,
        current_title,
        location,
        linkedin_url,
        linkedin_url_normalised: normalised,
      },
      { onConflict: "linkedin_url_normalised" }
    )
    .select("*")
    .single();

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  if (notes) {
    await supabase.from("profile_notes").insert({
      profile_id: data.id,
      note: notes,
      source: "user",
    });
  }

  return NextResponse.json({ profile: data });
}
