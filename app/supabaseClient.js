import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export function getSupabaseConfigError() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      message: "Missing Supabase environment variables.",
      missing: {
        NEXT_PUBLIC_SUPABASE_URL: !supabaseUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !supabaseAnonKey,
      },
    };
  }
  return null;
}
