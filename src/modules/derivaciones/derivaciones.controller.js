const derivacionesService = require('./derivaciones.service')

const getAll = async (req, res) => {
  try {
    const filters = {
      profesional_id: req.query.profesional_id,
      paciente_id:    req.query.paciente_id,
      estado:         req.query.estado
    }
    res.json(await derivacionesService.getAll(filters))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getById = async (req, res) => {
  try {
    res.json(await derivacionesService.getById(req.params.id))
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

const create = async (req, res) => {
  try {
    const { paciente_id, profesional_id } = req.body
    if (!paciente_id || !profesional_id) {
      return res.status(400).json({ error: 'paciente_id y profesional_id son requeridos' })
    }
    res.status(201).json(await derivacionesService.create(req.body, req.user.id))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const update = async (req, res) => {
  try {
    res.json(await derivacionesService.update(req.params.id, req.body))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const remove = async (req, res) => {
  try {
    res.json(await derivacionesService.remove(req.params.id))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = { getAll, getById, create, update, remove }
