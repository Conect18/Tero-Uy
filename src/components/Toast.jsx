import { useEffect } from 'react'
import './Toast.css'

export default function Toast({ mensaje, tipo = 'exito', onCerrar }) {
  useEffect(() => {
    if (!mensaje) return undefined
    const t = setTimeout(onCerrar, 3200)
    return () => clearTimeout(t)
  }, [mensaje, onCerrar])

  if (!mensaje) return null

  return (
    <div className={`toast toast-${tipo}`} role="status" aria-live="polite">
      <span>{mensaje}</span>
      <button type="button" onClick={onCerrar} aria-label="Cerrar aviso">×</button>
    </div>
  )
}
