// Mockeamos Supabase: el service NUNCA toca la base real
jest.mock('../../src/db/supabaseClient', () => ({ from: jest.fn() }))

const supabase = require('../../src/db/supabaseClient')
const pacientesService = require('../../src/modules/pacientes/pacientes.service')

// Simula la cadena .from().insert().select().single() de Supabase
function chain(result) {
  const c = {}
  ;['select', 'insert', 'update', 'delete', 'eq', 'neq', 'in', 'order', 'limit', 'single', 'maybeSingle']
    .forEach(m => { c[m] = jest.fn(() => c) })
  c.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject)
  return c
}

describe('pacientes.service → create()', () => {
  const datos = { nombre: 'Juan', apellido: 'Pérez', email: 'juan@mail.com', telefono: '123456' }

  beforeEach(() => {
    supabase.from.mockReset()
  })

  it("asigna estado 'activo' por defecto cuando no se especifica", async () => {
    const q = chain({ data: { id: 1, ...datos, estado: 'activo' }, error: null })
    supabase.from.mockReturnValue(q)

    const resultado = await pacientesService.create(datos, 'user-1')

    expect(supabase.from).toHaveBeenCalledWith('pacientes')
    expect(q.insert).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'activo', creado_por: 'user-1' })
    )
    expect(resultado.estado).toBe('activo')
  })

  it('respeta el estado cuando viene en el body', async () => {
    const q = chain({ data: { id: 1, ...datos, estado: 'inactivo' }, error: null })
    supabase.from.mockReturnValue(q)

    const resultado = await pacientesService.create({ ...datos, estado: 'inactivo' }, 'user-1')

    expect(q.insert).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 'inactivo' })
    )
    expect(resultado.estado).toBe('inactivo')
  })

  it('lanza el error si Supabase devuelve error', async () => {
    const errorSupabase = { message: 'fallo de base de datos' }
    supabase.from.mockReturnValue(chain({ data: null, error: errorSupabase }))

    await expect(pacientesService.create(datos, 'user-1')).rejects.toEqual(errorSupabase)
  })
})