const supabase = require('../../db/supabaseClient')

const getAll = async () => {
  const { data, error } = await supabase
    .from('profesionales')
    .select(`
      *,
      usuario:usuarios(id, email, rol),
      especializaciones:profesionales_especializaciones(
        especializacion:especializaciones(id, nombre, descripcion)
      )
    `)
    .order('apellido', { ascending: true })
  if (error) throw error
  return data
}

const getByUsuarioId = async (usuarioId) => {
  const { data, error } = await supabase
    .from('profesionales')
    .select(`
      *,
      usuario:usuarios(id, email, rol)
    `)
    .eq('usuario_id', usuarioId)
    .maybeSingle()  // Retorna null si no existe (no lanza error)
  if (error) throw error
  return data  // null si no tiene perfil aún
}

const getById = async (id) => {
  const { data, error } = await supabase
    .from('profesionales')
    .select(`
      *,
      usuario:usuarios(id, email, rol),
      especializaciones:profesionales_especializaciones(
        especializacion:especializaciones(id, nombre, descripcion)
      )
    `)
    .eq('id', id)
    .single()
  if (error || !data) throw new Error('Profesional no encontrado')
  return data
}

const create = async (body) => {
  const { especializacion_ids, ...profesionalData } = body
  const { data, error } = await supabase
    .from('profesionales')
    .insert(profesionalData)
    .select()
    .single()
  if (error) throw error

  // Asociar especializaciones si se enviaron
  if (especializacion_ids && especializacion_ids.length > 0) {
    const relaciones = especializacion_ids.map(eid => ({
      profesional_id: data.id,
      especializacion_id: eid
    }))
    const { error: relError } = await supabase
      .from('profesionales_especializaciones')
      .insert(relaciones)
    if (relError) throw relError
  }

  return getById(data.id)
}

const update = async (id, body) => {
  const { especializacion_ids, ...profesionalData } = body

  if (Object.keys(profesionalData).length > 0) {
    const { error } = await supabase
      .from('profesionales')
      .update(profesionalData)
      .eq('id', id)
    if (error) throw error
  }

  // Reemplazar especializaciones si se enviaron
  if (especializacion_ids !== undefined) {
    await supabase
      .from('profesionales_especializaciones')
      .delete()
      .eq('profesional_id', id)

    if (especializacion_ids.length > 0) {
      const relaciones = especializacion_ids.map(eid => ({
        profesional_id: id,
        especializacion_id: eid
      }))
      const { error: relError } = await supabase
        .from('profesionales_especializaciones')
        .insert(relaciones)
      if (relError) throw relError
    }
  }

  return getById(id)
}

const remove = async (id) => {
  const { error } = await supabase
    .from('profesionales')
    .delete()
    .eq('id', id)
  if (error) throw error
  return { mensaje: 'Profesional eliminado correctamente' }
}

module.exports = { getAll, getByUsuarioId, getById, create, update, remove }
