import { useEffect, useRef, useState } from 'react'
import { validarCuenta } from '../lib/validaciones'
import './CuentaForm.css'

const VACIO = {
  correo_principal: '',
  red_plataforma: '',
  clave: '',
  telefono_asociado: '',
  cuenta_recuperacion: ''
}

export default function CuentaForm({
  cuenta,
  masterPassword,
  onGuardar,
  onCerrar,
  guardando,
  errorExterno
}) {
  const editando = Boolean(cuenta)
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [errorLocal, setErrorLocal] = useState('')
  const [quitarClave, setQuitarClave] = useState(false)
  const primerCampo = useRef(null)

  useEffect(() => {
    if (cuenta) {
      setDatos({
        correo_principal: cuenta.correo_principal ?? '',
        red_plataforma: cuenta.red_plataforma ?? '',
        clave: '',
        telefono_asociado: cuenta.telefono_asociado ?? '',
        cuenta_recuperacion: cuenta.cuenta_recuperacion ?? ''
      })
    } else {
      setDatos(VACIO)
    }
    setErrores({})
    setErrorLocal('')
    setQuitarClave(false)
    primerCampo.current?.focus()
  }, [cuenta])

  function cambiar(campo, valor) {
    setDatos((prev) => ({ ...prev, [campo]: valor }))
    setErrores((prev) => ({ ...prev, [campo]: undefined }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (guardando) return
    setErrorLocal('')

    const nuevos = validarCuenta(datos)
    setErrores(nuevos)
    if (Object.keys(nuevos).length > 0) return

    if (datos.clave && !masterPassword) {
      setErrorLocal('Desbloquea la bóveda antes de guardar una clave.')
      return
    }

    try {
      await onGuardar({ datos, quitarClave })
    } catch (error) {
      setErrorLocal(error.message)
    }
  }

  return (
    <div className="modal-fondo" role="presentation" onMouseDown={(e) => {
      if (e.target === e.currentTarget && !guardando) onCerrar()
    }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-form">
        <div className="modal-cabecera">
          <h2 id="titulo-form" className="modal-titulo">
            {editando ? 'Editar cuenta' : 'Agregar cuenta'}
          </h2>
          <button type="button" className="modal-cerrar" onClick={onCerrar} disabled={guardando} aria-label="Cerrar">
            ×
          </button>
        </div>

        <form onSubmit={enviar} noValidate className="modal-cuerpo">
          {(errorLocal || errorExterno) && (
            <div className="alerta alerta-error" role="alert">{errorLocal || errorExterno}</div>
          )}

          <div className="campo">
            <label htmlFor="correo_principal">Correo principal *</label>
            <input
              id="correo_principal"
              ref={primerCampo}
              type="email"
              inputMode="email"
              value={datos.correo_principal}
              onChange={(e) => cambiar('correo_principal', e.target.value)}
              aria-invalid={Boolean(errores.correo_principal)}
              disabled={guardando}
            />
            {errores.correo_principal && <span className="error">{errores.correo_principal}</span>}
          </div>

          <div className="campo">
            <label htmlFor="red_plataforma">Red / plataforma *</label>
            <input
              id="red_plataforma"
              type="text"
              value={datos.red_plataforma}
              onChange={(e) => cambiar('red_plataforma', e.target.value)}
              aria-invalid={Boolean(errores.red_plataforma)}
              disabled={guardando}
            />
            {errores.red_plataforma && <span className="error">{errores.red_plataforma}</span>}
          </div>

          <div className="campo">
            <label htmlFor="clave">
              Clave {editando && <span className="ayuda">(vacío = conservar la actual)</span>}
            </label>
            <input
              id="clave"
              type="password"
              autoComplete="off"
              value={datos.clave}
              onChange={(e) => cambiar('clave', e.target.value)}
              disabled={guardando || quitarClave}
              placeholder={editando ? '••••••' : ''}
            />
          </div>

          {editando && cuenta.clave_cifrada && (
            <label className="checkbox">
              <input
                type="checkbox"
                checked={quitarClave}
                onChange={(e) => {
                  setQuitarClave(e.target.checked)
                  if (e.target.checked) cambiar('clave', '')
                }}
                disabled={guardando}
              />
              Eliminar la clave guardada
            </label>
          )}

          <div className="campo">
            <label htmlFor="telefono_asociado">Teléfono asociado</label>
            <input
              id="telefono_asociado"
              type="tel"
              inputMode="tel"
              value={datos.telefono_asociado}
              onChange={(e) => cambiar('telefono_asociado', e.target.value)}
              aria-invalid={Boolean(errores.telefono_asociado)}
              disabled={guardando}
            />
            {errores.telefono_asociado && <span className="error">{errores.telefono_asociado}</span>}
          </div>

          <div className="campo">
            <label htmlFor="cuenta_recuperacion">Cuenta de recuperación</label>
            <input
              id="cuenta_recuperacion"
              type="text"
              value={datos.cuenta_recuperacion}
              onChange={(e) => cambiar('cuenta_recuperacion', e.target.value)}
              aria-invalid={Boolean(errores.cuenta_recuperacion)}
              disabled={guardando}
            />
            {errores.cuenta_recuperacion && <span className="error">{errores.cuenta_recuperacion}</span>}
          </div>

          <div className="modal-acciones">
            <button type="button" className="btn btn-neutro" onClick={onCerrar} disabled={guardando}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primario" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
