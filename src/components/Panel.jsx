import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './Header'
import VaultLock from './VaultLock'
import CuentaForm from './CuentaForm'
import CuentaCard from './CuentaCard'
import ConfirmDialog from './ConfirmDialog'
import Toast from './Toast'
import {
  listarCuentas,
  crearCuenta,
  actualizarCuenta,
  eliminarCuenta,
  normalizar
} from '../lib/cuentas'
import { cifrarClave, descifrarClave } from '../lib/crypto'
import { traducirError } from '../lib/errores'
import './Panel.css'

const COLUMNAS = ['Correo', 'Plataforma', 'Clave', 'Teléfono', 'Recuperación', 'Acciones']

export default function Panel({ usuario, master, onDesbloquear, onCerrarSesion }) {
  const [cuentas, setCuentas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [errorCarga, setErrorCarga] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [enEdicion, setEnEdicion] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [porEliminar, setPorEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [toast, setToast] = useState(null)
  const [visibles, setVisibles] = useState({})
  const [descifrando, setDescifrando] = useState({})
  const montado = useRef(true)

  const avisar = useCallback((mensaje, tipo = 'exito') => setToast({ mensaje, tipo }), [])

  useEffect(() => {
    montado.current = true
    return () => {
      montado.current = false
      setVisibles({})
      setDescifrando({})
    }
  }, [])

  const cargar = useCallback(async () => {
    setCargando(true)
    setErrorCarga('')
    try {
      const datos = await listarCuentas(usuario.id)
      if (montado.current) setCuentas(datos)
    } catch (error) {
      if (montado.current) setErrorCarga(traducirError(error))
    } finally {
      if (montado.current) setCargando(false)
    }
  }, [usuario.id])

  useEffect(() => {
    cargar()
  }, [cargar])

  const filtradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    if (!termino) return cuentas
    return cuentas.filter(
      (c) =>
        c.correo_principal.toLowerCase().includes(termino) ||
        c.red_plataforma.toLowerCase().includes(termino)
    )
  }, [cuentas, busqueda])

  const totalClaves = useMemo(
    () => cuentas.filter((c) => c.clave_cifrada).length,
    [cuentas]
  )

  const nombreVisible = useMemo(() => {
    const correo = usuario.email ?? ''
    return correo.split('@')[0] || 'usuario'
  }, [usuario.email])

  function abrirAlta() {
    setEnEdicion(null)
    setErrorForm('')
    setModalAbierto(true)
  }

  function abrirEdicion(cuenta) {
    setEnEdicion(cuenta)
    setErrorForm('')
    setModalAbierto(true)
  }

  function cerrarModal() {
    if (guardando) return
    setModalAbierto(false)
    setEnEdicion(null)
    setErrorForm('')
  }

  async function guardar({ datos, quitarClave }) {
    setGuardando(true)
    setErrorForm('')
    try {
      const base = normalizar(datos)
      let cifrado
      if (datos.clave) {
        cifrado = await cifrarClave(datos.clave, master)
      } else if (quitarClave) {
        cifrado = { clave_cifrada: null, clave_salt: null, clave_iv: null }
      }

      if (enEdicion) {
        const payload = cifrado ? { ...base, ...cifrado } : base
        const actualizada = await actualizarCuenta(usuario.id, enEdicion.id, payload)
        setCuentas((prev) => prev.map((c) => (c.id === actualizada.id ? actualizada : c)))
        avisar('Cuenta actualizada.')
      } else {
        const payload = { ...base, ...(cifrado ?? {}) }
        const creada = await crearCuenta(usuario.id, payload)
        setCuentas((prev) => [creada, ...prev])
        avisar('Cuenta agregada.')
      }

      setVisibles((prev) => {
        if (!enEdicion) return prev
        const copia = { ...prev }
        delete copia[enEdicion.id]
        return copia
      })
      setModalAbierto(false)
      setEnEdicion(null)
    } catch (error) {
      setErrorForm(traducirError(error))
    } finally {
      if (montado.current) setGuardando(false)
    }
  }

  async function alternarVisibilidad(cuenta) {
    if (visibles[cuenta.id]) {
      setVisibles((prev) => {
        const copia = { ...prev }
        delete copia[cuenta.id]
        return copia
      })
      return
    }
    if (!master) {
      avisar('Desbloquea la bóveda primero.', 'error')
      return
    }
    setDescifrando((prev) => ({ ...prev, [cuenta.id]: true }))
    try {
      const plano = await descifrarClave(cuenta, master)
      if (!montado.current) return
      setVisibles((prev) => ({ ...prev, [cuenta.id]: plano ?? '' }))
    } catch (error) {
      if (montado.current) avisar(traducirError(error), 'error')
    } finally {
      if (montado.current) setDescifrando((prev) => ({ ...prev, [cuenta.id]: false }))
    }
  }

  async function confirmarEliminar() {
    if (!porEliminar) return
    setEliminando(true)
    try {
      await eliminarCuenta(usuario.id, porEliminar.id)
      setCuentas((prev) => prev.filter((c) => c.id !== porEliminar.id))
      setVisibles((prev) => {
        const copia = { ...prev }
        delete copia[porEliminar.id]
        return copia
      })
      avisar('Cuenta eliminada.')
      setPorEliminar(null)
    } catch (error) {
      avisar(traducirError(error), 'error')
    } finally {
      if (montado.current) setEliminando(false)
    }
  }

  function cerrarSesion() {
    setVisibles({})
    setDescifrando({})
    setCuentas([])
    setBusqueda('')
    onCerrarSesion()
  }

  const mostrarLista = !cargando && !errorCarga

  return (
    <div className="panel">
      <Header onCerrarSesion={cerrarSesion} onError={(m) => avisar(m, 'error')} />

      <main className="panel-contenido">
        <section className="panel-bienvenida">
          <h1 className="panel-saludo">Hola, {nombreVisible}</h1>
          <p className="panel-resumen">
            {cargando ? 'Cargando tus cuentas…' : `${cuentas.length} cuenta${cuentas.length === 1 ? '' : 's'} registrada${cuentas.length === 1 ? '' : 's'}`}
          </p>
        </section>

        {!master && (
          <VaultLock onDesbloquear={onDesbloquear} tieneClaves={totalClaves > 0} />
        )}

        {master && (
          <>
            <section className="panel-barra">
              <input
                type="search"
                className="buscador"
                placeholder="Buscar por correo o plataforma"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                aria-label="Buscar cuentas"
              />
              <button type="button" className="btn btn-primario" onClick={abrirAlta}>
                + Agregar cuenta
              </button>
            </section>

            {errorCarga && (
              <div className="alerta alerta-error" role="alert">
                {errorCarga}
                <button type="button" className="reintentar" onClick={cargar}>Reintentar</button>
              </div>
            )}

            {cargando && (
              <p className="estado" role="status">Cargando cuentas…</p>
            )}

            {mostrarLista && cuentas.length === 0 && (
              <div className="estado-vacio">
                <p className="estado-titulo">Todavía no hay cuentas</p>
                <p className="estado-texto">Agrega tu primera cuenta con el botón de arriba.</p>
              </div>
            )}

            {mostrarLista && cuentas.length > 0 && filtradas.length === 0 && (
              <div className="estado-vacio">
                <p className="estado-titulo">Sin resultados</p>
                <p className="estado-texto">Nada coincide con «{busqueda}».</p>
              </div>
            )}

            {mostrarLista && filtradas.length > 0 && (
              <div className="tabla" role="table" aria-label="Cuentas registradas">
                <div className="tabla-cabecera" role="row">
                  {COLUMNAS.map((col) => (
                    <span key={col} role="columnheader">{col}</span>
                  ))}
                </div>
                {filtradas.map((cuenta) => (
                  <CuentaCard
                    key={cuenta.id}
                    cuenta={cuenta}
                    visible={Boolean(visibles[cuenta.id])}
                    valorClave={visibles[cuenta.id]}
                    descifrando={Boolean(descifrando[cuenta.id])}
                    onAlternar={alternarVisibilidad}
                    onEditar={abrirEdicion}
                    onEliminar={setPorEliminar}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {modalAbierto && (
        <CuentaForm
          cuenta={enEdicion}
          masterPassword={master}
          onGuardar={guardar}
          onCerrar={cerrarModal}
          guardando={guardando}
          errorExterno={errorForm}
        />
      )}

      {porEliminar && (
        <ConfirmDialog
          titulo="Eliminar cuenta"
          mensaje={`¿Seguro que quieres eliminar ${porEliminar.correo_principal} de ${porEliminar.red_plataforma}? Esta acción no se puede deshacer.`}
          onConfirmar={confirmarEliminar}
          onCancelar={() => !eliminando && setPorEliminar(null)}
          procesando={eliminando}
        />
      )}

      <Toast
        mensaje={toast?.mensaje}
        tipo={toast?.tipo}
        onCerrar={() => setToast(null)}
      />
    </div>
  )
}
