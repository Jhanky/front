import React, { useState, useEffect } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdDownload, MdSearch, MdInfo } from "react-icons/md";
import Modal from "components/modal";
import { useAuth } from "context/AuthContext";
import Mensaje from "components/mensaje";
import Loading from "components/loading";
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getApiUrl } from '../../../config/api';

// Nuevo componente para el modal de edición
function EditCotizacionModal({
  isOpen,
  onClose,
  selectedCotizacion,
  paneles,
  inversores,
  fetchCotizaciones,
  setMensajes
}) {
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [statusId, setStatusId] = useState("");
  const [panelProduct, setPanelProduct] = useState({ product_id: "", quantity: "" });
  const [inverterProduct, setInverterProduct] = useState({ product_id: "", quantity: "" });
  const [batteryProduct, setBatteryProduct] = useState({ product_id: "", quantity: "" });
  const [baterias, setBaterias] = useState([]);

  // Utilidad para mapear tipos de producto de forma robusta
  function getProductByType(products, type) {
    if (!Array.isArray(products)) return null;
    if (type === "panel") {
      // Buscar por type: 'panel', 'Policristalino', 'Monocristalino', etc.
      return products.find(p => {
        const t = (p.type || p.product_type || "").toString().toLowerCase();
        return ["panel", "policristalino", "monocristalino"].includes(t);
      });
    }
    if (type === "inverter") {
      return products.find(p => ((p.type || p.product_type || "").toString().toLowerCase() === "inverter"));
    }
    if (type === "battery") {
      return products.find(p => ((p.type || p.product_type || "").toString().toLowerCase() === "battery"));
    }
    return null;
  }

  useEffect(() => {
    if (isOpen && selectedCotizacion) {
      setLoading(true);
      Promise.all([
        fetch("http://localhost:3000/api/quotation-statuses").then(res => res.json()),
        fetch(`http://localhost:3000/api/quotations/${selectedCotizacion.id}`).then(res => res.json()),
        fetch("http://localhost:3000/api/batteries").then(res => res.json()).then(data => data.batteries || [])
      ]).then(([statusesData, cotizacionData, bateriasData]) => {
        setStatuses(Array.isArray(statusesData) ? statusesData : []);
        setProjectName(cotizacionData.project_name || "");
        setStatusId(cotizacionData.status_id ? cotizacionData.status_id.toString() : "");
        // Panel
        const panel = getProductByType(cotizacionData.products, "panel");
        setPanelProduct({
          product_id: panel ? (panel.id || panel.product_id || "").toString() : "",
          quantity: panel && panel.quantity ? panel.quantity.toString() : ""
        });
        // Inversor
        const inverter = getProductByType(cotizacionData.products, "inverter");
        setInverterProduct({
          product_id: inverter ? (inverter.id || inverter.product_id || "").toString() : "",
          quantity: inverter && inverter.quantity ? inverter.quantity.toString() : ""
        });
        // Batería
        const battery = getProductByType(cotizacionData.products, "battery");
        setBatteryProduct({
          product_id: battery ? (battery.id || battery.product_id || "").toString() : "",
          quantity: battery && battery.quantity ? battery.quantity.toString() : ""
        });
        setBaterias(bateriasData);
      }).finally(() => setLoading(false));
    }
  }, [isOpen, selectedCotizacion]);

  // Guardar cambios
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const products = [];
      if (panelProduct.product_id && panelProduct.quantity) {
        const panel = paneles.find(p => p.panel_id === parseInt(panelProduct.product_id));
        products.push({
          product_type: "panel",
          product_id: parseInt(panelProduct.product_id),
          quantity: parseInt(panelProduct.quantity),
          unit_price: panel ? parseFloat(panel.price) : 0,
          profit_percentage: 0.25
        });
      }
      if (inverterProduct.product_id && inverterProduct.quantity) {
        const inverter = inversores.find(i => i.inverter_id === parseInt(inverterProduct.product_id));
        products.push({
          product_type: "inverter",
          product_id: parseInt(inverterProduct.product_id),
          quantity: parseInt(inverterProduct.quantity),
          unit_price: inverter ? parseFloat(inverter.price) : 0,
          profit_percentage: 0.25
        });
      }
      if (batteryProduct.product_id && batteryProduct.quantity) {
        const battery = baterias.find(b => b.battery_id === parseInt(batteryProduct.product_id));
        products.push({
          product_type: "battery",
          product_id: parseInt(batteryProduct.product_id),
          quantity: parseInt(batteryProduct.quantity),
          unit_price: battery ? parseFloat(battery.price) : 0,
          profit_percentage: 0.25
        });
      }
      const body = {
        project_name: projectName,
        status_id: parseInt(statusId),
        panel_count: panelProduct.quantity ? parseInt(panelProduct.quantity) : 0,
        products
      };
      const res = await fetch(`http://localhost:3000/api/quotations/${selectedCotizacion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Error al guardar cambios");
      setMensajes([{ contenido: "Cotización editada exitosamente", tipo: "success" }]);
      onClose();
      fetchCotizaciones();
    } catch (e) {
      setMensajes([{ contenido: e.message, tipo: "error" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Cotización">
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <form className="space-y-6" onSubmit={handleSave}>
            <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Proyecto</label>
                <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" value={projectName} onChange={e => setProjectName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <select className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" value={statusId} onChange={e => setStatusId(e.target.value)} required>
                  <option value="">Seleccione un estado</option>
                  {Array.isArray(statuses) && statuses.map(s => (
                    <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
                  ))}
                </select>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mt-6">Productos</h3>
            <div className="space-y-4">
              {/* Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end bg-gray-50 rounded-lg p-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Panel</label>
                  <select className="w-full rounded-md border border-gray-300 px-3 py-2" value={panelProduct.product_id} onChange={e => setPanelProduct(p => ({ ...p, product_id: e.target.value }))} required>
                    <option value="">Seleccione un panel</option>
                    {paneles.map(panel => (
                      <option key={panel.panel_id} value={panel.panel_id}>{panel.brand} - {panel.model} - {panel.power}W</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Cantidad de Paneles</label>
                  <input type="number" className="w-full rounded-md border border-gray-300 px-3 py-2" value={panelProduct.quantity} onChange={e => setPanelProduct(p => ({ ...p, quantity: e.target.value }))} min="1" required />
                </div>
              </div>
              {/* Inversor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end bg-gray-50 rounded-lg p-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Inversor</label>
                  <select className="w-full rounded-md border border-gray-300 px-3 py-2" value={inverterProduct.product_id} onChange={e => setInverterProduct(p => ({ ...p, product_id: e.target.value }))} required>
                    <option value="">Seleccione un inversor</option>
                    {inversores.map(inv => (
                      <option key={inv.inverter_id} value={inv.inverter_id}>{inv.brand} - {inv.model} - {inv.power}kW</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Cantidad de Inversores</label>
                  <input type="number" className="w-full rounded-md border border-gray-300 px-3 py-2" value={inverterProduct.quantity} onChange={e => setInverterProduct(p => ({ ...p, quantity: e.target.value }))} min="1" required />
                </div>
              </div>
              {/* Batería */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end bg-gray-50 rounded-lg p-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">Batería</label>
                  <select className="w-full rounded-md border border-gray-300 px-3 py-2" value={batteryProduct.product_id} onChange={e => setBatteryProduct(p => ({ ...p, product_id: e.target.value }))}>
                    <option value="">Seleccione una batería</option>
                    {baterias.map(bat => (
                      <option key={bat.battery_id} value={bat.battery_id}>{bat.brand} - {bat.model} - {bat.capacity}Ah</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">Cantidad de Baterías</label>
                  <input type="number" className="w-full rounded-md border border-gray-300 px-3 py-2" value={batteryProduct.quantity} onChange={e => setBatteryProduct(p => ({ ...p, quantity: e.target.value }))} min="1" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={loading}>Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

const Cotizaciones = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCotizacion, setSelectedCotizacion] = useState(null);
  const [cotizacionDetalles, setCotizacionDetalles] = useState(null);
  const [search, setSearch] = useState("");
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
  const [requiereFinanciamiento, setRequiereFinanciamiento] = useState(false);
  const [nombreProyecto, setNombreProyecto] = useState("");
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  // Estados para carga de detalles
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  // 1. Agregar estados para batería
  const [bateriaSeleccionada, setBateriaSeleccionada] = useState(null);
  const [cantidadBaterias, setCantidadBaterias] = useState(1);
  const [baterias, setBaterias] = useState([]);

  // 2. Cargar baterías si el sistema no es Interconectado
  useEffect(() => {
    if (tipoSistema && tipoSistema !== "Interconectado") {
      fetch("http://localhost:3000/api/batteries", {
        headers: { "Authorization": `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(data => setBaterias(data.batteries || []))
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

      const response = await fetch("http://localhost:3000/api/users/me/id", {
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
      console.log("Datos del usuario logueado:", data);
      
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

      const response = await fetch(getApiUrl(`/api/quotations?page=${page}`), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("No se encontró el servicio de cotizaciones. Por favor, verifique que el servidor esté funcionando.");
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Adaptar a la nueva estructura con paginación
      setCotizaciones(Array.isArray(data.data) ? data.data : []);
      
      // Si necesitas manejar paginación, puedes agregar estos estados:
      // setCurrentPage(data.current_page);
      // setTotalPages(data.last_page);
      // setTotal(data.total);
      
      setError(null);
    } catch (error) {
      setError(error.message);
      setCotizaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar cotizaciones al montar el componente
  useEffect(() => {
    fetchCotizaciones();
  }, []);

  // Filtrar cotizaciones basado en la búsqueda
  const filteredCotizaciones = cotizaciones.filter(cotizacion => {
    const searchLower = search.toLowerCase();
    return (
      cotizacion.project_name?.toLowerCase().includes(searchLower) ||
      cotizacion.client?.name?.toLowerCase().includes(searchLower) ||
      cotizacion.client?.city?.toLowerCase().includes(searchLower) ||
      cotizacion.user?.name?.toLowerCase().includes(searchLower) ||
      cotizacion.system_type?.toLowerCase().includes(searchLower)
    );
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

      const response = await fetch(getApiUrl(`/api/quotations/${selectedCotizacion.quotation_id}`), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la cotización");
      }

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
      const response = await fetch(`http://localhost:3000/api/quotations/${cotizacion.id}/pdfkit`, {
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

      console.log("JSON que se está enviando:", JSON.stringify(cotizacionData, null, 2));
      
      const response = await fetch("http://localhost:3000/api/quotations", {
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
      console.log("Respuesta del servidor:", data);
      
      // Cerrar modal y limpiar formulario
      setIsCreateModalOpen(false);
      
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
      const response = await fetch("http://localhost:3000/api/clients", {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar los clientes");
      }

      const data = await response.json();
      setClientes(data);
    } catch (error) {
      setError(error.message);
      setClientes([]);
    }
  };

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, []);

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
      const response = await fetch("http://localhost:3000/api/panels", {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar los paneles");
      }

      const data = await response.json();
      setPaneles(data);
    } catch (error) {
      setError(error.message);
    }
  };

  // Cargar paneles al montar el componente
  useEffect(() => {
    cargarPaneles();
  }, []);

  // Función para cargar inversores
  const cargarInversores = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/inverters", {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error("Error al cargar los inversores");
      }

      const data = await response.json();
      setInversores(data);
    } catch (error) {
      setError(error.message);
    }
  };

  // Cargar inversores al montar el componente
  useEffect(() => {
    cargarInversores();
  }, []);

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
    if (!tipoRed) return false;
    if (!potenciaKW) return false;
    
    const potenciaMaxima = parseFloat(potenciaKW) * 1.3;
    return inversor.grid_type === tipoRed && inversor.power <= potenciaMaxima;
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
              {inversor.brand} - {inversor.model} - {inversor.power}kW
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
    try {
      setLoadingDetalles(true);
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(getApiUrl(`/api/quotations/${cotizacion.quotation_id}`), {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al obtener los detalles de la cotización");
      }

      const data = await response.json();
      setCotizacionDetalles(data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error("Error al obtener detalles:", error);
      setError(error.message);
      setMensajes([{
        contenido: error.message,
        tipo: "error"
      }]);
    } finally {
      setLoadingDetalles(false);
    }
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
    fetch("http://localhost:3000/api/quotation-statuses", {
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
      const body = { status_id: parseInt(newStatusId) };
      const token = user?.token;
      console.log('PUT /api/quotations/' + cotizacion.id, body, token);
      const res = await fetch(getApiUrl(`/api/quotations/${cotizacion.quotation_id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error("Error al actualizar el estado");
      setMensajes([{ contenido: "Estado actualizado exitosamente", tipo: "success" }]);
      fetchCotizaciones();
    } catch (e) {
      setMensajes([{ contenido: e.message, tipo: "error" }]);
    }
  };

  // Función para obtener la clase de color según el estado
  function getEstadoColorClass(statusId) {
    switch (parseInt(statusId)) {
      case 1: // Pendiente
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2: // Enviada
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 3: // Aprobada
        return 'bg-green-100 text-green-800 border-green-300';
      case 4: // Rechazada
        return 'bg-red-100 text-red-800 border-red-300';
      case 5: // Cancelada
        return 'bg-gray-200 text-gray-700 border-gray-300';
      case 6: // Vencida
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-white transition-colors hover:bg-blue-700"
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
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Cotizaciones
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 text-white hover:bg-green-700"
            >
              <MdAdd className="h-5 w-5" />
              Nueva Cotización
            </button>
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:border-green-500 focus:outline-none"
                />
                <MdSearch className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Tabla de cotizaciones */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Nombre del Proyecto</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Tipo de Sistema</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Potencia (kWp)</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Valor Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Ciudad</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Usuario</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCotizaciones.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-3 text-center text-sm text-gray-500">
                      No se encontraron cotizaciones
                    </td>
                  </tr>
                ) : (
                  filteredCotizaciones.map((cotizacion) => (
                    <tr key={cotizacion.quotation_id} className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-800">{cotizacion.quotation_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{cotizacion.project_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{cotizacion.system_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{cotizacion.power_kwp} kWp</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{formatNumber(cotizacion.total_value)}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{cotizacion.client?.city}</td>
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
                      <td className="px-4 py-3 text-sm text-gray-800">{cotizacion.user?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewDetails(cotizacion)}
                            className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                            title="Ver detalles"
                          >
                            <MdInfo className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(cotizacion)}
                            className={`rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200 ${((cotizacion.status?.id || cotizacion.status_id) === 3) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Eliminar"
                            disabled={(cotizacion.status?.id || cotizacion.status_id) === 3}
                          >
                            <MdDelete className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(cotizacion)}
                            className="rounded-lg bg-green-100 p-2 text-green-600 hover:bg-green-200"
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
        </Card>
      </div>

      {/* Modal de Creación */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSeccionActual(1); // Resetear a la primera sección al cerrar
        }}
        title="Nueva Cotización"
      >
        <div className="p-4">
          <form className="space-y-4" onSubmit={handleCreateSubmit}>
            {seccionActual === 1 ? (
              <>
                {/* Información del Cliente y Proyecto (solo lectura, solo en edición) */}
                {isEditModalOpen && (
                  <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="mb-2 text-md font-semibold text-gray-800">Información del Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500">Nombre:</span>
                        <div className="font-medium text-gray-700">{clienteSeleccionado?.nombre || ""}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Ciudad:</span>
                        <div className="font-medium text-gray-700">{clienteSeleccionado?.ciudad || ""}</div>
                      </div>
                      {clienteSeleccionado?.direccion && (
                        <div>
                          <span className="text-xs text-gray-500">Dirección:</span>
                          <div className="font-medium text-gray-700">{clienteSeleccionado.direccion}</div>
                        </div>
                      )}
                      {clienteSeleccionado?.tipo_cliente && (
                        <div>
                          <span className="text-xs text-gray-500">Tipo de Cliente:</span>
                          <div className="font-medium text-gray-700">{clienteSeleccionado.tipo_cliente}</div>
                        </div>
                      )}
                    </div>
                    <h3 className="mb-2 mt-4 text-md font-semibold text-gray-800">Información del Proyecto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500">Nombre del Proyecto:</span>
                        <div className="font-medium text-gray-700">{nombreProyecto}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Potencia (kW):</span>
                        <div className="font-medium text-gray-700">{potenciaKW}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Tipo de Sistema:</span>
                        <div className="font-medium text-gray-700">{tipoSistema}</div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Tipo de Red:</span>
                        <div className="font-medium text-gray-700">{tipoRed}</div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Sección 1: Información Básica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
                  
                  {/* Selección de Cliente */}
                  {renderSeleccionCliente()}

                  {/* Cliente Seleccionado */}
                  {renderClienteSeleccionado()}

                  {/* Nombre del Proyecto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre del Proyecto
                    </label>
                    <input
                      type="text"
                      name="nombre_proyecto"
                      value={nombreProyecto}
                      onChange={(e) => setNombreProyecto(e.target.value)}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  {/* Potencia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Potencia (kW)
                    </label>
                    <input
                      type="number"
                      name="potencia_kwp"
                      value={potenciaKW}
                      onChange={(e) => {
                        console.log("Valor de potencia ingresado:", e.target.value);
                        setPotenciaKW(e.target.value);
                      }}
                      step="0.1"
                      min="0"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  {/* Tipo de Sistema */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Sistema
                    </label>
                    <select
                      name="tipo_sistema"
                      value={tipoSistema}
                      onChange={(e) => {
                        console.log("Valor de tipo de sistema seleccionado:", e.target.value);
                        setTipoSistema(e.target.value);
                        setInversorSeleccionado(null);
                      }}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option value="">Seleccione el tipo de sistema</option>
                      <option value="Interconectado">Interconectado - Sistema conectado a la red eléctrica</option>
                      <option value="Aislado">Aislado - Sistema independiente de la red eléctrica</option>
                      <option value="Híbrido">Híbrido - Sistema que combina características de interconectado y aislado</option>
                    </select>
                  </div>

                  {/* Tipo de Red */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Red
                    </label>
                    <select
                      name="tipo_red"
                      value={tipoRed}
                      onChange={(e) => {
                        console.log("Valor de tipo de red seleccionado:", e.target.value);
                        setTipoRed(e.target.value);
                        setInversorSeleccionado(null);
                      }}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    >
                      <option value="">Seleccione el tipo de red</option>
                      <option value="Monofásica 110V">Monofásica 110V</option>
                      <option value="Bifásica 220V">Bifásica 220V</option>
                      <option value="Trifásica 220V">Trifásica 220V</option>
                      <option value="Trifásica 440V">Trifásica 440V</option>
                    </select>
                  </div>
                </div>

                {/* Sección de Equipos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Equipos</h3>
                  
                  {/* Selección de Inversor */}
                  {renderSeleccionInversor()}

                  {/* Inversor Seleccionado */}
                  {inversorSeleccionado && (
                    <div className="rounded-md bg-blue-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-800">{inversorSeleccionado.brand} - {inversorSeleccionado.model} - {inversorSeleccionado.power}kW</h4>
                          <div className="mt-1 text-sm text-blue-600">
                            <div>Modelo: {inversorSeleccionado.model}</div>
                            <div>Tipo de Red: {inversorSeleccionado.grid_type}</div>
                            <div>Precio: ${formatearNumero(inversorSeleccionado.price)}</div>
                            {inversorSeleccionado.technical_sheet_url && (
                              <a 
                                href={`http://localhost:3000${inversorSeleccionado.technical_sheet_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Ver ficha técnica
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setInversorSeleccionado(null);
                            setCantidadInversores("");
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Cambiar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Selección de Panel */}
                  {renderSeleccionPanel()}

                  {/* Panel Seleccionado */}
                  {panelSeleccionado && (
                    <div className="rounded-md bg-blue-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-blue-800">{panelSeleccionado.brand} - {panelSeleccionado.model} - {panelSeleccionado.power}W</h4>
                          <div className="mt-1 text-sm text-blue-600">
                            <div>Tipo: {panelSeleccionado.type}</div>
                            <div>Precio: ${formatearNumero(panelSeleccionado.price)}</div>
                            {panelSeleccionado.technical_sheet_url && (
                              <a
                                href={`http://localhost:3000${panelSeleccionado.technical_sheet_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Ver ficha técnica
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPanelSeleccionado(null);
                            setCantidadPaneles(0);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Cambiar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Cálculo de Paneles */}
                  {numeroPanelesCalculado && panelSeleccionado && (
                    <div className="rounded-md bg-blue-50 p-4">
                      <p className="text-sm text-blue-800">
                        Para una potencia de {potenciaKW} kW, se necesitan aproximadamente {numeroPanelesCalculado} paneles de {panelSeleccionado.power}W.
                      </p>
                    </div>
                  )}

                  {/* Selección de Batería */}
                  {renderSeleccionBateria()}
                </div>

                {/* Botón Continuar */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      console.log("Estado actual antes de continuar:", {
                        inversorSeleccionado,
                        panelSeleccionado,
                        cantidadInversores,
                        cantidadPaneles,
                        tipoSistema,
                        potenciaKW
                      });
                      setSeccionActual(2);
                    }}
                    disabled={!inversorSeleccionado || !panelSeleccionado || !cantidadInversores || !cantidadPaneles || !tipoSistema || !potenciaKW}
                    className="rounded-lg bg-green-600 px-6 py-2.5 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar con la Cotización
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Sección 2: Valores y Porcentajes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Valores y Porcentajes</h3>
                  
                  {/* Valores */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Valor Trámites
                      </label>
                      <p className="mt-1 text-sm text-gray-500">
                        Valor para tramitar los procesos ante el operador de red
                      </p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={parseInt(valorTramites || 0).toLocaleString('es-ES')}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            setValorTramites(value);
                          }}
                          className="mt-1 block w-full rounded-md border border-gray-300 pl-8 pr-3 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Valor Mano de Obra
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={parseInt(valorManoObra || 0).toLocaleString('es-ES')}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            setValorManoObra(value);
                          }}
                          className="mt-1 block w-full rounded-md border border-gray-300 pl-8 pr-3 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Valor Estructura
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={parseInt(valorEstructura || 0).toLocaleString('es-ES')}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            setValorEstructura(value);
                          }}
                          className="mt-1 block w-full rounded-md border border-gray-300 pl-8 pr-3 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Valor Material Eléctrico
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={parseInt(valorMaterialElectrico || 0).toLocaleString('es-ES')}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            setValorMaterialElectrico(value);
                          }}
                          className="mt-1 block w-full rounded-md border border-gray-300 pl-8 pr-3 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Valor Sobreestructura
                      </label>
                      <p className="mt-1 text-sm text-gray-500">
                        Solo ingrese un valor si se requiere realizar trabajos de adaptación o instalación de estructuras adicionales
                      </p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={parseInt(valorSobreestructura || 0).toLocaleString('es-ES')}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^\d]/g, '');
                            setValorSobreestructura(value);
                          }}
                          className="mt-1 block w-full rounded-md border border-gray-300 pl-8 pr-3 py-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Porcentajes */}
                  <div className="mt-6">
                    <h4 className="mb-4 text-md font-semibold text-gray-800">Porcentajes</h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Gestión Comercial (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={porcentajeGestionComercial}
                          onChange={(e) => setPorcentajeGestionComercial(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Imprevistos (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={porcentajeImprevistos}
                          onChange={(e) => setPorcentajeImprevistos(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Retención (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={porcentajeRetencion}
                          onChange={(e) => setPorcentajeRetencion(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Administración (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={porcentajeAdministracion}
                          onChange={(e) => setPorcentajeAdministracion(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Utilidad (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={porcentajeUtilidad}
                          onChange={(e) => setPorcentajeUtilidad(e.target.value)}
                          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          IVA sobre Utilidad (%)
                        </label>
                        <input
                          type="number"
                          value="19"
                          disabled
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2"
                        />
                      </div>
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
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 disabled:opacity-50"
                      />
                      <label htmlFor="requiereFinanciamiento" className="ml-2 block text-sm text-gray-700">
                        Requiere Financiamiento
                      </label>
                    </div>
                    {potenciaKW && parseFloat(potenciaKW) <= 47 && (
                      <p className="mt-1 text-sm text-gray-500">
                        El financiamiento solo está disponible para proyectos con potencia mayor a 47 kW
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setSeccionActual(1)}
                    className="rounded-lg border border-gray-300 px-6 py-2.5 text-gray-800 hover:bg-gray-50"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-green-600 px-6 py-2.5 text-white hover:bg-green-700"
                  >
                    Guardar Cotización
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </Modal>

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
      />

      {/* Modal de Eliminación */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Eliminar Cotización"
      >
        <div className="p-4">
          <p className="text-gray-600">
            ¿Está seguro que desea eliminar la cotización {selectedCotizacion?.nombre_proyecto}?
          </p>
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

      {/* Modal de Detalles */}
      {isDetailsModalOpen && cotizacionDetalles && (
        <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Detalles de la Cotización</h2>
            
            {/* Información básica */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Información General</h3>
              <p><strong>Proyecto:</strong> {cotizacionDetalles.project_name}</p>
              <p><strong>Cliente:</strong> {cotizacionDetalles.client?.name}</p>
              <p><strong>Tipo de Sistema:</strong> {cotizacionDetalles.system_type}</p>
              <p><strong>Potencia:</strong> {cotizacionDetalles.power_kwp} kWp</p>
              <p><strong>Valor Total:</strong> {formatNumber(cotizacionDetalles.total_value)}</p>
            </div>

            {/* Productos utilizados */}
            {cotizacionDetalles.used_products && cotizacionDetalles.used_products.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-blue-500 mr-3"></div>
                  <h3 className="text-xl font-bold text-gray-800">Productos Utilizados</h3>
                </div>
                <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                  <table className="w-full bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Producto</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Cantidad</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Precio Unit.</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Subtotal</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Utilidad %</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Utilidad</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cotizacionDetalles.used_products.map((product, index) => {
                        const productTypeInfo = {
                          'panel': { name: 'Panel Solar', icon: '☀️', color: 'text-yellow-600 bg-yellow-50' },
                          'inverter': { name: 'Inversor', icon: '⚡', color: 'text-blue-600 bg-blue-50' },
                          'battery': { name: 'Batería', icon: '🔋', color: 'text-green-600 bg-green-50' }
                        };
                        const typeInfo = productTypeInfo[product.product_type] || { name: product.product_type, icon: '📦', color: 'text-gray-600 bg-gray-50' };
                        
                        return (
                          <tr key={product.used_product_id || index} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm mr-3 ${typeInfo.color}`}>
                                  {typeInfo.icon}
                                </span>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{typeInfo.name}</div>
                                  <div className="text-xs text-gray-500">ID: {product.product_id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                {product.quantity}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-sm">
                              <span className="text-gray-900">{formatNumber(product.unit_price)}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-sm">
                              <span className="text-gray-900">{formatNumber(product.partial_value)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {(parseFloat(product.profit_percentage) * 100).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-sm">
                              <span className="text-green-600 font-medium">{formatNumber(product.profit)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-lg font-bold text-gray-900">{formatNumber(product.total_value)}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan="6" className="px-6 py-4 text-right font-semibold text-gray-700">Total Productos:</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xl font-bold text-blue-600">
                            ${formatNumber(cotizacionDetalles.used_products.reduce((sum, p) => sum + parseFloat(p.total_value), 0))}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Items adicionales */}
            {cotizacionDetalles.items && cotizacionDetalles.items.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="w-1 h-6 bg-green-500 mr-3"></div>
                  <h3 className="text-xl font-bold text-gray-800">Items Adicionales</h3>
                </div>
                <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                  <table className="w-full bg-white">
                    <thead>
                      <tr className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Descripción</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">Tipo</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Cantidad</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Unidad</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Precio Unit.</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Subtotal</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">Utilidad %</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Utilidad</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cotizacionDetalles.items.map((item, index) => {
                        const itemTypeInfo = {
                          'conductor_fotovoltaico': { name: 'Conductor Fotovoltaico', icon: '🔌', color: 'text-orange-600 bg-orange-50' },
                          'material_electrico': { name: 'Material Eléctrico', icon: '⚡', color: 'text-yellow-600 bg-yellow-50' },
                          'estructura': { name: 'Estructura de Soporte', icon: '🏗️', color: 'text-gray-600 bg-gray-50' },
                          'mano_obra': { name: 'Mano de Obra', icon: '👷', color: 'text-blue-600 bg-blue-50' },
                          'tramites': { name: 'Trámites', icon: '📋', color: 'text-purple-600 bg-purple-50' },
                          'sobreestructura': { name: 'Sobreestructura', icon: '🏢', color: 'text-indigo-600 bg-indigo-50' }
                        };
                        const typeInfo = itemTypeInfo[item.tipo_item] || { name: item.tipo_item, icon: '📦', color: 'text-gray-600 bg-gray-50' };
                        
                        return (
                          <tr key={item.id_item || index} className="hover:bg-gray-50 transition-colors duration-200">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{item.descripcion}</div>
                              <div className="text-xs text-gray-500">ID: {item.id_item}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm mr-2 ${typeInfo.color}`}>
                                  {typeInfo.icon}
                                </span>
                                <span className="text-sm font-medium text-gray-700">{typeInfo.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                {item.cantidad}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {item.unidad}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-sm">
                              <span className="text-gray-900">{formatNumber(item.precio_unitario)}</span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-sm">
                              <span className="text-gray-900">{formatNumber(item.valor_parcial)}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {(parseFloat(item.porcentaje_ganancia) * 100).toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-sm">
                              <span className="text-green-600 font-medium">{formatNumber(item.ganancia)}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-lg font-bold text-gray-900">{formatNumber(item.valor_total_item)}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan="8" className="px-6 py-4 text-right font-semibold text-gray-700">Total Items:</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xl font-bold text-green-600">
                            ${formatNumber(cotizacionDetalles.items.reduce((sum, i) => sum + parseFloat(i.valor_total_item), 0))}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* Resumen total */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">Valor Total de la Cotización</h4>
                  <p className="text-sm text-gray-600">Incluye productos e items adicionales</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    ${formatNumber(cotizacionDetalles.total_value || 0)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Potencia: {cotizacionDetalles.power_kwp || 0} kWp
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Cotizaciones;