import { supabase } from '../supabaseClient'

const TABLA = 'cuentas_tero'

export async function listarCuentas(userId) {
  const { data, error } = await supabase
    .from(TABLA)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function crearCuenta(userId, datos) {
  const { data, error } = await supabase
    .from(TABLA)
    .insert({ ...datos, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function actualizarCuenta(userId, id, datos) {
  const { data, error } = await supabase
    .from(TABLA)
    .update(datos)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function eliminarCuenta(userId, id) {
  const { error } = await supabase
    .from(TABLA)
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}

export function normalizar(datos) {
  const limpiar = (v) => {
    const t = (v ?? '').trim()
    return t === '' ? null : t
  }
  return {
    correo_principal: datos.correo_principal.trim(),
    red_plataforma: datos.red_plataforma.trim(),
    telefono_asociado: limpiar(datos.telefono_asociado),
    cuenta_recuperacion: limpiar(datos.cuenta_recuperacion)
  }
}
