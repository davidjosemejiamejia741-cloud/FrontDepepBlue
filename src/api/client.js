export class ApiError extends Error {
  constructor({ status, message, details }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details ?? {}
  }
}

export async function request(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  let response
  try {
    response = await fetch(path, { ...options, headers })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError({ status: 0, message: 'No se pudo contactar el servidor. Verifica la conexión y el backend.' })
  }
  const body = await response.text()
  let data = null
  try { data = body ? JSON.parse(body) : null } catch {
    if (response.ok) throw new ApiError({ status: response.status, message: 'El servidor no devolvió JSON válido. Revisa la configuración del proxy.' })
  }
  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      message: data?.message ?? 'No se pudo completar la solicitud. Verifica que el backend esté disponible.',
      details: data?.details,
    })
  }
  return data
}
