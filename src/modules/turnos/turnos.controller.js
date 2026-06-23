const turnosService = require('./turnos.service')

const getAll = async (req, res) => {
  try {
    const filters = {
      profesional_id: req.query.profesional_id,
      paciente_id:    req.query.paciente_id,
      estado:         req.query.estado,
      fecha_desde:    req.query.fecha_desde,
      fecha_hasta:    req.query.fecha_hasta
    }
    res.json(await turnosService.getAll(filters, req.user.id, req.user.rol))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getById = async (req, res) => {
  try {
    res.json(await turnosService.getById(req.params.id))
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

const create = async (req, res) => {
  try {
    const { paciente_id, profesional_id, fecha_hora } = req.body
    if (!paciente_id || !profesional_id || !fecha_hora) {
      return res.status(400).json({ error: 'paciente_id, profesional_id y fecha_hora son requeridos' })
    }
    res.status(201).json(await turnosService.create(req.body, req.user.id))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const update = async (req, res) => {
  try {
    res.json(await turnosService.update(req.params.id, req.body))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const remove = async (req, res) => {
  try {
    res.json(await turnosService.remove(req.params.id))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = { getAll, getById, create, update, remove }
