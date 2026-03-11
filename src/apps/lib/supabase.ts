import { projectId, publicAnonKey } from "../../../utils/supabase/info";

const rawSupabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || projectId;

export const supabaseUrl = rawSupabaseUrl.startsWith("http")
  ? rawSupabaseUrl
  : `https://${rawSupabaseUrl}.supabase.co`;

export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey;

export function getSupabaseHeaders(accessToken?: string) {
  return {
    apikey: supabaseAnonKey,
    Authorization: accessToken ? `Bearer ${accessToken}` : `Bearer ${supabaseAnonKey}`,
    "Content-Type": "application/json",
  };
}
