import React, { useState, useEffect } from "react";
import Modal from "components/modal";
import { getApiUrl } from '../../../config/api';
import { cotizacionesService } from '../../../services/cotizacionesService';

const CreateCotizacionModal = ({
  isOpen,
  onClose,
  user,
  setMensajes,
  fetchCotizaciones
}) => {
  // Estados del formulario
  const [seccionActual, setSeccionActual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);
  
  // Estados de datos
  const [clientes, setClientes] = useState([]);
  const [paneles, setPaneles] = useState([]);
  const [inversores, setInversores] = useState([]);
  const [baterias, setBaterias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [items, setItems] = useState([]);
  
  // Estados del formulario
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [searchCliente, setSearchCliente] = useState("");
  const [showClienteDropdown, setShowClienteDropdown] = useState(false);
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [potenciaKW, setPotenciaKW] = useState("");
  const [tipoSistema, setTipoSistema] = useState("");
  const [tipoRed, setTipoRed] = useState("");
  const [panelSeleccionado, setPanelSeleccionado] = useState(null);
  const [numeroPanelesCalculado, setNumeroPanelesCalculado] = useState(null);
  const [inversorSeleccionado, setInversorSeleccionado] = useState(null);
  const [cantidadInversores, setCantidadInversores] = useState("");
  const [cantidadPaneles, setCantidadPaneles] = useState(0);
  const [bateriaSeleccionada, setBateriaSeleccionada] = useState(null);
  const [cantidadBaterias, setCantidadBaterias] = useState(1);
  
  // Estados de valores
  const [valorTramites, setValorTramites] = useState("7000000");
  const [valorManoObra, setValorManoObra] = useState("200000");
  const [valorEstructura, setValorEstructura] = useState("105000");
  const [valorMaterialElectrico, setValorMaterialElectrico] = useState("180000");
  const [valorSobreestructura, setValorSobreestructura] = useState("0");
  
  // Estados de porcentajes
  const [porcentajeGestionComercial, setPorcentajeGestionComercial] = useState("3");
  const [porcentajeImprevistos, setPorcentajeImprevistos] = useState("2");
  const [porcentajeRetencion, setPorcentajeRetencion] = useState("3.5");
  const [porcentajeAdministracion, setPorcentajeAdministracion] = useState("8");
     const [porcentajeUtilidad, setPorcentajeUtilidad] = useState("5");
  
  // Estado de financiamiento
  const [requiereFinanciamiento, setRequiereFinanciamiento] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      cargarClientes();
      cargarPaneles();
      cargarInversores();
      cargarBaterias();
    }
  }, [isOpen, user?.token]);

  // Cargar clientes
  const cargarClientes = async () => {
    try {
      setLoadingClientes(true);
      // Cargar todos los clientes sin paginación para la búsqueda
      const response = await fetch(getApiUrl("/api/clients?per_page=1000&sort_by=name&sort_order=asc"), {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      const data = await response.json();
      if (data.success) {
        // La API devuelve datos paginados: { data: { data: [...], total: X, per_page: Y } }
        const clientesArray = Array.isArray(data.data?.data) ? data.data.data : [];
        setClientes(clientesArray);
      } else {
        console.error("Error en respuesta de clientes:", data.message);
        setClientes([]);
      }
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setClientes([]);
    } finally {
      setLoadingClientes(false);
    }
  };

  // Cargar paneles
  const cargarPaneles = async () => {
    try {
      setLoadingProductos(true);
      // Cargar todos los paneles sin paginación para la selección
      const response = await fetch(getApiUrl("/api/panels?per_page=1000&sort_by=power&sort_order=asc"), {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      const data = await response.json();
      if (data.success) {
        // La API devuelve datos paginados: { data: { data: [...], total: X, per_page: Y } }
        const panelesArray = Array.isArray(data.data?.data) ? data.data.data : [];
        setPaneles(panelesArray);
      } else {
        console.error("Error en respuesta de paneles:", data.message);
        setPaneles([]);
      }
    } catch (error) {
      console.error("Error cargando paneles:", error);
      setPaneles([]);
    } finally {
      setLoadingProductos(false);
    }
  };

  // Cargar inversores
  const cargarInversores = async () => {
    try {
      // Cargar todos los inversores sin paginación para la selección
      const response = await fetch(getApiUrl("/api/inverters?per_page=1000&sort_by=power&sort_order=asc"), {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        // La API devuelve datos paginados: { data: { data: [...], total: X, per_page: Y } }
        const inversoresArray = Array.isArray(data.data?.data) ? data.data.data : [];
        setInversores(inversoresArray);
      } else {
        console.error("Error en respuesta de inversores:", data.message);
        setInversores([]);
      }
    } catch (error) {
      console.error("Error cargando inversores:", error);
      setInversores([]);
    }
  };

  // Cargar baterías
  const cargarBaterias = async () => {
    try {
      const url = getApiUrl("/api/batteries?per_page=1000&sort_by=capacity&sort_order=asc");
      
      // Cargar todas las baterías sin paginación para la selección
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // La API devuelve datos paginados: { data: [...], total: X, per_page: Y }
      // NO hay campo 'success', solo data directo
      const bateriasArray = Array.isArray(data.data) ? data.data : [];
      
      setBaterias(bateriasArray);
    } catch (error) {
      console.error("Error cargando baterías:", error);
      setBaterias([]);
    }
  };

  // Calcular número de paneles
  useEffect(() => {
    if (potenciaKW && panelSeleccionado) {
      const potenciaTotal = parseFloat(potenciaKW) * 1000; // Convertir a W
      const potenciaPanel = parseFloat(panelSeleccionado.power);
      const numeroPaneles = Math.ceil(potenciaTotal / potenciaPanel);
      setNumeroPanelesCalculado(numeroPaneles);
      setCantidadPaneles(numeroPaneles);
    }
  }, [potenciaKW, panelSeleccionado]);

  // Limpiar selecciones cuando cambie el tipo de sistema
  useEffect(() => {
    if (tipoSistema === "On-Grid") {
      setBateriaSeleccionada(null);
      setCantidadBaterias(1);
    }
  }, [tipoSistema]);

  // Limpiar selecciones cuando cambie el tipo de red
  useEffect(() => {
    setInversorSeleccionado(null);
    setCantidadInversores("");
  }, [tipoRed]);

  // Limpiar selecciones cuando cambie el tipo de sistema
  useEffect(() => {
    setInversorSeleccionado(null);
    setCantidadInversores("");
    setBateriaSeleccionada(null);
    setCantidadBaterias(1);
  }, [tipoSistema]);



  // Función para normalizar strings para comparación
  const normalizeString = (str) => {
    if (!str) return '';
    return str.toString().toLowerCase().trim().replace(/[-\s]/g, '');
  };

  // Filtrar inversores según tipo de sistema y red
  const getInversoresFiltrados = () => {
    if (!tipoSistema || !tipoRed) return inversores;
    
    const filtrados = inversores.filter(inversor => {
      const systemMatch = normalizeString(inversor.system_type) === normalizeString(tipoSistema);
      const gridMatch = normalizeString(inversor.grid_type) === normalizeString(tipoRed);
      
      return systemMatch && gridMatch;
    });
    
    return filtrados;
  };

  // Filtrar baterías según tipo de sistema
  const getBateriasFiltradas = () => {
    // Verificar que baterias sea un array válido
    if (!Array.isArray(baterias)) {
      return [];
    }
    
    // Solo mostrar baterías para sistemas Off-grid e Híbrido
    if (tipoSistema && normalizeString(tipoSistema) === normalizeString("On-grid")) {
      return [];
    }
    
    return baterias;
  };



  // Renderizar selección de cliente
  const renderSeleccionCliente = () => (
    <div>
             <label className="block text-sm font-medium text-text-secondary">
         Cliente
       </label>
      <div className="relative mt-1">
        <input
          type="text"
          value={searchCliente}
          onChange={(e) => {
            setSearchCliente(e.target.value);
            setShowClienteDropdown(true);
            if (!e.target.value) {
              setClienteSeleccionado(null);
            }
          }}
          onFocus={() => setShowClienteDropdown(true)}
          placeholder="Buscar por nombre, NIC o ciudad..."
          className="block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary pr-10"
        />
        {searchCliente && (
          <button
            type="button"
            onClick={() => {
              setSearchCliente("");
              setClienteSeleccionado(null);
              setShowClienteDropdown(false);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
          >
            ✕
          </button>
        )}
        {showClienteDropdown && searchCliente && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-text-disabled/30 bg-primary-card shadow-lg max-h-60 overflow-auto">
            {Array.isArray(clientes) && clientes
              .filter(cliente =>
                cliente.name?.toLowerCase().includes(searchCliente.toLowerCase()) ||
                cliente.nic?.toString().toLowerCase().includes(searchCliente.toLowerCase()) ||
                cliente.city?.toLowerCase().includes(searchCliente.toLowerCase())
              )
              .slice(0, 10) // Limitar a 10 resultados para mejor rendimiento
              .map((cliente) => (
                <div
                  key={cliente.client_id}
                  className="cursor-pointer px-4 py-2 hover:bg-accent-primary/10 transition-colors"
                  onClick={() => {
                    setClienteSeleccionado(cliente);
                    setSearchCliente(cliente.name);
                    setShowClienteDropdown(false);
                  }}
                >
                  <div className="font-medium">{cliente.name}</div>
                  <div className="text-sm text-text-secondary">
                    NIC: {cliente.nic} • {cliente.city} • {cliente.client_type}
                  </div>
                </div>
              ))}
            {Array.isArray(clientes) && clientes.filter(cliente =>
              cliente.name?.toLowerCase().includes(searchCliente.toLowerCase()) ||
              cliente.nic?.toString().toLowerCase().includes(searchCliente.toLowerCase()) ||
              cliente.city?.toLowerCase().includes(searchCliente.toLowerCase())
            ).length === 0 && searchCliente && (
              <div className="px-4 py-2 text-sm text-text-secondary">
                No se encontraron clientes con "{searchCliente}"
              </div>
            )}
            {loadingClientes ? (
              <div className="px-4 py-2 text-sm text-text-secondary">
                Cargando clientes...
              </div>
            ) : !Array.isArray(clientes) || clientes.length === 0 ? (
              <div className="px-4 py-2 text-sm text-text-secondary">
                No hay clientes disponibles
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );

  // Renderizar cliente seleccionado
  const renderClienteSeleccionado = () => {
    if (!clienteSeleccionado) return null;
    
    return (
              <div className="rounded-lg border border-text-disabled/20 bg-primary-card p-4">
                      <h3 className="mb-2 text-md font-semibold text-text-primary">Cliente Seleccionado</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <span className="text-xs text-text-secondary">Nombre:</span>
            <div className="font-medium text-text-primary">{clienteSeleccionado.name}</div>
          </div>
          <div>
            <span className="text-xs text-text-secondary">Ciudad:</span>
            <div className="font-medium text-text-primary">{clienteSeleccionado.city}</div>
          </div>
          {clienteSeleccionado.address && (
            <div>
              <span className="text-xs text-text-secondary">Dirección:</span>
              <div className="font-medium text-text-primary">{clienteSeleccionado.address}</div>
            </div>
          )}
          {clienteSeleccionado.client_type && (
            <div>
              <span className="text-xs text-text-secondary">Tipo de Cliente:</span>
              <div className="font-medium text-text-primary">{clienteSeleccionado.client_type}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Limpiar formulario
  const limpiarFormulario = () => {
    setSeccionActual(1);
    setClienteSeleccionado(null);
    setSearchCliente("");
    setNombreProyecto("");
    setPotenciaKW("");
    setTipoSistema("");
    setTipoRed("");
    setPanelSeleccionado(null);
    setInversorSeleccionado(null);
    setBateriaSeleccionada(null);
    setCantidadPaneles(0);
    setCantidadInversores("");
    setCantidadBaterias(1);
    setProductos([]);
    setItems([]);
    setRequiereFinanciamiento(false);
    setValorSobreestructura("0");
  };

  // Manejar envío del formulario
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!clienteSeleccionado) {
      setMensajes([{ contenido: "Debe seleccionar un cliente", tipo: "error" }]);
      return;
    }

    if (seccionActual === 1) {
      setSeccionActual(2);
      return;
    }

    setLoading(true);
    try {
      // Preparar productos según la documentación actualizada
      // El backend calcula automáticamente todos los valores monetarios
      const productosData = [];
      
      if (panelSeleccionado && cantidadPaneles > 0) {
        productosData.push({
          product_type: "panel",
          product_id: panelSeleccionado.panel_id,
          quantity: cantidadPaneles,
          unit_price: parseFloat(panelSeleccionado.price),
          profit_percentage: parseFloat(porcentajeUtilidad) / 100
        });
      }

      if (inversorSeleccionado && cantidadInversores > 0) {
        productosData.push({
          product_type: "inverter",
          product_id: inversorSeleccionado.inverter_id,
          quantity: parseInt(cantidadInversores),
          unit_price: parseFloat(inversorSeleccionado.price),
          profit_percentage: parseFloat(porcentajeUtilidad) / 100
        });
      }

      if (bateriaSeleccionada && cantidadBaterias > 0) {
        productosData.push({
          product_type: "battery",
          product_id: bateriaSeleccionada.battery_id,
          quantity: cantidadBaterias,
          unit_price: parseFloat(bateriaSeleccionada.price),
          profit_percentage: parseFloat(porcentajeUtilidad) / 100
        });
      }

      // Preparar items adicionales según la documentación
      const itemsData = [];
      
      // Solo agregar items si hay valores válidos
      if (parseFloat(valorTramites) > 0) {
        itemsData.push({
          description: "Trámites y permisos",
          item_type: "legalization",
          quantity: 1,
          unit: "servicio",
          unit_price: parseFloat(valorTramites),
          profit_percentage: parseFloat(porcentajeUtilidad) / 100
        });
      }

      if (parseFloat(valorManoObra) > 0) {
        itemsData.push({
          description: "Mano de obra instalación",
          item_type: "mano_obra",
          quantity: cantidadPaneles || 1,
          unit: "panel",
          unit_price: parseFloat(valorManoObra),
          profit_percentage: parseFloat(porcentajeUtilidad) / 100
        });
      }

      if (parseFloat(valorEstructura) > 0) {
        itemsData.push({
          description: "Estructura de soporte",
          item_type: "estructura",
          quantity: cantidadPaneles || 1,
          unit: "kit",
          unit_price: parseFloat(valorEstructura),
          profit_percentage: parseFloat(porcentajeUtilidad) / 100
        });
      }

      if (parseFloat(valorMaterialElectrico) > 0) {
        itemsData.push({
          description: "Material eléctrico",
          item_type: "material_electrico",
          quantity: cantidadPaneles || 1,
          unit: "metros",
          unit_price: parseFloat(valorMaterialElectrico),
          profit_percentage: parseFloat(porcentajeUtilidad) / 100
        });
      }

      if (parseFloat(valorSobreestructura) > 0) {
        itemsData.push({
          description: "Sobreestructura",
          item_type: "sobreestructura",
          quantity: cantidadPaneles || 1,
          unit: "kit",
          unit_price: parseFloat(valorSobreestructura),
          profit_percentage: parseFloat(porcentajeUtilidad) / 100
        });
      }

      // Preparar datos de la cotización según la documentación actualizada
      // IMPORTANTE: El backend calcula automáticamente todos los valores monetarios
      // (subtotales, ganancias, IVA, totales) basándose en productos, items y porcentajes
      const cotizacionData = {
        // Campos básicos requeridos (en el orden correcto según la documentación)
        client_id: clienteSeleccionado.client_id,
        user_id: user?.id || 1,
        project_name: nombreProyecto,
        system_type: tipoSistema,
        power_kwp: parseFloat(potenciaKW),
        panel_count: panelSeleccionado ? cantidadPaneles : 0,
        requires_financing: requiereFinanciamiento ? 1 : 0, // Convertir a 0/1 para compatibilidad con el backend
        
        // Porcentajes (en formato decimal 0.0-1.0 según la documentación)
        profit_percentage: parseFloat(porcentajeUtilidad) / 100,
        iva_profit_percentage: 0.19, // IVA fijo del 19%
        commercial_management_percentage: parseFloat(porcentajeGestionComercial) / 100,
        administration_percentage: parseFloat(porcentajeAdministracion) / 100,
        contingency_percentage: parseFloat(porcentajeImprevistos) / 100,
        withholding_percentage: parseFloat(porcentajeRetencion) / 100,
        
        // Productos (paneles, inversores, baterías)
        products: productosData,
        
        // Items adicionales (materiales, mano de obra, etc.)
        items: itemsData
      };

      // Logs detallados para debuggear
      console.log('🔍 DEBUG: Valores individuales antes de crear cotizacionData:');
      console.log('  - clienteSeleccionado:', clienteSeleccionado);
      console.log('  - user?.id:', user?.id);
      console.log('  - nombreProyecto:', nombreProyecto);
      console.log('  - tipoSistema:', tipoSistema);
      console.log('  - potenciaKW:', potenciaKW, 'tipo:', typeof potenciaKW);
      console.log('  - panelSeleccionado:', panelSeleccionado);
      console.log('  - cantidadPaneles:', cantidadPaneles, 'tipo:', typeof cantidadPaneles);
      console.log('  - requiereFinanciamiento:', requiereFinanciamiento);
      console.log('  - porcentajeUtilidad:', porcentajeUtilidad);
      console.log('  - productosData:', productosData);
      console.log('  - itemsData:', itemsData);
      
      console.log('📤 Datos de cotización a enviar:', cotizacionData);
      console.log('📋 Estructura del JSON:', {
        campos_basicos: {
          client_id: cotizacionData.client_id,
          user_id: cotizacionData.user_id,
          project_name: cotizacionData.project_name,
          system_type: cotizacionData.system_type,
          power_kwp: cotizacionData.power_kwp,
          panel_count: cotizacionData.panel_count,
          requires_financing: cotizacionData.requires_financing
        },
        porcentajes: {
          profit_percentage: cotizacionData.profit_percentage,
          iva_profit_percentage: cotizacionData.iva_profit_percentage,
          commercial_management_percentage: cotizacionData.commercial_management_percentage,
          administration_percentage: cotizacionData.administration_percentage,
          contingency_percentage: cotizacionData.contingency_percentage,
          withholding_percentage: cotizacionData.withholding_percentage
        },
        productos: cotizacionData.products,
        items: cotizacionData.items
      });
      
      // Validar datos antes de enviar
      console.log('🔍 DEBUG: Antes de validar con cotizacionesService');
      console.log('  - cotizacionData completo:', JSON.stringify(cotizacionData, null, 2));
      console.log('  - Tipos de datos:');
      console.log('    - client_id:', typeof cotizacionData.client_id, 'valor:', cotizacionData.client_id);
      console.log('    - user_id:', typeof cotizacionData.user_id, 'valor:', cotizacionData.user_id);
      console.log('    - project_name:', typeof cotizacionData.project_name, 'valor:', cotizacionData.project_name);
      console.log('    - system_type:', typeof cotizacionData.system_type, 'valor:', cotizacionData.system_type);
      console.log('    - power_kwp:', typeof cotizacionData.power_kwp, 'valor:', cotizacionData.power_kwp);
      console.log('    - panel_count:', typeof cotizacionData.panel_count, 'valor:', cotizacionData.panel_count);
      console.log('    - requires_financing:', typeof cotizacionData.requires_financing, 'valor:', cotizacionData.requires_financing);
      console.log('    - products.length:', cotizacionData.products?.length);
      console.log('    - items.length:', cotizacionData.items?.length);
      
      const validation = cotizacionesService.validateCotizacionData(cotizacionData);
      console.log('🔍 DEBUG: Resultado de validación:', validation);
      
      if (!validation.isValid) {
        console.error('❌ Errores de validación:', validation.errors);
        console.error('❌ Datos que fallaron la validación:', cotizacionData);
        throw new Error(validation.errors.join(', '));
      }

      console.log('🔍 DEBUG: Antes de llamar a createCotizacion');
      console.log('  - token disponible:', !!user?.token);
      
      const response = await cotizacionesService.createCotizacion(cotizacionData, user?.token);
      console.log('🔍 DEBUG: Respuesta del servicio:', response);

      if (!response.success) {
        throw new Error(response.message || "Error al crear la cotización");
      }

      setMensajes([{ contenido: "Cotización creada exitosamente", tipo: "success" }]);
      onClose();
      limpiarFormulario();
      fetchCotizaciones();
    } catch (error) {
      console.error("Error al crear cotización:", error);
      setMensajes([{ contenido: error.message, tipo: "error" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        limpiarFormulario();
      }}
      title="Nueva Cotización"
    >
      <div className="p-4">
        <form className="space-y-4" onSubmit={handleCreateSubmit}>
          {seccionActual === 1 ? (
            <>
              {/* Sección 1: Información Básica */}
              <div className="space-y-4">
                                 <h3 className="text-lg font-semibold text-text-primary">Información Básica</h3>
                 
                 
                
                {/* Selección de Cliente */}
                {renderSeleccionCliente()}

                {/* Cliente Seleccionado */}
                {renderClienteSeleccionado()}

                {/* Nombre del Proyecto */}
                <div>
                                     <label className="block text-sm font-medium text-text-secondary">
                     Nombre del Proyecto
                   </label>
                                     <input
                     type="text"
                     value={nombreProyecto}
                     onChange={(e) => setNombreProyecto(e.target.value)}
                     required
                     className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                   />
                </div>

                {/* Potencia */}
                                 <div>
                   <label className="block text-sm font-medium text-text-secondary">
                     Potencia (kW)
                   </label>
                   <input
                     type="number"
                     value={potenciaKW}
                     onChange={(e) => setPotenciaKW(e.target.value)}
                     step="0.1"
                     min="0"
                     required
                     className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                   />
                 </div>

                {/* Tipo de Sistema */}
                                 <div>
                   <label className="block text-sm font-medium text-text-secondary">
                     Tipo de Sistema
                   </label>
                   <select
                     value={tipoSistema}
                     onChange={(e) => setTipoSistema(e.target.value)}
                     required
                     className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                   >
                    <option value="">Seleccione el tipo de sistema</option>
                                         <option value="On-grid">On-grid</option>
                     <option value="Off-grid">Off-grid</option>
                     <option value="Híbrido">Híbrido</option>
                     <option value="Interconectado">Interconectado</option>
                  </select>
                </div>

                                 {/* Tipo de Red */}
                 <div>
                   <label className="block text-sm font-medium text-text-secondary">
                     Tipo de Red
                   </label>
                   <select
                     value={tipoRed}
                     onChange={(e) => setTipoRed(e.target.value)}
                     required
                     className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                   >
                     <option value="">Seleccione el tipo de red</option>
                     <option value="Monofásico 110V">Monofásico 110V</option>
                     <option value="Bifásico 220V">Bifásico 220V</option>
                     <option value="Trifásico 220V">Trifásico 220V</option>
                     <option value="Trifásico 440V">Trifásico 440V</option>
                   </select>
                 </div>

                                 {/* Selección de Panel */}
                 <div>
                   <label className="block text-sm font-medium text-text-secondary">
                     Panel Solar
                   </label>
                   <select
                     value={panelSeleccionado?.panel_id || ""}
                     onChange={(e) => {
                       const panel = paneles.find(p => p.panel_id === parseInt(e.target.value));
                       setPanelSeleccionado(panel);
                     }}
                     required
                     disabled={loadingProductos}
                     className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary disabled:bg-text-disabled/20"
                   >
                     <option value="">Seleccione un panel</option>
                     {loadingProductos ? (
                       <option value="" disabled>Cargando paneles...</option>
                     ) : Array.isArray(paneles) && paneles.length > 0 ? (
                       paneles.map((panel) => (
                         <option key={panel.panel_id} value={panel.panel_id}>
                           {panel.brand} - {panel.model} - {panel.power}W
                         </option>
                       ))
                     ) : (
                       <option value="" disabled>No hay paneles disponibles</option>
                     )}
                   </select>
                   {loadingProductos ? (
                     <p className="mt-1 text-sm text-text-secondary">Cargando paneles...</p>
                   ) : paneles.length === 0 ? (
                     <p className="mt-1 text-sm text-red-500">No hay paneles disponibles</p>
                   ) : numeroPanelesCalculado ? (
                     <p className="mt-1 text-sm text-text-secondary">
                       Número de paneles calculado: {numeroPanelesCalculado}
                     </p>
                   ) : (
                     <p className="mt-1 text-sm text-text-secondary">
                       {paneles.length} panel(es) disponible(s)
                     </p>
                   )}
                 </div>

                {/* Cantidad de Paneles */}
                                 <div>
                   <label className="block text-sm font-medium text-text-secondary">
                     Cantidad de Paneles
                   </label>
                   <input
                     type="number"
                     value={cantidadPaneles}
                     onChange={(e) => setCantidadPaneles(parseInt(e.target.value) || 0)}
                     min="1"
                     required
                     className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                   />
                 </div>

                                 {/* Selección de Inversor */}
                 <div>
                   <label className="block text-sm font-medium text-text-secondary">
                     Inversor
                   </label>
                   <select
                     value={inversorSeleccionado?.inverter_id || ""}
                     onChange={(e) => {
                       const inversor = inversores.find(i => i.inverter_id === parseInt(e.target.value));
                       setInversorSeleccionado(inversor);
                     }}
                     required
                     disabled={!tipoSistema || !tipoRed}
                     className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary disabled:bg-text-disabled/20"
                   >
                     <option value="">Seleccione un inversor</option>
                     {!tipoSistema || !tipoRed ? (
                       <option value="" disabled>Primero seleccione tipo de sistema y red</option>
                     ) : loadingProductos ? (
                       <option value="" disabled>Cargando inversores...</option>
                     ) : getInversoresFiltrados().length > 0 ? (
                       getInversoresFiltrados().map((inversor) => (
                         <option key={inversor.inverter_id} value={inversor.inverter_id}>
                           {inversor.brand} - {inversor.model} - {inversor.power}W
                         </option>
                       ))
                     ) : (
                       <option value="" disabled>No hay inversores disponibles</option>
                     )}
                   </select>
                   {!tipoSistema || !tipoRed ? (
                     <p className="mt-1 text-sm text-text-secondary">
                       Seleccione primero el tipo de sistema y red para ver inversores disponibles
                     </p>
                   ) : loadingProductos ? (
                     <p className="mt-1 text-sm text-text-secondary">Cargando inversores...</p>
                   ) : getInversoresFiltrados().length === 0 ? (
                     <p className="mt-1 text-sm text-red-500">
                       No hay inversores disponibles para {tipoSistema} - {tipoRed}
                     </p>
                   ) : (
                     <p className="mt-1 text-sm text-text-secondary">
                       {getInversoresFiltrados().length} inversor(es) disponible(s)
                     </p>
                   )}
                 </div>

                {/* Cantidad de Inversores */}
                                 <div>
                   <label className="block text-sm font-medium text-text-secondary">
                     Cantidad de Inversores
                   </label>
                   <input
                     type="number"
                     value={cantidadInversores}
                     onChange={(e) => setCantidadInversores(e.target.value)}
                     min="1"
                     required
                     className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                   />
                 </div>

                                 {/* Selección de Batería (opcional) */}
                 <div>
                   <label className="block text-sm font-medium text-text-secondary">
                     Batería (Opcional)
                   </label>
                                       <select
                      value={bateriaSeleccionada?.battery_id || ""}
                      onChange={(e) => {
                        const bateria = baterias.find(b => b.battery_id === parseInt(e.target.value));
                        setBateriaSeleccionada(bateria);
                      }}
                      disabled={!tipoSistema}
                      className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary disabled:bg-text-disabled/20"
                    >
                     <option value="">Seleccione una batería (opcional)</option>
                                           {!tipoSistema ? (
                        <option value="" disabled>Primero seleccione tipo de sistema</option>
                      ) : loadingProductos ? (
                        <option value="" disabled>Cargando baterías...</option>
                                             ) : (() => {
                         const bateriasDisponibles = getBateriasFiltradas();
                         
                         if (!Array.isArray(bateriasDisponibles) || bateriasDisponibles.length === 0) {
                           return <option value="" disabled>No hay baterías disponibles</option>;
                         }
                         
                         return bateriasDisponibles.map((bateria) => (
                           <option key={bateria.battery_id} value={bateria.battery_id}>
                             {bateria.brand} - {bateria.model} - {bateria.capacity}Ah - {bateria.voltage}V
                           </option>
                         ));
                       })()}
                   </select>
                                                            {!tipoSistema ? (
                       <p className="mt-1 text-sm text-text-secondary">
                         Seleccione primero el tipo de sistema
                       </p>
                     ) : tipoSistema === "On-grid" ? (
                       <p className="mt-1 text-sm text-text-secondary">
                         Los sistemas On-grid no requieren baterías
                       </p>
                     ) : loadingProductos ? (
                       <p className="mt-1 text-sm text-text-secondary">Cargando baterías...</p>
                                           ) : (() => {
                       const bateriasDisponibles = getBateriasFiltradas();
                       
                       if (!Array.isArray(bateriasDisponibles) || bateriasDisponibles.length === 0) {
                         return (
                           <p className="mt-1 text-sm text-red-500">
                             No hay baterías disponibles
                           </p>
                         );
                       }
                       
                       return (
                          <p className="mt-1 text-sm text-text-secondary">
                            {bateriasDisponibles.length} batería(s) disponible(s) para sistemas Off-Grid e Híbrido
                          </p>
                        );
                     })()}
                 </div>

                {/* Cantidad de Baterías */}
                {bateriaSeleccionada && (
                                     <div>
                     <label className="block text-sm font-medium text-text-secondary">
                       Cantidad de Baterías
                     </label>
                     <input
                       type="number"
                       value={cantidadBaterias}
                       onChange={(e) => setCantidadBaterias(parseInt(e.target.value) || 1)}
                       min="1"
                       className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                     />
                   </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                                 <button
                   type="submit"
                   className="rounded-lg bg-accent-primary px-6 py-2.5 text-white hover:bg-accent-hover transition-colors"
                 >
                   Continuar
                 </button>
              </div>
            </>
          ) : (
            <>
              {/* Sección 2: Valores y Porcentajes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text-primary">Valores y Porcentajes</h3>
                
                {/* Valores */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                     <label className="block text-sm font-medium text-text-secondary">
                       Valor Trámites
                     </label>
                     <input
                       type="number"
                       value={valorTramites}
                       onChange={(e) => setValorTramites(e.target.value)}
                       className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                     />
                   </div>
                                     <div>
                     <label className="block text-sm font-medium text-text-secondary">
                       Valor Mano de Obra
                     </label>
                     <input
                       type="number"
                       value={valorManoObra}
                       onChange={(e) => setValorManoObra(e.target.value)}
                       className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                     />
                   </div>
                                     <div>
                     <label className="block text-sm font-medium text-text-secondary">
                       Valor Estructura
                     </label>
                     <input
                       type="number"
                       value={valorEstructura}
                       onChange={(e) => setValorEstructura(e.target.value)}
                       className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                     />
                   </div>
                                     <div>
                     <label className="block text-sm font-medium text-text-secondary">
                       Valor Material Eléctrico
                     </label>
                     <input
                       type="number"
                       value={valorMaterialElectrico}
                       onChange={(e) => setValorMaterialElectrico(e.target.value)}
                       className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                     />
                   </div>
                                     <div>
                     <label className="block text-sm font-medium text-text-secondary">
                       Valor Sobreestructura
                     </label>
                     <input
                       type="number"
                       value={valorSobreestructura}
                       onChange={(e) => setValorSobreestructura(e.target.value)}
                       className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                     />
                   </div>
                </div>

                {/* Porcentajes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <div>
                     <label className="block text-sm font-medium text-text-secondary">
                       % Gestión Comercial
                     </label>
                     <input
                       type="number"
                       step="0.1"
                       value={porcentajeGestionComercial}
                       onChange={(e) => setPorcentajeGestionComercial(e.target.value)}
                       className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                     />
                   </div>
                                     <div>
                     <label className="block text-sm font-medium text-text-secondary">
                       % Imprevistos
                     </label>
                     <input
                       type="number"
                       step="0.1"
                       value={porcentajeImprevistos}
                       onChange={(e) => setPorcentajeImprevistos(e.target.value)}
                       className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                     />
                   </div>
                                     <div>
                     <label className="block text-sm font-medium text-text-secondary">
                       % Retención
                     </label>
                     <input
                       type="number"
                       step="0.1"
                       value={porcentajeRetencion}
                       onChange={(e) => setPorcentajeRetencion(e.target.value)}
                       className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                     />
                   </div>
                                     <div>
                     <label className="block text-sm font-medium text-text-secondary">
                       % Administración
                     </label>
                     <input
                       type="number"
                       step="0.1"
                       value={porcentajeAdministracion}
                       onChange={(e) => setPorcentajeAdministracion(e.target.value)}
                       className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                     />
                   </div>
                                     <div>
                     <label className="block text-sm font-medium text-text-secondary">
                       % Utilidad
                     </label>
                     <input
                       type="number"
                       step="0.1"
                       value={porcentajeUtilidad}
                       onChange={(e) => setPorcentajeUtilidad(e.target.value)}
                       className="mt-1 block w-full rounded-md border border-text-disabled/30 px-3 py-2 bg-primary-card text-text-primary"
                     />
                   </div>
                                     
                </div>

                {/* Financiamiento */}
                <div className="mt-6">
                  <div className="flex items-center">
                                         <input
                       type="checkbox"
                       id="requiereFinanciamiento"
                       checked={requiereFinanciamiento}
                       onChange={(e) => setRequiereFinanciamiento(e.target.checked)}
                       disabled={!potenciaKW || parseFloat(potenciaKW) <= 47}
                       className="h-4 w-4 rounded border-text-disabled/30 text-accent-primary disabled:opacity-50"
                     />
                    <label htmlFor="requiereFinanciamiento" className="ml-2 block text-sm text-text-secondary">
                      Requiere Financiamiento
                    </label>
                  </div>
                  {potenciaKW && parseFloat(potenciaKW) <= 47 && (
                    <p className="mt-1 text-sm text-text-secondary">
                      El financiamiento solo está disponible para proyectos con potencia mayor a 47 kW
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setSeccionActual(1)}
                  className="rounded-lg border border-text-disabled/30 px-6 py-2.5 text-text-secondary hover:bg-text-disabled/20 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-accent-primary px-6 py-2.5 text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
                >
                  {loading ? "Guardando..." : "Guardar Cotización"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default CreateCotizacionModal;
