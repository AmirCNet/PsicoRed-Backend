const bcrypt = require('bcryptjs')
const supabase = require('../../db/supabaseClient')

const getAll = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, email, rol, activo, creado_en, actualizado_en')
    .order('creado_en', { ascending: false })
  if (error) throw error
  return data
}

const getById = async (id) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, email, rol, activo, creado_en, actualizado_en')
    .eq('id', id)
    .single()
  if (error || !data) throw new Error('Usuario no encontrado')
  return data
}

// Devuelve los usuarios que aún no tienen rol asignado (pendientes de aprobación)
const getPendientes = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, email, activo, creado_en')
    .is('rol', null)
    .order('creado_en', { ascending: true })
  if (error) throw error
  return data
}

// Aprueba un usuario pendiente asignándole el rol de profesional
const aprobar = async (id) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ rol: 'profesional' })
    .eq('id', id)
    .is('rol', null)   // Solo se puede aprobar si está pendiente
    .select('id, email, rol')
    .single()
  if (error) throw error
  if (!data) throw new Error('Usuario no encontrado o ya tenía un rol asignado')
  return data
}

const create = async ({ email, password, rol }) => {
  const password_hash = await bcrypt.hash(password, 10)
  const { data, error } = await supabase
    .from('usuarios')
    .insert({ email, password_hash, rol })
    .select('id, email, rol, activo, creado_en')
    .single()
  if (error) throw error
  return data
}

const update = async (id, cambios) => {
  const updateData = { ...cambios }
  if (cambios.password) {
    updateData.password_hash = await bcrypt.hash(cambios.password, 10)
    delete updateData.password
  }
  const { data, error } = await supabase
    .from('usuarios')
    .update(updateData)
    .eq('id', id)
    .select('id, email, rol, activo')
    .single()
  if (error) throw error
  return data
}

// Soft delete: desactiva en lugar de borrar (preserva integridad referencial)
const remove = async (id) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update({ activo: false })
    .eq('id', id)
    .select('id, activo')
    .single()
  if (error) throw error
  return data
}

module.exports = { getAll, getById, getPendientes, aprobar, create, update, remove }
