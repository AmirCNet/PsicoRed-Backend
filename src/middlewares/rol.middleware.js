/**
 * Middleware de roles.
 * Uso: rolMiddleware('administrador') o rolMiddleware('administrador', 'profesional')
 */
const rolMiddleware = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        error: `Acción restringida. Roles permitidos: ${rolesPermitidos.join(', ')}`
      })
    }

    next()
  }
}

module.exports = rolMiddleware
