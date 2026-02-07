import { NextResponse } from "next/server";
import { createServiceClient, requireUserFromRequest } from "../../lib/supabaseServer";

export async function GET(request) {
  const { user, error } = await requireUserFromRequest(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error: dbError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ projects: data });
}

export async function POST(request) {
  const { user, error } = await requireUserFromRequest(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Missing SUPABASE_SERVICE_ROLE_KEY in server environment." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { name, description } = body || {};

  if (!name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error: dbError } = await supabase
    .from("projects")
    .insert({ name, description, user_id: user.id })
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ project: data });
}
