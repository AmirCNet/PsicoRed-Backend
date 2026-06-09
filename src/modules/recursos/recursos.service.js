const supabase = require('../../db/supabaseClient')

const getAll = async (soloActivos = true) => {
  let query = supabase
    .from('recursos')
    .select(`
      *,
      creado_por_usuario:usuarios!recursos_creado_por_fkey(id, email)
    `)
    .order('creado_en', { ascending: false })

  if (soloActivos) query = query.eq('activo', true)

  const { data, error } = await query
  if (error) throw error
  return data
}

const getById = async (id) => {
  const { data, error } = await supabase
    .from('recursos')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) throw new Error('Recurso no encontrado')
  return data
}

const create = async (body, usuarioId) => {
  const { data, error } = await supabase
    .from('recursos')
    .insert({ ...body, creado_por: usuarioId })
    .select()
    .single()
  if (error) throw error
  return data
}

const update = async (id, cambios) => {
  const { data, error } = await supabase
    .from('recursos')
    .update(cambios)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

const remove = async (id) => {
  // Soft delete: desactivar
  const { data, error } = await supabase
    .from('recursos')
    .update({ activo: false })
    .eq('id', id)
    .select('id, activo')
    .single()
  if (error) throw error
  return data
}

module.exports = { getAll, getById, create, update, remove }
