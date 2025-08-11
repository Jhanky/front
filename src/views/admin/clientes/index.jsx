import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdInfo, MdSearch } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import Mensaje from "components/mensaje";
import Loading from "components/loading";
import { getApiUrl } from '../../../config/api';

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
  const [intentosRestantes, setIntentosRestantes] = useState(5);

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

  // Función para cargar clientes
  const fetchClientes = async () => {
    try {
      setLoading(true);
      const token = user?.token;
      
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(getApiUrl('/api/clients'), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
    
      // Verificar la estructura de respuesta de Laravel
      if (responseData.success && responseData.data) {
        // La respuesta viene con paginación, extraer solo los datos
        const clientesData = responseData.data.data || [];
        setClientes(clientesData);
        console.log('Clientes cargados:', clientesData);
      } else {
        // Fallback para estructura anterior
        setClientes(responseData.data || responseData || []);
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

  // Función para cargar departamentos
  const fetchDepartamentos = async () => {
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(getApiUrl('/api/locations/departments'), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar los departamentos");
      }

      const responseData = await response.json();
      
      // Manejar la nueva estructura de respuesta de Laravel
      if (responseData.success && responseData.data) {
        setDepartamentos(responseData.data);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error al cargar departamentos:", error);
      setError(error.message);
    }
  };

  // Función para cargar ciudades por departamento
  const fetchCiudades = async (departamento) => {
    try {
      setLoadingLocalidades(true);
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(getApiUrl(`/api/locations/cities?department=${encodeURIComponent(departamento)}`), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar las ciudades");
      }

      const responseData = await response.json();
      
      // Manejar la nueva estructura de respuesta de Laravel
      if (responseData.success && responseData.data) {
        setCiudades(responseData.data);
      } else {
        throw new Error("Formato de respuesta inválido");
      }
    } catch (error) {
      console.error("Error al cargar ciudades:", error);
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
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(getApiUrl(`/api/clients/${selectedCliente.client_id}`), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al eliminar el cliente");
      }

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
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-CO').format(number);
  };

  const filteredClientes = clientes.filter(cliente => 
    cliente.name?.toLowerCase().includes(search.toLowerCase()) ||
    cliente.nic?.toString().includes(search) ||
    cliente.client_type?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensajes([]);
    setEsperandoRespuesta(true);

    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Validar tipo de red
      const tiposRedValidos = [
        "Monofásica 110V",
        "Bifásica 220V",
        "Trifásica 220V",
        "Trifásica 440V"
      ];

      if (!tiposRedValidos.includes(formData.tipo_red)) {
        throw new Error("Tipo de red no válido");
      }

      const clientData = {
        nic: formData.nic,
        client_type: formData.tipo_cliente,
        name: formData.nombre,
        department: formData.departamento,
        city: formData.ciudad,
        address: formData.direccion,
        monthly_consumption_kwh: Number(formData.consumo_mensual_kwh),
        energy_rate: Number(formData.tarifa_energia),
        network_type: formData.tipo_red,
        is_active: true
      };

      const response = await fetch(getApiUrl('/api/clients'), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(clientData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al crear el cliente");
      }

      // Agregar el nuevo cliente al estado local dinámicamente
      const nuevoCliente = data.data || data; // Adaptarse a la respuesta de Laravel
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
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Validar tipo de red
      const tiposRedValidos = [
        "Monofásica 110V",
        "Bifásica 220V",
        "Trifásica 220V",
        "Trifásica 440V"
      ];

      if (!tiposRedValidos.includes(editFormData.tipo_red)) {
        throw new Error("Tipo de red no válido");
      }

      // Preparar los datos para enviar con la nueva estructura
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

      const response = await fetch(getApiUrl(`/api/clients/${selectedCliente.client_id}`), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al actualizar el cliente");
      }

      // Actualizar el cliente en el estado local dinámicamente
      const clienteActualizado = data.data || { ...selectedCliente, ...updateData };
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
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-white transition-colors hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-2 2xl:col-span-3">
        <Card extra={"w-full h-full px-8 pb-8 sm:overflow-x-auto"}>
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Clientes
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-white hover:bg-green-700"
            >
              <MdAdd className="h-5 w-5" />
              Nuevo Cliente
            </button>
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:border-green-500 focus:outline-none"
                />
                <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Tabla de clientes */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">NIC</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Tipo Cliente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Nombre</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Ciudad</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Departamento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Dirección</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Consumo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Tarifa</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Tipo Red</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Estado</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.client_id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{cliente.nic}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{cliente.client_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{cliente.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{cliente.city}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{cliente.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{cliente.address}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatNumber(cliente.monthly_consumption_kwh)} kWh
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${formatNumber(cliente.energy_rate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{cliente.network_type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        cliente.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cliente.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {cliente.user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleInfo(cliente)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <MdInfo className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <MdEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente)}
                          className="text-red-600 hover:text-red-700"
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
                <label className="block text-sm font-medium text-gray-700">
                  NIC*
                </label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Cliente*
                </label>
                <select
                  name="tipo_cliente"
                  value={formData.tipo_cliente}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre*
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Departamento*
                </label>
                <select
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleDepartamentoChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
                <label className="block text-sm font-medium text-gray-700">
                  Ciudad*
                </label>
                <select
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.departamento || loadingLocalidades}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100"
                >
                  <option value="">Seleccione una ciudad</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.municipality} value={ciudad.municipality}>
                      {ciudad.municipality}
                    </option>
                  ))}
                </select>
                {loadingLocalidades && (
                  <p className="mt-1 text-sm text-gray-500">Cargando ciudades...</p>
                )}
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dirección*
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Consumo Mensual (kWh)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="consumo_mensual_kwh"
                  value={formData.consumo_mensual_kwh}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tarifa de Energía (COP/kWh)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="tarifa_energia"
                  value={formData.tarifa_energia}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Red*
                </label>
                <select
                  name="tipo_red"
                  value={formData.tipo_red}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={esperandoRespuesta}
              className="rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50"
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
                <label className="block text-sm font-medium text-gray-700">
                  NIC*
                </label>
                <input
                  type="text"
                  name="nic"
                  value={editFormData.nic}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Cliente*
                </label>
                <select 
                  name="tipo_cliente"
                  value={editFormData.tipo_cliente}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre*
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={editFormData.nombre}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Departamento*
                </label>
                <select
                  name="departamento"
                  value={editFormData.departamento}
                  onChange={handleEditDepartamentoChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
                <label className="block text-sm font-medium text-gray-700">
                  Ciudad*
                </label>
                <select
                  name="ciudad"
                  value={editFormData.ciudad}
                  onChange={handleEditInputChange}
                  required
                  disabled={!editFormData.departamento || loadingLocalidades}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                >
                  <option value="">Seleccione una ciudad</option>
                  {ciudades.map((ciudad) => (
                    <option key={ciudad.municipality} value={ciudad.municipality}>
                      {ciudad.municipality}
                    </option>
                  ))}
                </select>
                {loadingLocalidades && (
                  <p className="mt-1 text-sm text-gray-500">Cargando ciudades...</p>
                )}
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dirección*
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={editFormData.direccion}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Consumo Mensual (kWh)*
                </label>
                <input
                  type="number"
                  name="consumo_mensual_kwh"
                  value={editFormData.consumo_mensual_kwh}
                  onChange={handleEditInputChange}
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tarifa de Energía (COP/kWh)*
                </label>
                <input
                  type="number"
                  name="tarifa_energia"
                  value={editFormData.tarifa_energia}
                  onChange={handleEditInputChange}
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Red*
                </label>
                <select
                  name="tipo_red"
                  value={editFormData.tipo_red}
                  onChange={handleEditInputChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
      </Modal>

      {/* Modal de Eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Cliente"
      >
        <div className="p-4">
          <p className="text-gray-600">
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
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Datos del Cliente</h3>
                {/* Grid de dos columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Columna izquierda */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">NIC</p>
                      <p className="text-sm text-gray-800">{selectedCliente?.nic}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tipo de Cliente</p>
                      <p className="text-sm text-gray-800">{selectedCliente?.client_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Nombre</p>
                      <p className="text-sm text-gray-800">{selectedCliente?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Departamento</p>
                      <p className="text-sm text-gray-800">{selectedCliente?.department}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ciudad</p>
                      <p className="text-sm text-gray-800">{selectedCliente?.city}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Dirección</p>
                      <p className="text-sm text-gray-800">{selectedCliente?.address}</p>
                    </div>
                  </div>
                  
                  {/* Columna derecha */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Consumo Mensual</p>
                      <p className="text-sm text-gray-800">{formatNumber(selectedCliente?.monthly_consumption_kwh)} kWh</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tarifa de Energía</p>
                      <p className="text-sm text-gray-800">${formatNumber(selectedCliente?.energy_rate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tipo de Red</p>
                      <p className="text-sm text-gray-800">{selectedCliente?.network_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Estado</p>
                      <p className="text-sm text-gray-800">{selectedCliente?.is_active ? 'Activo' : 'Inactivo'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Usuario Asignado</p>
                      <p className="text-sm text-gray-800">{selectedCliente?.user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fecha de Creación</p>
                      <p className="text-sm text-gray-800">{new Date(selectedCliente?.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsInfoModalOpen(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-800"
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