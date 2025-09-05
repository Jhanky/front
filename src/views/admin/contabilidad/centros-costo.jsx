import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdCategory, MdFilterList, MdSearch, MdClear } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import { getApiUrl, API_CONFIG } from "config/api";
import Loading from "components/loading";
import { catalogosService } from "services/catalogosService";

const CentrosCosto = () => {
  const { user } = useAuth();
  const [centrosCosto, setCentrosCosto] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCentroCosto, setSelectedCentroCosto] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    status: "activo"
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Estados para filtros
  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    status: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados para modal de categorías
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    status: "activo",
    color: "#3B82F6",
    icon: "folder"
  });

  // URL base dinámica - usando getApiUrl

  useEffect(() => {
    fetchCentrosCosto();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const fetchCentrosCosto = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError("");
      
      console.log('🔍 DEBUG: Cargando centros de costo y categorías...');
      
      // Combinar filtros con parámetros por defecto
      const params = {
        status: 'activo',
        per_page: 50,
        ...filterParams
      };
      
      // Cargar centros de costo y categorías en paralelo
      const [centrosCostoData, categoriasData] = await Promise.all([
        catalogosService.getCentrosCosto(params),
        catalogosService.getCategoriasCentrosCosto({ status: 'activo', per_page: 50 })
      ]);
      
      console.log('📋 DEBUG: Datos recibidos:', { centrosCostoData, categoriasData });
      
      // Procesar centros de costo
      let centrosCostoFormateados = [];
      if (centrosCostoData.success && centrosCostoData.data) {
        if (Array.isArray(centrosCostoData.data.data)) {
          // Estructura paginada
          centrosCostoFormateados = centrosCostoData.data.data.map(centro => 
            catalogosService.formatCentroCostoForFrontend(centro)
          );
        } else if (Array.isArray(centrosCostoData.data)) {
          // Estructura directa
          centrosCostoFormateados = centrosCostoData.data.map(centro => 
            catalogosService.formatCentroCostoForFrontend(centro)
          );
        }
      }
      
      // Procesar categorías
      let categoriasFormateadas = [];
      if (categoriasData.success && categoriasData.data) {
        if (Array.isArray(categoriasData.data.data)) {
          // Estructura paginada
          categoriasFormateadas = categoriasData.data.data.map(categoria => 
            catalogosService.formatCategoriaForFrontend(categoria)
          );
        } else if (Array.isArray(categoriasData.data)) {
          // Estructura directa
          categoriasFormateadas = categoriasData.data.map(categoria => 
            catalogosService.formatCategoriaForFrontend(categoria)
          );
        }
      }
      
      console.log('✅ DEBUG: Datos formateados:', { centrosCostoFormateados, categoriasFormateadas });
      
      setCentrosCosto(centrosCostoFormateados);
      setCategorias(categoriasFormateadas);
      
    } catch (error) {
      console.error('Error al obtener centros de costo:', error);
      setError(error.message);
      
      // Usar datos mock como fallback
      console.log('⚠️ Usando datos mock como fallback');
      setCentrosCosto([
        {
          id: 1,
          cost_center_id: 1,
          code: "CC-001",
          name: "Peaje",
          description: "Gastos de peajes en carreteras",
          status: "activo",
          category_id: 1,
          category: {
            id: 1,
            category_id: 1,
            name: "Transporte",
            color: "#3B82F6",
            icon: "car"
          }
        }
      ]);
      setCategorias([
        {
          id: 1,
          category_id: 1,
          name: "Transporte",
          description: "Gastos relacionados con transporte y movilidad",
          status: "activo",
          color: "#3B82F6",
          icon: "car"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      category_id: "",
      status: "activo"
    });
    setFormError("");
    setIsEditMode(false);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (centroCosto) => {
    setSelectedCentroCosto(centroCosto);
    setFormData({
      name: centroCosto.name || "",
      description: centroCosto.description || "",
      category_id: centroCosto.category_id || "",
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
      if (!formData.name || !formData.category_id) {
        throw new Error("Por favor complete los campos obligatorios: Nombre y Categoría del Centro de Costo");
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
        ? getApiUrl(`/api/cost-centers/${selectedCentroCosto.cost_center_id}`)
        : getApiUrl('/api/cost-centers');
      
      const method = isEditMode ? "PUT" : "POST";

      // Preparar datos para enviar a la API
      const apiData = {
        name: formData.name,
        description: formData.description,
        category_id: parseInt(formData.category_id),
        status: formData.status
      };

      console.log('🔍 DEBUG: Enviando datos a la API:', { url, method, apiData });

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${isEditMode ? 'actualizar' : 'crear'} el centro de costo`);
      }

      const data = await response.json();

      if (isEditMode) {
        // Actualizar el centro de costo en el estado local dinámicamente
        const centroCostoActualizado = data.data ? 
          catalogosService.formatCentroCostoForFrontend(data.data) : 
          { ...selectedCentroCosto, ...formData };
        
        setCentrosCosto(prevCentros => 
          prevCentros.map(centro => 
            centro.cost_center_id === selectedCentroCosto.cost_center_id 
              ? centroCostoActualizado 
              : centro
          )
        );
        
        showNotification(`Centro de costo "${formData.name}" actualizado exitosamente`, "success");
        setIsEditModalOpen(false);
      } else {
        // Agregar el nuevo centro de costo al estado local dinámicamente
        const nuevoCentroCosto = data.data ? 
          catalogosService.formatCentroCostoForFrontend(data.data) : 
          { ...formData, cost_center_id: Date.now() }; // Fallback temporal para ID
        
        setCentrosCosto(prevCentros => [nuevoCentroCosto, ...prevCentros]);
        
        showNotification(`Centro de costo "${formData.name}" creado exitosamente`, "success");
        setIsCreateModalOpen(false);
      }

      // Limpiar formulario y estado
      setSelectedCentroCosto(null);
      setIsEditMode(false);
      setFormData({
        name: "",
        description: "",
        category_id: "",
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

      const response = await fetch(getApiUrl(`/api/cost-centers/${selectedCentroCosto.cost_center_id}`), {
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
        prevCentros.filter(centro => centro.cost_center_id !== selectedCentroCosto.cost_center_id)
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
        return 'bg-green-500/20 text-green-300';
      case 'inactivo':
        return 'bg-red-500/20 text-red-300';
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  // Funciones para filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    const filterParams = {};
    if (filters.search) filterParams.search = filters.search;
    if (filters.category_id) filterParams.category_id = filters.category_id;
    if (filters.status) filterParams.status = filters.status;
    
    fetchCentrosCosto(filterParams);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category_id: "",
      status: ""
    });
    fetchCentrosCosto();
  };

  // Funciones para categorías
  const handleCreateCategory = () => {
    setCategoryFormData({
      name: "",
      description: "",
      status: "activo",
      color: "#3B82F6",
      icon: "folder"
    });
    setFormError("");
    setIsCreateCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryFormData({
      name: category.name || "",
      description: category.description || "",
      status: category.status || "activo",
      color: category.color || "#3B82F6",
      icon: category.icon || "folder"
    });
    setFormError("");
    setIsEditCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setIsDeleteCategoryModalOpen(true);
  };

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      // Validaciones básicas
      if (!categoryFormData.name) {
        throw new Error("Por favor complete el nombre de la categoría");
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

      const url = selectedCategory 
        ? getApiUrl(`/api/cost-center-categories/${selectedCategory.category_id}`)
        : getApiUrl('/api/cost-center-categories');
      
      const method = selectedCategory ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(categoryFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${selectedCategory ? 'actualizar' : 'crear'} la categoría`);
      }

      const data = await response.json();

      if (selectedCategory) {
        showNotification(`Categoría "${categoryFormData.name}" actualizada exitosamente`, "success");
        setIsEditCategoryModalOpen(false);
      } else {
        showNotification(`Categoría "${categoryFormData.name}" creada exitosamente`, "success");
        setIsCreateCategoryModalOpen(false);
      }

      // Recargar categorías
      const categoriasData = await catalogosService.getCategoriasCentrosCosto({ status: 'activo', per_page: 50 });
      let categoriasFormateadas = [];
      if (categoriasData.success && categoriasData.data) {
        if (Array.isArray(categoriasData.data.data)) {
          categoriasFormateadas = categoriasData.data.data.map(categoria => 
            catalogosService.formatCategoriaForFrontend(categoria)
          );
        } else if (Array.isArray(categoriasData.data)) {
          categoriasFormateadas = categoriasData.data.map(categoria => 
            catalogosService.formatCategoriaForFrontend(categoria)
          );
        }
      }
      setCategorias(categoriasFormateadas);

      // Limpiar formulario y estado
      setSelectedCategory(null);
      setCategoryFormData({
        name: "",
        description: "",
        status: "activo",
        color: "#3B82F6",
        icon: "folder"
      });
      
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategoryConfirm = async () => {
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

      const response = await fetch(getApiUrl(`/api/cost-center-categories/${selectedCategory.category_id}`), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la categoría");
      }

      showNotification(`Categoría "${selectedCategory.name}" eliminada exitosamente`, "success");

      // Recargar categorías
      const categoriasData = await catalogosService.getCategoriasCentrosCosto({ status: 'activo', per_page: 50 });
      let categoriasFormateadas = [];
      if (categoriasData.success && categoriasData.data) {
        if (Array.isArray(categoriasData.data.data)) {
          categoriasFormateadas = categoriasData.data.data.map(categoria => 
            catalogosService.formatCategoriaForFrontend(categoria)
          );
        } else if (Array.isArray(categoriasData.data)) {
          categoriasFormateadas = categoriasData.data.map(categoria => 
            catalogosService.formatCategoriaForFrontend(categoria)
          );
        }
      }
      setCategorias(categoriasFormateadas);

      // Cerrar modal y limpiar estado
      setIsDeleteCategoryModalOpen(false);
      setSelectedCategory(null);
      
    } catch (error) {
      setFormError(error.message);
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
              Centros de Costo
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateCategory}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-white hover:bg-orange-600 transition-colors"
                title="Gestionar Categorías"
              >
                <MdCategory className="h-5 w-5" />
                Categorías
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

          {/* Filtros */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-primary">Filtros</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 rounded-lg border border-text-disabled/30 px-4 py-2 text-text-primary hover:bg-accent-primary/10 transition-colors"
              >
                <MdFilterList className="h-4 w-4" />
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-primary-card rounded-lg border border-text-disabled/20">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="search"
                      value={filters.search}
                      onChange={handleFilterChange}
                      placeholder="Buscar por nombre o descripción..."
                      className="w-full pl-10 pr-4 py-2 rounded-md border border-text-disabled/30 bg-primary text-text-primary focus:border-accent-primary focus:outline-none"
                    />
                    <MdSearch className="absolute left-3 top-2.5 h-4 w-4 text-text-disabled" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Categoría
                  </label>
                  <select
                    name="category_id"
                    value={filters.category_id}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.category_id} value={categoria.category_id}>
                        {categoria.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Estado
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                
                <div className="flex items-end gap-2">
                  <button
                    onClick={applyFilters}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover transition-colors"
                  >
                    <MdSearch className="h-4 w-4" />
                    Filtrar
                  </button>
                  <button
                    onClick={clearFilters}
                    className="flex items-center justify-center gap-2 rounded-lg border border-text-disabled/30 px-4 py-2 text-text-primary hover:bg-accent-primary/10 transition-colors"
                    title="Limpiar filtros"
                  >
                    <MdClear className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tabla de centros de costo */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-text-disabled/20 bg-primary">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Categoría</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Descripción</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Fecha Creación</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {centrosCosto.map((centroCosto) => (
                  <tr key={centroCosto.cost_center_id} className="border-b border-text-disabled/20 hover:bg-accent-primary/10 transition-colors">
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {centroCosto.category ? (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: centroCosto.category.color }}
                          ></div>
                          <span className="font-medium">{centroCosto.category.name}</span>
                        </div>
                      ) : (
                        <span className="text-text-disabled">Sin categoría</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary font-medium">{centroCosto.name}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">{centroCosto.description || 'Sin descripción'}</td>
                    <td className="px-4 py-3 text-sm text-text-primary">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(centroCosto.status)}`}>
                        {centroCosto.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-primary">{formatDate(centroCosto.created_at)}</td>
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
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Información del Centro de Costo</h3>
                  <div className="space-y-2 text-text-primary">
                    <div>
                      <span className="font-medium">Categoría:</span> 
                      {selectedCentroCosto.category ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: selectedCentroCosto.category.color }}
                          ></div>
                          <span>{selectedCentroCosto.category.name}</span>
                        </div>
                      ) : (
                        <span className="text-text-disabled ml-2">Sin categoría</span>
                      )}
                    </div>
                    <div><span className="font-medium">Nombre:</span> {selectedCentroCosto.name}</div>
                    <div><span className="font-medium">Estado:</span> 
                      <span className={`ml-2 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(selectedCentroCosto.status)}`}>
                        {selectedCentroCosto.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">Descripción</h3>
                  <div className="space-y-2 text-text-primary">
                    <div>
                      <span className="font-medium">Descripción:</span> 
                      <p className="mt-1 text-text-secondary">
                        {selectedCentroCosto.description || 'Sin descripción'}
                      </p>
                    </div>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Categoría del Centro de Costo *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.category_id} value={categoria.category_id}>
                      {categoria.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Nombre del Centro de Costo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Ingrese el nombre del centro de costo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="3"
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="Ingrese la descripción del centro de costo"
              />
            </div>

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
                <option value="pendiente">Pendiente</option>
              </select>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Categoría del Centro de Costo *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.category_id} value={categoria.category_id}>
                      {categoria.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Nombre del Centro de Costo *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Ingrese el nombre del centro de costo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows="3"
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="Ingrese la descripción del centro de costo"
              />
            </div>

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
            ¿Está seguro que desea eliminar el centro de costo <strong>{selectedCentroCosto?.name}</strong>?
          </p>
          
          <p className="text-sm text-text-disabled mb-6">
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

      {/* Modal de Gestión de Categorías */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Gestionar Categorías"
        size="large"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Categorías de Centros de Costo</h3>
            <button
              onClick={handleCreateCategory}
              className="flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover transition-colors"
            >
              <MdAdd className="h-4 w-4" />
              Nueva Categoría
            </button>
          </div>

          {/* Lista de categorías */}
          <div className="space-y-3">
            {categorias.map((categoria) => (
              <div key={categoria.category_id} className="flex items-center justify-between p-4 bg-primary-card rounded-lg border border-text-disabled/20">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full" 
                    style={{ backgroundColor: categoria.color }}
                  ></div>
                  <div>
                    <h4 className="font-medium text-text-primary">{categoria.name}</h4>
                    <p className="text-sm text-text-secondary">{categoria.description}</p>
                    <span className={`inline-block mt-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(categoria.status)}`}>
                      {categoria.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditCategory(categoria)}
                    className="text-orange-500 hover:text-orange-400 transition-colors"
                    title="Editar categoría"
                  >
                    <MdEdit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(categoria)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                    title="Eliminar categoría"
                  >
                    <MdDelete className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal de Crear/Editar Categoría */}
      <Modal
        isOpen={isCreateCategoryModalOpen || isEditCategoryModalOpen}
        onClose={() => {
          setIsCreateCategoryModalOpen(false);
          setIsEditCategoryModalOpen(false);
          setSelectedCategory(null);
          setFormError("");
        }}
        title={selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
      >
        <div className="p-6">
          <form onSubmit={handleCategoryFormSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-lg bg-red-500/20 p-4 text-red-400">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  name="name"
                  value={categoryFormData.name}
                  onChange={handleCategoryFormChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="Ingrese el nombre de la categoría"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Estado
                </label>
                <select
                  name="status"
                  value={categoryFormData.status}
                  onChange={handleCategoryFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary">
                Descripción
              </label>
              <textarea
                name="description"
                value={categoryFormData.description}
                onChange={handleCategoryFormChange}
                rows="3"
                className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                placeholder="Ingrese la descripción de la categoría"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Color
                </label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    name="color"
                    value={categoryFormData.color}
                    onChange={handleCategoryFormChange}
                    className="w-12 h-10 rounded border border-text-disabled/30 bg-primary-card"
                  />
                  <input
                    type="text"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="flex-1 rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Ícono
                </label>
                <input
                  type="text"
                  name="icon"
                  value={categoryFormData.icon}
                  onChange={handleCategoryFormChange}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none"
                  placeholder="folder, car, building, etc."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsCreateCategoryModalOpen(false);
                  setIsEditCategoryModalOpen(false);
                  setSelectedCategory(null);
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
                {formLoading ? "Guardando..." : (selectedCategory ? "Actualizar Categoría" : "Crear Categoría")}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal de Eliminar Categoría */}
      <Modal
        isOpen={isDeleteCategoryModalOpen}
        onClose={() => setIsDeleteCategoryModalOpen(false)}
        title="Eliminar Categoría"
      >
        <div className="p-6">
          {formError && (
            <div className="mb-4 rounded-lg bg-red-500/20 p-4 text-red-400">
              {formError}
            </div>
          )}
          
          <p className="text-text-secondary mb-4">
            ¿Está seguro que desea eliminar la categoría <strong>{selectedCategory?.name}</strong>?
          </p>
          
          <p className="text-sm text-text-disabled mb-6">
            <strong>Nota:</strong> Esta acción no se puede deshacer. Si la categoría tiene centros de costo asociados, no se podrá eliminar.
          </p>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsDeleteCategoryModalOpen(false);
                setFormError("");
                setSelectedCategory(null);
              }}
              disabled={formLoading}
              className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-accent-primary/10 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteCategoryConfirm}
              disabled={formLoading}
              className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {formLoading ? "Eliminando..." : "Eliminar Categoría"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CentrosCosto;