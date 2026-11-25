import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './Panel.css'

export default function Panel() {
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarClave, setMostrarClave] = useState({})
  const [modalAbierto, setModalAbierto] = useState(false)
  
  // Estados para el formulario
  const [nuevoCorreo, setNuevoCorreo] = useState('')
  const [nuevaRed, setNuevaRed] = useState('')
  const [nuevaClave, setNuevaClave] = useState('')
  const [nuevoTelefono, setNuevoTelefono] = useState('')
  const [nuevaRecuperacion, setNuevaRecuperacion] = useState('')

  useEffect(() => {
    fetchCuentas()
  }, [])

  const fetchCuentas = async () => {
    setCargando(true)
    const { data, error } = await supabase.from('cuentas_tero').select('*').order('id', { ascending: false })
    if (!error) setCuentas(data)
    setCargando(false)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
  }

  const toggleClave = (id) => {
    setMostrarClave(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const guardarCuenta = async (e) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase.from('cuentas_tero').insert([{
      user_id: user.id,
      correo_principal: nuevoCorreo,
      red_plataforma: nuevaRed,
      clave_opcional: nuevaClave,
      telefono_asociado: nuevoTelefono,
      cuenta_recuperacion: nuevaRecuperacion
    }])

    if (!error) {
      setModalAbierto(false)
      setNuevoCorreo(''); setNuevaRed(''); setNuevaClave(''); setNuevoTelefono(''); setNuevaRecuperacion('')
      fetchCuentas()
    } else {
      alert("Error al guardar: " + error.message)
    }
  }

  const eliminarCuenta = async (id) => {
    if(window.confirm('¿Seguro que quieres eliminar esta cuenta?')) {
      await supabase.from('cuentas_tero').delete().eq('id', id)
      fetchCuentas()
    }
  }

  const cuentasFiltradas = cuentas.filter(c => 
    c.correo_principal.toLowerCase().includes(busqueda.toLowerCase()) || 
    c.red_plataforma.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="panel-container">
      <header className="panel-header">
        <div className="header-title">
          <img src="/logo.png" alt="Tero" className="small-logo" />
          <h2>Tero-Uy</h2>
        </div>
        <button onClick={cerrarSesion} className="btn-logout">Cerrar Sesión</button>
      </header>

      <main className="panel-main">
        <div className="panel-actions">
          <input 
            type="text" 
            placeholder="🔍 Buscar por correo o red..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
          <button onClick={() => setModalAbierto(true)} className="btn-add">➕ Agregar</button>
        </div>

        <p className="counter">Mostrando {cuentasFiltradas.length} cuentas</p>

        {cargando ? (
          <p className="loading-text">Cargando tus cuentas...</p>
        ) : cuentasFiltradas.length === 0 ? (
          <p className="empty-text">Aún no tenés cuentas guardadas. ¡Agregá la primera!</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Correo</th>
                  <th>Red/Plataforma</th>
                  <th>Clave</th>
                  <th>Teléfono</th>
                  <th>Recuperación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cuentasFiltradas.map(c => (
                  <tr key={c.id}>
                    <td>{c.correo_principal}</td>
                    <td>{c.red_plataforma}</td>
                    <td>
                      {c.clave_opcional ? (
                        <div className="clave-cell">
                          <span>{mostrarClave[c.id] ? c.clave_opcional : '••••••'}</span>
                          <button onClick={() => toggleClave(c.id)} className="btn-eye">
                            {mostrarClave[c.id] ? '🙈' : '👁️'}
                          </button>
                        </div>
                      ) : '—'}
                    </td>
                    <td>{c.telefono_asociado || '—'}</td>
                    <td>{c.cuenta_recuperacion || '—'}</td>
                    <td>
                      <button onClick={() => eliminarCuenta(c.id)} className="btn-delete">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar Nueva Cuenta</h3>
            <form onSubmit={guardarCuenta}>
              <input type="email" placeholder="Correo principal (obligatorio)" value={nuevoCorreo} onChange={e => setNuevoCorreo(e.target.value)} required />
              <input type="text" placeholder="Red o Plataforma (obligatorio)" value={nuevaRed} onChange={e => setNuevaRed(e.target.value)} required />
              <input type="text" placeholder="Clave (opcional)" value={nuevaClave} onChange={e => setNuevaClave(e.target.value)} />
              <input type="text" placeholder="Teléfono asociado (opcional)" value={nuevoTelefono} onChange={e => setNuevoTelefono(e.target.value)} />
              <input type="text" placeholder="Cuenta de recuperación (opcional)" value={nuevaRecuperacion} onChange={e => setNuevaRecuperacion(e.target.value)} />
              
              <div className="modal-buttons">
                <button type="button" onClick={() => setModalAbierto(false)} className="btn-cancel">Cancelar</button>
                <button type="submit" className="btn-save">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
