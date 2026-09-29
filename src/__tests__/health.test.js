const request = require('supertest')
const app = require('../app')

describe('GET /api/health', () => {
  it('debería responder 200 con status ok', async () => {
    const res = await request(app).get('/api/health')
    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body).toHaveProperty('timestamp')
  })
})
