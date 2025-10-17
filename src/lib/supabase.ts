import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role key
export const supabaseAdmin = (() => {
  if (!supabaseServiceRoleKey) {
    console.warn("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
    return supabase; // Fallback to regular client
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey);
})();

export type GeneratedImage = {
  id: string;
  prompt: string;
  style_type: string;
  image_url: string;
  is_public: boolean;
  created_at: string;
};
