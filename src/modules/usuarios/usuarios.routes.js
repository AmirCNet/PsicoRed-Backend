const express = require('express')
const router = express.Router()
const ctrl = require('./usuarios.controller')
const auth = require('../../middlewares/auth.middleware')
const rol = require('../../middlewares/rol.middleware')

// Solo administradores pueden gestionar usuarios
router.get('/pendientes',       auth, rol('administrador'), ctrl.getPendientes)
router.patch('/:id/aprobar',    auth, rol('administrador'), ctrl.aprobar)
router.get('/',                 auth, rol('administrador'), ctrl.getAll)
router.get('/:id',              auth, rol('administrador'), ctrl.getById)
router.post('/',                auth, rol('administrador'), ctrl.create)
router.put('/:id',              auth, rol('administrador'), ctrl.update)
router.delete('/:id',           auth, rol('administrador'), ctrl.remove)

module.exports = router
