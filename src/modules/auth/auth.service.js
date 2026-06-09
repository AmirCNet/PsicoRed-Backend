const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../../db/supabaseClient')


// Loguea al usuario por email y password, retorna {token, usuario}
const login = async (email, password) => {
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .eq('activo', true)
    .single()

  if (error || !usuario) {
    throw new Error('Credenciales incorrectas')
  }

  const passwordValido = await bcrypt.compare(password, usuario.password_hash)
  if (!passwordValido) {
    throw new Error('Credenciales incorrectas')
  }

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  )

  return {
    token,
    usuario: {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    }
  }
}

// Retorna el perfil del usuario autenticado.
const getMe = async (userId) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, email, rol, activo, creado_en, actualizado_en')
    .eq('id', userId)
    .single()

  if (error || !data) throw new Error('Usuario no encontrado')
  return data
}

// Registra un nuevo usuario con rol null (pendiente de aprobación)
const register = async (email, password) => {
  // Verificar si el email ya existe
  const { data: existente } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email)
    .single()

  if (existente) {
    throw new Error('Ya existe una cuenta con ese correo electrónico')
  }

  const password_hash = await bcrypt.hash(password, 10)

  const { data: nuevoUsuario, error } = await supabase
    .from('usuarios')
    .insert({ email, password_hash, rol: null })
    .select('id, email, rol, activo, creado_en')
    .single()

  if (error) throw new Error(error.message)

  return {
    id: nuevoUsuario.id,
    email: nuevoUsuario.email,
    rol: nuevoUsuario.rol,
    activo: nuevoUsuario.activo
  }
}

module.exports = { login, getMe, register }
