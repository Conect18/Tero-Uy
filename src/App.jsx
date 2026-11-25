import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Panel from './components/Panel'
import './App.css'

export default function App() {
  const [sesion, setSesion] = useState(null)
  const [comprobando, setComprobando] = useState(true)
  const [master, setMaster] = useState('')
  const montado = useRef(true)

  useEffect(() => {
    montado.current = true
    let suscripcion = null

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!montado.current) return
        if (error) console.error('Sesión inicial:', error.message)
        setSesion(data?.session ?? null)
        setComprobando(false)
      })
      .catch(() => {
        if (montado.current) setComprobando(false)
      })

    const { data } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      if (!montado.current) return
      setSesion(nuevaSesion ?? null)
      setComprobando(false)
      if (!nuevaSesion) setMaster('')
    })
    suscripcion = data?.subscription

    return () => {
      montado.current = false
      suscripcion?.unsubscribe()
    }
  }, [])

  const manejarLogin = useCallback((nuevaSesion) => {
    setSesion(nuevaSesion ?? null)
  }, [])

  const manejarDesbloqueo = useCallback((valor) => {
    setMaster(valor)
  }, [])

  const manejarCierre = useCallback(() => {
    setMaster('')
    setSesion(null)
  }, [])

  if (comprobando) {
    return (
      <div className="app-cargando" role="status">
        <img src="/logo.png" alt="" className="app-cargando-logo" />
        <p>Cargando Tero-Uy…</p>
      </div>
    )
  }

  if (!sesion?.user) {
    return <Login onLoginSuccess={manejarLogin} />
  }

  return (
    <Panel
      key={sesion.user.id}
      usuario={sesion.user}
      master={master}
      onDesbloquear={manejarDesbloqueo}
      onCerrarSesion={manejarCierre}
    />
  )
}
