// JWT_SECRET tiene que existir ANTES de cargar la app
process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto_de_test'

// Solo se mockea la base de datos. Middlewares, controller, service y JWT son reales.
jest.mock('../../src/db/supabaseClient', () => ({ from: jest.fn() }))

const request = require('supertest')
const jwt = require('jsonwebtoken')
const supabase = require('../../src/db/supabaseClient')
const app = require('../../src/app')

function chain(result) {
  const c = {}
  ;['select', 'insert', 'update', 'delete', 'eq', 'neq', 'in', 'order', 'limit', 'single', 'maybeSingle']
    .forEach(m => { c[m] = jest.fn(() => c) })
  c.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject)
  return c
}

const tokenAdmin = jwt.sign(
  { id: 'admin-1', email: 'admin@mail.com', rol: 'administrador' },
  process.env.JWT_SECRET
)
const tokenProfesional = jwt.sign(
  { id: 'prof-1', email: 'prof@mail.com', rol: 'profesional' },
  process.env.JWT_SECRET
)

describe('POST /api/derivaciones', () => {
  beforeEach(() => {
    supabase.from.mockReset()
  })

  it('403 si el usuario es profesional (no administrador)', async () => {
    const res = await request(app)
      .post('/api/derivaciones')
      .set('Authorization', `Bearer ${tokenProfesional}`)
      .send({ paciente_id: 'p1', profesional_id: 'pr1' })

    expect(res.status).toBe(403)
  })

  it('400 si faltan paciente_id o profesional_id', async () => {
    const res = await request(app)
      .post('/api/derivaciones')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ paciente_id: 'p1' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/requeridos/)
  })

  it('400 si ya existe una derivación pendiente o activa', async () => {
    // 1ª consulta (chequeo de duplicado): devuelve una derivación existente
    supabase.from.mockReturnValueOnce(chain({ data: { id: 'existente' }, error: null }))

    const res = await request(app)
      .post('/api/derivaciones')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ paciente_id: 'p1', profesional_id: 'pr1' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/derivación pendiente/)
    expect(supabase.from).toHaveBeenCalledTimes(1) // nunca llegó al insert
  })

  it('201 si se crea correctamente', async () => {
    supabase.from
      // 1ª: chequeo de duplicado → no existe
      .mockReturnValueOnce(chain({ data: null, error: null }))
      // 2ª: insert → devuelve la derivación creada
      .mockReturnValueOnce(chain({ data: { id: 'd1' }, error: null }))
      // 3ª: getById final → devuelve la derivación completa
      .mockReturnValueOnce(chain({
        data: { id: 'd1', paciente_id: 'p1', profesional_id: 'pr1', estado: 'pendiente' },
        error: null
      }))

    const res = await request(app)
      .post('/api/derivaciones')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ paciente_id: 'p1', profesional_id: 'pr1' })

    expect(res.status).toBe(201)
    expect(res.body.id).toBe('d1')
    expect(res.body.estado).toBe('pendiente')
  })
})