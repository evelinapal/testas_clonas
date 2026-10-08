import { isSupabaseConfigured, supabase, usernameToEmail } from "./supabaseClient";

function ensureConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error("Pirmiausia nustatyk Supabase URL ir anon raktą faile .env.local.");
  }
}

export async function registerUser(username, password) {
  ensureConfigured();
  const cleanUsername = username.trim();
  const { data, error } = await supabase.auth.signUp({
    email: usernameToEmail(cleanUsername),
    password,
    options: { data: { username: cleanUsername, display_name: cleanUsername } },
  });
  if (error) throw error;
  if (!data.session) {
    throw new Error("Registracija sukurta. Išjunk el. pašto patvirtinimą Supabase Auth nustatymuose, tada bandyk prisijungti.");
  }
  return data;
}

export async function loginUser(username, password) {
  ensureConfigured();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });
  if (error) throw error;
  return data;
}

export async function logoutUser() {
  ensureConfigured();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}