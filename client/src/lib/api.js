export async function api(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    signal,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const error = new Error(data?.error?.message || "Request failed");

    error.status = response.status;
    error.details = data?.error?.details || [];

    throw error;
  }

  return data;
}
