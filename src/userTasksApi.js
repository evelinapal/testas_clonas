import { supabase } from "./supabaseClient";

function throwIfError(error) {
  if (error) throw new Error(error.message);
}

function toTask(row) {
  return { id: row.id, title: row.title, status: row.status, deadline: row.deadline ?? "" };
}

export async function getUserTasks(userId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, status, deadline")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  throwIfError(error);
  return (data ?? []).map(toTask);
}

export async function createUserTask(userId, task) {
  const { data, error } = await supabase
    .from("tasks")
    .insert({ user_id: userId, title: task.title, status: task.status, deadline: task.deadline || null })
    .select("id, title, status, deadline")
    .single();
  throwIfError(error);
  return toTask(data);
}

export async function updateUserTask(taskId, updates) {
  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select("id, title, status, deadline")
    .single();
  throwIfError(error);
  return toTask(data);
}

export async function deleteUserTask(taskId) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  throwIfError(error);
}