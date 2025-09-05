import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdSearch, MdFilterList } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import { getApiUrl, API_CONFIG } from "config/api";
import Loading from "components/loading";

const Proveedores = () => {
  const { user } = useAuth();
  const [proveedores, setProveedores] = useState([]);
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    tax_id: "",
    address: "",
    phone: "",
    email: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    city: "",
    department: "",
    country: "Colombia",
    postal_code: "",
    description: "",
    website: "",
    status: "activo",
    category: "general",
    credit_limit: "",
    payment_terms: "",
    notes: ""
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchProveedores();
  }, []);

  // Efecto para filtrar proveedores cuando cambien los filtros
  useEffect(() => {
    filterProveedores();
  }, [proveedores, searchTerm, statusFilter, categoryFilter]);

  const filterProveedores = () => {
    console.log('Ejecutando filterProveedores con:', { proveedores: proveedores.length, searchTerm, statusFilter, categoryFilter });
    let filtered = [...proveedores];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(proveedor =>
        proveedor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.tax_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter) {
      filtered = filtered.filter(proveedor => 
        proveedor.status === statusFilter
      );
    }

    // Filtro por categoría
    if (categoryFilter) {
      filtered = filtered.filter(proveedor => 
        proveedor.category === categoryFilter
      );
    }

    console.log('Proveedores filtrados:', filtered.length);
    setFilteredProveedores(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setCategoryFilter("");
  };

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SUPPLIERS), {
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
      console.log('Datos recibidos de la API:', data);
      
      // La API devuelve: { success: true, data: { current_page: 1, data: [...] } }
      let proveedoresData = [];
      if (data.success && data.data && data.data.data) {
        proveedoresData = data.data.data; // Acceder a data.data.data
      } else if (data.data && Array.isArray(data.data)) {
        proveedoresData = data.data; // Fallback para estructura directa
      } else if (data.suppliers && Array.isArray(data.suppliers)) {
        proveedoresData = data.suppliers; // Fallback para estructura suppliers
      } else if (Array.isArray(data)) {
        proveedoresData = data; // Fallback para array directo
      }
      
      console.log('Proveedores procesados:', proveedoresData);
      
      setProveedores(proveedoresData);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-gray-100 text-gray-800';
      case 'suspendido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusName = (status) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'inactivo':
        return 'Inactivo';
      case 'suspendido':
        return 'Suspendido';
      default:
        return 'Activo';
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'equipos':
        return 'Equipos';
      case 'materiales':
        return 'Materiales';
      case 'servicios':
        return 'Servicios';
      case 'general':
        return 'General';
      default:
        return 'General';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
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
      contact_phone: "",
      contact_email: "",
      city: "",
      department: "",
      country: "Colombia",
      postal_code: "",
      description: "",
      website: "",
      status: "activo",
      category: "general",
      credit_limit: "",
      payment_terms: "",
      notes: ""
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
      contact_phone: proveedor.contact_phone || "",
      contact_email: proveedor.contact_email || "",
      city: proveedor.city || "",
      department: proveedor.department || "",
      country: proveedor.country || "Colombia",
      postal_code: proveedor.postal_code || "",
      description: proveedor.description || "",
      website: proveedor.website || "",
      status: proveedor.status || "activo",
      category: proveedor.category || "general",
      credit_limit: proveedor.credit_limit || "",
      payment_terms: proveedor.payment_terms || "",
      notes: proveedor.notes || ""
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
        ? getApiUrl(`${API_CONFIG.ENDPOINTS.SUPPLIERS}/${selectedProveedor.supplier_id}`)
        : getApiUrl(API_CONFIG.ENDPOINTS.SUPPLIERS);
      
      const method = isEditMode ? "PUT" : "POST";

      // Para edición, solo enviar los campos que han cambiado
      // Para creación, solo enviar campos que tengan valor
      let requestBody = {};
      
      if (isEditMode) {
        console.log('Proveedor original:', selectedProveedor);
        console.log('FormData actual:', formData);
        
        Object.keys(formData).forEach(key => {
          const originalValue = selectedProveedor[key];
          const currentValue = formData[key];
          
          // Solo incluir campos que han cambiado y no estén vacíos
          if (currentValue !== originalValue && currentValue !== "" && currentValue !== null && currentValue !== undefined) {
            requestBody[key] = currentValue;
            console.log(`Campo "${key}" cambiado:`, { original: originalValue, nuevo: currentValue });
          }
        });
        
        // Si no hay campos para actualizar, mostrar error
        if (Object.keys(requestBody).length === 0) {
          throw new Error("No hay cambios para actualizar");
        }
        
        console.log('Campos a actualizar:', requestBody);
      } else {
        // Para creación, solo enviar campos que tengan valor (no vacíos)
        Object.keys(formData).forEach(key => {
          const value = formData[key];
          if (value !== "" && value !== null && value !== undefined) {
            requestBody[key] = value;
          }
        });
        
        console.log('Campos para crear:', requestBody);
      }

      console.log('URL de la API:', url);
      console.log('Método:', method);
      console.log('Request Body:', requestBody);
      console.log('Request Body JSON:', JSON.stringify(requestBody));
      
      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error de la API:', errorData);
        
        // Mostrar mensaje de error más específico
        let errorMessage = errorData.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el proveedor`;
        
        // Si hay errores de validación específicos, mostrarlos
        if (errorData.error) {
          errorMessage = `${errorMessage}: ${errorData.error}`;
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Respuesta de la API:', responseData);
      console.log('Modo de edición:', isEditMode);
      console.log('Proveedor seleccionado:', selectedProveedor);
      
      // Verificar si los datos vienen en un wrapper
      let proveedorData = null;
      if (responseData.supplier) {
        proveedorData = responseData.supplier; // Para creación/actualización
        console.log('Datos extraídos de responseData.supplier');
      } else if (responseData.data) {
        proveedorData = responseData.data; // Fallback
        console.log('Datos extraídos de responseData.data');
      } else {
        proveedorData = responseData; // Fallback directo
        console.log('Datos extraídos directamente de responseData');
      }
      console.log('Proveedor procesado:', proveedorData);

      // Actualización dinámica del estado local
      if (isEditMode) {
        console.log('Estado actual antes de actualizar:', proveedores);
        console.log('Buscando proveedor con ID:', selectedProveedor.supplier_id);
        
        // Actualizar proveedor existente - usar directamente los datos de la API
        setProveedores(prev => {
          const updated = prev.map(proveedor => {
            if (proveedor.supplier_id === selectedProveedor.supplier_id) {
              console.log('Proveedor encontrado para actualizar:', proveedor);
              // Usar directamente los datos completos de la API
              console.log('Proveedor actualizado con datos de la API:', proveedorData);
              return proveedorData;
            }
            return proveedor;
          });
          console.log('Estado actualizado (edición):', updated);
          return updated;
        });
      } else {
        // Agregar nuevo proveedor
        setProveedores(prev => {
          const updated = [...prev, proveedorData];
          console.log('Estado actualizado (creación):', updated);
          return updated;
        });
      }

      // Mostrar mensaje de éxito
      const successMessage = isEditMode 
        ? `Proveedor "${formData.name}" actualizado exitosamente`
        : `Proveedor "${formData.name}" creado exitosamente`;
      showNotification(successMessage, "success");

      // Cerrar modal
      if (isEditMode) {
        setIsEditModalOpen(false);
      } else {
        setIsCreateModalOpen(false);
      }
      setSelectedProveedor(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error en handleFormSubmit:', error); // Agregar este log
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.SUPPLIERS}/${selectedProveedor.supplier_id}`), {
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

      // Actualización dinámica del estado local
      setProveedores(prev => prev.filter(proveedor => proveedor.supplier_id !== selectedProveedor.supplier_id));

      // Mostrar mensaje de éxito
      showNotification(`Proveedor "${selectedProveedor.name}" eliminado exitosamente`, "success");

      // Cerrar modal
      setIsDeleteModalOpen(false);
      setSelectedProveedor(null);
    } catch (error) {
      setFormError(error.message);
      // Mantener el modal abierto para mostrar el error
    } finally {
      setFormLoading(false);
    }
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
              Proveedores
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-accent-primary px-6 py-2.5 text-white hover:bg-accent-hover transition-colors"
            >
              <MdAdd className="h-5 w-5" />
              Nuevo Proveedor
            </button>
          </div>

                     {/* Filtros y Búsqueda */}
           <div className="mt-6 space-y-4">
             {/* Barra de búsqueda */}
             <div className="mb-4">
               <form onSubmit={(e) => { e.preventDefault(); }} className="flex gap-2">
                 <div className="relative flex-1">
                   <input
                     type="text"
                     placeholder="Buscar por nombre, NIT, contacto o ciudad..."
                     value={searchTerm}
                     onChange={handleSearch}
                     className="w-full rounded-lg border border-text-disabled/30 px-4 py-2 pl-10 focus:border-accent-primary focus:outline-none bg-primary-card text-text-primary"
                   />
                   <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-disabled" />
                 </div>
                 <button
                   type="submit"
                   className="rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover transition-colors"
                 >
                   Buscar
                 </button>
               </form>
             </div>
             
             {/* Filtros */}
             <div className="mb-4 flex flex-wrap gap-4">
               {/* Filtro por estado */}
               <div className="flex-1 min-w-[200px]">
                 <label className="block text-sm font-medium text-text-secondary mb-1">
                   Estado
                 </label>
                 <select
                   value={statusFilter}
                   onChange={(e) => setStatusFilter(e.target.value)}
                   className="w-full rounded-lg border border-text-disabled/30 px-3 py-2 focus:border-accent-primary focus:outline-none bg-primary-card text-text-primary"
                 >
                   <option value="">Todos los estados</option>
                   <option value="activo">Activo</option>
                   <option value="inactivo">Inactivo</option>
                   <option value="suspendido">Suspendido</option>
                 </select>
               </div>

               {/* Filtro por categoría */}
               <div className="flex-1 min-w-[200px]">
                 <label className="block text-sm font-medium text-text-secondary mb-1">
                   Categoría
                 </label>
                 <select
                   value={categoryFilter}
                   onChange={(e) => setCategoryFilter(e.target.value)}
                   className="w-full rounded-lg border border-text-disabled/30 px-3 py-2 focus:border-accent-primary focus:outline-none bg-primary-card text-text-primary"
                 >
                   <option value="">Todas las categorías</option>
                   <option value="equipos">Equipos</option>
                   <option value="materiales">Materiales</option>
                   <option value="servicios">Servicios</option>
                   <option value="general">General</option>
                 </select>
               </div>

               {/* Botón para limpiar filtros */}
               <div className="flex items-end">
                 <button
                   type="button"
                   onClick={clearFilters}
                   className="rounded-lg bg-text-disabled px-4 py-2 text-white hover:bg-text-secondary transition-colors"
                 >
                   Limpiar Filtros
                 </button>
               </div>
             </div>

                         {/* Contador de resultados */}
             <div className="mb-4 flex justify-between items-center">
               <div className="text-sm text-text-secondary">
                 Mostrando {filteredProveedores.length} de {proveedores.length} proveedores
               </div>
               {(searchTerm || statusFilter || categoryFilter) && (
                 <div className="text-sm text-text-secondary">
                   Filtros activos: 
                   {statusFilter && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded">Estado: {statusFilter}</span>}
                   {categoryFilter && <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded">Categoría: {categoryFilter}</span>}
                   {searchTerm && <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Búsqueda: "{searchTerm}"</span>}
                 </div>
               )}
             </div>
          </div>

          {/* Tabla de proveedores */}
          <div className="mt-4 overflow-x-auto">
            {filteredProveedores.length === 0 ? (
              <div className="text-center py-8">
                {proveedores.length === 0 ? (
                  <div className="text-text-disabled">
                    <p className="text-lg font-medium mb-2">No hay proveedores registrados</p>
                    <p className="text-sm">Comienza creando tu primer proveedor</p>
                  </div>
                ) : (
                  <div className="text-text-disabled">
                    <p className="text-lg font-medium mb-2">No se encontraron resultados</p>
                    <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                    <button
                      onClick={clearFilters}
                      className="mt-3 px-4 py-2 text-sm text-accent-primary hover:text-accent-hover transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <table className="w-full">
              <thead>
                <tr className="border-b border-text-disabled/20 bg-primary">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">NIT</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Categoría</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Contacto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Teléfono</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                                 {filteredProveedores.map((proveedor) => (
                   <tr key={proveedor.supplier_id} className="border-b border-text-disabled/20 hover:bg-accent-primary/10 transition-colors">
                    <td className="px-4 py-3 text-sm text-text-primary font-medium">{proveedor.name}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{proveedor.tax_id}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {getCategoryName(proveedor.category || 'general')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">{proveedor.contact_name}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{proveedor.phone}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{proveedor.email}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(proveedor.status || 'activo')}`}>
                        {getStatusName(proveedor.status || 'activo')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(proveedor)}
                          className="text-accent-primary hover:text-accent-hover transition-colors"
                          title="Ver detalles"
                        >
                          <MdVisibility className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(proveedor)}
                          className="text-orange-500 hover:text-orange-400 transition-colors"
                          title="Editar"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(proveedor)}
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
            )}
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
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Información del Proveedor</h3>
                  <div className="space-y-2 text-text-primary">
                    <div><span className="font-medium">Nombre:</span> {selectedProveedor.name}</div>
                    <div><span className="font-medium">NIT:</span> {selectedProveedor.tax_id}</div>
                    <div><span className="font-medium">Categoría:</span> 
                      <span className={`ml-2 rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800`}>
                        {getCategoryName(selectedProveedor.category || 'general')}
                      </span>
                    </div>
                    <div><span className="font-medium">Dirección:</span> {selectedProveedor.address}</div>
                    <div><span className="font-medium">Estado:</span> 
                      <span className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedProveedor.status || 'activo')}`}>
                        {getStatusName(selectedProveedor.status || 'activo')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Información de Contacto</h3>
                  <div className="space-y-2 text-text-primary">
                    <div><span className="font-medium">Teléfono:</span> {selectedProveedor.phone}</div>
                    <div><span className="font-medium">Email:</span> {selectedProveedor.email}</div>
                    <div><span className="font-medium">Contacto:</span> {selectedProveedor.contact_name}</div>
                    <div><span className="font-medium">Teléfono de Contacto:</span> {selectedProveedor.contact_phone}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Ubicación</h3>
                  <div className="space-y-2 text-text-primary">
                    <div><span className="font-medium">Ciudad:</span> {selectedProveedor.city || 'No especificada'}</div>
                    <div><span className="font-medium">Departamento:</span> {selectedProveedor.department || 'No especificado'}</div>
                    <div><span className="font-medium">País:</span> {selectedProveedor.country || 'Colombia'}</div>
                  </div>
                </div>
              </div>

              {/* Información Comercial */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Información Comercial</h3>
                <div className="grid grid-cols-2 gap-4 text-text-primary">
                  <div><span className="font-medium">Límite de Crédito:</span> {selectedProveedor.credit_limit ? `$${Number(selectedProveedor.credit_limit).toLocaleString('es-CO')}` : 'No especificado'}</div>
                  <div><span className="font-medium">Términos de Pago:</span> {selectedProveedor.payment_terms ? `${selectedProveedor.payment_terms} días` : 'No especificados'}</div>
                  <div><span className="font-medium">Sitio Web:</span> {selectedProveedor.website ? <a href={selectedProveedor.website} target="_blank" rel="noopener noreferrer" className="text-accent-primary hover:underline">{selectedProveedor.website}</a> : 'No especificado'}</div>
                  <div><span className="font-medium">Descripción:</span> {selectedProveedor.description || 'No especificada'}</div>
                </div>
              </div>

              {/* Fechas de Creación y Actualización */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">Fechas</h3>
                <div className="grid grid-cols-2 gap-4 text-text-primary">
                  <div><span className="font-medium">Creado:</span> {formatDate(selectedProveedor.created_at)}</div>
                  <div><span className="font-medium">Actualizado:</span> {formatDate(selectedProveedor.updated_at)}</div>
                </div>
              </div>

              {/* Notas Adicionales */}
              {selectedProveedor.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Notas Adicionales</h3>
                  <div className="p-4 bg-gray-50 rounded-lg text-text-primary">
                    {selectedProveedor.notes}
                  </div>
                </div>
              )}
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
              <div className="rounded-lg bg-red-500/20 p-4 text-red-400">
                {formError}
              </div>
            )}

            {/* Campos Obligatorios */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Ingrese el nombre del proveedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  NIT *
                </label>
                <input
                  type="text"
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="12345678-9"
                />
              </div>
            </div>

            {/* Información de Ubicación */}
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="Ingrese la dirección del proveedor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Bogotá"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Departamento
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Cundinamarca"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  País
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Colombia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="12345"
                />
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="3001234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="proveedor@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Nombre del contacto principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Teléfono del Contacto
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="3009876543"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Email del Contacto
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="contacto@proveedor.co"
              />
            </div>

            {/* Información Comercial */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Sitio Web
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="www.proveedor.co"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Límite de Crédito
                </label>
                <input
                  type="number"
                  name="credit_limit"
                  value={formData.credit_limit}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="50000000"
                  min="0"
                  step="1000000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Estado
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Categoría
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="equipos">Equipos</option>
                  <option value="materiales">Materiales</option>
                  <option value="servicios">Servicios</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Términos de Pago (días)
              </label>
              <input
                type="number"
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="30"
                min="0"
                max="365"
              />
            </div>

            {/* Campos de Texto Largo */}
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="3"
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none resize-none"
                placeholder="Descripción del proveedor y sus servicios"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Notas Adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                rows="3"
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none resize-none"
                placeholder="Notas adicionales sobre el proveedor"
              />
            </div>

            {/* Botones */}
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
              <div className="rounded-lg bg-red-500/20 p-4 text-red-400">
                {formError}
              </div>
            )}

            {/* Campos Obligatorios */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Nombre del Proveedor *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Ingrese el nombre del proveedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  NIT *
                </label>
                <input
                  type="text"
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="12345678-9"
                />
              </div>
            </div>

            {/* Información de Ubicación */}
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="Ingrese la dirección del proveedor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Bogotá"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Departamento
                </label>
                                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleFormChange}
                    className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                    placeholder="Cundinamarca"
                  />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  País
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Colombia"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Código Postal
                </label>
                <input
                  type="text"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="12345"
                />
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="3001234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="proveedor@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Nombre del contacto principal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Teléfono del Contacto
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="3009876543"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Email del Contacto
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="contacto@proveedor.co"
              />
            </div>

            {/* Información Comercial */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Sitio Web
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="www.proveedor.co"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Límite de Crédito
                </label>
                <input
                  type="number"
                  name="credit_limit"
                  value={formData.credit_limit}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="50000000"
                  min="0"
                  step="1000000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Estado
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Categoría
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="General"
                >
                  <option value="equipos">Equipos</option>
                  <option value="materiales">Materiales</option>
                  <option value="servicios">Servicios</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Términos de Pago (días)
              </label>
              <input
                type="number"
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="30"
                min="0"
                max="365"
              />
            </div>

            {/* Campos de Texto Largo */}
            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="3"
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none resize-none"
                placeholder="Descripción del proveedor y sus servicios"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Notas Adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                rows="3"
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none resize-none"
                placeholder="Notas adicionales sobre el proveedor"
              />
            </div>

            {/* Botones */}
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
                className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-accent-primary/10 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
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
            <div className="mb-4 rounded-lg bg-red-500/20 p-4 text-red-400">
              {formError}
            </div>
          )}
          
          <p className="text-text-secondary mb-4">
            ¿Está seguro que desea eliminar el proveedor <strong>{selectedProveedor?.name}</strong>?
          </p>
          
          <p className="text-sm text-text-disabled mb-6">
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
              className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-accent-primary/10 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={formLoading}
              className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
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