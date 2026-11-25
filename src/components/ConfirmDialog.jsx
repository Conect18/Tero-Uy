import './ConfirmDialog.css'

export default function ConfirmDialog({ titulo, mensaje, textoConfirmar = 'Eliminar', onConfirmar, onCancelar, procesando }) {
  return (
    <div className="modal-fondo" role="presentation">
      <div className="confirmar" role="alertdialog" aria-modal="true" aria-labelledby="conf-titulo">
        <h2 id="conf-titulo" className="confirmar-titulo">{titulo}</h2>
        <p className="confirmar-mensaje">{mensaje}</p>
        <div className="confirmar-acciones">
          <button type="button" className="btn btn-neutro" onClick={onCancelar} disabled={procesando}>
            Cancelar
          </button>
          <button type="button" className="btn btn-peligro" onClick={onConfirmar} disabled={procesando}>
            {procesando ? 'Eliminando…' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
