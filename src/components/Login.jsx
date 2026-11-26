import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { validarLogin } from '../lib/validaciones'
import { traducirError } from '../lib/errores'
import './Login.css'

export default function Login({ onLoginSuccess }) {
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  function cambiarModo(nuevoModo) {
    setModo(nuevoModo)
    setErrores({})
    setErrorGeneral('')
    setMensaje('')
    setPassword('')
    setConfirmarPassword('')
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    if (cargando) return

    setErrores({})
    setErrorGeneral('')
    setMensaje('')

    const nuevos = validarLogin({ email, password })

    if (modo === 'registro') {
      if (password.length < 8) {
        nuevos.password = 'Usa al menos 8 caracteres.'
      }

      if (password !== confirmarPassword) {
        nuevos.confirmarPassword = 'Las contraseñas no coinciden.'
      }
    }

    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    setCargando(true)

    try {
      if (modo === 'registro') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: 'https://tero-uy.vercel.app'
          }
        })

        if (error) {
          setErrorGeneral(traducirError(error))
          return
        }

        if (data.session) {
          setPassword('')
          setConfirmarPassword('')
          onLoginSuccess?.(data.session)
        } else {
          setMensaje(
            '¡Registro creado! Revisa tu correo electrónico para confirmar tu cuenta antes de ingresar.'
          )
          setPassword('')
          setConfirmarPassword('')
          setModo('login')
        }
      } else {
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
      }
    } catch (error) {
      setErrorGeneral(traducirError(error))
    } finally {
      setCargando(false)
    }
  }

  const registrando = modo === 'registro'

  return (
    <main className="login">
      <form className="login-tarjeta" onSubmit={manejarEnvio} noValidate>
        <img src="/logo.png" alt="Tero-Uy" className="login-logo" />

        <h1 className="login-titulo">Tero-Uy</h1>

        <p className="login-subtitulo">
          Tu guardián de cuentas
        </p>

        <div className="login-pestanas">
          <button
            type="button"
            className={!registrando ? 'activa' : ''}
            onClick={() => cambiarModo('login')}
            disabled={cargando}
          >
            Ingresar
          </button>

          <button
            type="button"
            className={registrando ? 'activa' : ''}
            onClick={() => cambiarModo('registro')}
            disabled={cargando}
          >
            Crear cuenta
          </button>
        </div>

        {errorGeneral && (
          <div className="alerta alerta-error" role="alert">
            {errorGeneral}
          </div>
        )}

        {mensaje && (
          <div className="alerta alerta-exito" role="status">
            {mensaje}
          </div>
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
            required
          />
          {errores.email && (
            <span className="error">{errores.email}</span>
          )}
        </div>

        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            autoComplete={registrando ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errores.password)}
            disabled={cargando}
            required
          />
          {errores.password && (
            <span className="error">{errores.password}</span>
          )}
        </div>

        {registrando && (
          <div className="campo">
            <label htmlFor="confirmarPassword">
              Confirmar contraseña
            </label>
            <input
              id="confirmarPassword"
              type="password"
              autoComplete="new-password"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              aria-invalid={Boolean(errores.confirmarPassword)}
              disabled={cargando}
              required
            />
            {errores.confirmarPassword && (
              <span className="error">
                {errores.confirmarPassword}
              </span>
            )}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primario login-boton"
          disabled={cargando}
        >
          {cargando
            ? 'Procesando…'
            : registrando
              ? 'Crear mi cuenta'
              : 'Ingresar'}
        </button>

        <p className="login-pie">
          {registrando
            ? 'Tu cuenta estará protegida por Supabase.'
            : 'Acceso privado'}
        </p>
      </form>
    </main>
  )
}
