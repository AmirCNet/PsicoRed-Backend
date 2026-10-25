const rolMiddleware = require('../../src/middlewares/rol.middleware')

// ── Helpers: mocks manuales de req, res y next ─────────────────────────────
// res.status() devuelve el mismo res para poder encadenar .json()
const crearRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

// ═══════════════════════════════════════════════════════════════════════════
// Test Unitario 4 — rolMiddleware()
// ═══════════════════════════════════════════════════════════════════════════
describe('rolMiddleware()', () => {
  it('devuelve una función middleware', () => {
    const middleware = rolMiddleware('administrador')
    expect(typeof middleware).toBe('function')
  })

  it('responde 403 y no llama a next() si el rol no está permitido', () => {
    const middleware = rolMiddleware('administrador')
    const req = { user: { rol: 'profesional' } }
    const res = crearRes()
    const next = jest.fn()

    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Acción restringida. Roles permitidos: administrador'
    })
    expect(next).not.toHaveBeenCalled()
  })

  it('llama a next() y no responde nada si el rol está permitido', () => {
    const middleware = rolMiddleware('administrador')
    const req = { user: { rol: 'administrador' } }
    const res = crearRes()
    const next = jest.fn()

    middleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
    expect(res.json).not.toHaveBeenCalled()
  })

  it('acepta varios roles permitidos', () => {
    const middleware = rolMiddleware('administrador', 'profesional')
    const req = { user: { rol: 'profesional' } }
    const res = crearRes()
    const next = jest.fn()

    middleware(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('responde 401 si no hay usuario autenticado en req', () => {
    const middleware = rolMiddleware('administrador')
    const req = {}
    const res = crearRes()
    const next = jest.fn()

    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' })
    expect(next).not.toHaveBeenCalled()
  })
})
