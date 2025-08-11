import React, { useState } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdDownload } from "react-icons/md";
import Modal from "components/modal";


const formatCurrency = (value) => {
  if (value === undefined || value === null || value === "") return "";
  const num = Number(value.toString().replace(/[^\d]/g, ""));
  if (isNaN(num) || num === 0) return "";
  return `$ ${num.toLocaleString("es-CO")}`;
};

const parseCurrency = (value) => {
  if (!value) return 0;
  return Number(value.toString().replace(/[^\d]/g, ""));
};

const Propuestas = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPropuesta, setSelectedPropuesta] = useState(null);
  const [formData, setFormData] = useState({ precio: "" });

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (propuesta) => {
    setSelectedPropuesta(propuesta);
    setIsEditModalOpen(true);
  };

  const handleDelete = (propuesta) => {
    setSelectedPropuesta(propuesta);
    setIsDeleteModalOpen(true);
  };

  const handleDownload = (propuesta) => {
    // Aquí irá la lógica para descargar la propuesta en PDF
    console.log("Descargando propuesta:", propuesta);
  };

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-2 2xl:col-span-3">
        <Card extra={"w-full h-full px-8 pb-8 sm:overflow-x-auto"}>
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Propuestas
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-white hover:bg-green-700"
            >
              <MdAdd className="h-5 w-5" />
              Nueva Propuesta
            </button>
          </div>

          {/* Tabla de propuestas */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Número</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {/* Aquí irán los datos de las propuestas */}
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-3 text-sm text-gray-800">PROP-001</td>
                  <td className="px-4 py-3 text-sm text-gray-800">Juan Pérez</td>
                  <td className="px-4 py-3 text-sm text-gray-800">2024-03-20</td>
                  <td className="px-4 py-3 text-sm text-gray-800">COP 25.000.000</td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      En Revisión
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload({})}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <MdDownload className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEdit({})}
                        className="text-green-600 hover:text-green-700"
                      >
                        <MdEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete({})}
                        className="text-red-600 hover:text-red-700"
                      >
                        <MdDelete className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal de Creación */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nueva Propuesta"
      >
        <div className="p-4">
          <form className="space-y-4" onSubmit={e => {
            e.preventDefault();
            // Aquí se envía el valor numérico limpio:
            const precioNumerico = parseCurrency(formData.precio);
            // ...enviar precioNumerico al servicio junto con los demás datos
          }}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio Total
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="$ 0"
                value={formatCurrency(formData.precio)}
                onChange={e => {
                  // Permitir solo números y formatear visualmente
                  setFormData({ ...formData, precio: e.target.value });
                }}
                inputMode="numeric"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cliente
              </label>
              <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
                <option value="">Seleccione un cliente</option>
                <option value="1">Juan Pérez</option>
                <option value="2">María García</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sistema
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <select className="flex-1 rounded-md border border-gray-300 px-3 py-2">
                    <option value="">Seleccione un sistema</option>
                    <option value="residencial">Sistema Residencial</option>
                    <option value="comercial">Sistema Comercial</option>
                    <option value="industrial">Sistema Industrial</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Productos
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex gap-2">
                  <select className="flex-1 rounded-md border border-gray-300 px-3 py-2">
                    <option value="">Seleccione un producto</option>
                    <option value="panel">Panel Solar</option>
                    <option value="inversor">Inversor</option>
                    <option value="bateria">Batería</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Cantidad"
                    className="w-24 rounded-md border border-gray-300 px-3 py-2"
                  />
                  <button
                    type="button"
                    className="rounded-md bg-gray-100 px-3 py-2 text-gray-600 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Observaciones
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows="3"
                placeholder="Ingrese observaciones adicionales"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Propuesta"
      >
        <div className="p-4">
          <form className="space-y-4" onSubmit={e => {
            e.preventDefault();
            // Aquí se envía el valor numérico limpio:
            const precioNumerico = parseCurrency(formData.precio);
            // ...enviar precioNumerico al servicio junto con los demás datos
          }}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio Total
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="$ 0"
                value={formatCurrency(formData.precio)}
                onChange={e => {
                  setFormData({ ...formData, precio: e.target.value });
                }}
                inputMode="numeric"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cliente
              </label>
              <select 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                defaultValue={selectedPropuesta?.clienteId}
              >
                <option value="">Seleccione un cliente</option>
                <option value="1">Juan Pérez</option>
                <option value="2">María García</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                defaultValue={selectedPropuesta?.fecha}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                defaultValue={selectedPropuesta?.estado}
              >
                <option value="borrador">Borrador</option>
                <option value="revision">En Revisión</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sistema
              </label>
              <select 
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                defaultValue={selectedPropuesta?.sistema}
              >
                <option value="">Seleccione un sistema</option>
                <option value="residencial">Sistema Residencial</option>
                <option value="comercial">Sistema Comercial</option>
                <option value="industrial">Sistema Industrial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Productos
              </label>
              <div className="mt-2 space-y-2">
                {selectedPropuesta?.productos?.map((producto, index) => (
                  <div key={index} className="flex gap-2">
                    <select className="flex-1 rounded-md border border-gray-300 px-3 py-2">
                      <option value="">Seleccione un producto</option>
                      <option value="panel">Panel Solar</option>
                      <option value="inversor">Inversor</option>
                      <option value="bateria">Batería</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Cantidad"
                      className="w-24 rounded-md border border-gray-300 px-3 py-2"
                      defaultValue={producto.cantidad}
                    />
                    <button
                      type="button"
                      className="rounded-md bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mt-2 rounded-md bg-gray-100 px-3 py-2 text-gray-600 hover:bg-gray-200"
                >
                  Agregar Producto
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Observaciones
              </label>
              <textarea
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows="3"
                defaultValue={selectedPropuesta?.observaciones}
                placeholder="Ingrese observaciones adicionales"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Propuesta"
      >
        <div className="p-4">
          <p className="text-gray-600">
            ¿Está seguro que desea eliminar la propuesta {selectedPropuesta?.numero}?
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                // Aquí irá la lógica de eliminación
                setIsDeleteModalOpen(false);
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Propuestas; 