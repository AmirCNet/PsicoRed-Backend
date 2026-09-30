const derivacionesService = require('../../src/modules/derivaciones/derivaciones.service')

// ── Mock de supabaseClient ─────────────────────────────────────────────────
// create() hace hasta tres queries sobre la tabla 'derivaciones':
//   1. Chequeo de duplicado: from().select().eq().eq().in().maybeSingle()
//   2. Insert:               from().insert().select().single()
//   3. getById (al final):   from().select().eq().single()
// Todos los métodos intermedios devuelven el mismo builder (encadenables).
// Los métodos que cierran la query (maybeSingle y single) son jest.fn()
// para poder decidir qué devuelve cada uno en cada test.
jest.mock('../../src/db/supabaseClient', () => {
  const builder = {}
  builder.select = jest.fn(() => builder)
  builder.eq = jest.fn(() => builder)
  builder.in = jest.fn(() => builder)
  builder.insert = jest.fn(() => builder)
  builder.maybeSingle = jest.fn()
  builder.single = jest.fn()
  return {
    from: jest.fn(() => builder),
    _builder: builder
  }
})

const supabase = require('../../src/db/supabaseClient')
const mock = supabase._builder

const body = { paciente_id: 'p1', profesional_id: 'pr1', motivo: 'Ansiedad' }

// ═══════════════════════════════════════════════════════════════════════════
// Test Unitario 3 — derivacionesService.create()
// ═══════════════════════════════════════════════════════════════════════════
describe('derivacionesService.create()', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('lanza error si ya existe una derivación activa entre el paciente y el profesional', async () => {
    // El chequeo de duplicado encuentra un registro
    mock.maybeSingle.mockResolvedValue({ data: { id: 'uuid' }, error: null })

    await expect(derivacionesService.create(body, 'user-uuid'))
      .rejects.toThrow('ya tiene una derivación pendiente')
  })

  it('no llama al insert cuando hay duplicado', async () => {
    mock.maybeSingle.mockResolvedValue({ data: { id: 'uuid' }, error: null })

    await expect(derivacionesService.create(body, 'user-uuid')).rejects.toThrow()

    expect(mock.insert).not.toHaveBeenCalled()
  })

  it('busca el duplicado por paciente, profesional y estados activos', async () => {
    mock.maybeSingle.mockResolvedValue({ data: { id: 'uuid' }, error: null })

    await expect(derivacionesService.create(body, 'user-uuid')).rejects.toThrow()

    expect(supabase.from).toHaveBeenCalledWith('derivaciones')
    expect(mock.eq).toHaveBeenCalledWith('paciente_id', 'p1')
    expect(mock.eq).toHaveBeenCalledWith('profesional_id', 'pr1')
    expect(mock.in).toHaveBeenCalledWith('estado', ['pendiente', 'aceptada'])
  })

  it('propaga el error si falla el chequeo de duplicado', async () => {
    mock.maybeSingle.mockResolvedValue({ data: null, error: new Error('fallo de conexión') })

    await expect(derivacionesService.create(body, 'user-uuid'))
      .rejects.toThrow('fallo de conexión')
    expect(mock.insert).not.toHaveBeenCalled()
  })

  it('crea la derivación si no hay duplicado', async () => {
    // 1. Chequeo: no existe
    mock.maybeSingle.mockResolvedValue({ data: null, error: null })
    // 2. Insert devuelve el id nuevo
    mock.single.mockResolvedValueOnce({ data: { id: 'd-nueva' }, error: null })
    // 3. getById devuelve la derivación completa
    const derivacionCompleta = {
      id: 'd-nueva',
      ...body,
      estado: 'pendiente',
      derivado_por: 'user-uuid'
    }
    mock.single.mockResolvedValueOnce({ data: derivacionCompleta, error: null })

    const resultado = await derivacionesService.create(body, 'user-uuid')

    // El insert se hace una sola vez, con el body + quién derivó
    expect(mock.insert).toHaveBeenCalledTimes(1)
    expect(mock.insert).toHaveBeenCalledWith({ ...body, derivado_por: 'user-uuid' })
    // Después busca la derivación por el id nuevo
    expect(mock.eq).toHaveBeenCalledWith('id', 'd-nueva')
    expect(resultado).toEqual(derivacionCompleta)
  })
})
