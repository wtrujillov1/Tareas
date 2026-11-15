// Único punto de acceso HTTP de la aplicación.
const BASE = '/api'

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response
  try {
    response = await fetch(BASE + path, {
      method,
      signal,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error // petición cancelada a propósito
    throw new ApiError(0, 'NETWORK', 'No se pudo conectar con el servidor.')
  }

  if (response.status === 204) return null
  const json = await response.json().catch(() => null)

  if (!response.ok) {
    const e = json?.error
    throw new ApiError(response.status, e?.code ?? 'HTTP_ERROR', e?.message ?? `Error ${response.status}`, e?.details)
  }
  return json?.data ?? null
}

export const api = {
  register: credentials => request('/auth/register', { method: 'POST', body: credentials }),
  login: credentials => request('/auth/login', { method: 'POST', body: credentials }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  listTasks: signal => request('/tasks', { signal }),
  createTask: task => request('/tasks', { method: 'POST', body: task }),
  updateTask: (id, changes) => request(`/tasks/${id}`, { method: 'PATCH', body: changes }),
  deleteTask: (id, version) => request(`/tasks/${id}?version=${version}`, { method: 'DELETE' }),
}

export const EVENTS_URL = `${BASE}/events`
