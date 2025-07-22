import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";

const Proveedores = () => {
  const { user } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    tax_id: "",
    address: "",
    phone: "",
    email: "",
    contact_name: "",
    contact_phone: ""
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/suppliers", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar los proveedores");
      }

      const data = await response.json();
      setProveedores(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      tax_id: "",
      address: "",
      phone: "",
      email: "",
      contact_name: "",
      contact_phone: ""
    });
    setFormError("");
    setIsEditMode(false);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (proveedor) => {
    setSelectedProveedor(proveedor);
    setFormData({
      name: proveedor.name || "",
      tax_id: proveedor.tax_id || "",
      address: proveedor.address || "",
      phone: proveedor.phone || "",
      email: proveedor.email || "",
      contact_name: proveedor.contact_name || "",
      contact_phone: proveedor.contact_phone || ""
    });
    setFormError("");
    setIsEditMode(true);
    setIsEditModalOpen(true);
  };

  const handleDelete = (proveedor) => {
    setSelectedProveedor(proveedor);
    setIsDeleteModalOpen(true);
  };

  const handleView = (proveedor) => {
    setSelectedProveedor(proveedor);
    setIsViewModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      // Validaciones básicas - solo name y tax_id son obligatorios
      if (!formData.name || !formData.tax_id) {
        throw new Error("Por favor complete los campos obligatorios: Nombre del Proveedor y NIT");
      }

      const url = isEditMode 
        ? `http://localhost:3000/api/suppliers/${selectedProveedor.id}`
        : "http://localhost:3000/api/suppliers";
      
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el proveedor`);
      }

      // Mostrar mensaje de éxito
      const successMessage = isEditMode 
        ? `Proveedor "${formData.name}" actualizado exitosamente`
        : `Proveedor "${formData.name}" creado exitosamente`;
      showNotification(successMessage, "success");

      // Cerrar modal y recargar lista
      if (isEditMode) {
        setIsEditModalOpen(false);
      } else {
        setIsCreateModalOpen(false);
      }
      setSelectedProveedor(null);
      setIsEditMode(false);
      fetchProveedores();
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(`http://localhost:3000/api/suppliers/${selectedProveedor.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar el proveedor");
      }

      // Mostrar mensaje de éxito
      showNotification(`Proveedor "${selectedProveedor.name}" eliminado exitosamente`, "success");

      // Cerrar modal y recargar lista
      setIsDeleteModalOpen(false);
      setSelectedProveedor(null);
      fetchProveedores();
    } catch (error) {
      setFormError(error.message);
      // Mantener el modal abierto para mostrar el error
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando proveedores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      {/* Notificación */}
      {notification.show && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-500"
              : notification.type === "error"
              ? "bg-red-500"
              : notification.type === "warning"
              ? "bg-yellow-500"
              : "bg-blue-500"
          } text-white`}
        >
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => setNotification({ show: false, message: "", type: "" })}
            className="ml-2 rounded-full p-1 hover:bg-white/20 focus:outline-none"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      )}

      <div className="col-span-1 h-fit w-full xl:col-span-2 2xl:col-span-3">
        <Card extra={"w-full h-full px-8 pb-8 sm:overflow-x-auto"}>
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Proveedores
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-white hover:bg-green-700"
            >
              <MdAdd className="h-5 w-5" />
              Nuevo Proveedor
            </button>
          </div>

          {/* Tabla de proveedores */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">NIT</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Contacto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Teléfono</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proveedores.map((proveedor) => (
                  <tr key={proveedor.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{proveedor.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{proveedor.tax_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{proveedor.contact_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{proveedor.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{proveedor.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(proveedor.status || 'activo')}`}>
                        {proveedor.status || 'Activo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(proveedor)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Ver detalles"
                        >
                          <MdVisibility className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(proveedor)}
                          className="text-orange-600 hover:text-orange-700"
                          title="Editar"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(proveedor)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal de Vista Detallada */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Detalles del Proveedor - ${selectedProveedor?.name}`}
      >
        <div className="p-6 space-y-6">
          {selectedProveedor && (
            <>
              {/* Información Principal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Proveedor</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Nombre:</span> {selectedProveedor.name}</div>
                    <div><span className="font-medium">NIT:</span> {selectedProveedor.tax_id}</div>
                    <div><span className="font-medium">Dirección:</span> {selectedProveedor.address}</div>
                    <div><span className="font-medium">Estado:</span> 
                      <span className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedProveedor.status || 'activo')}`}>
                        {selectedProveedor.status || 'Activo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Contacto</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Teléfono:</span> {selectedProveedor.phone}</div>
                    <div><span className="font-medium">Email:</span> {selectedProveedor.email}</div>
                    <div><span className="font-medium">Contacto:</span> {selectedProveedor.contact_name}</div>
                    <div><span className="font-medium">Teléfono de Contacto:</span> {selectedProveedor.contact_phone}</div>
                  </div>
                </div>
              </div>

              {/* Fechas de Creación y Actualización */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Fechas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-medium">Creado:</span> {formatDate(selectedProveedor.created_at)}</div>
                  <div><span className="font-medium">Actualizado:</span> {formatDate(selectedProveedor.updated_at)}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal de Creación */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Proveedor"
      >
        <div className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-lg bg-red-100 p-4 text-red-700">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ingrese el nombre del proveedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  NIT *
                </label>
                <input
                  type="text"
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="12345678-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ingrese la dirección del proveedor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="3001234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="proveedor@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Nombre del contacto principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono del Contacto
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="3009876543"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={formLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {formLoading ? "Guardando..." : "Guardar Proveedor"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProveedor(null);
          setIsEditMode(false);
          setFormError("");
        }}
        title="Editar Proveedor"
      >
        <div className="p-6">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-lg bg-red-100 p-4 text-red-700">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ingrese el nombre del proveedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  NIT *
                </label>
                <input
                  type="text"
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="12345678-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ingrese la dirección del proveedor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="3001234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="proveedor@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Nombre del contacto principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono del Contacto
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="3009876543"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedProveedor(null);
                  setIsEditMode(false);
                  setFormError("");
                }}
                disabled={formLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {formLoading ? "Actualizando..." : "Actualizar Proveedor"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Proveedor"
      >
        <div className="p-6">
          {formError && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
              {formError}
            </div>
          )}
          
          <p className="text-gray-600 mb-4">
            ¿Está seguro que desea eliminar el proveedor <strong>{selectedProveedor?.name}</strong>?
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            <strong>Nota:</strong> Si el proveedor tiene facturas asociadas, no se podrá eliminar.
          </p>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setFormError("");
                setSelectedProveedor(null);
              }}
              disabled={formLoading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={formLoading}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {formLoading ? "Eliminando..." : "Eliminar Proveedor"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Proveedores; 