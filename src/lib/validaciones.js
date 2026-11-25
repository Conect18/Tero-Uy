const RE_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validarCuenta(datos) {
  const errores = {}
  const correo = (datos.correo_principal ?? '').trim()
  const red = (datos.red_plataforma ?? '').trim()
  const telefono = (datos.telefono_asociado ?? '').trim()
  const recuperacion = (datos.cuenta_recuperacion ?? '').trim()

  if (!correo) errores.correo_principal = 'El correo es obligatorio.'
  else if (!RE_CORREO.test(correo)) errores.correo_principal = 'Correo con formato inválido.'
  else if (correo.length > 254) errores.correo_principal = 'Máximo 254 caracteres.'

  if (!red) errores.red_plataforma = 'La red o plataforma es obligatoria.'
  else if (red.length > 80) errores.red_plataforma = 'Máximo 80 caracteres.'

  if (telefono.length > 40) errores.telefono_asociado = 'Máximo 40 caracteres.'
  if (recuperacion.length > 254) errores.cuenta_recuperacion = 'Máximo 254 caracteres.'
  if (recuperacion && !RE_CORREO.test(recuperacion) && recuperacion.length < 3) {
    errores.cuenta_recuperacion = 'Dato de recuperación demasiado corto.'
  }

  return errores
}

export function validarLogin({ email, password }) {
  const errores = {}
  if (!email.trim()) errores.email = 'Ingresa tu correo.'
  else if (!RE_CORREO.test(email.trim())) errores.email = 'Correo con formato inválido.'
  if (!password) errores.password = 'Ingresa tu contraseña.'
  return errores
}

export function validarMaster(master) {
  if (!master) return 'La contraseña maestra es obligatoria.'
  if (master.length < 8) return 'Usa al menos 8 caracteres.'
  return null
}

