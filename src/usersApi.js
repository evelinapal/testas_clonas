import { supabase } from "./supabaseClient";

export async function getUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, role, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}