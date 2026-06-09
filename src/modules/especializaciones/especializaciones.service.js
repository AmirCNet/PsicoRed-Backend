const supabase = require('../../db/supabaseClient')

const getAll = async () => {
  const { data, error } = await supabase
    .from('especializaciones')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) throw error
  return data
}

const getById = async (id) => {
  const { data, error } = await supabase
    .from('especializaciones')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) throw new Error('Especialización no encontrada')
  return data
}

const create = async ({ nombre, descripcion }) => {
  const { data, error } = await supabase
    .from('especializaciones')
    .insert({ nombre, descripcion })
    .select()
    .single()
  if (error) throw error
  return data
}

const update = async (id, cambios) => {
  const { data, error } = await supabase
    .from('especializaciones')
    .update(cambios)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

const remove = async (id) => {
  const { error } = await supabase
    .from('especializaciones')
    .delete()
    .eq('id', id)
  if (error) throw error
  return { mensaje: 'Especialización eliminada correctamente' }
}

module.exports = { getAll, getById, create, update, remove }
