const express = require('express')
const router = express.Router()
const ctrl = require('./especializaciones.controller')
const auth = require('../../middlewares/auth.middleware')
const rol = require('../../middlewares/rol.middleware')

router.get('/',       auth, ctrl.getAll)
router.get('/:id',    auth, ctrl.getById)
router.post('/',      auth, rol('administrador'), ctrl.create)
router.put('/:id',    auth, rol('administrador'), ctrl.update)
router.delete('/:id', auth, rol('administrador'), ctrl.remove)

module.exports = router
