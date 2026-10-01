// JWT_SECRET de prueba: tiene que estar definido ANTES de cargar la app,
// porque auth.middleware lo lee de process.env al verificar el token.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

const request = require('supertest')
const jwt = require('jsonwebtoken')

// ── Mock de supabaseClient (lo único que se mockea) ─────────────────────────
// pacientesService.create() hace: from('pacientes').insert(...).select().single()
// El controller, el auth middleware, el service y el JWT funcionan de verdad.
jest.mock('../../src/db/supabaseClient', () => {
  const builder = {}
  builder.insert = jest.fn(() => builder)
  builder.select = jest.fn(() => builder)
  builder.single = jest.fn()
  return {
    from: jest.fn(() => builder),
    _builder: builder
  }
})

const supabase = require('../../src/db/supabaseClient')
const app = require('../../src/app')
const mock = supabase._builder

const tokenValido = jwt.sign(
  { id: 'u1', email: 'test@mail.com', rol: 'profesional' },
  process.env.JWT_SECRET
)

const pacienteValido = {
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan.perez@mail.com',
  telefono: '1122334455'
}

// ═══════════════════════════════════════════════════════════════════════════
// Test de Integración 2 — POST /api/pacientes
// ═══════════════════════════════════════════════════════════════════════════
describe('POST /api/pacientes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('responde 401 si no se envía token', async () => {
    const res = await request(app)
      .post('/api/pacientes')
      .send(pacienteValido)

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Token no proporcionado')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('responde 401 si el token es inválido', async () => {
    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', 'Bearer token-falso')
      .send(pacienteValido)

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Token inválido o expirado')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('responde 400 si faltan campos requeridos (falta apellido, email y teléfono)', async () => {
    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ nombre: 'Juan' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/requeridos/)
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('responde 400 si el email no es válido', async () => {
    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send({ ...pacienteValido, email: 'juan-sin-arroba.com' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('El correo electrónico no es válido')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('responde 201 con el paciente creado si los datos son correctos', async () => {
    const pacienteCreado = {
      id: 'pac-1',
      ...pacienteValido,
      estado: 'activo',
      creado_por: 'u1'
    }
    mock.single.mockResolvedValue({ data: pacienteCreado, error: null })

    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send(pacienteValido)

    expect(res.status).toBe(201)
    expect(res.body).toEqual(pacienteCreado)
    // El id del usuario sale del JWT (auth middleware real) y llega al insert
    expect(supabase.from).toHaveBeenCalledWith('pacientes')
    expect(mock.insert).toHaveBeenCalledWith({
      ...pacienteValido,
      creado_por: 'u1',
      estado: 'activo'
    })
  })

  it('responde 400 si Supabase devuelve error al insertar', async () => {
    mock.single.mockResolvedValue({ data: null, error: new Error('duplicate key') })

    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${tokenValido}`)
      .send(pacienteValido)

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('duplicate key')
  })
})
