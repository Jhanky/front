import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdFilterList, MdSearch, MdClear, MdReceipt, MdBarChart } from "react-icons/md";
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
    cost_center_name: ""
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);

  // Estados para estadísticas
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);

  // Estados para facturas del centro de costo
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);
  const [centroCostoInvoices, setCentroCostoInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // URL base dinámica - usando getApiUrl

  useEffect(() => {
    fetchCentrosCosto();
  }, [currentPage, perPage]);

  useEffect(() => {
    filterCentrosCosto();
  }, [centrosCosto, searchTerm]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const fetchCentrosCosto = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: perPage.toString()
      });

      const response = await fetch(getApiUrl(`/api/cost-centers?${params}`), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setCentrosCosto(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
        setTotalItems(data.data.total || 0);
        setCurrentPage(data.data.current_page || 1);
      } else {
        throw new Error(data.message || "Error al cargar los centros de costo");
      }
      
    } catch (error) {
      console.error('Error al obtener centros de costo:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar centros de costo localmente
  const filterCentrosCosto = () => {
    // Esta función se ejecuta cuando cambia searchTerm
    // La búsqueda real se hace en el servidor
  };

  // Función para búsqueda en el servidor
  const handleSearchSubmit = async () => {
    if (!searchTerm.trim()) {
      fetchCentrosCosto();
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const params = new URLSearchParams({
        q: searchTerm,
        page: currentPage.toString(),
        per_page: perPage.toString()
      });

      const response = await fetch(getApiUrl(`/api/cost-centers/search?${params}`), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setCentrosCosto(data.data.data || []);
        setTotalPages(data.data.last_page || 1);
        setTotalItems(data.data.total || 0);
        setCurrentPage(data.data.current_page || 1);
      } else {
        throw new Error(data.message || "Error en la búsqueda");
      }
      
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener estadísticas
  const fetchStatistics = async () => {
    try {
      setStatisticsLoading(true);
      
      const response = await fetch(getApiUrl('/api/cost-centers/statistics'), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setStatistics(data.data);
      } else {
        throw new Error(data.message || "Error al cargar las estadísticas");
      }
      
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setError(error.message);
    } finally {
      setStatisticsLoading(false);
    }
  };

  // Función para obtener facturas de un centro de costo
  const fetchCentroCostoInvoices = async (centroCostoId) => {
    try {
      setInvoicesLoading(true);
      
      const response = await fetch(getApiUrl(`/api/cost-centers/${centroCostoId}/invoices`), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setCentroCostoInvoices(data.data.invoices.data || []);
      } else {
        throw new Error(data.message || "Error al cargar las facturas");
      }
      
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      setError(error.message);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      cost_center_name: ""
    });
    setFormError("");
    setIsEditMode(false);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (centroCosto) => {
    setSelectedCentroCosto(centroCosto);
    setFormData({
      cost_center_name: centroCosto.cost_center_name || ""
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

  const handleStatistics = () => {
    fetchStatistics();
    setIsStatisticsModalOpen(true);
  };

  const handleViewInvoices = (centroCosto) => {
    setSelectedCentroCosto(centroCosto);
    fetchCentroCostoInvoices(centroCosto.cost_center_id);
    setIsInvoicesModalOpen(true);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCurrentPage(1);
    fetchCentrosCosto();
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
      if (!formData.cost_center_name) {
        throw new Error("Por favor complete el nombre del centro de costo");
      }

      const url = isEditMode 
        ? getApiUrl(`/api/cost-centers/${selectedCentroCosto.cost_center_id}`)
        : getApiUrl('/api/cost-centers');
      
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${user.token}`,
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
        // Actualizar el centro de costo en el estado local
        setCentrosCosto(prevCentros => 
          prevCentros.map(centro => 
            centro.cost_center_id === selectedCentroCosto.cost_center_id 
              ? { ...centro, ...data.data }
              : centro
          )
        );
        
        showNotification(`Centro de costo "${formData.cost_center_name}" actualizado exitosamente`, "success");
        setIsEditModalOpen(false);
      } else {
        // Agregar el nuevo centro de costo al estado local
        setCentrosCosto(prevCentros => [data.data, ...prevCentros]);
        
        showNotification(`Centro de costo "${formData.cost_center_name}" creado exitosamente`, "success");
        setIsCreateModalOpen(false);
      }

      // Limpiar formulario y estado
      setSelectedCentroCosto(null);
      setIsEditMode(false);
      setFormData({
        cost_center_name: ""
      });
      
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setFormLoading(true);

      const response = await fetch(getApiUrl(`/api/cost-centers/${selectedCentroCosto.cost_center_id}`), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar el centro de costo");
      }

      // Eliminar el centro de costo del estado local
      setCentrosCosto(prevCentros => 
        prevCentros.filter(centro => centro.cost_center_id !== selectedCentroCosto.cost_center_id)
      );

      showNotification(`Centro de costo "${selectedCentroCosto.cost_center_name}" eliminado exitosamente`, "success");

      // Cerrar modal y limpiar estado
      setIsDeleteModalOpen(false);
      setSelectedCentroCosto(null);
      
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-400">Error: {error}</div>
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
            <h1 className="text-2xl font-bold text-text-primary">
              Centros de Costo
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleStatistics}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-white hover:bg-blue-600 transition-colors"
                title="Ver Estadísticas"
              >
                <MdBarChart className="h-5 w-5" />
                Estadísticas
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 rounded-lg bg-accent-primary px-6 py-2.5 text-white hover:bg-accent-hover transition-colors"
              >
                <MdAdd className="h-5 w-5" />
                Nuevo Centro de Costo
              </button>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  placeholder="Buscar centros de costo por nombre..."
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-text-disabled/30 bg-primary text-text-primary focus:border-accent-primary focus:outline-none"
                />
                <MdSearch className="absolute left-3 top-2.5 h-4 w-4 text-text-disabled" />
              </div>
              <button
                onClick={handleSearchSubmit}
                className="flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover transition-colors"
              >
                <MdSearch className="h-4 w-4" />
                Buscar
              </button>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-lg border border-text-disabled/30 px-4 py-2 text-text-primary hover:bg-accent-primary/10 transition-colors"
                title="Limpiar búsqueda"
              >
                <MdClear className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tabla de centros de costo */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-text-disabled/20 bg-primary">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Facturas</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Total Facturado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Creado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {centrosCosto.map((centroCosto) => (
                  <tr key={centroCosto.cost_center_id} className="border-b border-text-disabled/20 hover:bg-accent-primary/10 transition-colors">
                    <td className="px-4 py-3 text-sm text-text-primary font-medium">{centroCosto.cost_center_name}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {centroCosto.invoices_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      ${centroCosto.total_invoiced ? Number(centroCosto.total_invoiced).toLocaleString('es-CO') : '0'}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {centroCosto.created_at ? new Date(centroCosto.created_at).toLocaleDateString('es-CO') : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(centroCosto)}
                          className="text-accent-primary hover:text-accent-hover transition-colors"
                          title="Ver detalles"
                        >
                          <MdVisibility className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleViewInvoices(centroCosto)}
                          className="text-blue-500 hover:text-blue-400 transition-colors"
                          title="Ver facturas"
                        >
                          <MdReceipt className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(centroCosto)}
                          className="text-orange-500 hover:text-orange-400 transition-colors"
                          title="Editar"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(centroCosto)}
                          className="text-red-500 hover:text-red-400 transition-colors"
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-text-secondary">
                Mostrando {((currentPage - 1) * perPage) + 1} a {Math.min(currentPage * perPage, totalItems)} de {totalItems} resultados
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-text-disabled/30 text-text-primary hover:bg-accent-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 text-text-primary">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-text-disabled/30 text-text-primary hover:bg-accent-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de Vista Detallada */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Detalles del Centro de Costo - ${selectedCentroCosto?.cost_center_name}`}
      >
        <div className="p-6 space-y-6">
          {selectedCentroCosto && (
            <>
              {/* Información Principal */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Información del Centro de Costo</h3>
                  <div className="grid grid-cols-2 gap-4 text-text-primary">
                    <div><span className="font-medium">Nombre:</span> {selectedCentroCosto.cost_center_name}</div>
                    <div><span className="font-medium">Facturas:</span> 
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {selectedCentroCosto.invoices_count || 0}
                      </span>
                    </div>
                    <div><span className="font-medium">Total Facturado:</span> 
                      <span className="ml-2 font-bold text-green-600">
                        ${selectedCentroCosto.total_invoiced ? Number(selectedCentroCosto.total_invoiced).toLocaleString('es-CO') : '0'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fechas de Creación y Actualización */}
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Fechas</h3>
                  <div className="grid grid-cols-2 gap-4 text-text-primary">
                    <div><span className="font-medium">Creado:</span> {formatDate(selectedCentroCosto.created_at)}</div>
                    <div><span className="font-medium">Actualizado:</span> {formatDate(selectedCentroCosto.updated_at)}</div>
                  </div>
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
              <div className="rounded-lg bg-red-500/20 p-4 text-red-400">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Nombre del Centro de Costo *
              </label>
              <input
                type="text"
                name="cost_center_name"
                value={formData.cost_center_name}
                onChange={handleFormChange}
                required
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="Ingrese el nombre del centro de costo"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={formLoading}
                className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-accent-primary/10 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
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
              <div className="rounded-lg bg-red-500/20 p-4 text-red-400">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Nombre del Centro de Costo *
              </label>
              <input
                type="text"
                name="cost_center_name"
                value={formData.cost_center_name}
                onChange={handleFormChange}
                required
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="Ingrese el nombre del centro de costo"
              />
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
                className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-accent-primary/10 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
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
            <div className="mb-4 rounded-lg bg-red-500/20 p-4 text-red-400">
              {formError}
            </div>
          )}
          
          <p className="text-text-secondary mb-4">
            ¿Está seguro que desea eliminar el centro de costo <strong>{selectedCentroCosto?.cost_center_name}</strong>?
          </p>
          
          <p className="text-sm text-text-disabled mb-6">
            <strong>Nota:</strong> Esta acción no se puede deshacer. Si el centro de costo tiene facturas asociadas, no se podrá eliminar.
          </p>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setFormError("");
                setSelectedCentroCosto(null);
              }}
              disabled={formLoading}
              className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-accent-primary/10 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={formLoading}
              className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {formLoading ? "Eliminando..." : "Eliminar Centro de Costo"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Estadísticas */}
      <Modal
        isOpen={isStatisticsModalOpen}
        onClose={() => setIsStatisticsModalOpen(false)}
        title="Estadísticas de Centros de Costo"
        size="large"
      >
        <div className="p-6">
          {statisticsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-text-secondary">Cargando estadísticas...</div>
            </div>
          ) : statistics ? (
            <div className="space-y-6">
              {/* Resumen General */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{statistics.total_cost_centers}</div>
                  <div className="text-sm text-blue-800">Total Centros de Costo</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{statistics.cost_centers_with_invoices}</div>
                  <div className="text-sm text-green-800">Con Facturas</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{statistics.cost_centers_without_invoices}</div>
                  <div className="text-sm text-gray-800">Sin Facturas</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">${Number(statistics.total_invoiced).toLocaleString('es-CO')}</div>
                  <div className="text-sm text-purple-800">Total Facturado</div>
                </div>
              </div>

              {/* Top Centros de Costo */}
              {statistics.top_cost_centers && statistics.top_cost_centers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Top Centros de Costo por Facturación</h3>
                  <div className="space-y-2">
                    {statistics.top_cost_centers.map((centro, index) => (
                      <div key={centro.cost_center_id} className="flex items-center justify-between p-3 bg-primary-card rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-accent-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-text-primary">{centro.cost_center_name}</div>
                            <div className="text-sm text-text-secondary">{centro.invoices_count} facturas</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-text-primary">${Number(centro.total_invoiced).toLocaleString('es-CO')}</div>
                          <div className="text-sm text-text-secondary">{centro.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-text-secondary">No se pudieron cargar las estadísticas</div>
          )}
        </div>
      </Modal>

      {/* Modal de Facturas del Centro de Costo */}
      <Modal
        isOpen={isInvoicesModalOpen}
        onClose={() => setIsInvoicesModalOpen(false)}
        title={`Facturas - ${selectedCentroCosto?.cost_center_name}`}
        size="large"
      >
        <div className="p-6">
          {invoicesLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-text-secondary">Cargando facturas...</div>
            </div>
          ) : centroCostoInvoices.length > 0 ? (
            <div className="space-y-4">
              {centroCostoInvoices.map((invoice) => (
                <div key={invoice.invoice_id} className="p-4 bg-primary-card rounded-lg border border-text-disabled/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-text-primary">{invoice.invoice_number}</div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      invoice.status === 'PAGADA' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="text-sm text-text-secondary mb-2">{invoice.description}</div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-text-disabled">Fecha:</span> {new Date(invoice.invoice_date).toLocaleDateString('es-CO')}
                    </div>
                    <div>
                      <span className="text-text-disabled">Vencimiento:</span> {new Date(invoice.due_date).toLocaleDateString('es-CO')}
                    </div>
                    <div className="font-bold text-text-primary">
                      ${Number(invoice.total_amount).toLocaleString('es-CO')}
                    </div>
                  </div>
                  {invoice.provider && (
                    <div className="mt-2 text-sm text-text-secondary">
                      <span className="text-text-disabled">Proveedor:</span> {invoice.provider.provider_name} ({invoice.provider.NIT})
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-text-secondary">No hay facturas para este centro de costo</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CentrosCosto;