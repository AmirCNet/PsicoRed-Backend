const supabase = require('../../db/supabaseClient')
const profesionalesService = require('../profesionales/profesionales.service')

const getAll = async (filters = {}, usuarioId, rolUsuario) => {
  let query = supabase
    .from('turnos')
    .select(`
      *,
      paciente:pacientes(id, nombre, apellido),
      profesional:profesionales(id, nombre, apellido),
      derivacion:derivaciones(id, motivo, estado),
      creado_por_usuario:usuarios!turnos_creado_por_fkey(id, email)
    `)
    .order('fecha_hora', { ascending: true })

  if (rolUsuario === 'profesional') {
    const perfil = await profesionalesService.getByUsuarioId(usuarioId)
    if (!perfil) return []
    filters.profesional_id = perfil.id
  }

  if (filters.profesional_id) query = query.eq('profesional_id', filters.profesional_id)
  if (filters.paciente_id)    query = query.eq('paciente_id', filters.paciente_id)
  if (filters.estado)         query = query.eq('estado', filters.estado)
  if (filters.fecha_desde)    query = query.gte('fecha_hora', filters.fecha_desde)
  if (filters.fecha_hasta)    query = query.lte('fecha_hora', filters.fecha_hasta)

  const { data, error } = await query
  if (error) throw error
  return data
}

const getById = async (id) => {
  const { data, error } = await supabase
    .from('turnos')
    .select(`
      *,
      paciente:pacientes(id, nombre, apellido),
      profesional:profesionales(id, nombre, apellido),
      derivacion:derivaciones(id, motivo, estado),
      creado_por_usuario:usuarios!turnos_creado_por_fkey(id, email)
    `)
    .eq('id', id)
    .single()
  if (error || !data) throw new Error('Turno no encontrado')
  return data
}

const create = async (body, usuarioId) => {
  const { data, error } = await supabase
    .from('turnos')
    .insert({ ...body, creado_por: usuarioId })
    .select()
    .single()
  // El constraint EXCLUDE de la DB ya previene solapamientos
  if (error) {
    if (error.code === '23P01') {
      throw new Error('El profesional ya tiene un turno en ese horario')
    }
    throw error
  }
  return getById(data.id)
}

const update = async (id, cambios) => {
  const {
    paciente_id,
    profesional_id,
    derivacion_id,
    fecha_hora,
    duracion_minutos,
    estado,
    notas_sesion
  } = cambios

  const fieldsToUpdate = {}
  if (paciente_id !== undefined) fieldsToUpdate.paciente_id = paciente_id
  if (profesional_id !== undefined) fieldsToUpdate.profesional_id = profesional_id
  if (derivacion_id !== undefined) fieldsToUpdate.derivacion_id = derivacion_id
  if (fecha_hora !== undefined) fieldsToUpdate.fecha_hora = fecha_hora
  if (duracion_minutos !== undefined) fieldsToUpdate.duracion_minutos = duracion_minutos
  if (estado !== undefined) fieldsToUpdate.estado = estado
  if (notas_sesion !== undefined) fieldsToUpdate.notas_sesion = notas_sesion

  const { data, error } = await supabase
    .from('turnos')
    .update(fieldsToUpdate)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return getById(id)
}

const remove = async (id) => {
  // Cancelar en lugar de eliminar
  const { data, error } = await supabase
    .from('turnos')
    .update({ estado: 'cancelado' })
    .eq('id', id)
    .select('id, estado')
    .single()
  if (error) throw error
  return data
}

module.exports = { getAll, getById, create, update, remove }
