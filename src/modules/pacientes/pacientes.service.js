const supabase = require('../../db/supabaseClient')

const getAll = async (usuarioId, rolUsuario) => {
  let query = supabase
    .from('pacientes')
    .select('*')
    .order('apellido', { ascending: true })

  // Admin ve TODOS los pacientes sin filtro de estado
  if (rolUsuario === 'profesional') {
    query = query.eq('estado', 'activo')
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

const getById = async (id) => {
  const { data, error } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) throw new Error('Paciente no encontrado')
  return data
}

const create = async (body, usuarioId) => {
  const estadoFinal = body && body.estado ? body.estado : 'activo'
  const { data, error } = await supabase
    .from('pacientes')
    .insert({ ...body, creado_por: usuarioId, estado: estadoFinal })
    .select()
    .single()
  if (error) throw error
  return data
}

const update = async (id, cambios) => {
  const { data, error } = await supabase
    .from('pacientes')
    .update(cambios)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

const remove = async (id) => {
  // Cambiar estado a 'inactivo' en lugar de eliminar
  const { data, error } = await supabase
    .from('pacientes')
    .update({ estado: 'inactivo' })
    .eq('id', id)
    .select('id, estado')
    .single()
  if (error) throw error
  return data
}

module.exports = { getAll, getById, create, update, remove }
