import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { request, ApiError } from '../src/api/client.js'
const originalFetch = globalThis.fetch
afterEach(() => { globalThis.fetch = originalFetch })
test('devuelve JSON y conserva headers personalizados', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.get('X-Test'), 'ok')
    return new Response(JSON.stringify({ eligible: true }))
  }
  assert.deepEqual(await request('/api/test', { headers: { 'X-Test': 'ok' } }), { eligible: true })
})
for (const status of [400, 404, 409]) {
  test(`conserva ErrorResponse ${status}`, async () => {
    globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Error de prueba', details: { description: 'Inválida' } }), { status })
    await assert.rejects(request('/api/test'), e => e instanceof ApiError && e.status === status && e.details.description === 'Inválida')
  })
}
test('normaliza caída de red', async () => {
  globalThis.fetch = async () => { throw new TypeError('fetch failed') }
  await assert.rejects(request('/api/test'), e => e instanceof ApiError && e.status === 0)
})
test('acepta respuesta sin contenido', async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 })
  assert.equal(await request('/api/test'), null)
})
test('detecta HTML en lugar de JSON', async () => {
  globalThis.fetch = async () => new Response('<html>fallback</html>')
  await assert.rejects(request('/api/test'), /JSON válido/)
})
test('maneja error de proxy sin JSON', async () => {
  globalThis.fetch = async () => new Response('Bad Gateway', { status: 502 })
  await assert.rejects(request('/api/test'), e => e.status === 502)
})
