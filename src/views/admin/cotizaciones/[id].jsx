import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import Card from "components/card";
import Loading from "components/loading";
import { MdArrowBack, MdEdit, MdDownload, MdPrint, MdSave, MdCancel } from "react-icons/md";
import Modal from "components/modal";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getApiUrl } from '../../../config/api';
import { cotizacionesService } from '../../../services/cotizacionesService';
import ProductTooltip from '../../../components/ProductTooltip';
import useNotifications from '../../../hooks/useNotifications';
import { NotificationManager } from '../../../components/notifications';

const DetalleCotizacion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cotizacion, setCotizacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState(null);
  const [statuses, setStatuses] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  
  // Estados para edición completa
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  
  // Funciones de formato para números
  const formatNumber = (number) => {
    if (!number && number !== 0) return '0';
    return new Intl.NumberFormat('es-CO').format(Math.round(parseFloat(number) || 0));
  };
  
  const formatNumberWithoutDecimals = (number) => {
    if (!number && number !== 0) return '0';
    return Math.round(parseFloat(number) || 0).toLocaleString('es-CO');
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-CO');
  };
  
  // Hook de notificaciones
  const {
    mensajes,
    showSuccess,
    showError,
    showCRUDSuccess,
    showCRUDError
  } = useNotifications();
  const [editableProducts, setEditableProducts] = useState([]);
  const [editableItems, setEditableItems] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [percentageValue, setPercentageValue] = useState('');
  
  // Estados para cambio de productos
  const [availablePanels, setAvailablePanels] = useState([]);
  const [availableInverters, setAvailableInverters] = useState([]);
  const [availableBatteries, setAvailableBatteries] = useState([]);
  const [editingProductSelection, setEditingProductSelection] = useState({ index: null, type: null });
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Función para calcular valores monetarios
  const calculateMonetaryValues = (data) => {
    const {
      profit_percentage = 0,
      iva_profit_percentage = 0,
      commercial_management_percentage = 0,
      administration_percentage = 0,
      contingency_percentage = 0,
      withholding_percentage = 0
    } = data;

    // Calcular subtotal de productos
    const productsSubtotal = (data.used_products || []).reduce((sum, product) => {
      const partialValue = parseFloat(product.quantity || 0) * parseFloat(product.unit_price || 0);
      const profit = partialValue * parseFloat(product.profit_percentage || 0);
      return sum + partialValue + profit;
    }, 0);

    // Calcular subtotal de items
    const itemsSubtotal = (data.items || []).reduce((sum, item) => {
      const partialValue = parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0);
      const profit = partialValue * parseFloat(item.profit_percentage || 0);
      return sum + partialValue + profit;
    }, 0);

    const subtotal = productsSubtotal + itemsSubtotal;
    
    // Calcular porcentajes
    const profit = subtotal * parseFloat(profit_percentage);
    const profitIva = profit * parseFloat(iva_profit_percentage);
    const commercialManagement = subtotal * parseFloat(commercial_management_percentage);
    const administration = subtotal * parseFloat(administration_percentage);
    const contingency = subtotal * parseFloat(contingency_percentage);
    const withholdings = subtotal * parseFloat(withholding_percentage);

    // Calcular totales
    const subtotal2 = subtotal + profit;
    const subtotal3 = subtotal2 + profitIva;
    const totalValue = subtotal3 + commercialManagement + administration + contingency - withholdings;

    return {
      subtotal,
      profit,
      profit_iva: profitIva,
      commercial_management: commercialManagement,
      administration,
      contingency,
      withholdings,
      subtotal2,
      subtotal3,
      total_value: totalValue
    };
  };

  // Función para iniciar edición
  const startEditing = () => {
    if (!cotizacion) return;
    
    const initialData = {
      project_name: cotizacion.project_name || '',
      system_type: cotizacion.system_type || '',
      power_kwp: cotizacion.power_kwp || 0,
      panel_count: cotizacion.panel_count || 0,
      requires_financing: cotizacion.requires_financing || false,
      profit_percentage: parseFloat(cotizacion.profit_percentage || 0),
      iva_profit_percentage: parseFloat(cotizacion.iva_profit_percentage || 0),
      commercial_management_percentage: parseFloat(cotizacion.commercial_management_percentage || 0),
      administration_percentage: parseFloat(cotizacion.administration_percentage || 0),
      contingency_percentage: parseFloat(cotizacion.contingency_percentage || 0),
      withholding_percentage: parseFloat(cotizacion.withholding_percentage || 0),
      status_id: cotizacion.status_id || 1,
      used_products: cotizacion.used_products ? [...cotizacion.used_products] : [],
      items: cotizacion.items ? [...cotizacion.items] : []
    };

    setEditFormData(initialData);
    setOriginalData(initialData);
    setIsEditing(true);
  };

  // Función para cancelar edición
  const cancelEditing = () => {
    setIsEditing(false);
    setEditFormData({});
    setEditFormData(originalData);
    setHasChanges(false);
  };

  // Función para guardar cambios
  const saveChanges = async () => {
    try {
      setSaving(true);
      setEditError(null);

      // Calcular todos los valores monetarios
      const calculatedValues = calculateMonetaryValues(editFormData);
      
      // Preparar datos para enviar
      const updateData = {
        ...editFormData,
        ...calculatedValues
      };

      // Convertir porcentajes a decimales (0.0-1.0)
      Object.keys(updateData).forEach(key => {
        if (key.includes('percentage') && typeof updateData[key] === 'number') {
          updateData[key] = updateData[key] / 100;
        }
      });

      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await fetch(getApiUrl(`/api/quotations/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar la cotización');
      }

      const result = await response.json();
      
      if (result.success) {
        // Actualizar estado local
        setCotizacion(prev => ({
          ...prev,
          ...updateData,
          ...calculatedValues
        }));
        
        setIsEditing(false);
        setHasChanges(false);
        showCRUDSuccess('update', 'cotización');
        
        // Recargar datos
        await fetchCotizacion();
      } else {
        throw new Error(result.message || 'Error al actualizar la cotización');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      setEditError(error.message);
      showCRUDError('update', 'cotización', error.message);
    } finally {
      setSaving(false);
    }
  };



  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const token = user?.token;
        if (!token) {
          throw new Error("No hay token de autenticación");
        }

        const response = await cotizacionesService.getCotizacionById(id, token);

        if (response.success) {
          const cotizacionData = response.data;
          setCotizacion(cotizacionData);
          // Inicializar datos editables
          setEditableProducts(cotizacionData.used_products ? [...cotizacionData.used_products] : []);
          setEditableItems(cotizacionData.items ? [...cotizacionData.items] : []);
        } else {
          throw new Error(response.message || "Error al obtener los detalles de la cotización");
        }
      } catch (error) {
        console.error("Error al obtener detalles:", error);
        setError(error.message);
        showCRUDError('read', 'cotización', error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchStatuses = async () => {
      try {
        const token = user?.token;
        const response = await fetch(getApiUrl("/api/quotation-statuses"), {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStatuses(data);
        }
      } catch (error) {
        console.error("Error al obtener estados:", error);
      }
    };

    fetchCotizacion();
    fetchStatuses();
    fetchAvailableProducts();
  }, [id, user?.token]);

  // Recalcular totales cuando cambien los productos o items editables
  useEffect(() => {
    if (editableProducts.length > 0 || editableItems.length > 0) {
      recalculateCotizacionTotals();
    }
  }, [editableProducts, editableItems]);

  // Función para cargar productos disponibles
  const fetchAvailableProducts = async () => {
    try {
      setLoadingProducts(true);
      const token = user?.token;
      if (!token) return;

      // Cargar paneles - usando endpoint correcto sin paginación para mostrar todos
      const panelsResponse = await fetch(getApiUrl("/api/panels?limit=1000&page=1"), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (panelsResponse.ok) {
        const panelsData = await panelsResponse.json();
        // Estructura: { data: { data: [...], last_page: 1 } }
        const panels = Array.isArray(panelsData.data?.data) ? panelsData.data.data : [];
        setAvailablePanels(panels);

      } else {
        console.warn("Error al cargar paneles:", panelsResponse.status);
        setAvailablePanels([]);
      }

      // Cargar inversores - usando endpoint correcto sin paginación para mostrar todos
      const invertersResponse = await fetch(getApiUrl("/api/inverters?limit=1000&page=1"), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (invertersResponse.ok) {
        const invertersData = await invertersResponse.json();
        // Estructura: { data: { data: [...], last_page: 1 } }
        const inverters = Array.isArray(invertersData.data?.data) ? invertersData.data.data : [];
        setAvailableInverters(inverters);

      } else {
        console.warn("Error al cargar inversores:", invertersResponse.status);
        setAvailableInverters([]);
      }

      // Cargar baterías - usando endpoint correcto sin paginación para mostrar todos
      const batteriesResponse = await fetch(getApiUrl("/api/batteries?limit=1000&page=1"), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (batteriesResponse.ok) {
        const batteriesData = await batteriesResponse.json();
        // Estructura: { data: [...] } (sin paginación anidada)
        const batteries = Array.isArray(batteriesData.data) ? batteriesData.data : [];
        setAvailableBatteries(batteries);

      } else {
        console.warn("Error al cargar baterías:", batteriesResponse.status);
        setAvailableBatteries([]);
      }
    } catch (error) {
      console.error("Error al cargar productos disponibles:", error);
      // Asegurar que siempre sean arrays
      setAvailablePanels([]);
      setAvailableInverters([]);
      setAvailableBatteries([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleEdit = () => {
    if (cotizacion) {
    setFormData({
        nombre_proyecto: cotizacion.project_name || "",
        tipo_sistema: cotizacion.system_type || "",
        potencia_kwp: cotizacion.power_kwp || "",
        numero_paneles: cotizacion.panel_count || "",
        status_id: cotizacion.status_id || ""
    });
    setIsEditModalOpen(true);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para editar campos básicos de la cotización en tiempo real
  const handleBasicFieldEdit = (field, value) => {
    if (!cotizacion) return;

    // Validar el valor según el campo
    let validatedValue = value;
    
    switch (field) {
      case 'project_name':
        if (!value || value.trim().length === 0) {
          showError('El nombre del proyecto es requerido');
          return;
        }
        if (value.length > 200) {
          showError('El nombre del proyecto no puede exceder 200 caracteres');
          return;
        }
        validatedValue = value.trim();
        break;
        
      case 'power_kwp':
        const power = parseFloat(value);
        if (isNaN(power) || power < 0.1) {
          showError('La potencia debe ser mayor a 0.1 kW');
          return;
        }
        validatedValue = power;
        break;
        
      case 'panel_count':
        const panels = parseInt(value);
        if (isNaN(panels) || panels < 1) {
          showError('El número de paneles debe ser mayor a 0');
          return;
        }
        validatedValue = panels;
        break;
        
      case 'system_type':
        const validTypes = ['On-grid', 'Off-grid', 'Híbrido'];
        if (!validTypes.includes(value)) {
          showError('Tipo de sistema no válido');
          return;
        }
        validatedValue = value;
        break;
        
      default:
        validatedValue = value;
    }

    // Actualizar el estado de la cotización
    setCotizacion(prev => ({
      ...prev,
      [field]: validatedValue
    }));

    // Marcar que hay cambios pendientes
    setHasChanges(true);
  };

  // Estados para edición en línea
  const [editingProduct, setEditingProduct] = useState({ index: null, field: null });
  const [editingItem, setEditingItem] = useState({ index: null, field: null });
  const [editingPercentage, setEditingPercentage] = useState({ type: null, field: null });

  // Función para manejar doble clic en productos
  const handleDoubleClick = (type, index, field) => {
    if (type === 'product') {
      setEditingProduct({ index, field });
    } else if (type === 'item') {
      setEditingItem({ index, field });
    }
  };

  // Función para manejar cambios en productos
  const handleProductChange = (index, field, value) => {
    const newProducts = [...editableProducts];
    newProducts[index] = {
      ...newProducts[index],
      [field]: value
    };
    
    // Recalcular totales del producto
    const calculatedTotals = calculateProductTotal(newProducts[index]);
    newProducts[index] = {
      ...newProducts[index],
      ...calculatedTotals
    };
    
    setEditableProducts(newProducts);
    setHasChanges(true);
    
    // Recalcular totales de la cotización
    setTimeout(() => recalculateCotizacionTotals(), 100);
  };

  // Función para manejar cambios en items
  const handleItemChange = (index, field, value) => {
    const newItems = [...editableItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    // Recalcular totales del item
    const calculatedTotals = calculateItemTotal(newItems[index]);
    newItems[index] = {
      ...newItems[index],
      ...calculatedTotals
    };
    
    setEditableItems(newItems);
    setHasChanges(true);
    
    // Recalcular totales de la cotización
    setTimeout(() => recalculateCotizacionTotals(), 100);
  };

  // Función para manejar doble clic en porcentajes
  const handlePercentageDoubleClick = (field) => {
    // Obtener el valor actual del porcentaje y convertirlo a porcentaje (0-100)
    const currentValue = cotizacion[field] || 0;
    const percentageValue = Math.round(parseFloat(currentValue) * 100);
    
    setEditingPercentage({ type: null, field });
    setPercentageValue(percentageValue.toString());
  };

  // Función para manejar cambios en porcentajes
  const handlePercentageChange = (value) => {
    setPercentageValue(value);
  };

  // Función para guardar cambios en porcentajes
  const handlePercentageSave = () => {
    if (!editingPercentage.field) return;
    
    const value = parseFloat(percentageValue);
    if (isNaN(value) || value < 0 || value > 100) {
      showError('El porcentaje debe estar entre 0% y 100%');
      return;
    }
    
    // Convertir de porcentaje (0-100) a decimal (0.0-1.0)
    const decimalValue = value / 100;
    
    setCotizacion(prev => ({
      ...prev,
      [editingPercentage.field]: decimalValue
    }));
    
    setHasChanges(true);
    setEditingPercentage({ type: null, field: null });
    setPercentageValue('');
    
    // Recalcular totales
    setTimeout(() => recalculateCotizacionTotals(), 100);
  };

  // Función para manejar tecla Enter en porcentajes
  const handlePercentageKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePercentageSave();
    } else if (e.key === 'Escape') {
      setEditingPercentage({ type: null, field: null });
      setPercentageValue('');
    }
  };

  // Función para manejar pérdida de foco
  const handleBlur = () => {
    setEditingProduct({ index: null, field: null });
    setEditingItem({ index: null, field: null });
  };

  // Función para manejar tecla Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      handleBlur();
    }
  };

  // Función para filtrar inversores por compatibilidad
  const getFilteredInverters = (currentProduct) => {
    if (!currentProduct || !availableInverters) return [];
    
    // Filtrar inversores por tipo de sistema y red
    return availableInverters.filter(inverter => {
      // Si el producto actual tiene información del producto, usar esa
      if (currentProduct.product) {
        return inverter.system_type === currentProduct.product.system_type &&
               inverter.grid_type === currentProduct.product.grid_type;
      }
      
      // Si no, usar valores por defecto
      return inverter.system_type === 'On-grid' && inverter.grid_type === 'Monofásico 110V';
    });
  };

  // Función para recargar cotización (usada en handleSaveChanges)
  const fetchCotizacion = async () => {
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await cotizacionesService.getCotizacionById(id, token);

      if (response.success) {
        const cotizacionData = response.data;
        setCotizacion(cotizacionData);
        setEditableProducts(cotizacionData.used_products ? [...cotizacionData.used_products] : []);
        setEditableItems(cotizacionData.items ? [...cotizacionData.items] : []);
      } else {
        throw new Error(response.message || "Error al obtener los detalles de la cotización");
      }
    } catch (error) {
      console.error("Error al obtener detalles:", error);
      setError(error.message);
    }
  };

  // Función para calcular el total de un producto
  const calculateProductTotal = (product) => {
    const quantity = parseFloat(product.quantity) || 0;
    const unitPrice = parseFloat(product.unit_price) || 0;
    const profitPercentage = parseFloat(product.profit_percentage) || 0;
    
    const partialValue = quantity * unitPrice;
    const profit = partialValue * profitPercentage;
    const totalValue = partialValue + profit;
    
    return {
      partial_value: partialValue,
      profit: profit,
      total_value: totalValue
    };
  };

  // Función para calcular el total de un item
  const calculateItemTotal = (item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unit_price) || 0;
    const profitPercentage = parseFloat(item.profit_percentage) || 0;
    
    const partialValue = quantity * unitPrice;
    const profit = partialValue * profitPercentage;
    const totalValue = partialValue + profit;
    
    return {
      partial_value: partialValue,
      profit: profit,
      total_value: totalValue
    };
  };

  // Función para recalcular todos los totales de la cotización
  // Esta función se ejecuta automáticamente cuando se modifican productos, items o porcentajes
  // Mantiene sincronizado el total_value de la cotización con los cálculos en tiempo real
  // IMPORTANTE: Todos los valores calculados se envían al backend para sincronización completa
  const recalculateCotizacionTotals = () => {
    // Calcular subtotal sumando todos los totales de productos e items
    const subtotalProductos = editableProducts?.reduce((sum, product) => {
      return sum + (parseFloat(product.total_value) || 0);
    }, 0) || 0;
    
    const subtotalItems = editableItems?.reduce((sum, item) => {
      return sum + (parseFloat(item.total_value) || 0);
    }, 0) || 0;
    
    const subtotalCalculado = subtotalProductos + subtotalItems;
    
    // Calcular los porcentajes basados en el subtotal calculado
    const profitPercentage = parseFloat(cotizacion.profit_percentage || 0);
    const commercialManagementPercentage = parseFloat(cotizacion.commercial_management_percentage || 0);
    const administrationPercentage = parseFloat(cotizacion.administration_percentage || 0);
    const contingencyPercentage = parseFloat(cotizacion.contingency_percentage || 0);
    const withholdingPercentage = parseFloat(cotizacion.withholding_percentage || 0);
    
    // Cálculos siguiendo el orden establecido
    const subtotal = subtotalCalculado;
    const gestionComercial = subtotal * commercialManagementPercentage;
    const subtotal2 = subtotal + gestionComercial;
    const administracion = subtotal2 * administrationPercentage;
    const imprevistos = subtotal2 * contingencyPercentage;
    const utilidad = subtotal2 * profitPercentage;
    const ivaUtilidad = utilidad * 0.19; // IVA fijo del 19% sobre la utilidad
    const subtotal3 = subtotal2 + administracion + imprevistos + utilidad + ivaUtilidad;
    const retenciones = subtotal3 * withholdingPercentage;
    const cotizacionProyecto = subtotal3 + retenciones;
    
    // Actualizar el estado de la cotización con los nuevos totales
    // IMPORTANTE: Estos campos se envían al backend para sincronización completa
    setCotizacion(prev => ({
      ...prev,
      total_value: cotizacionProyecto,
      subtotal: subtotal,
      subtotal2: subtotal2,
      subtotal3: subtotal3,
      profit: utilidad,
      profit_iva: ivaUtilidad,
      commercial_management: gestionComercial,
      administration: administracion,
      contingency: imprevistos,
      withholdings: retenciones
    }));
  };

  // Función para preparar datos completos de la cotización para enviar al backend
  // CRÍTICO: Según la documentación, cuando se editan productos o items,
  // se requieren TODOS los valores calculados para que el backend pueda validar
  const prepareCompleteQuotationData = () => {
    if (!cotizacion) return null;

    // Preparar productos con todos los campos requeridos según la documentación
    const preparedProducts = editableProducts.map(product => ({
      used_product_id: product.used_product_id,
      quantity: parseInt(product.quantity) || 0,
      unit_price: parseFloat(product.unit_price) || 0,
      profit_percentage: parseFloat(product.profit_percentage) || 0,
      partial_value: parseFloat(product.partial_value) || 0,
      profit: parseFloat(product.profit) || 0,
      total_value: parseFloat(product.total_value) || 0
    }));

    // Preparar items con todos los campos requeridos según la documentación
    const preparedItems = editableItems.map(item => ({
      item_id: item.item_id,
      description: item.description || '',
      item_type: item.item_type || 'materiales',
      quantity: parseFloat(item.quantity) || 0,
      unit: item.unit || 'unidad',
      unit_price: parseFloat(item.unit_price) || 0,
      profit_percentage: parseFloat(item.profit_percentage) || 0,
      partial_value: parseFloat(item.partial_value) || 0,
      profit: parseFloat(item.profit) || 0,
      total_value: parseFloat(item.total_value) || 0
    }));

    // Preparar datos de actualización
    const updateData = {};

    // Si hay productos modificados, incluir productos Y todos los valores calculados
    if (editableProducts.length > 0) {
      updateData.used_products = preparedProducts;
      
      // CRÍTICO: Incluir todos los valores calculados cuando se editan productos
      updateData.subtotal = parseFloat(cotizacion.subtotal) || 0;
      updateData.profit = parseFloat(cotizacion.profit) || 0;
      updateData.profit_iva = parseFloat(cotizacion.profit_iva) || 0;
      updateData.commercial_management = parseFloat(cotizacion.commercial_management) || 0;
      updateData.administration = parseFloat(cotizacion.administration) || 0;
      updateData.contingency = parseFloat(cotizacion.contingency) || 0;
      updateData.withholdings = parseFloat(cotizacion.withholdings) || 0;
      updateData.total_value = parseFloat(cotizacion.total_value) || 0;
      updateData.subtotal2 = parseFloat(cotizacion.subtotal2) || 0;
      updateData.subtotal3 = parseFloat(cotizacion.subtotal3) || 0;
    }

    // Si hay items modificados, incluir items Y todos los valores calculados
    if (editableItems.length > 0) {
      updateData.items = preparedItems;
      
      // CRÍTICO: Incluir todos los valores calculados cuando se editan items
      if (!updateData.subtotal) {
        updateData.subtotal = parseFloat(cotizacion.subtotal) || 0;
        updateData.profit = parseFloat(cotizacion.profit) || 0;
        updateData.profit_iva = parseFloat(cotizacion.profit_iva) || 0;
        updateData.commercial_management = parseFloat(cotizacion.commercial_management) || 0;
        updateData.administration = parseFloat(cotizacion.administration) || 0;
        updateData.contingency = parseFloat(cotizacion.contingency) || 0;
        updateData.withholdings = parseFloat(cotizacion.withholdings) || 0;
        updateData.total_value = parseFloat(cotizacion.total_value) || 0;
        updateData.subtotal2 = parseFloat(cotizacion.subtotal2) || 0;
        updateData.subtotal3 = parseFloat(cotizacion.subtotal3) || 0;
      }
    }

    // Incluir porcentajes si han sido modificados
    if (cotizacion.profit_percentage !== undefined) {
      updateData.profit_percentage = parseFloat(cotizacion.profit_percentage) || 0;
    }
    if (cotizacion.iva_profit_percentage !== undefined) {
      updateData.iva_profit_percentage = parseFloat(cotizacion.iva_profit_percentage) || 0;
    }
    if (cotizacion.commercial_management_percentage !== undefined) {
      updateData.commercial_management_percentage = parseFloat(cotizacion.commercial_management_percentage) || 0;
    }
    if (cotizacion.administration_percentage !== undefined) {
      updateData.administration_percentage = parseFloat(cotizacion.administration_percentage) || 0;
    }
    if (cotizacion.contingency_percentage !== undefined) {
      updateData.contingency_percentage = parseFloat(cotizacion.contingency_percentage) || 0;
    }
    if (cotizacion.withholding_percentage !== undefined) {
      updateData.withholding_percentage = parseFloat(cotizacion.withholding_percentage) || 0;
    }

    return updateData;
  };

  // Función para guardar todos los cambios
  // CRÍTICO: Según la documentación, enviar TODA la cotización con valores recalculados
  const handleSaveChanges = async () => {
    if (!hasChanges) return;

    setSaving(true);
    setEditError(null);

    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // CRÍTICO: Recalcular todos los totales antes de enviar para asegurar sincronización
      recalculateCotizacionTotals();
      
      // Esperar un momento para que se actualice el estado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Preparar datos completos de la cotización
      const completeQuotationData = prepareCompleteQuotationData();
      if (!completeQuotationData) {
        throw new Error("Error al preparar los datos de la cotización");
      }

      // Validar solo los campos que se están enviando
      if (completeQuotationData.used_products) {
        for (const product of completeQuotationData.used_products) {
          if (!product.used_product_id || product.quantity <= 0 || product.unit_price <= 0) {
            throw new Error("Todos los productos deben tener ID, cantidad y precio válidos");
          }
          if (product.profit_percentage < 0 || product.profit_percentage > 1) {
            throw new Error("El porcentaje de ganancia del producto debe estar entre 0% y 100%");
          }
        }
      }

      if (completeQuotationData.items) {
        for (const item of completeQuotationData.items) {
          if (!item.item_id || !item.description || item.quantity <= 0 || item.unit_price <= 0) {
            throw new Error("Todos los items deben tener ID, descripción, cantidad y precio válidos");
          }
          if (item.profit_percentage < 0 || item.profit_percentage > 1) {
            throw new Error("El porcentaje de ganancia del item debe estar entre 0% y 100%");
          }
        }
      }

      // Validar porcentajes si se están enviando
      const percentageFields = [
        'profit_percentage', 'iva_profit_percentage', 'commercial_management_percentage',
        'administration_percentage', 'contingency_percentage', 'withholding_percentage'
      ];
      
      for (const field of percentageFields) {
        if (completeQuotationData[field] !== undefined) {
          const value = completeQuotationData[field];
          if (value < 0 || value > 1) {
            throw new Error(`El porcentaje ${field} debe estar entre 0% y 100%`);
          }
        }
      }

      // Log para debuggear qué datos se están enviando
      console.log('📤 Datos enviados al backend:', completeQuotationData);
      
      // CRÍTICO: Según la documentación, cuando se editan productos o items,
      // se requieren TODOS los valores calculados para validación del backend
      const response = await fetch(getApiUrl(`/api/quotations/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(completeQuotationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Actualizar estado local con la respuesta del servidor
        setCotizacion(prev => ({
          ...prev,
          ...result.data
        }));
        
        // Actualizar productos e items editables
        if (result.data.used_products) {
          setEditableProducts(result.data.used_products);
        }
        if (result.data.items) {
          setEditableItems(result.data.items);
        }
        
        setHasChanges(false);
        showCRUDSuccess('update', 'cotización');
        
        // Mostrar mensaje de éxito con detalles
        showSuccess(`Cotización actualizada exitosamente. Total: ${formatNumber(result.data.total_value)}`);
      } else {
        throw new Error(result.message || "Error al actualizar la cotización");
      }
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setEditError(error.message);
      showCRUDError('update', 'cotización', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    setSaving(true);
    setEditError(null);

    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const response = await cotizacionesService.updateCotizacion(id, formData, token);

      if (response.success) {
        const updatedCotizacion = response.data;
        setCotizacion(updatedCotizacion);
        setIsEditModalOpen(false);
        showCRUDSuccess('update', 'cotización');
      } else {
        throw new Error(response.message || "Error al actualizar la cotización");
      }
    } catch (error) {
      console.error("Error al actualizar cotización:", error);
      setEditError(error.message);
      showCRUDError('update', 'cotización', error.message);
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = () => {
    if (!cotizacion) return;

    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Cotización', 105, 20, { align: 'center' });
    
    // Información básica
    doc.setFontSize(12);
    doc.text(`Proyecto: ${cotizacion.project_name}`, 20, 40);
    doc.text(`Cliente: ${cotizacion.client?.name || 'N/A'}`, 20, 50);
    doc.text(`Tipo de Sistema: ${cotizacion.system_type}`, 20, 60);
    doc.text(`Potencia: ${cotizacion.power_kwp} kWp`, 20, 70);
    doc.text(`Valor Total: ${formatNumber(cotizacion.total_value)}`, 20, 80);
    
    // Productos
    doc.text('Productos:', 20, 100);
    let yPos = 110;
    
    if (cotizacion.products && Array.isArray(cotizacion.products)) {
      cotizacion.products.forEach((product, index) => {
        doc.text(`${index + 1}. ${product.product_name} - Cantidad: ${product.quantity}`, 30, yPos);
        yPos += 10;
      });
    }
    
    doc.save(`cotizacion-${cotizacion.quotation_id}.pdf`);
  };

  // Renderizado condicional del componente
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-4">Error</h2>
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => navigate('/admin/cotizaciones')}
            className="bg-accent-primary text-white px-4 py-2 rounded hover:bg-accent-hover transition-colors"
          >
            Volver a Cotizaciones
          </button>
        </div>
      </div>
    );
  }

  if (!cotizacion) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-text-secondary mb-4">Cotización no encontrada</h2>
          <button
            onClick={() => navigate('/admin/cotizaciones')}
            className="bg-accent-primary text-white px-4 py-2 rounded hover:bg-accent-hover transition-colors"
          >
            Volver a Cotizaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-5 xl:grid-cols-1 2xl:grid-cols-1 3xl:grid-cols-2 mb-5 grid-cols-1 gap-5">


      {/* Header con botones de acción */}
      <Card extra="col-span-full">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/admin/cotizaciones')}
              className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <MdArrowBack className="h-5 w-5" />
              <span>Volver</span>
        </button>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">
                {cotizacion.project_name}
              </h1>
              <p className="text-text-secondary">
                Cotización #{cotizacion.quotation_id} - Creada el {formatDate(cotizacion.creation_date)}
              </p>
              <div className="mt-2 space-y-1">
                <p className="text-lg font-semibold text-accent-primary">
                  Total: {formatNumber(cotizacion.total_value)}
                </p>
                {hasChanges && (
                  <p className="text-sm text-orange-500">
                    ⚠️ Tienes cambios pendientes de guardar
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSaveChanges}
              disabled={!hasChanges || saving}
              className={`flex items-center space-x-2 px-4 py-2 rounded transition-colors ${
                hasChanges 
                  ? 'bg-accent-primary text-white hover:bg-accent-hover' 
                  : 'bg-text-disabled text-white cursor-not-allowed'
              }`}
            >
              <MdEdit className="h-4 w-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
            
            {/* Botón temporal para probar la sincronización */}
            <button
              onClick={() => {
                
              }}
              className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
            >
              <span>Estado</span>
            </button>
            <button
              onClick={generatePDF}
              className="flex items-center space-x-2 bg-accent-primary text-white px-4 py-2 rounded hover:bg-accent-hover transition-colors"
            >
              <MdDownload className="h-4 w-4" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={generatePDF}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              <MdPrint className="h-4 w-4" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Información General */}
      <Card extra="col-span-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Información General</h2>
            <div className="text-sm text-text-secondary">
              {hasChanges && <span className="text-orange-500">⚠️ Cambios pendientes</span>}
            </div>
          </div>
          
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Nombre del Proyecto - Editable */}
                <div>
              <label className="block text-sm font-medium text-text-secondary">Nombre del Proyecto</label>
              <div 
                className="text-lg font-semibold text-text-primary cursor-pointer hover:bg-accent-primary/10 p-2 rounded transition-colors"
                onDoubleClick={() => {
                  const newName = prompt('Nuevo nombre del proyecto:', cotizacion.project_name);
                  if (newName !== null && newName.trim() !== '') {
                    handleBasicFieldEdit('project_name', newName);
                  }
                }}
                title="Doble clic para editar"
              >
                {cotizacion.project_name}
                <span className="text-xs text-accent-primary ml-2">✏️</span>
                </div>
            </div>
            
            {/* Cliente - Solo lectura */}
                <div>
                <label className="block text-sm font-medium text-text-secondary">Cliente</label>
                <p className="text-lg font-semibold text-text-primary">{cotizacion.client?.name || 'N/A'}</p>
                </div>
            
            {/* Tipo de Sistema - Editable */}
                <div>
                <label className="block text-sm font-medium text-text-secondary">Tipo de Sistema</label>
              <div 
                className="text-lg font-semibold text-text-primary cursor-pointer hover:bg-accent-primary/10 p-2 rounded transition-colors"
                onDoubleClick={() => {
                  const newType = prompt('Nuevo tipo de sistema (On-grid/Off-grid/Híbrido):', cotizacion.system_type);
                  if (newType !== null && ['On-grid', 'Off-grid', 'Híbrido'].includes(newType)) {
                    handleBasicFieldEdit('system_type', newType);
                  }
                }}
                title="Doble clic para editar"
              >
                {cotizacion.system_type}
                <span className="text-xs text-accent-primary ml-2">✏️</span>
                </div>
            </div>
            
            {/* Potencia - Editable */}
                <div>
              <label className="block text-sm font-medium text-text-secondary">Potencia (kWp)</label>
              <div 
                className="text-lg font-semibold text-text-primary cursor-pointer hover:bg-accent-primary/10 p-2 rounded transition-colors"
                onDoubleClick={() => {
                  const newPower = prompt('Nueva potencia en kWp:', cotizacion.power_kwp);
                  if (newPower !== null && !isNaN(parseFloat(newPower))) {
                    handleBasicFieldEdit('power_kwp', parseFloat(newPower));
                  }
                }}
                title="Doble clic para editar"
              >
                {cotizacion.power_kwp} kWp
                <span className="text-xs text-accent-primary ml-2">✏️</span>
              </div>
            </div>
            
            {/* Número de Paneles - Editable */}
                <div>
                <label className="block text-sm font-medium text-text-secondary">Número de Paneles</label>
              <div 
                className="text-lg font-semibold text-text-primary cursor-pointer hover:bg-accent-primary/10 p-2 rounded transition-colors"
                onDoubleClick={() => {
                  const newPanels = prompt('Nuevo número de paneles:', cotizacion.panel_count);
                  if (newPanels !== null && !isNaN(parseInt(newPanels))) {
                    handleBasicFieldEdit('panel_count', parseInt(newPanels));
                  }
                }}
                title="Doble clic para editar"
              >
                {cotizacion.panel_count}
                <span className="text-xs text-accent-primary ml-2">✏️</span>
                </div>
            </div>
            
            {/* Estado - Solo lectura */}
                <div>
                <label className="block text-sm font-medium text-text-secondary">Estado</label>
                <p className="text-lg font-semibold text-text-primary">{cotizacion.status?.name || 'N/A'}</p>
              </div>
            </div>
          
          {/* Información adicional */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Requiere Financiamiento</label>
              <p className="text-lg font-semibold text-text-primary">
                {cotizacion.requires_financing ? 'Sí' : 'No'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Fecha de Creación</label>
              <p className="text-lg font-semibold text-text-primary">
                {cotizacion.created_at ? formatDate(cotizacion.created_at) : 'N/A'}
              </p>
            </div>
          </div>
          </div>
      </Card>

          {/* Productos */}
      <Card extra="col-span-full">
        <div className="p-6 relative">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Productos</h2>
          {editableProducts && Array.isArray(editableProducts) && editableProducts.length > 0 ? (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="min-w-full divide-y divide-text-disabled/20">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-text-primary uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-primary uppercase tracking-wider">
                      Precio Unitario
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-text-primary uppercase tracking-wider">
                      % Utilidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-primary uppercase tracking-wider">
                      Valor Parcial
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-primary uppercase tracking-wider">
                      Utilidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-primary uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                                                  <tbody className="divide-y divide-text-disabled/20">
                  {editableProducts.map((product, index) => (
                    <tr key={product.used_product_id || index} className="hover:bg-accent-primary/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                          <ProductTooltip product={product}>
                            <span 
                              className="cursor-pointer hover:text-accent-primary transition-colors"
                              onDoubleClick={() => {
                                setSelectedProductIndex(index);
                                setShowProductModal(true);
                              }}
                            >
                              {product.product_type === 'panel' ? 'Panel Solar' : 
                               product.product_type === 'inverter' ? 'Inversor' : 
                               product.product_type === 'battery' ? 'Batería' : product.product_type}
                              {product.product_brand && product.product_model && (
                                <span className="text-xs text-text-secondary ml-2">
                                  ({product.product_brand} - {product.product_model})
                                </span>
                              )}
                              <span className="text-xs text-accent-primary ml-1">✏️</span>
                            </span>
                          </ProductTooltip>
                          

                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm text-text-primary cursor-pointer hover:bg-accent-primary/20 transition-colors text-center"
                          onDoubleClick={() => handleDoubleClick('product', index, 'quantity')}
                        >
                          {editingProduct.index === index && editingProduct.field === 'quantity' ? (
                            <input
                              type="text"
                              value={Math.round(parseFloat(product.quantity) || 0)}
                              onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                              onBlur={handleBlur}
                              onKeyPress={handleKeyPress}
                              className="w-full px-2 py-1 text-sm border border-accent-primary rounded focus:outline-none focus:ring-2 focus:ring-accent-primary bg-primary-card text-text-primary text-center"
                              autoFocus
                            />
                          ) : (
                            Math.round(parseFloat(product.quantity) || 0)
                          )}
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm text-text-primary cursor-pointer hover:bg-accent-primary/20 transition-colors text-right"
                          onDoubleClick={() => handleDoubleClick('product', index, 'unit_price')}
                        >
                          {editingProduct.index === index && editingProduct.field === 'unit_price' ? (
                            <input
                              type="text"
                              value={Math.round(parseFloat(product.unit_price) || 0)}
                              onChange={(e) => handleProductChange(index, 'unit_price', e.target.value)}
                              onBlur={handleBlur}
                              onKeyPress={handleKeyPress}
                              className="w-full px-2 py-1 text-sm border border-accent-primary rounded focus:outline-none focus:ring-2 focus:ring-accent-primary bg-primary-card text-text-primary text-right"
                              autoFocus
                            />
                          ) : (
                            formatNumber(product.unit_price)
                          )}
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm text-text-primary cursor-pointer hover:bg-accent-primary/20 transition-colors text-center"
                          onDoubleClick={() => handleDoubleClick('product', index, 'profit_percentage')}
                        >
                          {editingProduct.index === index && editingProduct.field === 'profit_percentage' ? (
                            <input
                              type="text"
                              value={product.profit_percentage ? Math.round(parseFloat(product.profit_percentage) * 100) : ''}
                              onChange={(e) => handleProductChange(index, 'profit_percentage', (parseFloat(e.target.value) / 100).toString())}
                              onBlur={handleBlur}
                              onKeyPress={handleKeyPress}
                              className="w-full px-2 py-1 text-sm border border-accent-primary rounded focus:outline-none focus:ring-2 focus:ring-accent-primary bg-primary-card text-text-primary text-center"
                              autoFocus
                            />
                          ) : (
                            `${Math.round((parseFloat(product.profit_percentage) || 0) * 100)}%`
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary text-right">
                          {formatNumber(product.partial_value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary text-right">
                          {formatNumber(product.profit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary text-right">
                          {formatNumber(product.total_value)}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-secondary">No hay productos asociados a esta cotización.</p>
          )}
          </div>
      </Card>

      {/* Items Adicionales */}
      <Card extra="col-span-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Items Adicionales</h2>
          {editableItems && Array.isArray(editableItems) && editableItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-text-disabled/20">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-text-primary uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Unidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-primary uppercase tracking-wider">
                      Precio Unitario
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-text-primary uppercase tracking-wider">
                      % Utilidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-primary uppercase tracking-wider">
                      Valor Parcial
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-primary uppercase tracking-wider">
                      Utilidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-primary uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                                                  <tbody className="divide-y divide-text-disabled/20">
                  {editableItems.map((item, index) => (
                    <tr key={item.item_id || index} className="hover:bg-accent-primary/10 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                          {item.description}
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm text-text-primary cursor-pointer hover:bg-accent-primary/20 transition-colors text-center"
                          onDoubleClick={() => handleDoubleClick('item', index, 'quantity')}
                        >
                          {editingItem.index === index && editingItem.field === 'quantity' ? (
                            <input
                              type="text"
                              value={Math.round(parseFloat(item.quantity) || 0)}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              onBlur={handleBlur}
                              onKeyPress={handleKeyPress}
                              className="w-full px-2 py-1 text-sm border border-accent-primary rounded focus:outline-none focus:ring-2 focus:ring-accent-primary bg-primary-card text-text-primary text-center"
                              autoFocus
                            />
                          ) : (
                            formatNumberWithoutDecimals(item.quantity)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          {item.unit}
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm text-text-primary cursor-pointer hover:bg-accent-primary/20 transition-colors text-right"
                          onDoubleClick={() => handleDoubleClick('item', index, 'unit_price')}
                        >
                          {editingItem.index === index && editingItem.field === 'unit_price' ? (
                            <input
                              type="text"
                              value={Math.round(parseFloat(item.unit_price) || 0)}
                              onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                              onBlur={handleBlur}
                              onKeyPress={handleKeyPress}
                              className="w-full px-2 py-1 text-sm border border-accent-primary rounded focus:outline-none focus:ring-2 focus:ring-accent-primary bg-primary-card text-text-primary text-right"
                              autoFocus
                            />
                          ) : (
                            formatNumber(item.unit_price)
                          )}
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-sm text-text-primary cursor-pointer hover:bg-accent-primary/20 transition-colors text-center"
                          onDoubleClick={() => handleDoubleClick('item', index, 'profit_percentage')}
                        >
                          {editingItem.index === index && editingItem.field === 'profit_percentage' ? (
                            <input
                              type="text"
                              value={item.profit_percentage ? Math.round(parseFloat(item.profit_percentage) * 100) : ''}
                              onChange={(e) => handleItemChange(index, 'profit_percentage', (parseFloat(e.target.value) / 100).toString())}
                              onBlur={handleBlur}
                              onKeyPress={handleKeyPress}
                              className="w-full px-2 py-1 text-sm border border-accent-primary rounded focus:outline-none focus:ring-2 focus:ring-accent-primary bg-primary-card text-text-primary text-center"
                              autoFocus
                            />
                          ) : (
                            `${Math.round((parseFloat(item.profit_percentage) || 0) * 100)}%`
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary text-right">
                          {formatNumber(item.partial_value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary text-right">
                          {formatNumber(item.profit)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary text-right">
                          {formatNumber(item.total_value)}
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-secondary">No hay items adicionales asociados a esta cotización.</p>
          )}
          </div>
      </Card>

          {/* Resumen de Costos */}
      <Card extra="col-span-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Resumen de Costos</h2>
          {(() => {
            // Calcular subtotal sumando todos los totales de productos e items
            const subtotalProductos = editableProducts?.reduce((sum, product) => {
              return sum + (parseFloat(product.total_value) || 0);
            }, 0) || 0;
            
            const subtotalItems = editableItems?.reduce((sum, item) => {
              return sum + (parseFloat(item.total_value) || 0);
            }, 0) || 0;
            
            const subtotalCalculado = subtotalProductos + subtotalItems;
            
            // Calcular los porcentajes basados en el subtotal calculado
            const profitPercentage = parseFloat(cotizacion.profit_percentage || 0);
            const ivaProfitPercentage = parseFloat(cotizacion.iva_profit_percentage || 0);
            const commercialManagementPercentage = parseFloat(cotizacion.commercial_management_percentage || 0);
            const administrationPercentage = parseFloat(cotizacion.administration_percentage || 0);
            const contingencyPercentage = parseFloat(cotizacion.contingency_percentage || 0);
            const withholdingPercentage = parseFloat(cotizacion.withholding_percentage || 0);
            const legalizationCostPercentage = parseFloat(cotizacion.legalization_cost_percentage || 0);
            
            // Cálculos siguiendo el orden de la imagen
            const subtotal = subtotalCalculado;
            const gestionComercial = subtotal * commercialManagementPercentage;
            const subtotal2 = subtotal + gestionComercial;
            const administracion = subtotal2 * administrationPercentage;
            const imprevistos = subtotal2 * contingencyPercentage;
            const utilidad = subtotal2 * profitPercentage;
            const ivaUtilidad = utilidad * 0.19; // IVA fijo del 19% sobre la utilidad
            const subtotal3 = subtotal2 + administracion + imprevistos + utilidad + ivaUtilidad;
            const retenciones = subtotal3 * withholdingPercentage;
            const cotizacionProyecto = subtotal3 + retenciones;
            
            // Actualizar el total_value de la cotización cuando hay cambios
            if (hasChanges && cotizacion.total_value !== cotizacionProyecto) {
              setCotizacion(prev => ({
                ...prev,
                total_value: cotizacionProyecto,
                subtotal: subtotal,
                subtotal2: subtotal2,
                subtotal3: subtotal3,
                profit: utilidad,
                profit_iva: ivaUtilidad,
                commercial_management: gestionComercial,
                administration: administracion,
                contingency: imprevistos,
                withholdings: retenciones
              }));
            }
            
                          return (
                <div className="space-y-4">
                  {/* Subtotal base */}
                  <div className="flex justify-between bg-primary-card p-3 rounded">
                    <span className="text-text-primary font-medium">Subtotal</span>
                    <span className="font-semibold">{formatNumber(subtotal)}</span>
                  </div>
                  
                  {/* Gestión Comercial */}
                  <div className="flex justify-between bg-accent-primary/10 p-3 rounded">
                    <span 
                      className="text-text-secondary cursor-pointer hover:bg-accent-primary/20 px-2 py-1 rounded transition-colors"
                      onDoubleClick={() => handlePercentageDoubleClick('commercial_management_percentage')}
                    >
                      {editingPercentage.field === 'commercial_management_percentage' ? (
                        <input
                          type="number"
                          value={percentageValue}
                          onChange={(e) => handlePercentageChange(e.target.value)}
                          onBlur={handlePercentageSave}
                          onKeyDown={handlePercentageKeyPress}
                          className="w-16 text-center border border-accent-primary rounded px-1 bg-primary-card text-text-primary"
                          autoFocus
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      ) : (
                        `Gestión Comercial (${(commercialManagementPercentage * 100).toFixed(1)}%)`
                      )}
                    </span>
                    <span className="font-semibold">{formatNumber(gestionComercial)}</span>
                  </div>
                  
                  {/* Subtotal 2 */}
                  <div className="flex justify-between bg-primary-card p-3 rounded">
                    <span className="text-text-primary font-medium">Subtotal 2</span>
                    <span className="font-semibold text-accent-primary">{formatNumber(subtotal2)}</span>
                  </div>
                  
                  {/* Administración */}
                  <div className="flex justify-between bg-accent-primary/10 p-3 rounded">
                    <span 
                      className="text-text-secondary cursor-pointer hover:bg-accent-primary/20 px-2 py-1 rounded transition-colors"
                      onDoubleClick={() => handlePercentageDoubleClick('administration_percentage')}
                    >
                      {editingPercentage.field === 'administration_percentage' ? (
                        <input
                          type="number"
                          value={percentageValue}
                          onChange={(e) => handlePercentageChange(e.target.value)}
                          onBlur={handlePercentageSave}
                          onKeyDown={handlePercentageKeyPress}
                          className="w-16 text-center border border-accent-primary rounded px-1 bg-primary-card text-text-primary"
                          autoFocus
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      ) : (
                        `Administración (${(administrationPercentage * 100).toFixed(1)}%)`
                      )}
                    </span>
                    <span className="font-semibold">{formatNumber(administracion)}</span>
                  </div>
                  
                  {/* Imprevistos */}
                  <div className="flex justify-between bg-accent-primary/10 p-3 rounded">
                    <span 
                      className="text-text-secondary cursor-pointer hover:bg-accent-primary/20 px-2 py-1 rounded transition-colors"
                      onDoubleClick={() => handlePercentageDoubleClick('contingency_percentage')}
                    >
                      {editingPercentage.field === 'contingency_percentage' ? (
                        <input
                          type="number"
                          value={percentageValue}
                          onChange={(e) => handlePercentageChange(e.target.value)}
                          onBlur={handlePercentageSave}
                          onKeyDown={handlePercentageKeyPress}
                          className="w-16 text-center border border-accent-primary rounded px-1 bg-primary-card text-text-primary"
                          autoFocus
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      ) : (
                        `Imprevistos (${(contingencyPercentage * 100).toFixed(1)}%)`
                      )}
                    </span>
                    <span className="font-semibold">{formatNumber(imprevistos)}</span>
                  </div>
                  
                  {/* Utilidad */}
                  <div className="flex justify-between bg-accent-primary/10 p-3 rounded">
                    <span 
                      className="text-text-secondary cursor-pointer hover:bg-accent-primary/20 px-2 py-1 rounded transition-colors"
                      onDoubleClick={() => handlePercentageDoubleClick('profit_percentage')}
                    >
                      {editingPercentage.field === 'profit_percentage' ? (
                        <input
                          type="number"
                          value={percentageValue}
                          onChange={(e) => handlePercentageChange(e.target.value)}
                          onBlur={handlePercentageSave}
                          onKeyDown={handlePercentageKeyPress}
                          className="w-16 text-center border border-accent-primary rounded px-1 bg-primary-card text-text-primary"
                          autoFocus
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      ) : (
                        `Utilidad (${(profitPercentage * 100).toFixed(1)}%)`
                      )}
                    </span>
                    <span className="font-semibold">{formatNumber(utilidad)}</span>
                  </div>
                  
                  {/* IVA sobre la utilidad */}
                  <div className="flex justify-between bg-accent-primary/10 p-3 rounded">
                    <span className="text-text-secondary">
                      IVA sobre la utilidad (19.0%)
                    </span>
                    <span className="font-semibold">{formatNumber(ivaUtilidad)}</span>
                  </div>
                  
                  {/* Subtotal 3 */}
                  <div className="flex justify-between bg-primary-card p-3 rounded">
                    <span className="text-text-primary font-medium">Subtotal 3</span>
                    <span className="font-semibold text-accent-primary">{formatNumber(subtotal3)}</span>
                  </div>
                  
                  {/* Retenciones */}
                  <div className="flex justify-between bg-accent-primary/10 p-3 rounded">
                    <span 
                      className="text-text-secondary cursor-pointer hover:bg-accent-primary/20 px-2 py-1 rounded transition-colors"
                      onDoubleClick={() => handlePercentageDoubleClick('withholding_percentage')}
                    >
                      {editingPercentage.field === 'withholding_percentage' ? (
                        <input
                          type="number"
                          value={percentageValue}
                          onChange={(e) => handlePercentageChange(e.target.value)}
                          onBlur={handlePercentageSave}
                          onKeyDown={handlePercentageKeyPress}
                          className="w-16 text-center border border-accent-primary rounded px-1 bg-primary-card text-text-primary"
                          autoFocus
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      ) : (
                        `Retenciones (${(withholdingPercentage * 100).toFixed(1)}%)`
                      )}
                    </span>
                    <span className="font-semibold">{formatNumber(retenciones)}</span>
                  </div>
                  
                  {/* Cotización del proyecto */}
                  <div className="flex justify-between bg-primary-card p-3 rounded">
                    <span className="text-text-primary font-medium">Cotización del proyecto</span>
                    <div className="text-right">
                      <span className="font-semibold text-accent-primary text-lg">{formatNumber(cotizacionProyecto)}</span>
                      {hasChanges && (
                        <p className="text-xs text-orange-500 mt-1">
                          🔄 Calculado en tiempo real
                        </p>
                      )}
                    </div>
                  </div>
                </div>
            );
          })()}
        </div>
      </Card>

      {/* Información Adicional */}
      <Card extra="col-span-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Información Adicional</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary">Vendedor</label>
              <p className="text-lg font-semibold text-text-primary">{cotizacion.user?.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Fecha de Creación</label>
              <p className="text-lg font-semibold text-text-primary">{formatDate(cotizacion.creation_date)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Última Actualización</label>
              <p className="text-lg font-semibold text-text-primary">
                {cotizacion.updated_at ? formatDate(cotizacion.updated_at) : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Requiere Financiamiento</label>
              <p className="text-lg font-semibold text-text-primary">
                {cotizacion.requires_financing ? 'Sí' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de edición */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Cotización">
        {formData && (
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Nombre del Proyecto</label>
              <input 
                type="text" 
                className="w-full border border-text-disabled/30 rounded px-2 py-1 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none" 
                value={formData.nombre_proyecto} 
                onChange={e => handleFormChange('nombre_proyecto', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Tipo de Sistema</label>
              <input 
                type="text" 
                className="w-full border border-text-disabled/30 rounded px-2 py-1 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none" 
                value={formData.tipo_sistema} 
                onChange={e => handleFormChange('tipo_sistema', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Potencia (kWp)</label>
              <input 
                type="number" 
                className="w-full border border-text-disabled/30 rounded px-2 py-1 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none" 
                value={formData.potencia_kwp} 
                onChange={e => handleFormChange('potencia_kwp', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Número de Paneles</label>
              <input 
                type="number" 
                className="w-full border border-text-disabled/30 rounded px-2 py-1 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none" 
                value={formData.numero_paneles} 
                onChange={e => handleFormChange('numero_paneles', e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary">Estado</label>
              <select 
                className="w-full border border-text-disabled/30 rounded px-2 py-1 bg-primary-card text-text-primary focus:border-accent-primary focus:outline-none" 
                value={formData.status_id} 
                onChange={e => handleFormChange('status_id', e.target.value)}
              >
                {statuses.map(s => (
                  <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
                ))}
              </select>
            </div>
            {editError && (
              <div className="text-red-400 text-sm">{editError}</div>
            )}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-text-disabled/30 rounded text-text-secondary hover:bg-accent-primary/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-hover disabled:opacity-50 transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal para cambiar productos */}
      <Modal 
        isOpen={showProductModal} 
        onClose={() => setShowProductModal(false)} 
        title={`Cambiar ${selectedProductIndex !== null && editableProducts[selectedProductIndex] ? 
          (editableProducts[selectedProductIndex].product_type === 'panel' ? 'Panel' : 
           editableProducts[selectedProductIndex].product_type === 'inverter' ? 'Inversor' : 'Batería') : 'Producto'}`}
      >
        {selectedProductIndex !== null && editableProducts[selectedProductIndex] && (
          <div className="space-y-4">
            <div className="bg-accent-primary/10 p-3 rounded">
              <h4 className="font-semibold text-text-primary mb-2">Producto Actual:</h4>
              <p className="text-text-secondary">
                {editableProducts[selectedProductIndex].product_brand} - {editableProducts[selectedProductIndex].product_model}
                {editableProducts[selectedProductIndex].product_power && ` (${editableProducts[selectedProductIndex].product_power})`}
              </p>
            </div>

            {editableProducts[selectedProductIndex].product_type === 'inverter' && (
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Restricción:</strong> Solo se muestran inversores del mismo tipo de red: 
                  <span className="font-semibold">
                    {editableProducts[selectedProductIndex].product?.grid_type || editableProducts[selectedProductIndex].product?.system_type}
                  </span>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Los inversores deben ser compatibles con el tipo de sistema actual.
                </p>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-2"></div>
                    <p className="text-text-secondary">Cargando productos...</p>
                  </div>
                </div>
              ) : (
              <table className="min-w-full divide-y divide-text-disabled/20">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Marca
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Especificación
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-text-primary uppercase tracking-wider">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-text-disabled/20">
                  {(() => {
                    const currentProduct = editableProducts[selectedProductIndex];
                    let productsToShow = [];
                    
                    if (currentProduct.product_type === 'panel') {
                      productsToShow = Array.isArray(availablePanels) ? availablePanels : [];
                    } else if (currentProduct.product_type === 'inverter') {
                      productsToShow = getFilteredInverters(currentProduct);
                    } else if (currentProduct.product_type === 'battery') {
                      productsToShow = Array.isArray(availableBatteries) ? availableBatteries : [];
                    }

                    return productsToShow.map((product) => {
                      const isCurrentProduct = product.panel_id === currentProduct.product_id || 
                                             product.inverter_id === currentProduct.product_id || 
                                             product.battery_id === currentProduct.product_id;
                      
                      return (
                        <tr key={product.panel_id || product.inverter_id || product.battery_id} 
                            className={`hover:bg-accent-primary/10 transition-colors ${
                              isCurrentProduct ? 'bg-accent-primary/20' : ''
                            }`}>
                          <td className="px-4 py-3 text-sm text-text-primary">
                            {product.brand}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-primary">
                            {product.model}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-primary">
                            {currentProduct.product_type === 'panel' ? `${product.power} W` : 
                             currentProduct.product_type === 'inverter' ? `${product.power} W` : 
                             `${product.capacity} Ah`}
                            {currentProduct.product_type === 'inverter' && product.system_type && (
                              <span className="text-xs text-text-secondary ml-1">
                                ({product.system_type})
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-primary">
                            {formatNumber(product.price)}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-primary">
                            {isCurrentProduct ? (
                              <span className="text-green-500 font-medium">Actual</span>
                            ) : (
                              <button
                                onClick={() => {
                                  const productId = product.panel_id || product.inverter_id || product.battery_id;
                                  handleProductChange(selectedProductIndex, 'product_id', productId.toString());
                                  setShowProductModal(false);
                                }}
                                className="bg-accent-primary text-white px-3 py-1 rounded text-xs hover:bg-accent-hover transition-colors"
                              >
                                Seleccionar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
              )}
            </div>

            {(() => {
               const currentProduct = editableProducts[selectedProductIndex];
               let productsToShow = [];
               
               if (currentProduct.product_type === 'panel') {
                 productsToShow = Array.isArray(availablePanels) ? availablePanels : [];
               } else if (currentProduct.product_type === 'inverter') {
                 productsToShow = getFilteredInverters(currentProduct);
               } else if (currentProduct.product_type === 'battery') {
                 productsToShow = Array.isArray(availableBatteries) ? availableBatteries : [];
               }

              return productsToShow.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-text-secondary">No hay productos disponibles de este tipo.</p>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Sistema de Notificaciones */}
      <NotificationManager mensajes={mensajes} />
    </div>
  );
};

export default DetalleCotizacion;