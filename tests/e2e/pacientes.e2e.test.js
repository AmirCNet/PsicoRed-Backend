process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto_de_test'

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

const token = jwt.sign(
  { id: 'u1', email: 'test@mail.com', rol: 'profesional' },
  process.env.JWT_SECRET
)

describe('E2E POST /api/pacientes', () => {
  beforeEach(() => {
    supabase.from.mockReset()
  })

  // ── KIARA ───────────────────────────────────────────────
  it('201 con todos los datos válidos (recorre todas las capas)', async () => {
    const q = chain({
      data: { id: 10, nombre: 'Juan', apellido: 'Pérez', email: 'juan@mail.com', telefono: '123456', estado: 'activo' },
      error: null
    })
    supabase.from.mockReturnValue(q)

    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Juan', apellido: 'Pérez', email: 'juan@mail.com', telefono: '123456' })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ id: 10, nombre: 'Juan', estado: 'activo' })
    // el id del usuario del token llegó hasta el insert
    expect(q.insert).toHaveBeenCalledWith(
      expect.objectContaining({ creado_por: 'u1', estado: 'activo' })
    )
  })

  it('400 con email inválido', async () => {
    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Juan', apellido: 'Pérez', email: 'no-es-un-email', telefono: '123456' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('El correo electrónico no es válido')
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('401 sin token', async () => {
    const res = await request(app)
      .post('/api/pacientes')
      .send({ nombre: 'Juan', apellido: 'Pérez', email: 'juan@mail.com', telefono: '123456' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Token no proporcionado')
  })

  it('400 con datos incompletos', async () => {
    const res = await request(app)
      .post('/api/pacientes')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Juan' }) 

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Nombre, apellido, email y teléfono son requeridos') 
  })
})