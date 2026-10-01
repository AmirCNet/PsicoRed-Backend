const request = require('supertest')

// ── Mock (Db: supabase)
// bcrypt y JWT funcionan de verdad. Solo mockeamos supabase
jest.mock('../../src/db/supabaseClient', () => {
  const mockSingle = jest.fn()
  const mockEq = jest.fn(() => ({ eq: mockEq, single: mockSingle }))
  const mockSelect = jest.fn(() => ({ eq: mockEq, single: mockSingle }))
  const mockInsertSelect = jest.fn(() => ({ single: mockSingle }))
  const mockInsert = jest.fn(() => ({ select: mockInsertSelect }))
  const mockFrom = jest.fn(() => ({ select: mockSelect, insert: mockInsert }))
  return { from: mockFrom, _mockSingle: mockSingle }
})

const app = require('../../src/app')
const supabase = require('../../src/db/supabaseClient')

// Hash de 'password123' generado con bcrypt real
const HASH_PASSWORD123 = '$2a$10$..Rj5kjyzhVcMqti5FUBlezG3m.ZcCksKTr4g3566vgMBXv0i7gw2'

const USUARIO_MOCK = {
  id: 'u-test-001',
  email: 'test@mail.com',
  rol: 'profesional',
  password_hash: HASH_PASSWORD123,
  activo: true
}

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'

// POST /api/auth/login
describe('POST /api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Login correcto
  it('200 — login exitoso: retorna token y datos del usuario', async () => {
    supabase._mockSingle.mockResolvedValue({ data: USUARIO_MOCK, error: null })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@mail.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.usuario.email).toBe('test@mail.com')
    expect(res.body.usuario.rol).toBe('profesional')
    // El token debe ser un JWT válido (3 partes separadas por punto)
    expect(res.body.token.split('.')).toHaveLength(3)
  })

  // Login incorrecto (contraseña incorrecta)
  it('401 — contraseña incorrecta', async () => {
    supabase._mockSingle.mockResolvedValue({ data: USUARIO_MOCK, error: null })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@mail.com', password: 'wrong-password' })

    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/Credenciales incorrectas/)
  })

  // Usuario inexistente
  it('401 — usuario no encontrado', async () => {
    supabase._mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@mail.com', password: 'password123' })

    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/Credenciales incorrectas/)
  })

  // Campo correo faltante 
  it('400 — email faltante', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'password123' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/requeridos/)
  })

  // Campo contraseña faltante
  it('400 — password faltante', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@mail.com' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/requeridos/)
  })

  // Body vacío
  it('400 — body vacío', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/requeridos/)
  })
})
