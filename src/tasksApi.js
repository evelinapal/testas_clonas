const TASKS_API_URL = "https://testapi.io/api/evelinapal/resource/Tasklist";

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API užklausa nepavyko (HTTP ${response.status}).`);
  }

  if (response.status === 204) return null;

  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : null;
}

function normalizeTask(task) {
  return {
    ...task,
    id: task.id ?? task._id,
    title: task.Title ?? task.title ?? "",
    status: task.status ?? "Nepradėta",
    deadline: task.deadline ?? "",
  };
}

export async function getTasks() {
  const data = await request(TASKS_API_URL, { method: "GET" });
  const records = Array.isArray(data) ? data : data?.data;

  if (!Array.isArray(records)) {
    throw new Error("API atsakymas nėra užduočių sąrašas.");
  }

  return records.map(normalizeTask);
}

export async function getTask(id) {
  const data = await request(`${TASKS_API_URL}/${encodeURIComponent(id)}`, {
    method: "GET",
  });
  return normalizeTask(data?.data ?? data);
}

export async function createTask(task) {
  const data = await request(TASKS_API_URL, {
    method: "POST",
    body: JSON.stringify({
      Title: task.title,
      status: task.status,
      deadline: task.deadline,
    }),
  });

  return normalizeTask(data?.data ?? data ?? task);
}

export async function updateTask(id, task) {
  const data = await request(`${TASKS_API_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({
      Title: task.title,
      status: task.status,
      deadline: task.deadline,
    }),
  });

  return data ? normalizeTask(data.data ?? data) : normalizeTask({ id, ...task });
}

export async function deleteTask(id) {
  await request(`${TASKS_API_URL}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}