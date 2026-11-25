import { useState } from 'react'
import { supabase } from './supabaseClient'
import { validarLogin } from './lib/validaciones'
import { traducirError } from './lib/errores'
export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)

  const enviando = cargando

  async function manejarEnvio(evento) {
    evento.preventDefault()
    if (enviando) return

    const nuevos = validarLogin({ email, password })
    setErrores(nuevos)
    setErrorGeneral('')
    if (Object.keys(nuevos).length > 0) return

    setCargando(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      })
      if (error) {
        setErrorGeneral(traducirError(error))
        return
      }
      setPassword('')
      onLoginSuccess?.(data.session)
    } catch (error) {
      setErrorGeneral(traducirError(error))
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="login">
      <form className="login-tarjeta" onSubmit={manejarEnvio} noValidate>
        <img src="/logo.png" alt="Tero-Uy" className="login-logo" />
        <h1 className="login-titulo">Tero-Uy</h1>
        <p className="login-subtitulo">Tu guardián de cuentas</p>

        {errorGeneral && (
          <div className="alerta alerta-error" role="alert">{errorGeneral}</div>
        )}

        <div className="campo">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errores.email)}
            disabled={cargando}
          />
          {errores.email && <span className="error">{errores.email}</span>}
        </div>

        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errores.password)}
            disabled={cargando}
          />
          {errores.password && <span className="error">{errores.password}</span>}
        </div>

        <button type="submit" className="btn btn-primario login-boton" disabled={cargando}>
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </button>

        <p className="login-pie">Acceso privado</p>
      </form>
    </main>
  )
}
