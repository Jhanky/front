import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdSearch, MdFilterList, MdBarChart, MdReceipt } from "react-icons/md";
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
  const [isStatisticsModalOpen, setIsStatisticsModalOpen] = useState(false);
  const [isInvoicesModalOpen, setIsInvoicesModalOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState(null);
  
  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [totalItems, setTotalItems] = useState(0);
  
  // Estados para estadísticas
  const [statistics, setStatistics] = useState(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  
  // Estados para facturas del proveedor
  const [providerInvoices, setProviderInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    provider_name: "",
    provider_tax_id: ""
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    fetchProveedores();
  }, [currentPage, perPage]);

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
        proveedor.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proveedor.provider_tax_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    setCurrentPage(1);
  };

  // Función para buscar proveedores usando el endpoint de búsqueda
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        setLoading(true);
        setError("");
        
        const params = new URLSearchParams({
          q: searchTerm,
          page: 1,
          per_page: perPage
        });

        const response = await fetch(getApiUrl(`/api/providers/search?${params}`), {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${user.token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error de respuesta:', errorText);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Datos de búsqueda recibidos:', data);
        
        if (data.success && data.data) {
          // Mapear los datos de la misma manera que en fetchProveedores
          const mappedProveedores = data.data.data.map(proveedor => ({
            provider_id: proveedor.provider_id,
            provider_name: proveedor.provider_name,
            provider_tax_id: proveedor.NIT,
            address: proveedor.address,
            phone: proveedor.phone,
            email: proveedor.email,
            contact_name: proveedor.contact_name,
            contact_phone: proveedor.contact_phone,
            contact_email: proveedor.contact_email,
            city: proveedor.city,
            department: proveedor.department,
            country: proveedor.country,
            postal_code: proveedor.postal_code,
            description: proveedor.description,
            website: proveedor.website,
            status: proveedor.status,
            category: proveedor.category,
            credit_limit: proveedor.credit_limit,
            payment_terms: proveedor.payment_terms,
            notes: proveedor.notes,
            invoices_count: proveedor.invoices_count || 0,
            total_invoiced: proveedor.total_invoiced || "0.00",
            created_at: proveedor.created_at,
            updated_at: proveedor.updated_at
          }));
          
          setProveedores(mappedProveedores);
          setTotalPages(data.data.last_page || 1);
          setTotalItems(data.data.total || 0);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('Error en la búsqueda:', error);
        setError(`Error en la búsqueda: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      fetchProveedores();
    }
  };

  // Función para obtener estadísticas del servidor
  const fetchStatistics = async () => {
    try {
      setStatisticsLoading(true);
      setError("");
      
      const response = await fetch(getApiUrl('/api/providers/statistics'), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error de respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Estadísticas recibidas:', data);
      
      if (data.success && data.data) {
        setStatistics(data.data);
      } else {
        throw new Error(data.message || "Error al cargar las estadísticas");
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError(`Error al cargar estadísticas: ${error.message}`);
    } finally {
      setStatisticsLoading(false);
    }
  };

  // Función para obtener facturas de un proveedor
  const fetchProviderInvoices = async (providerId) => {
    try {
      setInvoicesLoading(true);
      setError("");
      
      const response = await fetch(getApiUrl(`/api/providers/${providerId}/invoices`), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error de respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Facturas recibidas:', data);
      
      if (data.success && data.data) {
        setProviderInvoices(data.data.invoices.data || []);
      } else {
        throw new Error(data.message || "Error al cargar las facturas");
      }
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      setError(`Error al cargar facturas: ${error.message}`);
    } finally {
      setInvoicesLoading(false);
    }
  };

  const fetchProveedores = async () => {
    try {
      setLoading(true);
      setError("");
      
      const params = new URLSearchParams({
        page: currentPage,
        per_page: perPage,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter })
      });

      const url = getApiUrl(`/api/providers?${params}`);
      console.log('URL de la API:', url);
      console.log('Token de usuario:', user.token ? 'Presente' : 'Ausente');

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      console.log('Status de respuesta:', response.status);
      console.log('Headers de respuesta:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error de respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Datos recibidos de la API:', data);
      
      // Manejar diferentes estructuras de respuesta
      let proveedoresData = [];
      
      if (data.success && data.data) {
        if (data.data.data && Array.isArray(data.data.data)) {
          // Nueva estructura con paginación
          proveedoresData = data.data.data;
          setTotalPages(data.data.last_page || 1);
          setTotalItems(data.data.total || 0);
          setCurrentPage(data.data.current_page || 1);
        } else if (Array.isArray(data.data)) {
          // Estructura directa con array
          proveedoresData = data.data;
          setTotalPages(1);
          setTotalItems(data.data.length);
          setCurrentPage(1);
        }
      } else if (data.data && Array.isArray(data.data)) {
        // Estructura directa con array
        proveedoresData = data.data;
        setTotalPages(1);
        setTotalItems(data.data.length);
        setCurrentPage(1);
      } else if (Array.isArray(data)) {
        // Array directo
        proveedoresData = data;
        setTotalPages(1);
        setTotalItems(data.length);
        setCurrentPage(1);
      } else {
        throw new Error(data.message || "Estructura de datos no reconocida");
      }

      // Mapear los datos para usar la estructura esperada
      const mappedProveedores = proveedoresData.map(proveedor => ({
        provider_id: proveedor.supplier_id || proveedor.provider_id,
        provider_name: proveedor.name || proveedor.provider_name,
        provider_tax_id: proveedor.tax_id || proveedor.provider_tax_id || proveedor.NIT,
        address: proveedor.address,
        phone: proveedor.phone,
        email: proveedor.email,
        contact_name: proveedor.contact_name,
        contact_phone: proveedor.contact_phone,
        contact_email: proveedor.contact_email,
        city: proveedor.city,
        department: proveedor.department,
        country: proveedor.country,
        postal_code: proveedor.postal_code,
        description: proveedor.description,
        website: proveedor.website,
        status: proveedor.status,
        category: proveedor.category,
        credit_limit: proveedor.credit_limit,
        payment_terms: proveedor.payment_terms,
        notes: proveedor.notes,
        invoices_count: proveedor.invoices_count || 0,
        total_invoiced: proveedor.total_invoiced || "0.00",
        created_at: proveedor.created_at,
        updated_at: proveedor.updated_at
      }));

      setProveedores(mappedProveedores);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setError(`Error al cargar los proveedores: ${error.message}`);
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
      provider_name: "",
      provider_tax_id: ""
    });
    setFormError("");
    setIsEditMode(false);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (proveedor) => {
    setSelectedProveedor(proveedor);
    setFormData({
      provider_name: proveedor.provider_name || "",
      provider_tax_id: proveedor.provider_tax_id || ""
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

  const handleStatistics = () => {
    fetchStatistics();
    setIsStatisticsModalOpen(true);
  };

  const handleViewInvoices = (proveedor) => {
    setSelectedProveedor(proveedor);
    fetchProviderInvoices(proveedor.provider_id);
    setIsInvoicesModalOpen(true);
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
      // Validaciones básicas - solo provider_name y provider_tax_id son obligatorios
      if (!formData.provider_name || !formData.provider_tax_id) {
        throw new Error("Por favor complete los campos obligatorios: Nombre del Proveedor y NIT");
      }

      const url = isEditMode 
        ? getApiUrl(`/api/providers/${selectedProveedor.provider_id}`)
        : getApiUrl('/api/providers');
      
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
            // Mapear el campo NIT correctamente
            if (key === 'provider_tax_id') {
              requestBody['NIT'] = currentValue;
            } else {
              requestBody[key] = currentValue;
            }
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
            // Mapear el campo NIT correctamente
            if (key === 'provider_tax_id') {
              requestBody['NIT'] = value;
            } else {
              requestBody[key] = value;
            }
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
      if (responseData.data) {
        proveedorData = responseData.data; // Para creación/actualización
        console.log('Datos extraídos de responseData.data');
      } else {
        proveedorData = responseData; // Fallback directo
        console.log('Datos extraídos directamente de responseData');
      }
      console.log('Proveedor procesado:', proveedorData);

      // Actualización dinámica del estado local
      if (isEditMode) {
        console.log('Estado actual antes de actualizar:', proveedores);
        console.log('Buscando proveedor con ID:', selectedProveedor.provider_id);
        
        // Actualizar proveedor existente - usar directamente los datos de la API
        setProveedores(prev => {
          const updated = prev.map(proveedor => {
            if (proveedor.provider_id === selectedProveedor.provider_id) {
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
        ? `Proveedor "${formData.provider_name}" actualizado exitosamente`
        : `Proveedor "${formData.provider_name}" creado exitosamente`;
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
      const response = await fetch(getApiUrl(`/api/providers/${selectedProveedor.provider_id}`), {
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
      setProveedores(prev => prev.filter(proveedor => proveedor.provider_id !== selectedProveedor.provider_id));

      // Mostrar mensaje de éxito
      showNotification(`Proveedor "${selectedProveedor.provider_name}" eliminado exitosamente`, "success");

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
            <div className="flex gap-2">
              <button
                onClick={handleStatistics}
                className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-white hover:bg-blue-600 transition-colors"
              >
                <MdBarChart className="h-5 w-5" />
                Estadísticas
              </button>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 rounded-lg bg-accent-primary px-6 py-2.5 text-white hover:bg-accent-hover transition-colors"
              >
                <MdAdd className="h-5 w-5" />
                Nuevo Proveedor
              </button>
            </div>
          </div>

                     {/* Filtros y Búsqueda */}
           <div className="mt-6 space-y-4">
             {/* Barra de búsqueda */}
             <div className="mb-4">
               <form onSubmit={handleSearchSubmit} className="flex gap-2">
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Facturas</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Total Facturado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Creado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                                 {filteredProveedores.map((proveedor) => (
                   <tr key={proveedor.provider_id} className="border-b border-text-disabled/20 hover:bg-accent-primary/10 transition-colors">
                    <td className="px-4 py-3 text-sm text-text-primary font-medium">{proveedor.provider_name}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{proveedor.provider_tax_id}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {proveedor.invoices_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      ${proveedor.total_invoiced ? Number(proveedor.total_invoiced).toLocaleString('es-CO') : '0'}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {proveedor.created_at ? new Date(proveedor.created_at).toLocaleDateString('es-CO') : 'N/A'}
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
                          onClick={() => handleViewInvoices(proveedor)}
                          className="text-blue-500 hover:text-blue-400 transition-colors"
                          title="Ver facturas"
                        >
                          <MdReceipt className="h-5 w-5" />
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                Mostrando {((currentPage - 1) * perPage) + 1} a {Math.min(currentPage * perPage, totalItems)} de {totalItems} proveedores
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-text-disabled/30 rounded-lg hover:bg-accent-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-accent-primary text-white border-accent-primary'
                          : 'border-text-disabled/30 hover:bg-accent-primary/10'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-text-disabled/30 rounded-lg hover:bg-accent-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        title={`Detalles del Proveedor - ${selectedProveedor?.provider_name}`}
      >
        <div className="p-6 space-y-6">
          {selectedProveedor && (
            <>
              {/* Información Principal */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Información del Proveedor</h3>
                  <div className="grid grid-cols-2 gap-4 text-text-primary">
                    <div><span className="font-medium">Nombre:</span> {selectedProveedor.provider_name}</div>
                    <div><span className="font-medium">NIT:</span> {selectedProveedor.provider_tax_id}</div>
                    <div><span className="font-medium">Facturas:</span> 
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {selectedProveedor.invoices_count || 0}
                      </span>
                    </div>
                    <div><span className="font-medium">Total Facturado:</span> 
                      <span className="ml-2 font-bold text-green-600">
                        ${selectedProveedor.total_invoiced ? Number(selectedProveedor.total_invoiced).toLocaleString('es-CO') : '0'}
                      </span>
                    </div>
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
                  name="provider_name"
                  value={formData.provider_name}
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
                  name="provider_tax_id"
                  value={formData.provider_tax_id}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="12345678-9"
                />
              </div>
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
                  name="provider_name"
                  value={formData.provider_name}
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
                  name="provider_tax_id"
                  value={formData.provider_tax_id}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="12345678-9"
                />
              </div>
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
            ¿Está seguro que desea eliminar el proveedor <strong>{selectedProveedor?.provider_name}</strong>?
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

      {/* Modal de Estadísticas */}
      <Modal
        isOpen={isStatisticsModalOpen}
        onClose={() => setIsStatisticsModalOpen(false)}
        title="Estadísticas de Proveedores"
      >
        <div className="p-6">
          {statisticsLoading ? (
            <div className="flex justify-center py-8">
              <Loading />
            </div>
          ) : statistics ? (
            <div className="space-y-6">
              {/* Resumen General */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800">Total de Proveedores</h3>
                  <p className="text-3xl font-bold text-blue-600">{statistics.total_providers}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800">Con Facturas</h3>
                  <p className="text-3xl font-bold text-green-600">{statistics.providers_with_invoices}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800">Sin Facturas</h3>
                  <p className="text-3xl font-bold text-gray-600">{statistics.providers_without_invoices}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800">Total Facturado</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    ${Number(statistics.total_invoiced).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              {/* Top Proveedores */}
              {statistics.top_providers && statistics.top_providers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Top Proveedores por Facturación</h3>
                  <div className="space-y-2">
                    {statistics.top_providers.map((provider, index) => (
                      <div key={provider.provider_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-text-primary">{provider.provider_name}</p>
                          <p className="text-sm text-text-secondary">{provider.NIT || provider.provider_tax_id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-text-primary">
                            ${Number(provider.total_invoiced).toLocaleString('es-CO')}
                          </p>
                          <p className="text-sm text-text-secondary">
                            {provider.invoices_count} facturas ({provider.percentage}%)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-text-disabled">
              No se pudieron cargar las estadísticas
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Facturas del Proveedor */}
      <Modal
        isOpen={isInvoicesModalOpen}
        onClose={() => setIsInvoicesModalOpen(false)}
        title={`Facturas de ${selectedProveedor?.provider_name}`}
      >
        <div className="p-6">
          {invoicesLoading ? (
            <div className="flex justify-center py-8">
              <Loading />
            </div>
          ) : providerInvoices.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-text-disabled/20">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Número</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Vencimiento</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Estado</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Centro de Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providerInvoices.map((invoice) => (
                      <tr key={invoice.invoice_id} className="border-b border-text-disabled/20">
                        <td className="px-4 py-3 text-sm text-text-primary">{invoice.invoice_number}</td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          {new Date(invoice.invoice_date).toLocaleDateString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          {new Date(invoice.due_date).toLocaleDateString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          ${Number(invoice.total_amount).toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            invoice.status === 'PAGADA' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-text-primary">
                          {invoice.cost_center?.cost_center_name || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-text-disabled">
              <p className="text-lg font-medium mb-2">No hay facturas registradas</p>
              <p className="text-sm">Este proveedor no tiene facturas asociadas</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Proveedores;