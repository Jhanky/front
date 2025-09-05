import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdDownload, MdSearch, MdInfo } from "react-icons/md";
import { useAuth } from "context/AuthContext";
import Mensaje from "components/mensaje";
import Loading from "components/loading";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getApiUrl, getTechnicalSheetUrl } from '../../../config/api';
import { cotizacionesService } from '../../../services/cotizacionesService';

// Importar modales separados
import CreateCotizacionModal from './CreateCotizacionModal';
import EditCotizacionModal from './EditCotizacionModal';
import DeleteCotizacionModal from './DeleteCotizacionModal';



const Cotizaciones = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
    last_page: 1
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("sin-financiamiento"); // "sin-financiamiento" o "con-financiamiento"
  const [productos, setProductos] = useState([]);
  const [items, setItems] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [searchCliente, setSearchCliente] = useState("");
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [potenciaKW, setPotenciaKW] = useState("");
  const [tipoSistema, setTipoSistema] = useState("");
  const [tipoRed, setTipoRed] = useState("");
  const [panelSeleccionado, setPanelSeleccionado] = useState(null);
  const [numeroPanelesCalculado, setNumeroPanelesCalculado] = useState(null);
  const [paneles, setPaneles] = useState([]);
  const [inversores, setInversores] = useState([]);
  const [inversorSeleccionado, setInversorSeleccionado] = useState(null);
  const [cantidadInversores, setCantidadInversores] = useState("");
  const [cantidadPaneles, setCantidadPaneles] = useState(0);
  const [seccionActual, setSeccionActual] = useState(1);

  // Función para limpiar el formulario
  const limpiarFormulario = () => {
    setClienteSeleccionado(null);
    setSearchCliente("");
    setShowClienteDropdown(false);
    setNombreProyecto("");
    setPotenciaKW("");
    setTipoSistema("");
    setTipoRed("");
    setPanelSeleccionado(null);
    setInversorSeleccionado(null);
    setCantidadPaneles(0);
    setCantidadInversores("");
    setRequiereFinanciamiento(false);
    setValorTramites("");
    setValorManoObra("");
    setValorEstructura("");
    setValorMaterialElectrico("");
    setValorSobreestructura("");
    setPorcentajeGestionComercial("");
    setPorcentajeImprevistos("");
    setPorcentajeRetencion("");
    setPorcentajeAdministracion("");
    setPorcentajeUtilidad("");
    setCostoLegalizacion("");
    setPorcentajeLegalizacion("");
    setSeccionActual(1);
  };

  // Estados para valores monetarios
  const [valorTramites, setValorTramites] = useState("7000000");
  const [valorManoObra, setValorManoObra] = useState("200000");
  const [valorEstructura, setValorEstructura] = useState("105000");
  const [valorMaterialElectrico, setValorMaterialElectrico] = useState("180000");
  const [valorSobreestructura, setValorSobreestructura] = useState("");

  // Estados para porcentajes
  const [porcentajeGestionComercial, setPorcentajeGestionComercial] = useState("3");
  const [porcentajeImprevistos, setPorcentajeImprevistos] = useState("2");
  const [porcentajeRetencion, setPorcentajeRetencion] = useState("3.5");
  const [porcentajeAdministracion, setPorcentajeAdministracion] = useState("8");
  const [porcentajeUtilidad, setPorcentajeUtilidad] = useState("5");
  const [costoLegalizacion, setCostoLegalizacion] = useState("2500000");
  const [porcentajeLegalizacion, setPorcentajeLegalizacion] = useState("25");
  const [requiereFinanciamiento, setRequiereFinanciamiento] = useState(false);
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  // Estados para carga de detalles


  // 1. Agregar estados para batería
  const [bateriaSeleccionada, setBateriaSeleccionada] = useState(null);
  const [cantidadBaterias, setCantidadBaterias] = useState(1);
  const [baterias, setBaterias] = useState([]);

  // 2. Cargar baterías si el sistema no es Interconectado
  useEffect(() => {
    if (tipoSistema && tipoSistema !== "Interconectado") {
      fetch(getApiUrl("/api/batteries"), {
        headers: { "Authorization": `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => {
  
          // Extraer las baterías de la estructura de respuesta correcta
          const bateriasData = data.success && data.data && data.data.data ? data.data.data : [];
          setBaterias(Array.isArray(bateriasData) ? bateriasData : []);
        })
        .catch(() => setBaterias([]));
    }
  }, [tipoSistema, user.token]);

  // Función para obtener datos del usuario logueado
  const obtenerUsuarioLogueado = async () => {
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(getApiUrl("/api/users/me/id"), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error al obtener datos del usuario");
      }

      const data = await response.json();
      
      
      // Crear objeto con la estructura esperada
      const usuarioData = {
        id: data.user_id,
        user_id: data.user_id
      };
      
      setUsuarioLogueado(usuarioData);
    } catch (error) {
      console.error("Error:", error);
      setError("Error al obtener datos del usuario");
    }
  };

  // Llamar a la función cuando se monta el componente
  useEffect(() => {
    obtenerUsuarioLogueado();
  }, []);

  // Función para cargar cotizaciones
  const fetchCotizaciones = async (page = 1) => {
    try {
      setLoading(true);
      const token = user?.token;
      
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await cotizacionesService.getCotizaciones({ page }, token);
      
      if (response.success) {
        // La respuesta ya viene formateada correctamente desde el servicio
        setCotizaciones(Array.isArray(response.data) ? response.data : []);
        
        // Configurar paginación si está disponible
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        throw new Error(response.message || "Error al cargar cotizaciones");
      }
      
      setError(null);
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      setError(error.message);
      setCotizaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar cambio de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.last_page) {
      fetchCotizaciones(newPage);
    }
  };

  // Cargar cotizaciones al montar el componente
  useEffect(() => {
    fetchCotizaciones();
  }, []);

  // Filtrar cotizaciones basado en la búsqueda y el tipo de financiamiento
  const filteredCotizaciones = cotizaciones.filter(cotizacion => {
    const searchLower = search.toLowerCase();
    const matchesSearch = (
      cotizacion.project_name?.toLowerCase().includes(searchLower) ||
      cotizacion.client?.name?.toLowerCase().includes(searchLower) ||
      cotizacion.client?.city?.toLowerCase().includes(searchLower) ||
      cotizacion.user?.name?.toLowerCase().includes(searchLower) ||
      cotizacion.system_type?.toLowerCase().includes(searchLower)
    );
    
    // Filtrar por tipo de financiamiento
    const requiresFinancing = cotizacion.requires_financing === true || cotizacion.requires_financing === 1;
    
    if (activeTab === "sin-financiamiento") {
      return matchesSearch && !requiresFinancing;
    } else {
      return matchesSearch && requiresFinancing;
    }
  });

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (cotizacion) => {
    setSelectedCotizacion(cotizacion);
    setIsEditModalOpen(true);
  };

  const handleDelete = (cotizacion) => {
    setSelectedCotizacion(cotizacion);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await cotizacionesService.deleteCotizacion(selectedCotizacion.quotation_id, token);

      if (response.success) {
        // Actualizar estado local dinámicamente
        setCotizaciones(prev => prev.filter(c => c.quotation_id !== selectedCotizacion.quotation_id));
        
        // Cerrar el modal
        setIsDeleteModalOpen(false);
        
        // Mostrar mensaje de éxito
        setMensajes([{
          contenido: "Cotización eliminada exitosamente",
          tipo: "success"
        }]);
        
        // Limpiar mensaje después de 2 segundos
        setTimeout(() => {
          setMensajes([]);
        }, 2000);
      } else {
        throw new Error(response.message || "Error al eliminar la cotización");
      }
      
    } catch (error) {
      console.error("Error al eliminar la cotización:", error);
      setError(error.message);
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
      
      // Limpiar mensaje después de 2 segundos
      setTimeout(() => {
        setMensajes([]);
        setError(null);
      }, 2000);
    }
  };

  const handleDownload = async (cotizacion) => {
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      setMensajes([{
        contenido: "Generando PDF...",
        tipo: "info"
      }]);

      // Llama al endpoint de tu backend para obtener el PDF
      const response = await fetch(getApiUrl(`/api/quotations/${cotizacion.id}/pdfkit`), {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error("Error al generar el PDF");
      }

      // Obtén el blob del PDF
      const pdfBlob = await response.blob();

      // Crea la URL y descarga el archivo
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Cotizacion_${cotizacion.project_name || cotizacion.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMensajes([{
        contenido: "PDF generado exitosamente",
        tipo: "success"
      }]);
    } catch (error) {
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
    }
  };

  const formatNumber = (number) => {
    if (!number) return '0';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(number);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const agregarProducto = () => {
    const nuevoProducto = {
      tipo_producto: "",
      id_producto: "",
      cantidad: 1
    };
    setProductos([...productos, nuevoProducto]);
  };

  const eliminarProducto = (index) => {
    const nuevosProductos = productos.filter((_, i) => i !== index);
    setProductos(nuevosProductos);
  };

  const actualizarProducto = (index, campo, valor) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index] = {
      ...nuevosProductos[index],
      [campo]: valor
    };
    setProductos(nuevosProductos);
  };

  const agregarItem = () => {
    const nuevoItem = {
      descripcion: "",
      cantidad: 1,
      precio_unitario: 0,
      porcentaje_ganancia: 0.20
    };
    setItems([...items, nuevoItem]);
  };

  const eliminarItem = (index) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    setItems(nuevosItems);
  };

  const actualizarItem = (index, campo, valor) => {
    const nuevosItems = [...items];
    nuevosItems[index] = {
      ...nuevosItems[index],
      [campo]: valor
    };
    setItems(nuevosItems);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Validar que el usuario esté logueado
      if (!usuarioLogueado || !usuarioLogueado.id) {
        throw new Error("No se pudo obtener la información del usuario logueado");
      }

      // Validar que se haya seleccionado un cliente
      if (!clienteSeleccionado || !clienteSeleccionado.client_id) {
        throw new Error("Debe seleccionar un cliente");
      }

      // Validar que se haya seleccionado un panel
      if (!panelSeleccionado || !panelSeleccionado.panel_id) {
        throw new Error("Debe seleccionar un panel solar");
      }

      // Validar que se haya seleccionado un inversor
      if (!inversorSeleccionado || !inversorSeleccionado.inverter_id) {
        throw new Error("Debe seleccionar un inversor");
      }

      // Preparar los datos de la cotización con la estructura correcta del backend
      const cotizacionData = {
        client_id: parseInt(clienteSeleccionado.client_id),
        user_id: parseInt(usuarioLogueado.id),
        project_name: nombreProyecto,
        system_type: tipoSistema,
        power_kwp: parseFloat(potenciaKW),
        panel_count: parseInt(cantidadPaneles),
        requires_financing: requiereFinanciamiento ? 1 : 0,
        profit_percentage: 0.15,
        iva_profit_percentage: 0.19,
        commercial_management_percentage: 0.05,
        administration_percentage: 0.03,
        contingency_percentage: 0.02,
        withholding_percentage: 0.025,
        legalization_cost: 2500000,
        legalization_cost_percentage: 0.25,
        products: [
          {
            product_type: "panel",
            product_id: parseInt(panelSeleccionado.panel_id),
            quantity: parseInt(cantidadPaneles),
            unit_price: parseInt(panelSeleccionado.price),
            profit_percentage: 0.25
          },
          {
            product_type: "inverter",
            product_id: parseInt(inversorSeleccionado.inverter_id),
            quantity: parseInt(cantidadInversores),
            unit_price: parseInt(inversorSeleccionado.price),
            profit_percentage: 0.25
          },
          ...(tipoSistema !== "Interconectado" && bateriaSeleccionada ? [{
            product_type: "battery",
            product_id: parseInt(bateriaSeleccionada.battery_id),
            quantity: parseInt(cantidadBaterias),
            unit_price: parseInt(bateriaSeleccionada.price),
            profit_percentage: 0.25
          }] : [])
        ],
        items: [
          {
            description: "Conductor fotovoltaico",
            item_type: "conductor_fotovoltaico",
            quantity: parseInt(potenciaKW) * 12,
            unit: "metro",
            unit_price: 4047,
            profit_percentage: 0.25
          },
          {
            description: "Cableado fotovoltaico",
            item_type: "material_electrico",
            quantity: parseInt(cantidadPaneles),
            unit: "metros",
            unit_price: parseInt(valorMaterialElectrico),
            profit_percentage: 0.25
          },
          {
            description: "Estructura de soporte",
            item_type: "estructura",
            quantity: parseInt(cantidadPaneles),
            unit: "kit",
            unit_price: parseInt(valorEstructura),
            profit_percentage: 0.25
          },
          {
            description: "Mano de obra instalación",
            item_type: "mano_obra",
            quantity: parseInt(cantidadPaneles),
            unit: "servicio",
            unit_price: parseInt(valorManoObra),
            profit_percentage: 0.25
          }
        ]
      };

      
      
      const response = await fetch(getApiUrl("/api/quotations"), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cotizacionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la cotización");
      }

      const data = await response.json();
      
      
      // Cerrar modal y limpiar formulario
      setIsCreateModalOpen(false);
      limpiarFormulario();
      
      // Recargar la lista de cotizaciones
      await fetchCotizaciones();
      
      // Limpiar estados
      setProductos([]);
      setItems([]);
      setClienteSeleccionado(null);
      setPanelSeleccionado(null);
      setInversorSeleccionado(null);
      setPotenciaKW("");
      setCantidadPaneles(0);
      setCantidadInversores("");
      setNombreProyecto("");
      setTipoSistema("");
      setValorTramites("7000000");
      setValorManoObra("200000");
      setValorEstructura("105000");
      setValorMaterialElectrico("180000");
      setValorSobreestructura("");
      setPorcentajeGestionComercial("3");
      setPorcentajeImprevistos("2");
      setPorcentajeRetencion("3.5");
      setPorcentajeAdministracion("8");
      setPorcentajeUtilidad("5");
      setCostoLegalizacion("2500000");
      setPorcentajeLegalizacion("25");
      setRequiereFinanciamiento(false);

      // Mostrar mensaje de éxito
      setMensajes([{
        contenido: "Cotización creada exitosamente",
        tipo: "success"
      }]);
    } catch (error) {
      console.error("Error al crear la cotización:", error);
      setError(error.message);
    }
  };

  // Renderizar productos dinámicamente
  const renderProductos = () => {
    return productos.map((producto, index) => (
      <div key={index} className="flex gap-2 items-center">
        <select
          value={producto.tipo_producto}
          onChange={(e) => actualizarProducto(index, "tipo_producto", e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          required
        >
          <option value="">Seleccione tipo de producto</option>
          <option value="panel">Panel Solar</option>
          <option value="inversor">Inversor</option>
          <option value="bateria">Batería</option>
        </select>
        <select
          value={producto.id_producto}
          onChange={(e) => actualizarProducto(index, "id_producto", e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          required
        >
          <option value="">Seleccione producto</option>
          {/* TODO: Cargar productos según el tipo seleccionado */}
        </select>
        <input
          type="number"
          value={producto.cantidad}
          onChange={(e) => actualizarProducto(index, "cantidad", parseInt(e.target.value))}
          min="1"
          className="w-24 rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <button
          type="button"
          onClick={() => eliminarProducto(index)}
          className="rounded-md bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
        >
          -
        </button>
      </div>
    ));
  };

  // Renderizar items dinámicamente
  const renderItems = () => {
    return items.map((item, index) => (
      <div key={index} className="flex gap-2 items-center">
        <input
          type="text"
          value={item.descripcion}
          onChange={(e) => actualizarItem(index, "descripcion", e.target.value)}
          placeholder="Descripción"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <input
          type="number"
          value={item.cantidad}
          onChange={(e) => actualizarItem(index, "cantidad", parseInt(e.target.value))}
          min="1"
          className="w-24 rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <input
          type="number"
          value={item.precio_unitario}
          onChange={(e) => actualizarItem(index, "precio_unitario", parseFloat(e.target.value))}
          min="0"
          className="w-32 rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <input
          type="number"
          value={item.porcentaje_ganancia}
          onChange={(e) => actualizarItem(index, "porcentaje_ganancia", parseFloat(e.target.value))}
          min="0"
          max="1"
          step="0.01"
          className="w-32 rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <button
          type="button"
          onClick={() => eliminarItem(index)}
          className="rounded-md bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
        >
          -
        </button>
      </div>
    ));
  };

  // Función para cargar todos los clientes
  const cargarClientes = async () => {
    try {
      const token = user?.token;
      
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(getApiUrl("/api/clients"), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicie sesión nuevamente.");
        }
        if (response.status === 404) {
          throw new Error("No se encontró el servicio de clientes. Por favor, verifique que el servidor esté funcionando.");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extraer los clientes de la estructura de respuesta correcta
      const clientesData = data.success && data.data && data.data.data ? data.data.data : [];
      setClientes(Array.isArray(clientesData) ? clientesData : []);
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      setError(error.message);
      setClientes([]);
    }
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    if (user?.token) {
      cargarClientes();
    }
  }, [user]);

  // Función para calcular el número de paneles
  const calcularNumeroPaneles = (potenciaKW, potenciaPanel) => {
    if (!potenciaKW || !potenciaPanel) return null;
    const potenciaWatts = parseFloat(potenciaKW) * 1000;
    const numeroPaneles = Math.ceil(potenciaWatts / potenciaPanel);
    return numeroPaneles;
  };

  // Efecto para calcular paneles cuando cambia la potencia o el panel seleccionado
  useEffect(() => {
    if (potenciaKW && panelSeleccionado?.power) {
      const numeroPaneles = calcularNumeroPaneles(potenciaKW, panelSeleccionado.power);
      setNumeroPanelesCalculado(numeroPaneles);
    } else {
      setNumeroPanelesCalculado(null);
    }
  }, [potenciaKW, panelSeleccionado]);

  // Efecto para actualizar la cantidad de paneles cuando cambia el cálculo
  useEffect(() => {
    if (numeroPanelesCalculado) {
      setCantidadPaneles(numeroPanelesCalculado);
    }
  }, [numeroPanelesCalculado]);

  // Función para cargar paneles
  const cargarPaneles = async () => {
    try {
      const token = user?.token;
      
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(getApiUrl("/api/panels"), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicie sesión nuevamente.");
        }
        if (response.status === 404) {
          throw new Error("No se encontró el servicio de paneles. Por favor, verifique que el servidor esté funcionando.");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extraer los paneles de la estructura de respuesta correcta
      const panelesData = data.success && data.data && data.data.data ? data.data.data : [];
      setPaneles(Array.isArray(panelesData) ? panelesData : []);
    } catch (error) {
      console.error("Error al cargar paneles:", error);
      setError(error.message);
      setPaneles([]);
    }
  };

  // Cargar paneles al montar el componente
  useEffect(() => {
    if (user?.token) {
      cargarPaneles();
    }
  }, [user]);

  // Función para cargar inversores
  const cargarInversores = async () => {
    try {
              const token = user?.token;
      
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const url = getApiUrl("/api/inverters");
              const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("No autorizado. Por favor, inicie sesión nuevamente.");
        }
        if (response.status === 404) {
          throw new Error("No se encontró el servicio de inversores. Por favor, verifique que el servidor esté funcionando.");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Intentar diferentes estructuras de respuesta
      let inversoresData = [];
      if (data.success && data.data && data.data.data) {
        inversoresData = data.data.data;
      } else if (data.data && Array.isArray(data.data)) {
        inversoresData = data.data;
      } else if (Array.isArray(data)) {
        inversoresData = data;
      }
      
      setInversores(Array.isArray(inversoresData) ? inversoresData : []);
    } catch (error) {
      console.error("=== ERROR AL CARGAR INVERSORES ===", error);
      setError(error.message);
      setInversores([]);
    }
  };

  // Cargar inversores al montar el componente
  useEffect(() => {
    if (user?.token) {
      cargarInversores();
    }
  }, [user]);

  // Cerrar dropdown de clientes cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showClienteDropdown && !event.target.closest('.cliente-dropdown')) {
        setShowClienteDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showClienteDropdown]);

  // Filtrar inversores según tipo de red y potencia
  const inversoresFiltrados = inversores.filter(inversor => {
    if (!tipoRed) {
      return false;
    }
    if (!potenciaKW) {
      return false;
    }
    
    const potenciaMaxima = parseFloat(potenciaKW) * 1.3;
    // Usar los campos correctos de la API: grid_type y power
    // Si estos campos no existen, verificar system_type y power_rating
    const gridType = inversor.grid_type || inversor.system_type;
    const power = inversor.power || inversor.power_rating || inversor.capacity;
    
    return gridType === tipoRed && parseFloat(power) <= potenciaMaxima;
  });
  
  

  // Función para filtrar clientes basado en la búsqueda
  const clientesFiltrados = clientes.filter(cliente => 
    cliente.name?.toLowerCase().includes(searchCliente.toLowerCase()) ||
    cliente.nic?.toLowerCase().includes(searchCliente.toLowerCase())
  );
  
  
  

  // Actualizar el modal de creación para usar búsqueda de clientes
  const renderSeleccionCliente = () => (
    <div className="relative cliente-dropdown">
      <label className="block text-sm font-medium text-gray-700">
        Buscar y Seleccionar Cliente
      </label>
      <div className="relative">
        <input
          type="text"
          value={clienteSeleccionado ? clienteSeleccionado.name : searchCliente}
          onChange={(e) => {
            setSearchCliente(e.target.value);
            setShowClienteDropdown(true);
            if (!e.target.value) {
              setClienteSeleccionado(null);
            }
          }}
          onFocus={() => setShowClienteDropdown(true)}
          placeholder="Buscar cliente por nombre o NIC..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 pr-10"
          required
        />
        {clienteSeleccionado && (
          <button
            type="button"
            onClick={() => {
              setClienteSeleccionado(null);
              setSearchCliente("");
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Dropdown de clientes */}
      {showClienteDropdown && searchCliente && !clienteSeleccionado && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg max-h-60 overflow-auto">
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map((cliente) => (
              <button
                key={cliente.client_id}
                type="button"
                onClick={() => {
                  setClienteSeleccionado(cliente);
                  setSearchCliente(cliente.name);
                  setShowClienteDropdown(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              >
                {cliente.name}
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No se encontraron clientes
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Actualizar también la visualización del cliente seleccionado
  const renderClienteSeleccionado = () => (
    clienteSeleccionado && (
      <div className="rounded-md bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-green-800">{clienteSeleccionado.name}</h4>
            <div className="mt-1 text-sm text-green-600">
              <div>NIC: {clienteSeleccionado.nic}</div>
              <div>Tipo: {clienteSeleccionado.client_type}</div>
              <div>Ubicación: {clienteSeleccionado.city}, {clienteSeleccionado.department}</div>
              <div>Dirección: {clienteSeleccionado.address}</div>
              <div>Consumo: {clienteSeleccionado.monthly_consumption_kwh} kWh/mes</div>
              <div>Tarifa: ${clienteSeleccionado.energy_rate}</div>
              <div>Tipo de Red: {clienteSeleccionado.network_type}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setClienteSeleccionado(null);
              setSearchCliente("");
            }}
            className="text-sm text-green-600 hover:text-green-800"
          >
            Cambiar
          </button>
        </div>
      </div>
    )
  );

  // Renderizar selección de inversor
  const renderSeleccionInversor = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Seleccionar Inversor
        </label>
        <select
          value={inversorSeleccionado?.inverter_id || ""}
          onChange={(e) => {
            const inversor = inversores.find(i => i.inverter_id === parseInt(e.target.value));
            setInversorSeleccionado(inversor);
            setCantidadInversores("");
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          disabled={!tipoRed || !potenciaKW}
        >
          <option value="">Seleccione un inversor</option>
          {inversoresFiltrados.map((inversor) => (
            <option key={inversor.inverter_id} value={inversor.inverter_id}>
              {inversor.brand} - {inversor.model} - {inversor.power || inversor.power_rating || inversor.capacity || 'N/A'}kW
            </option>
          ))}
        </select>
        {(!tipoRed || !potenciaKW) && (
          <p className="mt-1 text-sm text-gray-500">
            {!potenciaKW ? "Ingrese la potencia para ver los inversores compatibles" : 
             "Seleccione el tipo de red para ver los inversores compatibles"}
          </p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cantidad de Inversores
        </label>
        <input
          type="number"
          min="1"
          value={cantidadInversores}
          onChange={(e) => setCantidadInversores(e.target.value)}
          disabled={!inversorSeleccionado}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Cantidad"
        />
      </div>
    </div>
  );

  // Renderizar selección de panel
  const renderSeleccionPanel = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Seleccionar Panel
        </label>
        <select
          value={panelSeleccionado?.panel_id || ""}
          onChange={(e) => {
            const panel = paneles.find(p => p.panel_id === parseInt(e.target.value));
            setPanelSeleccionado(panel);
          }}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="">Seleccione un panel</option>
          {paneles.map((panel) => (
            <option key={panel.panel_id} value={panel.panel_id}>
              {panel.brand} - {panel.model} - {panel.power}W
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cantidad de Paneles
        </label>
        <input
          type="number"
          min="1"
          value={cantidadPaneles}
          onChange={(e) => setCantidadPaneles(parseInt(e.target.value) || 0)}
          disabled={!panelSeleccionado}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Cantidad"
        />
      </div>
    </div>
  );

  // Función para formatear números con comas
  const formatearNumero = (numero) => {
    if (numero === undefined || numero === null || isNaN(numero)) return "";
    return numero.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Función para manejar el cambio en inputs monetarios
  const handleMonetaryChange = (e, setter) => {
    const valor = e.target.value.replace(/,/g, '');
    if (valor === '' || /^\d+$/.test(valor)) {
      setter(valor);
    }
  };

  // Función para obtener el valor formateado para mostrar
  const getValorFormateado = (valor) => {
    return valor ? formatearNumero(valor) : '';
  };

  const handleViewDetails = async (cotizacion) => {
    // Navegar a la página de detalles en lugar de abrir modal
    navigate(`/admin/cotizaciones/${cotizacion.quotation_id}`);
  };

  // Función para editar cotización
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Validar que el usuario esté logueado
      if (!usuarioLogueado || !usuarioLogueado.id) {
        throw new Error("No se pudo obtener la información del usuario logueado");
      }

      if (!selectedCotizacion) {
        throw new Error("No hay cotización seleccionada para editar");
      }

      // Validar que se haya seleccionado un cliente
      if (!clienteSeleccionado || !clienteSeleccionado.client_id) {
        throw new Error("Debe seleccionar un cliente");
      }

      // Validar que se haya seleccionado un panel
      if (!panelSeleccionado || !panelSeleccionado.panel_id) {
        throw new Error("Debe seleccionar un panel solar");
      }

      // Validar que se haya seleccionado un inversor
      if (!inversorSeleccionado || !inversorSeleccionado.inverter_id) {
        throw new Error("Debe seleccionar un inversor");
      }

      // Preparar los datos de la cotización editada con la estructura correcta del backend
      const cotizacionData = {
        client_id: parseInt(clienteSeleccionado.client_id),
        user_id: parseInt(usuarioLogueado.id),
        project_name: nombreProyecto,
        system_type: tipoSistema,
        power_kwp: parseFloat(potenciaKW),
        panel_count: parseInt(cantidadPaneles),
        requires_financing: requiereFinanciamiento ? 1 : 0,
        structure_cost: valorSobreestructura ? parseFloat(valorSobreestructura) : 0,
        profit_percentage: parseFloat(porcentajeUtilidad) / 100,
        iva_profit_percentage: 0.19,
        commercial_management_percentage: parseFloat(porcentajeGestionComercial) / 100,
        administration_percentage: parseFloat(porcentajeAdministracion) / 100,
        contingency_percentage: parseFloat(porcentajeImprevistos) / 100,
        withholding_percentage: parseFloat(porcentajeRetencion) / 100,
        legalization_cost: parseFloat(costoLegalizacion) || 2500000,
        legalization_cost_percentage: parseFloat(porcentajeLegalizacion) / 100 || 0.25,
        products: [
          {
            product_type: "panel",
            product_id: parseInt(panelSeleccionado.panel_id),
            quantity: parseInt(cantidadPaneles),
            unit_price: parseInt(panelSeleccionado.price),
            profit_percentage: 0.25
          },
          {
            product_type: "inverter",
            product_id: parseInt(inversorSeleccionado.inverter_id),
            quantity: parseInt(cantidadInversores),
            unit_price: parseInt(inversorSeleccionado.price),
            profit_percentage: 0.25
          },
          ...(tipoSistema !== "Interconectado" && bateriaSeleccionada ? [{
            product_type: "battery",
            product_id: parseInt(bateriaSeleccionada.battery_id),
            quantity: parseInt(cantidadBaterias),
            unit_price: parseInt(bateriaSeleccionada.price),
            profit_percentage: 0.25
          }] : [])
        ],
        items: [
          {
            description: "Conductor fotovoltaico",
            item_type: "conductor_fotovoltaico",
            quantity: parseInt(potenciaKW) * 12,
            unit: "metro",
            unit_price: 4047,
            profit_percentage: 0.25
          },
          {
            description: "Cableado fotovoltaico",
            item_type: "material_electrico",
            quantity: parseInt(cantidadPaneles),
            unit: "metros",
            unit_price: parseInt(valorMaterialElectrico),
            profit_percentage: 0.25
          },
          {
            description: "Estructura de soporte",
            item_type: "estructura",
            quantity: parseInt(cantidadPaneles),
            unit: "kit",
            unit_price: parseInt(valorEstructura),
            profit_percentage: 0.25
          },
          {
            description: "Mano de obra instalación",
            item_type: "mano_obra",
            quantity: parseInt(cantidadPaneles),
            unit: "servicio",
            unit_price: parseInt(valorManoObra),
            profit_percentage: 0.25
          }
        ]
      };
      // Hacer la petición PUT
      const response = await fetch(getApiUrl(`/api/quotations/${selectedCotizacion.quotation_id}`), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cotizacionData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al editar la cotización");
      }
      // Cerrar modal y limpiar estados
      setIsEditModalOpen(false);
      setSeccionActual(1);
      // Recargar la lista de cotizaciones
      await fetchCotizaciones();
      // Mostrar mensaje de éxito
      setMensajes([{
        contenido: "Cotización editada exitosamente",
        tipo: "success"
      }]);
    } catch (error) {
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
    }
  };

  // Rellenar los campos del formulario de edición con los datos de la cotización seleccionada
  React.useEffect(() => {
    if (isEditModalOpen && selectedCotizacion) {
      setNombreProyecto(selectedCotizacion.project_name || "");
      setPotenciaKW(selectedCotizacion.power?.toString() || "");
      setTipoSistema(selectedCotizacion.system_type || "");
      setTipoRed(selectedCotizacion.client?.network_type || "");
      setCantidadPaneles(selectedCotizacion.numero_paneles?.toString() || "");
      setCantidadInversores(selectedCotizacion.productos?.find(p => p.tipo_producto === "inversor")?.cantidad?.toString() || "");
      setRequiereFinanciamiento(!!selectedCotizacion.requiere_financiamiento);
      setValorTramites(selectedCotizacion.items?.find(i => i.tipo_item === "tramites")?.precio_unitario?.toString() || "");
      setValorManoObra(selectedCotizacion.items?.find(i => i.tipo_item === "mano_obra")?.precio_unitario?.toString() || "");
      setValorEstructura(selectedCotizacion.items?.find(i => i.tipo_item === "estructura")?.precio_unitario?.toString() || "");
      setValorMaterialElectrico(selectedCotizacion.items?.find(i => i.tipo_item === "material_electrico")?.precio_unitario?.toString() || "");
      setValorSobreestructura(selectedCotizacion.items?.find(i => i.tipo_item === "sobreestructura")?.precio_unitario?.toString() || "");
      setPorcentajeGestionComercial(selectedCotizacion.porcentaje_gestion_comercial !== undefined ? (selectedCotizacion.porcentaje_gestion_comercial * 100).toString() : "");
      setPorcentajeImprevistos(selectedCotizacion.porcentaje_imprevistos !== undefined ? (selectedCotizacion.porcentaje_imprevistos * 100).toString() : "");
      setPorcentajeRetencion(selectedCotizacion.porcentaje_retenciones !== undefined ? (selectedCotizacion.porcentaje_retenciones * 100).toString() : "");
      setPorcentajeAdministracion(selectedCotizacion.porcentaje_administracion !== undefined ? (selectedCotizacion.porcentaje_administracion * 100).toString() : "");
      setPorcentajeUtilidad(selectedCotizacion.porcentaje_utilidad !== undefined ? (selectedCotizacion.porcentaje_utilidad * 100).toString() : "");
      setCostoLegalizacion(selectedCotizacion.legalization_cost !== undefined ? selectedCotizacion.legalization_cost.toString() : "2500000");
      setPorcentajeLegalizacion(selectedCotizacion.legalization_cost_percentage !== undefined ? (selectedCotizacion.legalization_cost_percentage * 100).toString() : "25");
      // Panel e inversor seleccionados
      if (paneles.length > 0 && selectedCotizacion.productos) {
        const panel = paneles.find(p => p.id_panel === selectedCotizacion.productos.find(prod => prod.tipo_producto === "panel")?.id_producto);
        setPanelSeleccionado(panel || null);
      }
      if (inversores.length > 0 && selectedCotizacion.productos) {
        const inversor = inversores.find(i => i.id_inversor === selectedCotizacion.productos.find(prod => prod.tipo_producto === "inversor")?.id_producto);
        setInversorSeleccionado(inversor || null);
      }
      // Cliente seleccionado
      if (clientes.length > 0 && selectedCotizacion.client?.id) {
        const cliente = clientes.find(c => c.client_id === selectedCotizacion.client.id);
        setClienteSeleccionado(cliente || null);
      }
      // Productos e items completos
      setProductos(selectedCotizacion.productos || []);
      setItems(selectedCotizacion.items || []);
    }
    // eslint-disable-next-line
  }, [isEditModalOpen, selectedCotizacion, paneles, inversores, clientes]);

  // 3. Renderizar selección de batería solo si aplica
  const renderSeleccionBateria = () => (
    tipoSistema && tipoSistema !== "Interconectado" ? (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Seleccionar Batería</label>
          <select
            value={bateriaSeleccionada?.battery_id || ""}
            onChange={e => {
              const bat = baterias.find(b => b.battery_id === parseInt(e.target.value));
              setBateriaSeleccionada(bat);
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Seleccione una batería</option>
            {baterias.map(bat => (
              <option key={bat.battery_id} value={bat.battery_id}>{bat.brand} - {bat.model} - {bat.capacity}Ah</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cantidad de Baterías</label>
          <input
            type="number"
            min="1"
            value={cantidadBaterias}
            onChange={e => setCantidadBaterias(parseInt(e.target.value) || 1)}
            disabled={!bateriaSeleccionada}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="Cantidad"
          />
        </div>
      </div>
    ) : null
  );

  // 1. Estado global para los estados disponibles
  const [statuses, setStatuses] = useState([]);

  // 2. Cargar los estados al montar el componente principal
  useEffect(() => {
    const token = user?.token;
    if (!token) return;
    fetch(getApiUrl("/api/quotation-statuses"), {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => setStatuses(Array.isArray(data) ? data : []))
      .catch(() => setStatuses([]));
  }, [user?.token]);

  // 3. Función para actualizar el estado de una cotización
  const handleEstadoChange = async (cotizacion, newStatusId) => {
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await cotizacionesService.changeCotizacionStatus(cotizacion.quotation_id, parseInt(newStatusId), token);
      
      if (response.success) {
        setMensajes([{ contenido: "Estado actualizado exitosamente", tipo: "success" }]);
        fetchCotizaciones();
      } else {
        throw new Error(response.message || "Error al actualizar el estado");
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      setMensajes([{ contenido: error.message, tipo: "error" }]);
    }
  };

  // Función para obtener la clase de color según el estado
  function getEstadoColorClass(statusId) {
    switch (parseInt(statusId)) {
      case 1: // Pendiente
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 2: // Enviada
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 3: // Aprobada
        return 'bg-accent-primary/20 text-accent-primary border-accent-primary/30';
      case 4: // Rechazada
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 5: // Cancelada
        return 'bg-text-disabled/20 text-text-secondary border-text-disabled/30';
      case 6: // Vencida
        return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      default:
        return 'bg-text-disabled/20 text-text-secondary border-text-disabled/30';
    }
  }

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
          onClick={() => window.location.reload()}
          className="rounded-lg bg-accent-primary px-6 py-2.5 text-white transition-colors hover:bg-accent-hover"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      {/* Notificaciones flotantes al estilo clientes */}
        {mensajes.map((mensaje, index) => (
        <div
            key={index}
          className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg transition-all duration-300 ${mensaje.tipo === "success"
              ? "bg-green-500"
              : mensaje.tipo === "error"
                ? "bg-red-500"
                : mensaje.tipo === "warning"
                  ? "bg-yellow-500"
                  : "bg-blue-500"
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
      <div className="col-span-1 h-fit w-full xl:col-span-2 2xl:col-span-3">
        {/* Mostrar mensajes */}
        {/* Eliminado el renderizado de <Mensaje> aquí para que no aparezca arriba de la tabla */}
        
        <Card extra={"w-full h-full px-8 pb-8 sm:overflow-x-auto"}>
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                Cotizaciones
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                {activeTab === "sin-financiamiento" ? "Sin Financiamiento" : "Con Financiamiento"}
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-accent-primary px-6 py-2.5 text-white hover:bg-accent-hover transition-colors"
            >
              <MdAdd className="h-5 w-5" />
              Nueva Cotización
            </button>
          </div>

          {/* Pestañas de financiamiento */}
          <div className="mb-6">
            <div className="border-b border-text-disabled/20">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("sin-financiamiento")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "sin-financiamiento"
                      ? "border-accent-primary text-accent-primary"
                      : "border-transparent text-text-secondary hover:text-text-primary hover:border-text-disabled/30"
                  }`}
                >
                  Sin Financiamiento
                  <span className="ml-2 bg-primary-card text-text-primary py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {cotizaciones.filter(c => !(c.requires_financing === true || c.requires_financing === 1)).length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("con-financiamiento")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "con-financiamiento"
                      ? "border-accent-primary text-accent-primary"
                      : "border-transparent text-text-secondary hover:text-text-primary hover:border-text-disabled/30"
                  }`}
                >
                  Con Financiamiento
                  <span className="ml-2 bg-primary-card text-text-primary py-0.5 px-2.5 rounded-full text-xs font-medium">
                    {cotizaciones.filter(c => c.requires_financing === true || c.requires_financing === 1).length}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-4">
            <form className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre del proyecto o ID..."
                  className="w-full rounded-lg border border-text-disabled/30 px-4 py-2 pl-10 focus:border-accent-primary focus:outline-none bg-primary-card text-text-primary"
                />
                <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-disabled" />
              </div>
            </form>
          </div>

          {/* Tabla de cotizaciones */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-text-disabled/20 bg-primary">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Nombre del Proyecto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Tipo de Sistema</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Potencia (kWp)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Valor Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Ciudad</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Usuario</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCotizaciones.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-3 text-center text-sm text-text-secondary">
                      No se encontraron cotizaciones {activeTab === "sin-financiamiento" ? "sin financiamiento" : "con financiamiento"}
                    </td>
                  </tr>
                ) : (
                  filteredCotizaciones.map((cotizacion) => (
                    <tr key={cotizacion.quotation_id} className="border-b border-text-disabled/20 hover:bg-accent-primary/10 transition-colors">
                      <td className="px-4 py-3 text-sm text-text-primary">{cotizacion.quotation_id}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{cotizacion.project_name}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{cotizacion.system_type}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{cotizacion.power_kwp} kWp</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{formatNumber(cotizacion.total_value)}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">{cotizacion.client?.city}</td>
                      <td className="px-4 py-3 text-sm">
                        <select
                          className={`rounded-full px-2 py-1 text-xs font-semibold border focus:outline-none ${getEstadoColorClass(cotizacion.status?.status_id || cotizacion.status_id)}`}
                          value={cotizacion.status?.status_id || cotizacion.status_id || ""}
                          onChange={e => handleEstadoChange(cotizacion, e.target.value)}
                          disabled={(cotizacion.status?.status_id || cotizacion.status_id) === 3}
                        >
                          <option value="">Seleccione</option>
                          {statuses.map(s => (
                            <option key={s.status_id} value={s.status_id}>{s.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary">{cotizacion.user?.name}</td>
                      <td className="px-4 py-3 text-sm text-text-primary">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(cotizacion)}
                            className="rounded-lg bg-blue-500/20 p-2 text-blue-500 hover:bg-blue-500/30 transition-colors"
                            title="Ver detalles"
                          >
                            <MdInfo className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cotizacion)}
                            className={`rounded-lg bg-red-500/20 p-2 text-red-500 hover:bg-red-500/30 transition-colors ${((cotizacion.status?.id || cotizacion.status_id) === 3) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Eliminar"
                            disabled={(cotizacion.status?.id || cotizacion.status_id) === 3}
                          >
                            <MdDelete className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(cotizacion)}
                            className="rounded-lg bg-accent-primary/20 p-2 text-accent-primary hover:bg-accent-primary/30 transition-colors"
                            title="Descargar PDF"
                          >
                            <MdDownload className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {pagination.total > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-text-secondary">
                Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} a {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de {pagination.total} cotizaciones
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="rounded-lg border border-text-disabled/30 px-3 py-2 text-text-secondary hover:bg-text-disabled/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-text-secondary">
                  Página {pagination.current_page} de {pagination.last_page}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="rounded-lg border border-text-disabled/30 px-3 py-2 text-text-secondary hover:bg-text-disabled/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Modal de Creación */}
      <CreateCotizacionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
        }}
        user={user}
        setMensajes={setMensajes}
        fetchCotizaciones={fetchCotizaciones}
      />

      {/* Modal de Edición */}
      <EditCotizacionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSeccionActual(1); // Resetear a la primera sección al cerrar
        }}
        selectedCotizacion={selectedCotizacion}
        paneles={paneles}
        inversores={inversores}
        fetchCotizaciones={fetchCotizaciones}
        setMensajes={setMensajes}
        user={user}
      />

      {/* Modal de Eliminación */}
      <DeleteCotizacionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        selectedCotizacion={selectedCotizacion}
        onConfirm={handleDeleteConfirm}
      />

            </div>
  );
};

export default Cotizaciones;