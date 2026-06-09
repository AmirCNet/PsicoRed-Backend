const usuariosService = require('./usuarios.service')

const getAll = async (req, res) => {
  try {
    const data = await usuariosService.getAll()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getById = async (req, res) => {
  try {
    const data = await usuariosService.getById(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(404).json({ error: err.message })
  }
}

const getPendientes = async (req, res) => {
  try {
    const data = await usuariosService.getPendientes()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const aprobar = async (req, res) => {
  try {
    const data = await usuariosService.aprobar(req.params.id)
    res.json({ mensaje: 'Usuario aprobado correctamente', usuario: data })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const create = async (req, res) => {
  try {
    const { email, password, rol } = req.body
    if (!email || !password || !rol) {
      return res.status(400).json({ error: 'email, password y rol son requeridos' })
    }
    const data = await usuariosService.create({ email, password, rol })
    res.status(201).json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const update = async (req, res) => {
  try {
    const data = await usuariosService.update(req.params.id, req.body)
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

const remove = async (req, res) => {
  try {
    const data = await usuariosService.remove(req.params.id)
    res.json(data)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

module.exports = { getAll, getById, getPendientes, aprobar, create, update, remove }
