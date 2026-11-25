import { useState } from 'react'
import { validarMaster } from '../lib/validaciones'
import './VaultLock.css'

export default function VaultLock({ onDesbloquear, tieneClaves }) {
  const [master, setMaster] = useState('')
  const [error, setError] = useState('')

  function enviar(evento) {
    evento.preventDefault()
    const fallo = validarMaster(master)
    if (fallo) {
      setError(fallo)
      return
    }
    setError('')
    onDesbloquear(master)
    setMaster('')
  }

  return (
    <section className="boveda">
      <h2 className="boveda-titulo">Bóveda bloqueada</h2>
      <p className="boveda-texto">
        {tieneClaves
          ? 'Introduce tu contraseña maestra para poder mostrar las claves guardadas.'
          : 'Introduce tu contraseña maestra. Se usará para cifrar las claves que agregues en esta sesión.'}
      </p>
      <form onSubmit={enviar} noValidate>
        <div className="campo">
          <label htmlFor="master">Contraseña maestra</label>
          <input
            id="master"
            type="password"
            autoComplete="off"
            value={master}
            onChange={(e) => setMaster(e.target.value)}
            aria-invalid={Boolean(error)}
          />
          {error && <span className="error">{error}</span>}
        </div>
        <button type="submit" className="btn btn-primario boveda-boton">Desbloquear</button>
      </form>
      <p className="boveda-nota">
        La contraseña maestra vive solo en la memoria de esta pestaña. No se guarda en el
        dispositivo ni se envía a Supabase.
      </p>
    </section>
  )
}
