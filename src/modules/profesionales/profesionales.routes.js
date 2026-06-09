const express = require('express')
const router = express.Router()
const ctrl = require('./profesionales.controller')
const auth = require('../../middlewares/auth.middleware')
const rol = require('../../middlewares/rol.middleware')

// Perfil propio del profesional logueado (va antes de /:id para no ser capturada como ID)
router.get('/mi-perfil', auth, rol('profesional', 'administrador'), ctrl.getMiPerfil)

router.get('/',       auth, ctrl.getAll)
router.get('/:id',    auth, ctrl.getById)
router.post('/',      auth, rol('administrador', 'profesional'), ctrl.create)
router.put('/:id',    auth, ctrl.update)
router.delete('/:id', auth, rol('administrador'), ctrl.remove)

module.exports = router
