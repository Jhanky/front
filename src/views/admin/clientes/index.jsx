import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdInfo, MdSearch, MdPersonAdd, MdTrendingUp, MdElectricBolt } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import Mensaje from "components/mensaje";
import Loading from "components/loading";
import { 
  getClientes, 
  createCliente, 
  updateCliente, 
  deleteCliente,
  getDepartamentos,
  getCiudades,
  formatNumber,
  validateNetworkType,
  validateClientType,
  prepareClientData
} from "services/clientesService";
import { testDepartamentoDirecto, getDepartamentosAlternativo } from "services/localizacionesService";

const Clientes = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTipoCliente, setFilterTipoCliente] = useState("");
  const [filterCiudad, setFilterCiudad] = useState("");
  const [formData, setFormData] = useState({
    nic: "",
    tipo_cliente: "Residencial",
    nombre: "",
    departamento: "",
    ciudad: "",
    direccion: "",
    consumo_mensual_kwh: "",
    tarifa_energia: "",
    tipo_red: "Monofásica 110V"
  });

  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loadingLocalidades, setLoadingLocalidades] = useState(false);

  const [mensajes, setMensajes] = useState([]);
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);

  const [editFormData, setEditFormData] = useState({
    nic: "",
    tipo_cliente: "",
    nombre: "",
    departamento: "",
    ciudad: "",
    direccion: "",
    consumo_mensual_kwh: "",
    tarifa_energia: "",
    tipo_red: ""
  });

  // Función para cargar clientes usando el servicio
  const fetchClientes = async () => {
    try {
      setLoading(true);
      
      // Preparar filtros para la API
      const filters = {};
      if (search) filters.search = search;
      if (filterTipoCliente) filters.client_type = filterTipoCliente;
      if (filterCiudad) filters.city = filterCiudad;
      
      const response = await getClientes(filters);
      
      if (response.success) {
        setClientes(response.data);

      } else {
        setClientes(response.data || []);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setError(error.message);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcular métricas de clientes
  const calcularMetricas = () => {
    const ahora = new Date();
    const trimestreActual = Math.floor(ahora.getMonth() / 3);
    const inicioTrimestre = new Date(ahora.getFullYear(), trimestreActual * 3, 1);
    
    // Clientes nuevos del trimestre
    const clientesNuevos = clientes.filter(cliente => {
      const fechaCreacion = new Date(cliente.created_at || cliente.updated_at);
      return fechaCreacion >= inicioTrimestre;
    }).length;

    // kW totales posibles a cotizar (basado en consumo mensual)
    const kwPosibles = clientes.reduce((total, cliente) => {
      const consumo = parseFloat(cliente.consumo_mensual_kwh) || 0;
      // Estimación: 1 kWp genera aproximadamente 120-150 kWh/mes en Colombia
      const kwEstimado = consumo / 130; // Usando 130 como promedio
      return total + kwEstimado;
    }, 0);

    // Consumo promedio mensual
    const consumos = clientes.map(cliente => parseFloat(cliente.consumo_mensual_kwh) || 0);
    const consumoPromedio = consumos.length > 0 
      ? consumos.reduce((sum, consumo) => sum + consumo, 0) / consumos.length 
      : 0;

    return {
      clientesNuevos,
      kwPosibles: Math.round(kwPosibles * 10) / 10, // Redondear a 1 decimal
      consumoPromedio: Math.round(consumoPromedio * 10) / 10
    };
  };

  const metricas = calcularMetricas();



  // Función para cargar departamentos usando el servicio
  const fetchDepartamentos = async () => {
    try {
      // Intentar primero con la función alternativa
      let response;
      try {
        response = await getDepartamentosAlternativo();
      } catch (error) {
        response = await getDepartamentos();
      }
      
      setDepartamentos(response);
    } catch (error) {
      console.error("❌ Error al cargar departamentos:", error);
      setError(error.message);
    }
  };

  // Función para cargar ciudades usando el servicio
  const fetchCiudades = async (departamento) => {
    try {
      setLoadingLocalidades(true);
      const response = await getCiudades(departamento);
      setCiudades(response);
    } catch (error) {
      console.error("❌ Error al cargar ciudades:", error);
      setError(error.message);
      setCiudades([]);
    } finally {
      setLoadingLocalidades(false);
    }
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClientes();
  }, []);

  // Cargar departamentos al montar el componente
  useEffect(() => {
    fetchDepartamentos();
  }, []);

  // Cargar ciudades cuando cambia el departamento en el formulario de creación
  useEffect(() => {
    if (formData.departamento) {
      fetchCiudades(formData.departamento);
    } else {
      setCiudades([]);
    }
  }, [formData.departamento]);

  // Cargar ciudades cuando cambia el departamento en el formulario de edición
  useEffect(() => {
    if (editFormData.departamento) {
      fetchCiudades(editFormData.departamento);
    } else {
      setCiudades([]);
    }
  }, [editFormData.departamento]);

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (cliente) => {
    setSelectedCliente(cliente);
    setEditFormData({
      nic: cliente.nic,
      tipo_cliente: cliente.client_type,
      nombre: cliente.name,
      departamento: cliente.department,
      ciudad: cliente.city,
      direccion: cliente.address,
      consumo_mensual_kwh: cliente.monthly_consumption_kwh,
      tarifa_energia: cliente.energy_rate,
      tipo_red: cliente.network_type || "Monofásica 110V"
    });
    // Cargar las ciudades del departamento seleccionado
    if (cliente.department) {
      fetchCiudades(cliente.department);
    }
    setIsEditModalOpen(true);
  };

  const handleDelete = async (cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setError("");
    setMensajes([]);
    setEsperandoRespuesta(true);

    try {
      await deleteCliente(selectedCliente.client_id);

      // Eliminar el cliente del estado local dinámicamente
      setClientes(prevClientes => 
        prevClientes.filter(cliente => cliente.client_id !== selectedCliente.client_id)
      );

      // Mostrar mensaje de éxito
      setMensajes([{
        contenido: "Cliente eliminado exitosamente",
        tipo: "success"
      }]);
      
      setTimeout(() => {
        setMensajes([]);
      }, 2000);

      setIsDeleteModalOpen(false);
    } catch (error) {
      setError(error.message);
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
      // Limpiar mensaje de error después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);
    } finally {
      setEsperandoRespuesta(false);
    }
  };

  const handleInfo = (cliente) => {
    setSelectedCliente(cliente);
    setIsInfoModalOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClientes(); // Recargar con los filtros actuales
  };

  // Obtener tipos de cliente únicos
  const tiposClienteUnicos = [...new Set(clientes.map(cliente => cliente.client_type))].filter(Boolean).sort();
  
  // Obtener ciudades únicas
  const ciudadesUnicas = [...new Set(clientes.map(cliente => cliente.city))].filter(Boolean).sort();

  const filteredClientes = clientes.filter(cliente => {
    // Filtro por búsqueda general
    const matchesSearch = 
      cliente.name?.toLowerCase().includes(search.toLowerCase()) ||
      cliente.nic?.toString().includes(search) ||
      cliente.client_type?.toLowerCase().includes(search.toLowerCase());
    
    // Filtro por tipo de cliente
    const matchesTipoCliente = !filterTipoCliente || cliente.client_type === filterTipoCliente;
    
    // Filtro por ciudad
    const matchesCiudad = !filterCiudad || cliente.city === filterCiudad;
    
    return matchesSearch && matchesTipoCliente && matchesCiudad;
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensajes([]);
    setEsperandoRespuesta(true);

    try {
      // Validar tipo de red usando el servicio
      if (!validateNetworkType(formData.tipo_red)) {
        throw new Error("Tipo de red no válido");
      }

      // Validar tipo de cliente usando el servicio
      if (!validateClientType(formData.tipo_cliente)) {
        throw new Error("Tipo de cliente no válido");
      }

      // Preparar datos usando el servicio
      const clientData = prepareClientData(formData);

      const nuevoCliente = await createCliente(clientData);

      // Agregar el nuevo cliente al estado local dinámicamente
      setClientes(prevClientes => [nuevoCliente, ...prevClientes]);

      // Mostrar mensaje de éxito
      setMensajes([{
        contenido: "Cliente registrado exitosamente",
        tipo: "success"
      }]);
      
      setTimeout(() => {
        setMensajes([]);
      }, 2000);

      // Cerrar el modal y limpiar formulario
      setIsCreateModalOpen(false);
      setFormData({
        nic: "",
        tipo_cliente: "Residencial",
        nombre: "",
        departamento: "",
        ciudad: "",
        direccion: "",
        consumo_mensual_kwh: "",
        tarifa_energia: "",
        tipo_red: "Monofásica 110V"
      });
    } catch (error) {
      setError(error.message);
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
      // Limpiar mensaje de error después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);
    } finally {
      setEsperandoRespuesta(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepartamentoChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      departamento: value,
      ciudad: "" // Resetear la ciudad cuando cambia el departamento
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensajes([]);
    setEsperandoRespuesta(true);

    try {
      // Validar tipo de red usando el servicio
      if (!validateNetworkType(editFormData.tipo_red)) {
        throw new Error("Tipo de red no válido");
      }

      // Validar tipo de cliente usando el servicio
      if (!validateClientType(editFormData.tipo_cliente)) {
        throw new Error("Tipo de cliente no válido");
      }

      // Preparar los datos para enviar
      const updateData = {
        nic: editFormData.nic,
        client_type: editFormData.tipo_cliente,
        name: editFormData.nombre,
        department: editFormData.departamento,
        city: editFormData.ciudad,
        address: editFormData.direccion,
        monthly_consumption_kwh: Number(editFormData.consumo_mensual_kwh),
        energy_rate: Number(editFormData.tarifa_energia),
        network_type: editFormData.tipo_red
      };

      const clienteActualizado = await updateCliente(selectedCliente.client_id, updateData);

      // Actualizar el cliente en el estado local dinámicamente
      setClientes(prevClientes => 
        prevClientes.map(cliente => 
          cliente.client_id === selectedCliente.client_id 
            ? clienteActualizado 
            : cliente
        )
      );

      // Mostrar mensaje de éxito
      setMensajes([{
        contenido: "Cliente actualizado exitosamente",
        tipo: "success"
      }]);
      
      setTimeout(() => {
        setMensajes([]);
      }, 2000);

      setIsEditModalOpen(false);
    } catch (error) {
      setError(error.message);
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
      // Limpiar mensaje de error después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
      }, 2000);
    } finally {
      setEsperandoRespuesta(false);
    }
  };

  const handleEditDepartamentoChange = (e) => {
    const { value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      departamento: value,
      ciudad: "" // Resetear la ciudad cuando cambia el departamento
    }));
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4">
        <Mensaje 
          contenido={error} 
          tipo="error"
        />
        <button
          onClick={() => {
            setError(null);
            fetchClientes();
          }}
          className="rounded-lg bg-accent-primary px-6 py-2.5 text-white transition-colors hover:bg-accent-hover"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      {/* Widgets de métricas */}
      <div className="col-span-1 h-fit w-full xl:col-span-2 2xl:col-span-3 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Widget Clientes Nuevos */}
          <Card extra="p-6 bg-[var(--bg-secondary)] border border-[rgba(138,141,148,0.2)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600">
                <MdPersonAdd className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[var(--text-secondary)]">Clientes Nuevos</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{metricas.clientesNuevos}</p>
                <p className="text-xs text-[var(--text-disabled)]">Este trimestre</p>
              </div>
            </div>
          </Card>

          {/* Widget kW Posibles */}
          <Card extra="p-6 bg-[var(--bg-secondary)] border border-[rgba(138,141,148,0.2)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-hover)]">
                <MdTrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[var(--text-secondary)]">kW Posibles</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{metricas.kwPosibles}</p>
                <p className="text-xs text-[var(--text-disabled)]">Para cotizar</p>
              </div>
            </div>
          </Card>

          {/* Widget Consumo Promedio */}
          <Card extra="p-6 bg-[var(--bg-secondary)] border border-[rgba(138,141,148,0.2)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-amber-600">
                <MdElectricBolt className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[var(--text-secondary)]">Consumo Promedio</p>
                <p className="text-2xl font-bold text-[var(--text-primary)]">{metricas.consumoPromedio}</p>
                <p className="text-xs text-[var(--text-disabled)]">kWh/mes</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="col-span-1 h-fit w-full xl:col-span-2 2xl:col-span-3">
        <Card extra={"w-full h-full px-8 pb-8 sm:overflow-x-auto"}>
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-text-primary">
              Clientes
            </h1>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 rounded-lg bg-accent-primary px-6 py-2.5 text-white hover:bg-accent-hover transition-colors"
              >
                <MdAdd className="h-5 w-5" />
                Nuevo Cliente
              </button>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, NIC o tipo de cliente..."
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
            {/* Filtro por tipo de cliente */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Tipo de Cliente
              </label>
              <select
                value={filterTipoCliente}
                onChange={(e) => setFilterTipoCliente(e.target.value)}
                className="w-full rounded-lg border border-text-disabled/30 px-3 py-2 focus:border-accent-primary focus:outline-none bg-primary-card text-text-primary"
              >
                <option value="">Todos los tipos</option>
                {tiposClienteUnicos.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por ciudad */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Ciudad
              </label>
              <select
                value={filterCiudad}
                onChange={(e) => setFilterCiudad(e.target.value)}
                className="w-full rounded-lg border border-text-disabled/30 px-3 py-2 focus:border-accent-primary focus:outline-none bg-primary-card text-text-primary"
              >
                <option value="">Todas las ciudades</option>
                {ciudadesUnicas.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón para limpiar filtros */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setFilterTipoCliente("");
                  setFilterCiudad("");
                  setSearch("");
                }}
                className="rounded-lg bg-text-disabled px-4 py-2 text-white hover:bg-text-secondary transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-text-secondary">
              Mostrando {filteredClientes.length} de {clientes.length} clientes
            </div>
            {(filterTipoCliente || filterCiudad || search) && (
              <div className="text-sm text-text-secondary">
                Filtros activos: 
                {filterTipoCliente && <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 rounded">Tipo: {filterTipoCliente}</span>}
                {filterCiudad && <span className="ml-1 px-2 py-1 bg-green-100 text-green-800 rounded">Ciudad: {filterCiudad}</span>}
                {search && <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">Búsqueda: "{search}"</span>}
              </div>
            )}
          </div>

          {/* Tabla de clientes */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-text-disabled/20 bg-primary">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">NIC</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Tipo Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Nombre</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Ciudad</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Departamento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Dirección</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Consumo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Fecha Creación</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Responsable</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="px-6 py-8 text-center text-text-secondary">
                      <div className="flex flex-col items-center">
                        <div className="text-lg font-medium mb-2">No se encontraron clientes</div>
                        <div className="text-sm">
                          {search || filterTipoCliente || filterCiudad 
                            ? "Intenta ajustar los filtros de búsqueda"
                            : "No hay clientes registrados"
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cliente) => (
                  <tr key={cliente.client_id} className="border-b border-text-disabled/20 hover:bg-accent-primary/10 transition-colors">
                    <td className="px-6 py-4 text-sm text-text-primary">{cliente.nic}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{cliente.client_type}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{cliente.name}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{cliente.city}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{cliente.department}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">{cliente.address}</td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {formatNumber(cliente.monthly_consumption_kwh)} kWh
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('es-CO') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-primary">
                      {cliente.user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleInfo(cliente)}
                          className="text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          <MdInfo className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="text-accent-primary hover:text-accent-hover transition-colors"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente)}
                          className="text-red-500 hover:text-red-400 transition-colors"
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal de Crear Cliente */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nuevo Cliente"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Columna Izquierda */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  NIC*
                </label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary bg-primary-card text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Tipo de Cliente*
                </label>
                <select
                  name="tipo_cliente"
                  value={formData.tipo_cliente}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary bg-primary-card text-text-primary"
                >
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Nombre*
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary bg-primary-card text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Departamento*
                </label>
                <select
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleDepartamentoChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary bg-primary-card text-text-primary"
                >
                  <option value="">Seleccione un departamento</option>
                  {departamentos.map((depto) => (
                    <option key={depto} value={depto}>
                      {depto}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Ciudad*
                </label>
                <select
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.departamento || loadingLocalidades}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary bg-primary-card text-text-primary disabled:bg-text-disabled/20"
                >
                  <option value="">Seleccione una ciudad</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.municipality} value={ciudad.municipality}>
                      {ciudad.municipality}
                    </option>
                  ))}
                </select>
                {loadingLocalidades && (
                  <p className="mt-1 text-sm text-text-secondary">Cargando ciudades...</p>
                )}
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Dirección*
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary bg-primary-card text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Consumo Mensual (kWh)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="consumo_mensual_kwh"
                  value={formData.consumo_mensual_kwh}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary bg-primary-card text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Tarifa de Energía (COP/kWh)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="tarifa_energia"
                  value={formData.tarifa_energia}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary bg-primary-card text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Tipo de Red*
                </label>
                <select
                  name="tipo_red"
                  value={formData.tipo_red}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 shadow-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary bg-primary-card text-text-primary"
                >
                  <option value="Monofásica 110V">Monofásica 110V</option>
                  <option value="Bifásica 220V">Bifásica 220V</option>
                  <option value="Trifásica 220V">Trifásica 220V</option>
                  <option value="Trifásica 440V">Trifásica 440V</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="rounded-md border border-text-disabled/30 px-4 py-2 text-sm font-medium text-text-secondary hover:bg-text-disabled/20 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={esperandoRespuesta}
              className="rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {esperandoRespuesta ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Cliente"
      >
        <form onSubmit={handleEditSubmit} className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Columna Izquierda */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  NIC*
                </label>
                <input
                  type="text"
                  name="nic"
                  value={editFormData.nic}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Tipo de Cliente*
                </label>
                <select 
                  name="tipo_cliente"
                  value={editFormData.tipo_cliente}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                >
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Nombre*
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={editFormData.nombre}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Departamento*
                </label>
                <select
                  name="departamento"
                  value={editFormData.departamento}
                  onChange={handleEditDepartamentoChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                >
                  <option value="">Seleccione un departamento</option>
                  {departamentos.map((depto) => (
                    <option key={depto} value={depto}>
                      {depto}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Ciudad*
                </label>
                <select
                  name="ciudad"
                  value={editFormData.ciudad}
                  onChange={handleEditInputChange}
                  required
                  disabled={!editFormData.departamento || loadingLocalidades}
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary disabled:bg-text-disabled/20"
                >
                  <option value="">Seleccione una ciudad</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.municipality} value={ciudad.municipality}>
                      {ciudad.municipality}
                    </option>
                  ))}
                </select>
                {loadingLocalidades && (
                  <p className="mt-1 text-sm text-text-secondary">Cargando ciudades...</p>
                )}
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Dirección*
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={editFormData.direccion}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Consumo Mensual (kWh)*
                </label>
                <input
                  type="number"
                  name="consumo_mensual_kwh"
                  value={editFormData.consumo_mensual_kwh}
                  onChange={handleEditInputChange}
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Tarifa de Energía (COP/kWh)*
                </label>
                <input
                  type="number"
                  name="tarifa_energia"
                  value={editFormData.tarifa_energia}
                  onChange={handleEditInputChange}
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary">
                  Tipo de Red*
                </label>
                <select
                  name="tipo_red"
                  value={editFormData.tipo_red}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                >
                  <option value="Monofásica 110V">Monofásica 110V</option>
                  <option value="Bifásica 220V">Bifásica 220V</option>
                  <option value="Trifásica 220V">Trifásica 220V</option>
                  <option value="Trifásica 440V">Trifásica 440V</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-text-disabled/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Cliente"
      >
        <div className="p-4">
          <p className="text-text-secondary">
            ¿Está seguro que desea eliminar al cliente {selectedCliente?.name}?
          </p>
          {error && (
            <div className="mt-4">
              <Mensaje 
                contenido={error} 
                tipo="error"
              />
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-text-disabled/20 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-400 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Información */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Información del Cliente"
      >
        <div className="p-4">
          <div className="space-y-6">
            {/* Información del Cliente */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-text-primary">Datos del Cliente</h3>
              {/* Grid de dos columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Columna izquierda */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">NIC</p>
                    <p className="text-sm text-text-primary">{selectedCliente?.nic}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Tipo de Cliente</p>
                    <p className="text-sm text-text-primary">{selectedCliente?.client_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Nombre</p>
                    <p className="text-sm text-text-primary">{selectedCliente?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Departamento</p>
                    <p className="text-sm text-text-primary">{selectedCliente?.department}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Ciudad</p>
                    <p className="text-sm text-text-primary">{selectedCliente?.city}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Dirección</p>
                    <p className="text-sm text-text-primary">{selectedCliente?.address}</p>
                  </div>
                </div>
                
                {/* Columna derecha */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Consumo Mensual</p>
                    <p className="text-sm text-text-primary">{formatNumber(selectedCliente?.monthly_consumption_kwh)} kWh</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Tarifa de Energía</p>
                    <p className="text-sm text-text-primary">${formatNumber(selectedCliente?.energy_rate)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Tipo de Red</p>
                    <p className="text-sm text-text-primary">{selectedCliente?.network_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Estado</p>
                    <p className="text-sm text-text-primary">{selectedCliente?.is_active ? 'Activo' : 'Inactivo'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Usuario Asignado</p>
                    <p className="text-sm text-text-primary">{selectedCliente?.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-secondary">Fecha de Creación</p>
                    <p className="text-sm text-text-primary">{new Date(selectedCliente?.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="rounded-lg border border-text-disabled/30 px-4 py-2 text-text-secondary hover:bg-text-disabled/20 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Mensajes de notificación */}
      {mensajes.map((mensaje, index) => (
        <div
          key={index}
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg transition-all duration-300 ${
            mensaje.tipo === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          <span className="flex-1">{mensaje.contenido}</span>
          <button
            onClick={() => {
              setMensajes((prev) => prev.filter((_, i) => i !== index));
            }}
            className="ml-2 rounded-full p-1 hover:bg-white/20 focus:outline-none"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default Clientes;