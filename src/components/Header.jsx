import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { traducirError } from '../lib/errores'
import './Header.css'

export default function Header({ onCerrarSesion, onError }) {
  const [saliendo, setSaliendo] = useState(false)

  async function cerrarSesion() {
    if (saliendo) return
    setSaliendo(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      onError?.(traducirError(error))
      setSaliendo(false)
      return
    }
    onCerrarSesion?.()
  }

  return (
    <header className="header">
      <div className="header-marca">
        <img src="/logo.png" alt="Tero-Uy" className="header-logo" />
        <div>
          <p className="header-nombre">Tero-Uy</p>
          <p className="header-lema">Tu guardián de cuentas</p>
        </div>
      </div>
      <button
        type="button"
        className="btn btn-neutro header-salir"
        onClick={cerrarSesion}
        disabled={saliendo}
      >
        {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
      </button>
    </header>
  )
}
