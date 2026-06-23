const supabase = require('../../db/supabaseClient')

const getAll = async (filters = {}) => {
  let query = supabase
    .from('derivaciones')
    .select(`
      *,
      paciente:pacientes(id, nombre, apellido),
      profesional:profesionales(id, nombre, apellido),
      derivado_por_usuario:usuarios!derivaciones_derivado_por_fkey(id, email)
    `)
    .order('creado_en', { ascending: false })

  if (filters.profesional_id) query = query.eq('profesional_id', filters.profesional_id)
  if (filters.paciente_id)    query = query.eq('paciente_id', filters.paciente_id)
  if (filters.estado)         query = query.eq('estado', filters.estado)

  const { data, error } = await query
  if (error) throw error
  return data
}

const getById = async (id) => {
  const { data, error } = await supabase
    .from('derivaciones')
    .select(`
      *,
      paciente:pacientes(id, nombre, apellido),
      profesional:profesionales(id, nombre, apellido),
      derivado_por_usuario:usuarios!derivaciones_derivado_por_fkey(id, email)
    `)
    .eq('id', id)
    .single()
  if (error || !data) throw new Error('Derivación no encontrada')
  return data
}

const create = async (body, usuarioId) => {
  // Validar si ya existe una derivación activa (pendiente o aceptada) para esta misma pareja
  const { data: existente, error: checkError } = await supabase
    .from('derivaciones')
    .select('id')
    .eq('paciente_id', body.paciente_id)
    .eq('profesional_id', body.profesional_id)
    .in('estado', ['pendiente', 'aceptada'])
    .maybeSingle()

  if (checkError) throw checkError
  if (existente) {
    throw new Error('El paciente ya tiene una derivación pendiente o activa con este profesional')
  }

  const { data, error } = await supabase
    .from('derivaciones')
    .insert({ ...body, derivado_por: usuarioId })
    .select()
    .single()
  if (error) throw error
  return getById(data.id)
}

const update = async (id, cambios) => {
  const { data, error } = await supabase
    .from('derivaciones')
    .update(cambios)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return getById(id)
}

const remove = async (id) => {
  const { error } = await supabase
    .from('derivaciones')
    .delete()
    .eq('id', id)
  if (error) throw error
  return { mensaje: 'Derivación eliminada correctamente' }
}

module.exports = { getAll, getById, create, update, remove }
