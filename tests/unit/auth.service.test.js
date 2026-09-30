const authService = require('../../src/modules/auth/auth.service')

// ── Mock de supabaseClient ─────────────────────────────────────────────────
// Soporta dos cadenas de query usadas en auth.service.js:
//   - login/getMe:  from().select().eq().eq().single()
//   - register:     from().select().eq().single()  (chequeo)
//                   from().insert().select().single()  (insert)
jest.mock('../../src/db/supabaseClient', () => {
  const mockSingle = jest.fn()
  const mockEq = jest.fn(() => ({ eq: mockEq, single: mockSingle }))
  const mockInsertSelect = jest.fn(() => ({ single: mockSingle }))
  const mockInsert = jest.fn(() => ({ select: mockInsertSelect }))
  const mockSelect = jest.fn(() => ({ eq: mockEq, single: mockSingle }))
  const mockFrom = jest.fn(() => ({ select: mockSelect, insert: mockInsert }))
  return { from: mockFrom, _mockSingle: mockSingle, _mockInsert: mockInsert }
})

const supabase = require('../../src/db/supabaseClient')

// ── Mock de bcryptjs ───────────────────────────────────────────────────────
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn()
}))
const bcrypt = require('bcryptjs')

// Asegurar JWT_SECRET disponible en tests
process.env.JWT_SECRET = 'test-secret'

// ═══════════════════════════════════════════════════════════════════════════
// Test Unitario 1 — login()
// ═══════════════════════════════════════════════════════════════════════════
describe('authService.login()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lanza "Credenciales incorrectas" si Supabase devuelve error', async () => {
    supabase._mockSingle.mockResolvedValue({ data: null, error: { message: 'not found' } })

    await expect(authService.login('x@x.com', 'pass'))
      .rejects.toThrow('Credenciales incorrectas')
  })

  it('lanza "Credenciales incorrectas" si el usuario no existe (data null)', async () => {
    supabase._mockSingle.mockResolvedValue({ data: null, error: null })

    await expect(authService.login('noexiste@mail.com', 'pass'))
      .rejects.toThrow('Credenciales incorrectas')
  })

  it('lanza "Credenciales incorrectas" si la contraseña es incorrecta', async () => {
    supabase._mockSingle.mockResolvedValue({
      data: { id: 'u1', email: 'test@mail.com', rol: 'profesional', password_hash: '$hashed' },
      error: null
    })
    bcrypt.compare.mockResolvedValue(false)

    await expect(authService.login('test@mail.com', 'wrongpass'))
      .rejects.toThrow('Credenciales incorrectas')
  })

  it('retorna token y datos del usuario si las credenciales son correctas', async () => {
    supabase._mockSingle.mockResolvedValue({
      data: { id: 'u1', email: 'test@mail.com', rol: 'profesional', password_hash: '$hashed' },
      error: null
    })
    bcrypt.compare.mockResolvedValue(true)

    const resultado = await authService.login('test@mail.com', 'correctpass')

    expect(resultado).toHaveProperty('token')
    expect(resultado.usuario).toEqual({
      id: 'u1',
      email: 'test@mail.com',
      rol: 'profesional'
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// Test Unitario 2 — register()
// ═══════════════════════════════════════════════════════════════════════════
describe('authService.register()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lanza "Ya existe una cuenta" si el email ya está registrado', async () => {
    // Primera query (buscar existente) devuelve un usuario
    supabase._mockSingle.mockResolvedValueOnce({
      data: { id: 'u-existente' },
      error: null
    })

    await expect(authService.register('existente@mail.com', 'password123'))
      .rejects.toThrow('Ya existe una cuenta')
  })

  it('crea el usuario y lo retorna si el email no existe', async () => {
    // Primera query: no existe (data null)
    supabase._mockSingle.mockResolvedValueOnce({ data: null, error: null })
    // Segunda query: insert exitoso
    supabase._mockSingle.mockResolvedValueOnce({
      data: { id: 'u-nuevo', email: 'nuevo@mail.com', rol: null, activo: false, creado_en: '2026-01-01' },
      error: null
    })
    bcrypt.hash.mockResolvedValue('$hasheada')

    const resultado = await authService.register('nuevo@mail.com', 'password123')

    expect(resultado).toMatchObject({
      id: 'u-nuevo',
      email: 'nuevo@mail.com',
      rol: null
    })
  })
})
