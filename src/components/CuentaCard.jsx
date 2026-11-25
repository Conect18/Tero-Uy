import './CuentaCard.css'

export default function CuentaCard({
  cuenta,
  visible,
  valorClave,
  descifrando,
  onAlternar,
  onEditar,
  onEliminar
}) {
  const tieneClave = Boolean(cuenta.clave_cifrada)

  return (
    <div className="fila" role="row">
      <div className="celda celda-correo" role="cell" data-label="Correo">
        <span className="celda-valor">{cuenta.correo_principal}</span>
      </div>
      <div className="celda" role="cell" data-label="Plataforma">
        <span className="etiqueta">{cuenta.red_plataforma}</span>
      </div>
      <div className="celda celda-clave" role="cell" data-label="Clave">
        {!tieneClave && <span className="vacio">—</span>}
        {tieneClave && (
          <>
            <span className="celda-valor mono">
              {descifrando ? 'Descifrando…' : visible ? valorClave ?? '••••••' : '••••••'}
            </span>
            <button
              type="button"
              className="ojo"
              onClick={() => onAlternar(cuenta)}
              aria-label={visible ? 'Ocultar clave' : 'Mostrar clave'}
              aria-pressed={visible}
            >
              {visible ? 'Ocultar' : 'Ver'}
            </button>
          </>
        )}
      </div>
      <div className="celda" role="cell" data-label="Teléfono">
        <span className="celda-valor">{cuenta.telefono_asociado || '—'}</span>
      </div>
      <div className="celda" role="cell" data-label="Recuperación">
        <span className="celda-valor">{cuenta.cuenta_recuperacion || '—'}</span>
      </div>
      <div className="celda celda-acciones" role="cell" data-label="Acciones">
        <button type="button" className="btn btn-neutro accion" onClick={() => onEditar(cuenta)}>
          Editar
        </button>
        <button type="button" className="btn btn-peligro accion" onClick={() => onEliminar(cuenta)}>
          Eliminar
        </button>
      </div>
    </div>
  )
}
