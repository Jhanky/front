import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import { getApiUrl, API_CONFIG } from "config/api";
import Loading from "components/loading";

const CentrosCosto = () => {
  const { user } = useAuth();
  const [centrosCosto, setCentrosCosto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCentroCosto, setSelectedCentroCosto] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    status: "activo"
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // URL base dinámica
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://www.api.energy4cero.com/public';

  useEffect(() => {
    fetchCentrosCosto();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const fetchCentrosCosto = async () => {
    try {
      setLoading(true);
      
      // Obtener el token del localStorage
      const storedUser = localStorage.getItem('user');
      let token = null;
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token;
        } catch (error) {
          console.error('Error al parsear datos de usuario:', error);
        }
      }
      
      if (!token) {
        throw new Error('No se encontró token de autorización');
      }

      const response = await fetch(`${API_BASE_URL}/api/cost-centers`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error("Error al cargar los centros de costo");
      }

      const data = await response.json();
      setCentrosCosto(data);
    } catch (error) {
      console.error('Error al obtener centros de costo:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      code: "",
      name: "",
      description: "",
      status: "activo"
    });
    setFormError("");
    setIsEditMode(false);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (centroCosto) => {
    setSelectedCentroCosto(centroCosto);
    setFormData({
      code: centroCosto.code || "",
      name: centroCosto.name || "",
      description: centroCosto.description || "",
      status: centroCosto.status || "activo"
    });
    setFormError("");
    setIsEditMode(true);
    setIsEditModalOpen(true);
  };

  const handleDelete = (centroCosto) => {
    setSelectedCentroCosto(centroCosto);
    setIsDeleteModalOpen(true);
  };

  const handleView = (centroCosto) => {
    setSelectedCentroCosto(centroCosto);
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
      // Validaciones básicas
      if (!formData.code || !formData.name) {
        throw new Error("Por favor complete los campos obligatorios: Código y Nombre del Centro de Costo");
      }

      // Obtener el token del localStorage
      const storedUser = localStorage.getItem('user');
      let token = null;
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token;
        } catch (error) {
          console.error('Error al parsear datos de usuario:', error);
        }
      }
      
      if (!token) {
        throw new Error('No se encontró token de autorización');
      }

      const url = isEditMode 
        ? `${API_BASE_URL}/api/cost-centers/${selectedCentroCosto.id}`
        : `${API_BASE_URL}/api/cost-centers`;
      
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el centro de costo`);
      }

      const data = await response.json();

      if (isEditMode) {
        // Actualizar el centro de costo en el estado local dinámicamente
        const centroCostoActualizado = data.data || { ...selectedCentroCosto, ...formData };
        setCentrosCosto(prevCentros => 
          prevCentros.map(centro => 
            centro.id === selectedCentroCosto.id 
              ? centroCostoActualizado 
              : centro
          )
        );
        
        showNotification(`Centro de costo "${formData.name}" actualizado exitosamente`, "success");
        setIsEditModalOpen(false);
      } else {
        // Agregar el nuevo centro de costo al estado local dinámicamente
        const nuevoCentroCosto = data.data || { ...formData, id: Date.now() }; // Fallback temporal para ID
        setCentrosCosto(prevCentros => [nuevoCentroCosto, ...prevCentros]);
        
        showNotification(`Centro de costo "${formData.name}" creado exitosamente`, "success");
        setIsCreateModalOpen(false);
      }

      // Limpiar formulario y estado
      setSelectedCentroCosto(null);
      setIsEditMode(false);
      setFormData({
        code: "",
        name: "",
        description: "",
        status: "activo"
      });
      
      // NO llamar fetchCentrosCosto() aquí - esa es la clave
      
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setFormLoading(true);
      
      // Obtener el token del localStorage
      const storedUser = localStorage.getItem('user');
      let token = null;
      
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token;
        } catch (error) {
          console.error('Error al parsear datos de usuario:', error);
        }
      }
      
      if (!token) {
        throw new Error('No se encontró token de autorización');
      }

      const response = await fetch(`${API_BASE_URL}/api/cost-centers/${selectedCentroCosto.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar el centro de costo");
      }

      // Eliminar el centro de costo del estado local dinámicamente
      setCentrosCosto(prevCentros => 
        prevCentros.filter(centro => centro.id !== selectedCentroCosto.id)
      );

      showNotification(`Centro de costo "${selectedCentroCosto.name}" eliminado exitosamente`, "success");

      // Cerrar modal y limpiar estado
      setIsDeleteModalOpen(false);
      setSelectedCentroCosto(null);
      
      // NO llamar fetchCentrosCosto() aquí - esa es la clave
      
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
    return <Loading />;
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
              Centros de Costo
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-white hover:bg-green-700"
            >
              <MdAdd className="h-5 w-5" />
              Nuevo Centro de Costo
            </button>
          </div>

          {/* Tabla de centros de costo */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Código</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Descripción</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Fecha Creación</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {centrosCosto.map((centroCosto) => (
                  <tr key={centroCosto.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">{centroCosto.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{centroCosto.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{centroCosto.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(centroCosto.status)}`}>
                        {centroCosto.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{formatDate(centroCosto.created_at)}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(centroCosto)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Ver detalles"
                        >
                          <MdVisibility className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(centroCosto)}
                          className="text-orange-600 hover:text-orange-700"
                          title="Editar"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(centroCosto)}
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
        title={`Detalles del Centro de Costo - ${selectedCentroCosto?.name}`}
      >
        <div className="p-6 space-y-6">
          {selectedCentroCosto && (
            <>
              {/* Información Principal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Centro de Costo</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Código:</span> {selectedCentroCosto.code}</div>
                    <div><span className="font-medium">Nombre:</span> {selectedCentroCosto.name}</div>
                    <div><span className="font-medium">Estado:</span> 
                      <span className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedCentroCosto.status)}`}>
                        {selectedCentroCosto.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Descripción</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Descripción:</span> {selectedCentroCosto.description}</div>
                  </div>
                </div>
              </div>

              {/* Fechas de Creación y Actualización */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Fechas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="font-medium">Creado:</span> {formatDate(selectedCentroCosto.created_at)}</div>
                  <div><span className="font-medium">Actualizado:</span> {formatDate(selectedCentroCosto.updated_at)}</div>
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
        title="Nuevo Centro de Costo"
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
                  Código del Centro de Costo *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="CC001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Centro de Costo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ingrese el nombre del centro de costo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="3"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ingrese la descripción del centro de costo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="pendiente">Pendiente</option>
              </select>
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
                {formLoading ? "Guardando..." : "Guardar Centro de Costo"}
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
          setSelectedCentroCosto(null);
          setIsEditMode(false);
          setFormError("");
        }}
        title="Editar Centro de Costo"
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
                  Código del Centro de Costo *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="CC001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre del Centro de Costo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Ingrese el nombre del centro de costo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="3"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ingrese la descripción del centro de costo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedCentroCosto(null);
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
                {formLoading ? "Actualizando..." : "Actualizar Centro de Costo"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Centro de Costo"
      >
        <div className="p-6">
          {formError && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
              {formError}
            </div>
          )}
          
          <p className="text-gray-600 mb-4">
            ¿Está seguro que desea eliminar el centro de costo <strong>{selectedCentroCosto?.name}</strong>?
          </p>
          
          <p className="text-sm text-gray-500 mb-6">
            <strong>Nota:</strong> Esta acción no se puede deshacer.
          </p>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setFormError("");
                setSelectedCentroCosto(null);
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
              {formLoading ? "Eliminando..." : "Eliminar Centro de Costo"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CentrosCosto;