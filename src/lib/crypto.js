const ITERACIONES_PBKDF2 = 310000
const LARGO_SALT = 16
const LARGO_IV = 12
const LARGO_CLAVE = 256

const codificador = new TextEncoder()

function aBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  let binario = ''
  for (let i = 0; i < bytes.length; i += 1) binario += String.fromCharCode(bytes[i])
  return btoa(binario)
}

function deBase64(texto) {
  const binario = atob(texto)
  const bytes = new Uint8Array(binario.length)
  for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i)
  return bytes
}

function exigirWebCrypto() {
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error(
      'Web Crypto no disponible. Abre la app por http://localhost:5173 (no por la IP de la red).'
    )
  }
}

async function derivarClave(masterPassword, salt) {
  exigirWebCrypto()
  const material = await crypto.subtle.importKey(
    'raw',
    codificador.encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERACIONES_PBKDF2, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: LARGO_CLAVE },
    false,
    ['encrypt', 'decrypt']
  )
}

/** Devuelve { clave_cifrada, clave_salt, clave_iv } o los tres campos en null. */
export async function cifrarClave(clavePlana, masterPassword) {
  if (!clavePlana || clavePlana.length === 0) {
    return { clave_cifrada: null, clave_salt: null, clave_iv: null }
  }
  if (!masterPassword) throw new Error('MASTER_REQUERIDA')

  const salt = crypto.getRandomValues(new Uint8Array(LARGO_SALT))
  const iv = crypto.getRandomValues(new Uint8Array(LARGO_IV))
  const llave = await derivarClave(masterPassword, salt)
  const cifrado = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    llave,
    codificador.encode(clavePlana)
  )

  return {
    clave_cifrada: aBase64(cifrado),
    clave_salt: aBase64(salt),
    clave_iv: aBase64(iv)
  }
}

export async function descifrarClave(cuenta, masterPassword) {
  if (!cuenta?.clave_cifrada || !cuenta?.clave_salt || !cuenta?.clave_iv) return null
  if (!masterPassword) throw new Error('MASTER_REQUERIDA')

  const salt = deBase64(cuenta.clave_salt)
  const iv = deBase64(cuenta.clave_iv)
  const llave = await derivarClave(masterPassword, salt)

  try {
    const plano = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      llave,
      deBase64(cuenta.clave_cifrada)
    )
    return new TextDecoder().decode(plano)
  } catch {
    throw new Error('MASTER_INVALIDA')
  }
}
