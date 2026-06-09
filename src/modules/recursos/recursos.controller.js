const recursosService = require('./recursos.service')

const getAll = async (req, res) => {
  try {
    // Los admins pueden ver todos (incluidos inactivos) con ?todos=true
    const soloActivos = req.query.todos !== 'true'
    res.json(await recursosService.getAll(soloActivos))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getById = async (req, res) => {
  try {
    res.json(await recursosService.getById(req.params.id))
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

const create = async (req, res) => {
  try {
    const { titulo, url } = req.body
    if (!titulo || !url) {
      return res.status(400).json({ error: 'titulo y url son requeridos' })
    }
    res.status(201).json(await recursosService.create(req.body, req.user.id))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const update = async (req, res) => {
  try {
    res.json(await recursosService.update(req.params.id, req.body))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const remove = async (req, res) => {
  try {
    res.json(await recursosService.remove(req.params.id))
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = { getAll, getById, create, update, remove }
