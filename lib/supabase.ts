import { createClient } from "@supabase/supabase-js";

export function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    projectImagesBucket:
      process.env.SUPABASE_PROJECT_IMAGES_BUCKET ?? "project-images",
  };
}

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getSupabaseConfig();

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase URL and service role key are required.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
