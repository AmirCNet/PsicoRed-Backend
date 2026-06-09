const express = require('express')
const router = express.Router()
const ctrl = require('./derivaciones.controller')
const auth = require('../../middlewares/auth.middleware')
const soloAdmin = require('../../middlewares/rol.middleware')('administrador')

router.get('/',       auth, ctrl.getAll)
router.get('/:id',    auth, ctrl.getById)
router.post('/',      auth, soloAdmin, ctrl.create)
router.put('/:id',    auth, soloAdmin, ctrl.update)
router.delete('/:id', auth, soloAdmin, ctrl.remove)

module.exports = router
