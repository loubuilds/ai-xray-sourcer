import { NextResponse } from "next/server";
import { createServiceClient, requireUserFromRequest } from "../../lib/supabaseServer";
import { toCsv } from "../../lib/utils";

export async function GET(request) {
  const { user, error } = await requireUserFromRequest(request);
  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  let query = supabase.from("profiles").select("*").eq("project_id", projectId).eq("user_id", user.id);
  if (status) query = query.eq("status", status);

  const { data, error: dbError } = await query;
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const csv = toCsv(data || []);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=export.csv",
    },
  });
}
