const express = require('express')
const router = express.Router()
const authController = require('./auth.controller')
const authMiddleware = require('../../middlewares/auth.middleware')

// POST /api/auth/login
router.post('/login', authController.login)

// POST /api/auth/register  (ruta pública)
router.post('/register', authController.register)

// GET /api/auth/me  (requiere token) --> Devuelve la info del usuario logueado
router.get('/me', authMiddleware, authController.me)

module.exports = router
