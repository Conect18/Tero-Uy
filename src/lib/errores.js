const MENSAJES = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  email_not_confirmed: 'Debes confirmar tu correo antes de ingresar.',
  over_email_send_rate_limit: 'Demasiados intentos. Espera unos minutos.',
  user_not_found: 'No existe una cuenta con ese correo.',
  weak_password: 'La contraseña es demasiado débil.',
  session_not_found: 'Tu sesión expiró. Vuelve a ingresar.',
  '23505': 'Ya tienes registrada esa cuenta en esa plataforma.',
  '23503': 'El usuario asociado no existe.',
  '23514': 'Algún dato no cumple el formato esperado.',
  '42501': 'Sin permisos para esa operación.',
  '42P01': 'La tabla cuentas_tero no existe. Ejecuta el SQL.',
  'PGRST301': 'La sesión expiró. Vuelve a ingresar.'
}

const LOCALES = {
  MASTER_REQUERIDA: 'Falta la contraseña maestra.',
  MASTER_INVALIDA: 'Contraseña maestra incorrecta: no se pudo descifrar.'
}

export function traducirError(error) {
  if (!error) return 'Ocurrió un error inesperado.'
  if (LOCALES[error.message]) return LOCALES[error.message]
  if (error.code === '42501') {
    return [
      MENSAJES['42501'],
      `Código: ${error.code}`,
      `Mensaje: ${error.message || 'No disponible'}`,
      `Detalles: ${error.details || 'Sin detalles'}`,
      `Sugerencia: ${error.hint || 'Sin sugerencias'}`
    ].join(' | ')
  }
  if (error.code && MENSAJES[error.code]) return MENSAJES[error.code]
  if (error.message) {
    const clave = Object.keys(MENSAJES).find((k) => error.message.includes(k))
    if (clave) return MENSAJES[clave]
    if (/network|fetch/i.test(error.message)) {
      return 'No hay conexión con el servidor. Revisa tu red.'
    }
    return error.message
  }
  return 'Ocurrió un error inesperado.'
}
