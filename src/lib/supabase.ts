import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket para uploads de mãos e referências
export const STORAGE_BUCKETS = {
  nailUploads: "nail-uploads",
} as const;

export async function uploadHandImage(file: File, userId: string): Promise<string | null> {
  const path = `${userId}/hand-${Date.now()}.${file.name.split(".").pop()}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.nailUploads)
    .upload(path, file);
  if (error) return null;
  const { data } = supabase.storage
    .from(STORAGE_BUCKETS.nailUploads)
    .getPublicUrl(path);
  return data.publicUrl;
}
