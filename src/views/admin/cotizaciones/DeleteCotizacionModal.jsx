import React from "react";
import Modal from "components/modal";

const DeleteCotizacionModal = ({
  isOpen,
  onClose,
  selectedCotizacion,
  onConfirm
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Cotización"
    >
      <div className="p-4">
        <p className="text-text-secondary">
          ¿Está seguro que desea eliminar la cotización <strong>{selectedCotizacion?.project_name || selectedCotizacion?.nombre_proyecto}</strong>?
        </p>
        <p className="text-sm text-text-secondary mt-2">
          Esta acción no se puede deshacer.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-text-disabled/20 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-400 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteCotizacionModal;
