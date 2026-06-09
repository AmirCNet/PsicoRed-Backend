const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// ── Middlewares ──────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}))
app.use(express.json())

// ── Health check ─ Para saber si el servidor está funcionando correctamente ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Rutas ──────────────────────────────────────────────────────────
app.use('/api/auth', require('./modules/auth/auth.routes'))
app.use('/api/usuarios', require('./modules/usuarios/usuarios.routes'))
app.use('/api/profesionales', require('./modules/profesionales/profesionales.routes'))
app.use('/api/especializaciones', require('./modules/especializaciones/especializaciones.routes'))
app.use('/api/pacientes', require('./modules/pacientes/pacientes.routes'))
app.use('/api/derivaciones', require('./modules/derivaciones/derivaciones.routes'))
app.use('/api/turnos', require('./modules/turnos/turnos.routes'))
app.use('/api/recursos', require('./modules/recursos/recursos.routes'))

// ── Rutas no encontradas ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.path} no encontrada` })
})

// ── Manejo de errores ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err)
  res.status(500).json({ error: 'Error interno del servidor' })
})

module.exports = app
