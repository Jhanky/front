import React, { useEffect, useState, useMemo } from "react";
import Card from "components/card";
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdUpload, MdCloudUpload, MdFilterList, MdSearch, MdClear, MdBarChart, MdWarning, MdSchedule, MdError, MdFileDownload } from "react-icons/md";
import { getApiUrl, API_CONFIG } from "config/api";
import { useAuth } from "context/AuthContext";
import Modal from "components/modal";
import Loading from "components/loading";
import { catalogosService } from "services/catalogosService";
import { facturasService } from "services/facturasService";




const Facturas = () => {
  const { user } = useAuth();
  
  // Estados principales - declarar primero
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Verificar si el usuario es contador (rol 8) - múltiples formas de verificar
  const isContador = user?.roles?.some(role => role.id === 8) || 
                    user?.roles?.some(role => role.id === "8") ||
                    user?.role_id === 8 ||
                    user?.role_id === "8" ||
                    (user?.roles && user.roles.length > 0 && user.roles[0].id === 8) ||
                    (user?.roles && user.roles.length > 0 && user.roles[0].id === "8");
  
  // Debug: Verificar la estructura del usuario y roles
  console.log('🔍 DEBUG: Usuario completo:', user);
  console.log('🔍 DEBUG: Roles del usuario:', user?.roles);
  console.log('🔍 DEBUG: Es contador:', isContador);
  console.log('🔍 DEBUG: Facturas cargadas:', facturas.length);
  console.log('🔍 DEBUG: Estado de carga:', loading);
  console.log('🔍 DEBUG: Error:', error);
  
  // Debug adicional para roles
  if (user?.roles) {
    user.roles.forEach((role, index) => {
      console.log(`🔍 DEBUG: Rol ${index}:`, role);
      console.log(`🔍 DEBUG: Rol ${index} ID:`, role.id);
      console.log(`🔍 DEBUG: Rol ${index} es 8?:`, role.id === 8);
      console.log(`🔍 DEBUG: Rol ${index} es "8"?:`, role.id === "8");
    });
  }
  
  // Debug de todas las condiciones
  console.log('🔍 DEBUG: user?.roles?.some(role => role.id === 8):', user?.roles?.some(role => role.id === 8));
  console.log('🔍 DEBUG: user?.roles?.some(role => role.id === "8"):', user?.roles?.some(role => role.id === "8"));
  console.log('🔍 DEBUG: user?.role_id === 8:', user?.role_id === 8);
  console.log('🔍 DEBUG: user?.role_id === "8":', user?.role_id === "8");
  console.log('🔍 DEBUG: user?.roles[0]?.id === 8:', user?.roles?.[0]?.id === 8);
  console.log('🔍 DEBUG: user?.roles[0]?.id === "8":', user?.roles?.[0]?.id === "8");
  
  // Debug específico para contador
  if (isContador) {
    console.log('🔍 DEBUG: USUARIO ES CONTADOR - Verificando permisos...');
    console.log('🔍 DEBUG: Token del usuario:', user?.token ? 'Presente' : 'Ausente');
    console.log('🔍 DEBUG: ID del usuario:', user?.id);
    console.log('🔍 DEBUG: Nombre del usuario:', user?.name);
  }
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isQuickEditModalOpen, setIsQuickEditModalOpen] = useState(false);
  const [isCreateBasicModalOpen, setIsCreateBasicModalOpen] = useState(false);
  const [isUploadDocumentsModalOpen, setIsUploadDocumentsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: "",
    invoice_date: "",
    due_date: "",
    subtotal: "",
    iva_amount: "",
    retention: "",
    total_amount: "",
    description: "",
    status: "",
    sale_type: "",
    payment_method: "",
    provider_id: "",
    cost_center_id: ""
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  // Estados para el modal de upload
  const [uploadFile, setUploadFile] = useState(null); // Archivo de factura (PDF)
  const [paymentSupportFile, setPaymentSupportFile] = useState(null); // Archivo de soporte de pago (imagen)
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [centrosCosto, setCentrosCosto] = useState([]);
  const [uploadFormData, setUploadFormData] = useState({
    cost_center_id: "",
    status: "PENDIENTE"
  });

  // Estados para el modal de edición rápida
  const [quickEditData, setQuickEditData] = useState({
    cost_center_id: "",
    status: ""
  });
  const [quickEditLoading, setQuickEditLoading] = useState(false);
  const [quickEditError, setQuickEditError] = useState("");
  const [quickEditCentrosCosto, setQuickEditCentrosCosto] = useState([]);

  // Estados para el modal de crear factura básica
  const [basicFormData, setBasicFormData] = useState({
    invoice_number: "",
    invoice_date: "",
    due_date: "",
    subtotal: "",
    retention: "",
    status: "PENDIENTE",
    sale_type: "CREDITO",
    payment_method_id: "",
    provider_id: "",
    cost_center_id: "",
    description: ""
  });
  const [basicFormLoading, setBasicFormLoading] = useState(false);
  const [basicFormError, setBasicFormError] = useState("");

  // Estados para el modal de subir documentos
  const [uploadDocumentsData, setUploadDocumentsData] = useState({
    payment_support: null,
    invoice_file: null
  });
  const [uploadDocumentsLoading, setUploadDocumentsLoading] = useState(false);
  const [uploadDocumentsError, setUploadDocumentsError] = useState("");

  // Estados para filtros
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    provider_id: "",
    cost_center_id: "",
    month: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados para opciones de filtros
  const [providers, setProviders] = useState([]);
  const [costCenters, setCostCenters] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(false);


  // Estados para facturas próximas a vencer
  const [facturasProximasVencer, setFacturasProximasVencer] = useState(null);
  const [showFacturasProximasVencer, setShowFacturasProximasVencer] = useState(false);
  const [diasFiltro, setDiasFiltro] = useState(30);

  // Estados para generación de Excel
  const [generatingExcel, setGeneratingExcel] = useState(false);

  // Estados únicos para filtros
  const estadosUnicos = useMemo(() => {
    const estados = [...new Set(facturas.map(f => f.status).filter(Boolean))];
    return estados.sort();
  }, [facturas]);

  const proyectosUnicos = useMemo(() => {
    // Obtener todos los proyectos únicos de la nueva estructura
    const proyectosMap = new Map();
    
    facturas.forEach(factura => {
      if (factura.project && factura.project.name) {
        // Usar el nombre del proyecto como ID único
        const projectName = factura.project.name;
        proyectosMap.set(projectName, {
          id: projectName,
          name: projectName
        });
      }
    });
    
    const proyectosUnicos = Array.from(proyectosMap.values()).sort((a, b) => {
      const nameA = String(a.name || '');
      const nameB = String(b.name || '');
      return nameA.localeCompare(nameB);
    });
    console.log('Proyectos únicos encontrados:', proyectosUnicos);
    return proyectosUnicos;
  }, [facturas]);

  const selectRef = React.useRef(null);



  // Los filtros ahora se manejan en el servidor, no necesitamos filtrado local

  // Función para cargar facturas
  const fetchFacturas = async (filterParams = {}) => {
    setLoading(true);
    setError("");
    try {
      console.log('🔍 DEBUG: Cargando facturas con filtros:', filterParams);
      console.log('🔍 DEBUG: Usuario es contador:', isContador);
      console.log('🔍 DEBUG: Token del usuario:', user?.token ? 'Presente' : 'Ausente');
      console.log('🔍 DEBUG: ID del usuario:', user?.id);
      
      const data = await facturasService.getFacturas(filterParams);
      
      if (data.success && data.data) {
        // Procesar facturas con formateo
        let facturasFormateadas = [];
        let paginationData = {};
        
        if (Array.isArray(data.data.data)) {
          // Estructura paginada - usar datos directamente
          facturasFormateadas = data.data.data;
          paginationData = {
            current_page: data.data.current_page || 1,
            last_page: data.data.last_page || 1,
            per_page: data.data.per_page || 15,
            total: data.data.total || 0,
            from: data.data.from || 0,
            to: data.data.to || 0
          };
        } else if (Array.isArray(data.data)) {
          // Estructura directa - usar datos directamente
          facturasFormateadas = data.data;
          paginationData = {
            current_page: 1,
            last_page: 1,
            per_page: facturasFormateadas.length,
            total: facturasFormateadas.length,
            from: 1,
            to: facturasFormateadas.length
          };
        }
        
        console.log('📊 DEBUG: Facturas formateadas:', facturasFormateadas);
        console.log('📊 DEBUG: Primera factura:', facturasFormateadas[0]);
        
        // Debug específico para contador
        if (isContador) {
          console.log('🔍 DEBUG: CONTADOR - Facturas recibidas:', facturasFormateadas.length);
          if (facturasFormateadas.length === 0) {
            console.log('🔍 DEBUG: CONTADOR - No hay facturas disponibles');
          }
        }
        
        setFacturas(facturasFormateadas);
        setPagination(paginationData);
      } else if (Array.isArray(data)) {
        // Usar datos directamente sin formateo adicional
        setFacturas(data);
        setPagination({
          current_page: 1,
          last_page: 1,
          per_page: data.length,
          total: data.length,
          from: 1,
          to: data.length
        });
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (err) {
      console.error('Error al cargar facturas:', err);
      
      // Debug específico para contador
      if (isContador) {
        console.log('🔍 DEBUG: CONTADOR - Error al cargar facturas:', err);
        console.log('🔍 DEBUG: CONTADOR - Mensaje de error:', err.message);
        console.log('🔍 DEBUG: CONTADOR - Status del error:', err.status);
      }
      
      setError('Error al cargar las facturas. Por favor, intenta de nuevo.');
      setFacturas([]);
      setPagination({
        current_page: 1,
        last_page: 1,
        per_page: 0,
        total: 0,
        from: 0,
        to: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  // Cargar opciones de filtros cuando se abren
  useEffect(() => {
    if (showFilters && (providers.length === 0 || costCenters.length === 0)) {
      loadFilterOptions();
    }
  }, [showFilters]);

  // Aplicar filtros automáticamente solo para búsqueda (con debounce)
  useEffect(() => {
    if (filters.search && filters.search.trim()) {
      const timeoutId = setTimeout(() => {
        applyFilters();
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [filters.search]);

  // Aplicar filtros automáticamente para selecciones (estado, proveedor, centro de costo, mes)
  useEffect(() => {
    if (filters.status || filters.provider_id || filters.cost_center_id || filters.month) {
      applyFilters();
    }
  }, [filters.status, filters.provider_id, filters.cost_center_id, filters.month]);

  // Cargar catálogos cuando se abre el modal de upload
  useEffect(() => {
    if (isUploadModalOpen) {
      loadCatalogos();
    }
  }, [isUploadModalOpen]);

  const loadCatalogos = async () => {
    try {
      console.log('🔍 DEBUG: Cargando catálogos para facturas...');
      
      const [proyectosData, centrosCostoData] = await Promise.all([
        catalogosService.getProyectos(),
        catalogosService.getCentrosCosto({ status: 'activo', per_page: 50 })
      ]);
      
      console.log('📋 DEBUG: Datos de catálogos recibidos:', { proyectosData, centrosCostoData });
      
      // Procesar proyectos
      let proyectosFormateados = [];
      if (Array.isArray(proyectosData)) {
        proyectosFormateados = proyectosData;
      } else if (proyectosData.data) {
        proyectosFormateados = Array.isArray(proyectosData.data) ? proyectosData.data : [];
      }
      
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
      } else if (Array.isArray(centrosCostoData)) {
        centrosCostoFormateados = centrosCostoData.map(centro => 
          catalogosService.formatCentroCostoForFrontend(centro)
        );
      }
      
      console.log('✅ DEBUG: Catálogos formateados:', { proyectosFormateados, centrosCostoFormateados });
      
      setProyectos(proyectosFormateados);
      setCentrosCosto(centrosCostoFormateados);
      setUploadError(""); // Limpiar error
      
    } catch (error) {
      console.error('Error al cargar catálogos:', error);
      setUploadError('Error al cargar los catálogos. Por favor, intenta de nuevo.');
    }
  };

  const handleView = async (factura) => {
    try {
      setLoading(true);
      // Obtener detalles completos de la factura
      const data = await facturasService.getFacturaDetalles(factura.id);
      if (data.success && data.data) {
        const formattedData = facturasService.formatFacturaDetallesForFrontend(data);
        setSelectedFactura(formattedData);
        setShowModal(true);
      } else {
        // Fallback a datos básicos si no se pueden obtener los detalles
        setSelectedFactura(factura);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error al obtener detalles de factura:', error);
      // Fallback a datos básicos en caso de error
      setSelectedFactura(factura);
      setShowModal(true);
    } finally {
      setLoading(false);
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
    const filterParams = {
      page: 1, // Resetear a la primera página al aplicar filtros
      per_page: pagination.per_page
    };
    
    // Solo agregar filtros que tengan valor
    if (filters.search && filters.search.trim()) {
      filterParams.search = filters.search.trim();
    }
    if (filters.status) {
      filterParams.status = filters.status;
    }
    if (filters.provider_id) {
      filterParams.provider_id = parseInt(filters.provider_id);
    }
    if (filters.cost_center_id) {
      filterParams.cost_center_id = parseInt(filters.cost_center_id);
    }
    if (filters.month) {
      const [yearStr, monthStr] = filters.month.split('-');
      filterParams.invoice_month = parseInt(monthStr, 10);
      filterParams.invoice_year = parseInt(yearStr, 10);
    }
    
    fetchFacturas(filterParams);
  };

  // Función para cambiar de página
  const handlePageChange = (page) => {
    const filterParams = {
      page: page,
      per_page: pagination.per_page
    };
    if (filters.search) filterParams.search = filters.search;
    if (filters.status) filterParams.status = filters.status;
    if (filters.provider_id) filterParams.provider_id = filters.provider_id;
    if (filters.cost_center_id) filterParams.cost_center_id = filters.cost_center_id;
    if (filters.month) {
      const [yearStr, monthStr] = filters.month.split('-');
      filterParams.invoice_month = parseInt(monthStr, 10);
      filterParams.invoice_year = parseInt(yearStr, 10);
    }
    
    fetchFacturas(filterParams);
  };

  // Función para cambiar elementos por página
  const handlePerPageChange = (perPage) => {
    const filterParams = {
      page: 1, // Resetear a la primera página
      per_page: perPage
    };
    if (filters.search) filterParams.search = filters.search;
    if (filters.status) filterParams.status = filters.status;
    if (filters.provider_id) filterParams.provider_id = filters.provider_id;
    if (filters.cost_center_id) filterParams.cost_center_id = filters.cost_center_id;
    if (filters.month) {
      const [yearStr, monthStr] = filters.month.split('-');
      filterParams.invoice_month = parseInt(monthStr, 10);
      filterParams.invoice_year = parseInt(yearStr, 10);
    }
    
    fetchFacturas(filterParams);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      provider_id: "",
      cost_center_id: "",
      month: ""
    });
    fetchFacturas();
  };

  // Función para cargar estadísticas
  // Función para cargar opciones de filtros
  const loadFilterOptions = async () => {
    setLoadingFilters(true);
    try {
      // Cargar proveedores desde las facturas existentes
      const facturasData = await facturasService.getFacturas({ per_page: 1000 });
      if (facturasData.success && facturasData.data?.data) {
        const uniqueProviders = {};
        const uniqueCostCenters = {};
        
        facturasData.data.data.forEach(factura => {
          if (factura.provider) {
            uniqueProviders[factura.provider.provider_id] = {
              id: factura.provider.provider_id,
              name: factura.provider.provider_name,
              nit: factura.provider.NIT
            };
          }
          if (factura.cost_center) {
            uniqueCostCenters[factura.cost_center.cost_center_id] = {
              id: factura.cost_center.cost_center_id,
              name: factura.cost_center.cost_center_name
            };
          }
        });
        
        setProviders(Object.values(uniqueProviders));
        setCostCenters(Object.values(uniqueCostCenters));
      }
    } catch (error) {
      console.error('Error al cargar opciones de filtros:', error);
    } finally {
      setLoadingFilters(false);
    }
  };


  // Función para cargar facturas próximas a vencer
  const loadFacturasProximasVencer = async (days = 30) => {
    try {
      const data = await facturasService.getFacturasProximasVencer(days);
      if (data.success && data.data) {
        const formattedData = facturasService.formatFacturasProximasVencer(data);
        setFacturasProximasVencer(formattedData);
      }
    } catch (error) {
      console.error('Error al cargar facturas próximas a vencer:', error);
    }
  };

  // Función para generar Excel usando el backend
  const generateExcelReport = async () => {
    setGeneratingExcel(true);
    
    try {
      // Preparar parámetros basados en los filtros actuales
      const reportParams = new URLSearchParams();
      
      // Mapear filtros actuales a parámetros del endpoint
      if (filters.status) {
        reportParams.append('status', filters.status);
      }
      if (filters.provider_id) {
        reportParams.append('provider_id', filters.provider_id);
      }
      if (filters.cost_center_id) {
        reportParams.append('cost_center_id', filters.cost_center_id);
      }
      if (filters.month) {
        const [yearStr, monthStr] = filters.month.split('-');
        reportParams.append('invoice_month', parseInt(monthStr, 10));
        reportParams.append('invoice_year', parseInt(yearStr, 10));
      }
      if (filters.search && filters.search.trim()) {
        reportParams.append('search', filters.search.trim());
      }
      
      // Construir la URL del endpoint
      const reportUrl = getApiUrl(`/api/invoices/report?${reportParams.toString()}`);
      
      console.log('🔍 DEBUG: Generando reporte Excel con URL:', reportUrl);
      console.log('🔍 DEBUG: Parámetros:', Object.fromEntries(reportParams));
      
      // Realizar la petición al backend
      const response = await fetch(reportUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }
      
      // Obtener el blob del archivo Excel
      const blob = await response.blob();
      
      // Crear URL temporal para descarga
      const url = window.URL.createObjectURL(blob);
      
      // Crear elemento de descarga
      const a = document.createElement('a');
      a.href = url;
      
      // Generar nombre de archivo basado en filtros aplicados
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
      
      let fileName = `reporte_facturas_${dateStr}_${timeStr}.xlsx`;
      
      // Personalizar nombre según filtros aplicados
      if (filters.status) {
        fileName = `reporte_facturas_${filters.status.toLowerCase()}_${dateStr}_${timeStr}.xlsx`;
      }
      if (filters.month) {
        const [year, month] = filters.month.split('-');
        fileName = `reporte_facturas_${year}_${month}_${dateStr}_${timeStr}.xlsx`;
      }
      
      a.download = fileName;
      
      // Trigger descarga
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Limpiar URL temporal
      window.URL.revokeObjectURL(url);
      
      // Mostrar notificación de éxito
      showNotification('Reporte Excel generado exitosamente', 'success');
      
    } catch (error) {
      console.error('Error al generar reporte Excel:', error);
      showNotification(`Error al generar el reporte: ${error.message}`, 'error');
    } finally {
      setGeneratingExcel(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Evitar desplazamientos por zona horaria usando operaciones sobre cadena
    // Soporta: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss(.sss)Z y variantes
    const str = String(dateString);
    const base = str.length >= 10 ? str.slice(0, 10) : str;
    const match = base.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, y, m, d] = match;
      // Formato local es-CO (DD/MM/AAAA)
      return `${d}/${m}/${y}`;
    }
    // Fallback seguro
    try {
      return new Date(str).toLocaleDateString('es-CO');
    } catch {
      return str;
    }
  };
  // Devuelve { date_from, date_to } para un mes dado en formato YYYY-MM
  const getMonthRange = (yearMonth) => {
    if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) return null;
    const [y, m] = yearMonth.split('-');
    const lastDay = new Date(parseInt(y, 10), parseInt(m, 10), 0).getDate();
    return { date_from: `${y}-${m}-01`, date_to: `${y}-${m}-${String(lastDay).padStart(2, '0')}` };
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  // Función para calcular IVA automáticamente (19%)
  const calculateIVA = (subtotal) => {
    if (!subtotal || isNaN(subtotal)) return 0;
    return parseFloat(subtotal) * 0.19;
  };

  // Función para calcular total automáticamente
  const calculateTotal = (subtotal, iva, retention = 0) => {
    if (!subtotal || isNaN(subtotal)) return 0;
    const subtotalNum = parseFloat(subtotal);
    const ivaNum = iva || calculateIVA(subtotal);
    const retentionNum = parseFloat(retention) || 0;
    return subtotalNum + ivaNum - retentionNum;
  };

  // Función para manejar cambios en el subtotal
  const handleSubtotalChange = (value) => {
    const subtotal = parseFloat(value) || 0;
    const iva = calculateIVA(subtotal);
    const total = calculateTotal(subtotal, iva, formData.retention);
    
    setFormData(prev => ({
      ...prev,
      subtotal: value,
      iva_amount: iva.toFixed(2),
      total_amount: total.toFixed(2)
    }));
  };

  // Función para manejar cambios en la retención
  const handleRetentionChange = (value) => {
    const retention = parseFloat(value) || 0;
    const subtotal = parseFloat(formData.subtotal) || 0;
    const iva = calculateIVA(subtotal);
    const total = calculateTotal(subtotal, iva, retention);
    
    setFormData(prev => ({
      ...prev,
      retention: value,
      total_amount: total.toFixed(2)
    }));
  };


  // Funciones auxiliares para niveles de urgencia
  const getUrgencyColor = (urgencyLevel) => {
    return facturasService.getUrgencyColor(urgencyLevel);
  };

  const getUrgencyText = (urgencyLevel) => {
    return facturasService.getUrgencyText(urgencyLevel);
  };

  const getUrgencyIcon = (urgencyLevel) => {
    switch (urgencyLevel) {
      case 'critical':
        return <MdError className="w-4 h-4" />;
      case 'high':
        return <MdWarning className="w-4 h-4" />;
      case 'medium':
        return <MdSchedule className="w-4 h-4" />;
      case 'low':
        return <MdError className="w-4 h-4" />;
      default:
        return <MdError className="w-4 h-4" />;
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFactura(null);
  };



  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleCreate = () => {
    setFormData({
      invoice_number: "",
      invoice_date: "",
      due_date: "",
      subtotal: "",
      iva_amount: "",
      retention: "",
      total_amount: "",
      description: "",
      status: "",
      sale_type: "",
      payment_method: "",
      provider_id: "",
      cost_center_id: ""
    });
    setFormError("");
    setIsCreateModalOpen(true);
  };

  const handleEdit = (factura) => {
    setSelectedFactura(factura);
    setFormData({
      invoice_number: factura.number || "",
      invoice_date: factura.date ? factura.date.split('T')[0] : "",
      due_date: factura.due_date ? factura.due_date.split('T')[0] : "",
      subtotal: factura.subtotal || "",
      iva_amount: factura.iva_amount || "",
      retention: factura.retention || "",
      total_amount: factura.total_amount || factura.amount || "",
      description: factura.description || "",
      status: factura.status || "",
      sale_type: factura.sale_type || "",
      payment_method: factura.payment_method || "",
      provider_id: factura.provider_id || "",
      cost_center_id: factura.cost_center_id || ""
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleDelete = (factura) => {
    setSelectedFactura(factura);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (!formData.invoice_number || !formData.invoice_date || !formData.total_amount) {
        throw new Error("Por favor complete los campos obligatorios");
      }

      const url = selectedFactura 
        ? getApiUrl(`/api/invoices/${selectedFactura.id}`)
        : getApiUrl('/api/invoices');
      
      const method = selectedFactura ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${selectedFactura ? 'actualizar' : 'crear'} la factura`);
      }

      const facturaData = await response.json();

      // Actualización dinámica del estado local
      if (selectedFactura) {
        setFacturas(prev => prev.map(factura => 
          factura.id === selectedFactura.id ? facturaData : factura
        ));
      } else {
        setFacturas(prev => [...prev, facturaData]);
      }

      const successMessage = selectedFactura 
        ? `Factura "${formData.invoice_number}" actualizada exitosamente`
        : `Factura "${formData.invoice_number}" creada exitosamente`;
      showNotification(successMessage, "success");

      // Cerrar modal
      if (selectedFactura) {
        setIsEditModalOpen(false);
      } else {
        setIsCreateModalOpen(false);
      }
      setSelectedFactura(null);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(getApiUrl(`/api/invoices/${selectedFactura.id}`), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la factura");
      }

      // Actualización dinámica del estado local
      setFacturas(prev => prev.filter(factura => factura.id !== selectedFactura.id));

              showNotification(`Factura "${selectedFactura.number}" eliminada exitosamente`, "success");

      setIsDeleteModalOpen(false);
      setSelectedFactura(null);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Función para cambiar el estado de la factura
  const handleStatusChange = async (factura, newStatus) => {
    if (factura.status === newStatus) return; // No hacer nada si el estado es el mismo
    
    // Confirmación antes de cambiar el estado
    const statusText = newStatus === 'PAGADA' ? 'Pagada' : 'Pendiente';
    const currentStatusText = factura.status === 'PAGADA' ? 'Pagada' : 'Pendiente';
    
    if (!window.confirm(`¿Estás seguro de que quieres cambiar el estado de la factura "${factura.invoice_number}" de "${currentStatusText}" a "${statusText}"?`)) {
      return;
    }
    
    setFormLoading(true);
    try {
      const response = await fetch(getApiUrl(`/api/invoices/${factura.invoice_id}`), {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar el estado de la factura");
      }

      // Actualización dinámica del estado local
      setFacturas(prev => prev.map(f => 
        f.invoice_id === factura.invoice_id 
          ? { ...f, status: newStatus }
          : f
      ));

      showNotification(`Estado de la factura "${factura.invoice_number}" cambiado a ${statusText}`, "success");
      
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showNotification(`Error al cambiar el estado: ${error.message}`, "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Función para cargar centros de costo para el modal de edición
  const loadQuickEditCentrosCosto = async () => {
    try {
      const response = await fetch(getApiUrl('/api/cost-centers?status=activo&per_page=50'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar centros de costo');
      }

      const data = await response.json();
      
      // Procesar la respuesta según la estructura del API
      let centrosCostoData = [];
      if (data.success && data.data) {
        if (Array.isArray(data.data.data)) {
          // Estructura paginada
          centrosCostoData = data.data.data;
        } else if (Array.isArray(data.data)) {
          // Estructura directa
          centrosCostoData = data.data;
        }
      } else if (Array.isArray(data)) {
        centrosCostoData = data;
      }

      setQuickEditCentrosCosto(centrosCostoData);
    } catch (error) {
      console.error('Error al cargar centros de costo para edición:', error);
      setQuickEditCentrosCosto([]);
    }
  };

  // Función para abrir modal de edición rápida
  const handleEditCostCenter = async (factura) => {
    setSelectedFactura(factura);
    setQuickEditData({
      cost_center_id: factura.cost_center_id || "",
      status: factura.status || ""
    });
    setQuickEditError("");
    setIsQuickEditModalOpen(true);
    
    // Cargar centros de costo cuando se abre el modal
    await loadQuickEditCentrosCosto();
  };

  // Función para guardar cambios del modal de edición rápida
  const handleQuickEditSave = async () => {
    if (!selectedFactura) return;
    
    setQuickEditLoading(true);
    setQuickEditError("");
    
    try {
      // Usar los nuevos endpoints específicos para cambio de estado y centro de costo
      const promises = [];
      
      // Cambiar estado si es diferente
      if (quickEditData.status !== selectedFactura.status) {
        promises.push(
          facturasService.changeInvoiceStatus(selectedFactura.invoice_id, quickEditData.status)
        );
      }
      
      // Cambiar centro de costo si es diferente
      if (quickEditData.cost_center_id !== selectedFactura.cost_center_id) {
        promises.push(
          facturasService.changeInvoiceCostCenter(selectedFactura.invoice_id, quickEditData.cost_center_id)
        );
      }
      
      // Ejecutar cambios si hay alguno
      if (promises.length > 0) {
        await Promise.all(promises);
        
        // Actualizar la lista de facturas
        setFacturas(prevFacturas => 
          prevFacturas.map(f => 
            f.invoice_id === selectedFactura.invoice_id 
            ? { 
                ...f, 
                cost_center_id: quickEditData.cost_center_id,
                status: quickEditData.status,
                cost_center: quickEditCentrosCosto.find(cc => cc.cost_center_id === parseInt(quickEditData.cost_center_id))
              }
            : f
        ));

        showNotification(`Factura "${selectedFactura.invoice_number}" actualizada exitosamente`, "success");
      } else {
        showNotification("No hay cambios para guardar", "info");
      }
      
      setIsQuickEditModalOpen(false);
      setSelectedFactura(null);
      
    } catch (error) {
      console.error('Error al actualizar factura:', error);
      setQuickEditError(error.message);
    } finally {
      setQuickEditLoading(false);
    }
  };

  // Función para crear factura básica
  const handleCreateBasic = async () => {
    setBasicFormLoading(true);
    setBasicFormError("");
    
    try {
      const response = await fetch(getApiUrl('/api/invoices'), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          invoice_number: basicFormData.invoice_number,
          invoice_date: basicFormData.invoice_date,
          due_date: basicFormData.due_date || null,
          subtotal: parseFloat(basicFormData.subtotal),
          retention: parseFloat(basicFormData.retention) || 0,
          status: basicFormData.status,
          sale_type: basicFormData.sale_type,
          payment_method_id: basicFormData.payment_method_id ? parseInt(basicFormData.payment_method_id) : null,
          provider_id: parseInt(basicFormData.provider_id),
          cost_center_id: parseInt(basicFormData.cost_center_id),
          description: basicFormData.description || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la factura");
      }

      const result = await response.json();
      
      // Actualizar la lista de facturas
      await fetchFacturas();
      
      showNotification(`Factura "${basicFormData.invoice_number}" creada exitosamente`, "success");
      setIsCreateBasicModalOpen(false);
      
      // Limpiar formulario
      setBasicFormData({
        invoice_number: "",
        invoice_date: "",
        due_date: "",
        subtotal: "",
        retention: "",
        status: "PENDIENTE",
        sale_type: "CREDITO",
        payment_method_id: "",
        provider_id: "",
        cost_center_id: "",
        description: ""
      });
      
    } catch (error) {
      console.error('Error al crear factura:', error);
      setBasicFormError(error.message);
    } finally {
      setBasicFormLoading(false);
    }
  };

  // Función para abrir modal de subir documentos
  const handleUploadDocuments = (factura) => {
    setSelectedFactura(factura);
    setUploadDocumentsData({
      payment_support: null,
      invoice_file: null
    });
    setUploadDocumentsError("");
    setIsUploadDocumentsModalOpen(true);
  };

  // Función para subir documentos a factura existente
  const handleUploadDocumentsSubmit = async () => {
    if (!selectedFactura) return;
    
    setUploadDocumentsLoading(true);
    setUploadDocumentsError("");
    
    try {
      const formData = new FormData();
      
      if (uploadDocumentsData.payment_support) {
        formData.append('payment_support', uploadDocumentsData.payment_support);
      }
      
      if (uploadDocumentsData.invoice_file) {
        formData.append('invoice_file', uploadDocumentsData.invoice_file);
      }

      const response = await fetch(getApiUrl(`/api/invoices/${selectedFactura.invoice_id}/upload-files`), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user.token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al subir los documentos");
      }

      const result = await response.json();
      
      // Actualizar la lista de facturas
      await fetchFacturas();
      
      showNotification(`Documentos subidos exitosamente para la factura "${selectedFactura.invoice_number}"`, "success");
      setIsUploadDocumentsModalOpen(false);
      setSelectedFactura(null);
      
      // Limpiar formulario
      setUploadDocumentsData({
        payment_support: null,
        invoice_file: null
      });
      
    } catch (error) {
      console.error('Error al subir documentos:', error);
      setUploadDocumentsError(error.message);
    } finally {
      setUploadDocumentsLoading(false);
    }
  };

  // Funciones para el modal de upload
  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    if (file) {
      if (fileType === 'factura') {
        // Solo PDF para facturas
        if (file.type !== 'application/pdf') {
          setUploadError('La factura debe ser un archivo PDF');
          setUploadFile(null);
          return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB
          setUploadError('El archivo de factura es demasiado grande. Máximo 10MB');
          setUploadFile(null);
          return;
        }
        setUploadFile(file);
      } else if (fileType === 'payment') {
        // Solo imágenes para soporte de pago
        const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedImageTypes.includes(file.type)) {
          setUploadError('El soporte de pago debe ser una imagen (JPG, PNG)');
          setPaymentSupportFile(null);
          return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB para imágenes
          setUploadError('El archivo de soporte de pago es demasiado grande. Máximo 5MB');
          setPaymentSupportFile(null);
          return;
        }
        setPaymentSupportFile(file);
      }
      setUploadError("");
    }
  };

  // Función para procesar archivo de factura (opcional - para extracción automática)
  const handleFileUpload = async () => {
    if (!uploadFile) {
      setUploadError('Por favor selecciona el archivo de factura (PDF)');
      return;
    }

    setUploadLoading(true);
    setUploadError("");

    try {
      // Usar el servicio para procesar el archivo
      const result = await facturasService.procesarArchivoFactura(uploadFile);
      setExtractedData(result);
      
      // Llenar automáticamente el formulario con los datos extraídos
      if (result.success && result.data) {
        setFormData({
          invoice_number: result.data.number || "",
          invoice_date: result.data.date || "",
          due_date: result.data.due_date || "",
          subtotal: result.data.subtotal || "",
          iva_amount: result.data.iva_amount || "",
          retention: result.data.retention || "",
          total_amount: result.data.total_amount || result.data.amount || "",
          description: result.data.description || "",
          status: uploadFormData.status,
          sale_type: result.data.sale_type || "",
          payment_method: result.data.payment_method || "",
          provider_id: result.data.supplier_id || "",
          cost_center_id: uploadFormData.cost_center_id
        });
      }

      showNotification('Archivo procesado exitosamente', 'success');
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      setUploadError(error.message || 'Error al procesar el archivo. Por favor intenta de nuevo.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUploadFormSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFormData.cost_center_id) {
      setUploadError('Por favor selecciona el centro de costo');
      return;
    }

    if (!uploadFile) {
      setUploadError('Por favor selecciona el archivo de factura (PDF)');
      return;
    }

    if (!paymentSupportFile) {
      setUploadError('Por favor selecciona el archivo de soporte de pago (imagen)');
      return;
    }

    try {
      setFormLoading(true);
      
      // Preparar datos de la factura
      const facturaData = {
        ...formData,
        cost_center_id: uploadFormData.cost_center_id,
        status: uploadFormData.status
      };
      
      // Usar el servicio para crear la factura con archivos
      const result = await facturasService.crearFacturaConArchivos(facturaData, uploadFile, paymentSupportFile);
      setFacturas(prev => [...prev, result]);

      showNotification(`Factura "${formData.invoice_number}" creada exitosamente`, "success");
      setIsUploadModalOpen(false);
      
      // Limpiar estados
      setUploadFile(null);
      setPaymentSupportFile(null);
      setExtractedData(null);
      setUploadFormData({
        cost_center_id: "",
        status: "PENDIENTE"
      });
      setFormData({
        invoice_number: "",
        invoice_date: "",
        due_date: "",
        total_amount: "",
        description: "",
        status: "",
        provider_id: "",
        cost_center_id: ""
      });
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setPaymentSupportFile(null);
    setExtractedData(null);
    setUploadError("");
    setUploadFormData({
      cost_center_id: "",
      status: "PENDIENTE"
    });
    setFormData({
      invoice_number: "",
      invoice_date: "",
      due_date: "",
      subtotal: "",
      iva_amount: "",
      retention: "",
      total_amount: "",
      description: "",
      status: "",
      sale_type: "",
      payment_method: "",
      provider_id: "",
      cost_center_id: ""
    });
  };

  if (loading) {
    return <Loading />;
  }
  if (error) return <div className="p-8 text-center text-red-400">Error: {error}</div>;

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      
      <div className="col-span-1 h-fit w-full xl:col-span-2 2xl:col-span-3">
        <Card extra={"w-full h-full px-8 pb-8 sm:overflow-x-auto"}>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">
                Facturas
              </h1>
              {isContador && (
                <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/50 text-blue-400 rounded-lg text-sm font-medium">
                  📊 Vista de Gestión Financiera
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFacturasProximasVencer(true);
                  loadFacturasProximasVencer(diasFiltro);
                }}
                className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-white hover:bg-orange-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                <MdWarning className="h-4 w-4" />
                Próximas a Vencer
              </button>
              <button
                onClick={generateExcelReport}
                disabled={generatingExcel}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-white transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl ${
                  generatingExcel 
                    ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {generatingExcel ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generando...
                  </>
                ) : (
                  <>
                    <MdFileDownload className="h-4 w-4" />
                    Exportar Excel
                  </>
                )}
              </button>
              {!isContador && (
                <>
                  <button
                    onClick={() => setIsCreateBasicModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                  >
                    <MdAdd className="h-4 w-4" />
                    Crear Factura
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-white hover:bg-green-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                <MdCloudUpload className="h-4 w-4" />
                    Crear con Archivos
              </button>
                </>
              )}
            </div>
          </div>


          {/* Mensaje informativo para contador */}
          {isContador && (
            <div className="mb-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-blue-400 text-lg">ℹ️</div>
                <div>
                  <div className="text-blue-400 font-medium">Vista de Gestión Financiera</div>
                  <div className="text-blue-300 text-sm">
                    Como contador, tienes acceso de solo lectura a la información financiera. Puedes ver detalles y editar centros de costo, pero no crear facturas ni subir documentos.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="mb-6">
            <div className="bg-primary-card border border-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Filtros de Búsqueda</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 bg-accent-primary/10 border border-accent-primary/30 rounded-lg text-accent-primary hover:bg-accent-primary/20 transition-all duration-200 text-sm font-medium"
                >
                  <MdFilterList className="h-4 w-4" />
                  {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </button>
              </div>
              
              {showFilters && (
                <div className="space-y-4">
                  {/* Campo de búsqueda */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Búsqueda General
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        placeholder="Buscar por número, descripción, proveedor o centro de costo..."
                        className="w-full bg-primary-card border border-gray-600/50 rounded-lg px-3 py-2.5 pl-10 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-200"
                      />
                      <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Filtros principales */}
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Filtro por Estado */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Estado
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-primary-card border border-gray-600/50 rounded-lg px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-200"
                      >
                        <option value="">Todos los estados</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="PAGADA">Pagada</option>
                      </select>
                    </div>

                    {/* Filtro por Proveedor */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Proveedor
                      </label>
                      <select
                        value={filters.provider_id}
                        onChange={(e) => setFilters(prev => ({ ...prev, provider_id: e.target.value }))}
                        disabled={loadingFilters}
                        className="w-full bg-primary-card border border-gray-600/50 rounded-lg px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {loadingFilters ? 'Cargando proveedores...' : 'Todos los proveedores'}
                        </option>
                        {providers.map((provider) => (
                          <option key={provider.id} value={provider.id}>
                            {provider.name} ({provider.nit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro por Centro de Costo */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Centro de Costo
                      </label>
                      <select
                        value={filters.cost_center_id}
                        onChange={(e) => setFilters(prev => ({ ...prev, cost_center_id: e.target.value }))}
                        disabled={loadingFilters}
                        className="w-full bg-primary-card border border-gray-600/50 rounded-lg px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {loadingFilters ? 'Cargando centros de costo...' : 'Todos los centros de costo'}
                        </option>
                        {costCenters.map((costCenter) => (
                          <option key={costCenter.id} value={costCenter.id}>
                            {costCenter.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filtro por Mes (invoice_date) */}
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Mes de Factura
                      </label>
                      <input
                        type="month"
                        value={filters.month}
                        onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                        className="w-full bg-primary-card border border-gray-600/50 rounded-lg px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={applyFilters}
                      className="bg-accent-primary hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2"
                    >
                      <MdSearch className="h-4 w-4" />
                      Aplicar Filtros
                    </button>
                    <button
                      onClick={clearFilters}
                      className="bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 hover:text-red-300 px-6 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium flex items-center gap-2"
                    >
                      <MdClear className="h-4 w-4" />
                      Limpiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-text-secondary">
              Mostrando <span className="font-medium text-text-primary">{pagination.from}</span> a <span className="font-medium text-text-primary">{pagination.to}</span> de <span className="font-medium text-text-primary">{pagination.total}</span> facturas
            </div>
            {Object.values(filters).some(value => value !== "") && (
              <div className="text-sm text-text-secondary">
                <span className="font-medium text-text-primary">Filtros activos:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.search && filters.search.trim() && (
                    <span className="px-3 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-medium flex items-center gap-2">
                      🔍 Búsqueda: {filters.search}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, search: "" }))}
                        className="text-blue-300 hover:text-blue-100 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.status && (
                    <span className="px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-medium flex items-center gap-2">
                      📊 Estado: {filters.status}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, status: "" }))}
                        className="text-green-300 hover:text-green-100 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.provider_id && (
                    <span className="px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-medium flex items-center gap-2">
                      🏢 Proveedor: {providers.find(p => p.id === parseInt(filters.provider_id))?.name || 'ID: ' + filters.provider_id}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, provider_id: "" }))}
                        className="text-purple-300 hover:text-purple-100 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.cost_center_id && (
                    <span className="px-3 py-1.5 bg-orange-600/20 border border-orange-500/30 text-orange-400 rounded-lg text-xs font-medium flex items-center gap-2">
                      🏗️ Centro: {costCenters.find(c => c.id === parseInt(filters.cost_center_id))?.name || 'ID: ' + filters.cost_center_id}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, cost_center_id: "" }))}
                        className="text-orange-300 hover:text-orange-100 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {filters.month && (
                    <span className="px-3 py-1.5 bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-medium flex items-center gap-2">
                      📅 Mes (Factura): {filters.month}
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, month: "" }))}
                        className="text-cyan-300 hover:text-cyan-100 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tabla de Facturas */}
          <div className="mt-6 overflow-x-auto">
            <div className="bg-primary-card border border-gray-700/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50 border-b border-gray-700/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Número</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Tipo Venta</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Subtotal</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">IVA</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Proveedor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Centro de Costo</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {facturas.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="px-6 py-12 text-center text-text-secondary">
                        <div className="flex flex-col items-center">
                          <div className="text-xl font-medium mb-3 text-text-primary">No se encontraron facturas</div>
                          <div className="text-sm">
                            {Object.values(filters).some(value => value !== "")
                              ? "Intenta ajustar los filtros de búsqueda"
                              : isContador 
                                ? "No hay facturas disponibles para tu rol de contador"
                                : "No hay facturas registradas"
                            }
                          </div>
                          {isContador && (
                            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                              <div className="text-blue-400 text-sm">
                                Si crees que deberías ver facturas, contacta al administrador para verificar tus permisos.
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    facturas.map((factura) => {
                      console.log('🔍 DEBUG: Procesando factura:', factura);
                      return (
                      <tr key={factura.invoice_id} className="border-b border-gray-700/30 hover:bg-accent-primary/5 transition-all duration-200">
                        <td className="px-6 py-4 text-sm text-text-primary font-medium">{factura.invoice_number}</td>
                        <td className="px-6 py-4 text-sm text-text-primary">{formatDate(factura.invoice_date)}</td>
                        <td className="px-6 py-4 text-sm text-text-primary">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            factura.sale_type?.toUpperCase() === 'CONTADO' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : factura.sale_type?.toUpperCase() === 'CREDITO'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {factura.sale_type || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary font-medium">
                          {factura.subtotal ? `$${Number(factura.subtotal).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary">
                          {factura.iva_amount ? `$${Number(factura.iva_amount).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary font-medium">
                          {factura.total_amount ? `$${Number(factura.total_amount).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            factura.status?.toUpperCase() === 'PAGADA' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : factura.status?.toUpperCase() === 'PENDIENTE'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            {factura.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary">
                          {factura.provider?.provider_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-text-primary">
                          {factura.cost_center?.cost_center_name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleView(factura)}
                              className="text-blue-600 hover:text-blue-800 transition-all duration-200 p-1 rounded-lg hover:bg-blue-100"
                              title="Ver detalles"
                            >
                              <MdVisibility className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditCostCenter(factura)}
                              className="text-green-600 hover:text-green-800 transition-all duration-200 p-1 rounded-lg hover:bg-green-100"
                              title="Editar"
                            >
                              <MdEdit className="h-4 w-4" />
                            </button>
                            {!isContador && (
                              <button
                                onClick={() => handleUploadDocuments(factura)}
                                className="text-purple-600 hover:text-purple-800 transition-all duration-200 p-1 rounded-lg hover:bg-purple-100"
                                title="Subir documentos"
                              >
                                <MdCloudUpload className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Controles de Paginación */}
          {pagination.total > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Información de paginación */}
              <div className="text-sm text-text-secondary">
                Página <span className="font-medium text-text-primary">{pagination.current_page}</span> de <span className="font-medium text-text-primary">{pagination.last_page}</span>
              </div>

              {/* Selector de elementos por página */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Mostrar:</span>
                <select
                  value={pagination.per_page}
                  onChange={(e) => handlePerPageChange(parseInt(e.target.value))}
                  className="bg-primary-card border border-gray-600/50 rounded-lg px-3 py-1.5 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-text-secondary">por página</span>
              </div>

              {/* Navegación de páginas */}
              <div className="flex items-center gap-2">
                {/* Botón Anterior */}
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="px-3 py-2 text-sm font-medium text-text-secondary bg-primary-card border border-gray-600/50 rounded-lg hover:bg-gray-700/30 hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Anterior
                </button>

                {/* Números de página */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                    let pageNum;
                    if (pagination.last_page <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.current_page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.current_page >= pagination.last_page - 2) {
                      pageNum = pagination.last_page - 4 + i;
                    } else {
                      pageNum = pagination.current_page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          pageNum === pagination.current_page
                            ? 'bg-accent-primary text-white'
                            : 'text-text-secondary bg-primary-card border border-gray-600/50 hover:bg-gray-700/30 hover:text-text-primary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Botón Siguiente */}
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="px-3 py-2 text-sm font-medium text-text-secondary bg-primary-card border border-gray-600/50 rounded-lg hover:bg-gray-700/30 hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>


      {/* Modal de detalles */}
      {showModal && selectedFactura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-primary-card rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative border border-gray-700/50">
            <button onClick={closeModal} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary text-xl transition-colors duration-200">&times;</button>
            <h2 className="text-xl font-bold mb-6 text-text-primary">Detalles de la Factura</h2>
            
            {/* Información Principal de la Factura */}
            <div className="bg-gray-800/30 rounded-lg p-4 mb-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-text-primary">Factura #{selectedFactura.invoice_number}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedFactura.status?.toUpperCase() === 'PAGADA' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : selectedFactura.status?.toUpperCase() === 'PENDIENTE'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {selectedFactura.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedFactura.sale_type?.toUpperCase() === 'CONTADO' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      : selectedFactura.sale_type?.toUpperCase() === 'CREDITO'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                    {selectedFactura.sale_type}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                  <span className="text-text-secondary">Fecha:</span>
                  <span className="ml-2 text-text-primary font-medium">{formatDate(selectedFactura.invoice_date)}</span>
                </div>
                {selectedFactura.due_date && (
                  <div>
                    <span className="text-text-secondary">Vencimiento:</span>
                    <span className="ml-2 text-text-primary font-medium">{formatDate(selectedFactura.due_date)}</span>
              </div>
                )}
                {selectedFactura.payment_method?.name && (
              <div>
                    <span className="text-text-secondary">Método de Pago:</span>
                    <span className="ml-2 text-text-primary font-medium">{selectedFactura.payment_method.name}</span>
                  </div>
                )}
                {selectedFactura.description && (
                  <div className="col-span-2">
                    <span className="text-text-secondary">Descripción:</span>
                    <span className="ml-2 text-text-primary font-medium">{selectedFactura.description}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Información Financiera - Destacada */}
            {selectedFactura.total_amount && (
              <div className="bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-700/50">
                <h3 className="text-lg font-semibold text-text-primary mb-3">Información Financiera</h3>
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    {selectedFactura.subtotal && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Subtotal:</span>
                        <span className="text-text-primary font-medium">${Number(selectedFactura.subtotal).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                    )}
                    {selectedFactura.iva_amount && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">IVA (19%):</span>
                        <span className="text-text-primary font-medium">${Number(selectedFactura.iva_amount).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                  </div>
                    )}
                    {selectedFactura.retention && (
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Retención:</span>
                        <span className="text-text-primary font-medium">${Number(selectedFactura.retention).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                </div>
                    )}
              </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-text-secondary text-sm mb-1">Total</div>
                      <div className="text-2xl font-bold text-blue-400">${Number(selectedFactura.total_amount).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Información del Proveedor y Centro de Costo */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {selectedFactura.provider?.provider_name && (
                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Proveedor</h3>
                  <div className="space-y-2 text-sm">
              <div>
                      <span className="text-text-secondary">Nombre:</span>
                      <span className="ml-2 text-text-primary font-medium">{selectedFactura.provider.provider_name}</span>
                </div>
                    {selectedFactura.provider.NIT && (
                      <div>
                        <span className="text-text-secondary">NIT:</span>
                        <span className="ml-2 text-text-primary font-medium">{selectedFactura.provider.NIT}</span>
              </div>
                    )}
                    {selectedFactura.provider_id && (
              <div>
                        <span className="text-text-secondary">ID:</span>
                        <span className="ml-2 text-text-primary font-medium">{selectedFactura.provider_id}</span>
                </div>
                    )}
              </div>
            </div>
              )}
            
              {selectedFactura.cost_center?.cost_center_name && (
                <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-text-primary mb-3">Centro de Costo</h3>
                  <div className="space-y-2 text-sm">
              <div>
                      <span className="text-text-secondary">Nombre:</span>
                      <span className="ml-2 text-text-primary font-medium">{selectedFactura.cost_center.cost_center_name}</span>
                </div>
                    {selectedFactura.cost_center_id && (
                      <div>
                        <span className="text-text-secondary">ID:</span>
                        <span className="ml-2 text-text-primary font-medium">{selectedFactura.cost_center_id}</span>
              </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Fechas del Sistema */}
            {(selectedFactura.created_at || selectedFactura.updated_at) && (
              <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                <h3 className="text-lg font-semibold text-text-primary mb-3">Fechas del Sistema</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedFactura.created_at && (
              <div>
                      <span className="text-text-secondary">Creado:</span>
                      <span className="ml-2 text-text-primary font-medium">{formatDate(selectedFactura.created_at)}</span>
                </div>
                  )}
                  {selectedFactura.updated_at && (
                    <div>
                      <span className="text-text-secondary">Actualizado:</span>
                      <span className="ml-2 text-text-primary font-medium">{formatDate(selectedFactura.updated_at)}</span>
              </div>
                  )}
            </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Crear Factura Básica */}
      {isCreateBasicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-primary-card rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative border border-gray-700/50">
            <button 
              onClick={() => setIsCreateBasicModalOpen(false)} 
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-xl transition-colors duration-200"
            >
              ×
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-text-primary">Crear Factura</h2>
            
            {basicFormError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <div className="text-red-400 text-sm">{basicFormError}</div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleCreateBasic(); }} className="space-y-6">
              {/* Información Básica */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Número de Factura *
                  </label>
                  <input
                    type="text"
                    value={basicFormData.invoice_number}
                    onChange={(e) => setBasicFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Fecha de Emisión *
                  </label>
                  <input
                    type="date"
                    value={basicFormData.invoice_date}
                    onChange={(e) => setBasicFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={basicFormData.due_date}
                    onChange={(e) => setBasicFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Estado *
                  </label>
                  <select
                    value={basicFormData.status}
                    onChange={(e) => setBasicFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="PAGADA">Pagada</option>
                  </select>
                </div>
              </div>

              {/* Información Financiera */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Subtotal *
                  </label>
                  <input
                    type="number"
                    value={basicFormData.subtotal}
                    onChange={(e) => setBasicFormData(prev => ({ ...prev, subtotal: e.target.value }))}
                    step="0.01"
                    min="0"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Retención
                  </label>
                  <input
                    type="number"
                    value={basicFormData.retention}
                    onChange={(e) => setBasicFormData(prev => ({ ...prev, retention: e.target.value }))}
                    step="0.01"
                    min="0"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Tipo de Venta *
                  </label>
                  <select
                    value={basicFormData.sale_type}
                    onChange={(e) => setBasicFormData(prev => ({ ...prev, sale_type: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="CONTADO">Contado</option>
                    <option value="CREDITO">Crédito</option>
                  </select>
                </div>
              </div>

              {/* Relaciones */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Proveedor *
                  </label>
                  <select
                    value={basicFormData.provider_id}
                    onChange={(e) => setBasicFormData(prev => ({ ...prev, provider_id: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar proveedor</option>
                    {providers.map((provider) => (
                      <option key={provider.provider_id} value={provider.provider_id}>
                        {provider.provider_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Centro de Costo *
                  </label>
                  <select
                    value={basicFormData.cost_center_id}
                    onChange={(e) => setBasicFormData(prev => ({ ...prev, cost_center_id: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar centro de costo</option>
                    {centrosCosto.map((centro) => (
                      <option key={centro.cost_center_id} value={centro.cost_center_id}>
                        {centro.cost_center_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Método de Pago
                </label>
                <select
                  value={basicFormData.payment_method_id}
                  onChange={(e) => setBasicFormData(prev => ({ ...prev, payment_method_id: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar método de pago</option>
                  <option value="1">Transferencia desde cuenta Davivienda E4(TCD)</option>
                  <option value="2">Transferencia desde Cuenta personal(CP)</option>
                  <option value="3">Efectivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Descripción
                </label>
                <textarea
                  value={basicFormData.description}
                  onChange={(e) => setBasicFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción adicional de la factura..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateBasicModalOpen(false)}
                  disabled={basicFormLoading}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={basicFormLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  {basicFormLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creando...
                    </>
                  ) : (
                    'Crear Factura'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Upload de Factura */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-primary-card rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative border border-gray-700/50 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={handleUploadModalClose} 
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-xl transition-colors duration-200"
            >
              ×
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-text-primary">Crear Factura con Archivos</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel izquierdo - Subida de archivos */}
              <div className="space-y-4">
                {/* Sección 1: Archivo de Factura */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-lg font-semibold mb-4 text-text-primary">1. Archivo de Factura (PDF)</h3>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleFileChange(e, 'factura')}
                        className="hidden"
                        id="factura-upload"
                      />
                      <label htmlFor="factura-upload" className="cursor-pointer">
                        <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <div className="text-text-primary font-medium">
                          {uploadFile ? uploadFile.name : "Haz clic para seleccionar factura PDF"}
                        </div>
                        <div className="text-text-secondary text-sm mt-2">
                          Solo archivos PDF (máx. 10MB)
                        </div>
                      </label>
                    </div>

                    {uploadFile && (
                      <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-400">
                          <MdUpload className="h-4 w-4" />
                          <span className="text-sm font-medium">Factura seleccionada: {uploadFile.name}</span>
                        </div>
                        <div className="text-xs text-green-300 mt-1">
                          Tamaño: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                        <button
                          onClick={handleFileUpload}
                          disabled={uploadLoading}
                          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          {uploadLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Procesando...
                            </>
                          ) : (
                            <>
                              <MdUpload className="h-4 w-4" />
                              Extraer Datos (Opcional)
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sección 2: Soporte de Pago */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-lg font-semibold mb-4 text-text-primary">2. Soporte de Pago (Imagen)</h3>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, 'payment')}
                        className="hidden"
                        id="payment-upload"
                      />
                      <label htmlFor="payment-upload" className="cursor-pointer">
                        <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <div className="text-text-primary font-medium">
                          {paymentSupportFile ? paymentSupportFile.name : "Haz clic para seleccionar soporte de pago"}
                        </div>
                        <div className="text-text-secondary text-sm mt-2">
                          JPG, PNG (máx. 5MB)
                        </div>
                      </label>
                    </div>

                    {paymentSupportFile && (
                      <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-400">
                          <MdUpload className="h-4 w-4" />
                          <span className="text-sm font-medium">Soporte seleccionado: {paymentSupportFile.name}</span>
                        </div>
                        <div className="text-xs text-green-300 mt-1">
                          Tamaño: {(paymentSupportFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuración de la factura */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-lg font-semibold mb-4 text-text-primary">3. Configuración</h3>
                  
                  <div className="space-y-4">

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Centro de Costo *
                      </label>
                      <select
                        value={uploadFormData.cost_center_id}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, cost_center_id: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar centro de costo</option>
                        {centrosCosto.map((centro) => (
                          <option key={centro.cost_center_id} value={centro.cost_center_id}>
                            {centro.category ? `${centro.category.name} - ` : ''}{centro.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Estado de la Factura
                      </label>
                      <select
                        value={uploadFormData.status}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="PAGADA">Pagada</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel derecho - Formulario de datos */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-lg font-semibold mb-4 text-text-primary">4. Datos de la Factura</h3>
                  
                  {extractedData ? (
                    <div className="space-y-4">
                      <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-400">
                          <MdUpload className="h-4 w-4" />
                          <span className="text-sm font-medium">Datos extraídos automáticamente</span>
                        </div>
                      </div>

                      <form onSubmit={handleUploadFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Número de Factura
                            </label>
                            <input
                              type="text"
                              value={formData.invoice_number}
                              onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Número de factura"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Fecha
                            </label>
                            <input
                              type="date"
                              value={formData.invoice_date}
                              onChange={(e) => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Tipo de Venta
                            </label>
                            <select
                              value={formData.sale_type}
                              onChange={(e) => setFormData(prev => ({ ...prev, sale_type: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Seleccionar tipo</option>
                              <option value="CONTADO">Contado</option>
                              <option value="CREDITO">Crédito</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Método de Pago
                            </label>
                            <select
                              value={formData.payment_method}
                              onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Seleccionar método</option>
                              <option value="EFECTIVO">Efectivo</option>
                              <option value="TRANSFERENCIA">Transferencia</option>
                              <option value="CHEQUE">Cheque</option>
                              <option value="TARJETA">Tarjeta</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Subtotal
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.subtotal}
                              onChange={(e) => handleSubtotalChange(e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              IVA (19%)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.iva_amount}
                              readOnly
                              className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-text-primary"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Retención
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.retention}
                              onChange={(e) => handleRetentionChange(e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Total
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.total_amount}
                              readOnly
                              className="w-full bg-gray-600 border border-gray-600 rounded-lg px-3 py-2 text-text-primary font-bold"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Fecha de Vencimiento
                            </label>
                            <input
                              type="date"
                              value={formData.due_date}
                              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            Descripción
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows="3"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Descripción de la factura"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={formLoading || !uploadFile || !paymentSupportFile}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {formLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Creando factura...
                            </>
                          ) : (
                            <>
                              <MdAdd className="h-4 w-4" />
                              Crear Factura
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="text-text-secondary mb-4">
                        Selecciona ambos archivos (factura PDF y soporte de pago) para continuar
                      </div>
                      <div className="text-sm text-text-secondary">
                        {!uploadFile && !paymentSupportFile && "Selecciona ambos archivos"}
                        {uploadFile && !paymentSupportFile && "Falta el archivo de soporte de pago"}
                        {!uploadFile && paymentSupportFile && "Falta el archivo de factura PDF"}
                        {uploadFile && paymentSupportFile && "Ambos archivos seleccionados - Completa los datos de la factura"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mensajes de error */}
            {(uploadError || formError) && (
              <div className="mt-4 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                <div className="text-red-400 text-sm">
                  {uploadError || formError}
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Modal de Facturas Próximas a Vencer */}
      {showFacturasProximasVencer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary-card border border-gray-700/50 rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <MdWarning className="w-6 h-6 text-orange-500" />
                Facturas Próximas a Vencer
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={diasFiltro}
                  onChange={(e) => {
                    setDiasFiltro(parseInt(e.target.value));
                    loadFacturasProximasVencer(parseInt(e.target.value));
                  }}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-text-primary text-sm"
                >
                  <option value={15}>15 días</option>
                  <option value={30}>30 días</option>
                  <option value={60}>60 días</option>
                  <option value={90}>90 días</option>
                </select>
                <button
                  onClick={() => setShowFacturasProximasVencer(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {facturasProximasVencer ? (
              <div className="space-y-6">
                {/* Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                    <div className="text-red-400 text-xl font-bold">
                      {facturasProximasVencer.summary.total_critical || 0}
                    </div>
                    <div className="text-text-secondary text-sm">Facturas Críticas</div>
                  </div>
                  <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                    <div className="text-orange-400 text-xl font-bold">
                      {formatCurrency(facturasProximasVencer.summary.total_upcoming_amount || 0)}
                    </div>
                    <div className="text-text-secondary text-sm">Monto Próximo a Vencer</div>
                  </div>
                  <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                    <div className="text-red-400 text-xl font-bold">
                      {formatCurrency(facturasProximasVencer.summary.total_overdue_amount || 0)}
                    </div>
                    <div className="text-text-secondary text-sm">Monto Vencido</div>
                  </div>
                </div>

                {/* Facturas Vencidas */}
                {facturasProximasVencer.overdue.count > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <MdError className="w-5 h-5" />
                      Facturas Vencidas ({facturasProximasVencer.overdue.count})
                    </h3>
                    <div className="space-y-2">
                      {facturasProximasVencer.overdue.invoices.map((factura) => (
                        <div key={factura.id} className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(factura.urgency_level)}`}>
                                {getUrgencyIcon(factura.urgency_level)}
                                <span className="ml-1">{getUrgencyText(factura.urgency_level)}</span>
                              </span>
                              <div>
                                <div className="font-medium text-text-primary">{factura.number}</div>
                                <div className="text-sm text-text-secondary">{factura.supplier?.name || 'N/A'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-text-primary">{formatCurrency(factura.total_amount)}</div>
                              <div className="text-sm text-red-400">
                                Vencida hace {factura.days_overdue} días
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facturas Próximas a Vencer */}
                {facturasProximasVencer.upcoming_due.count > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
                      <MdSchedule className="w-5 h-5" />
                      Próximas a Vencer ({facturasProximasVencer.upcoming_due.count})
                    </h3>
                    <div className="space-y-2">
                      {facturasProximasVencer.upcoming_due.invoices.map((factura) => (
                        <div key={factura.id} className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(factura.urgency_level)}`}>
                                {getUrgencyIcon(factura.urgency_level)}
                                <span className="ml-1">{getUrgencyText(factura.urgency_level)}</span>
                              </span>
                              <div>
                                <div className="font-medium text-text-primary">{factura.number}</div>
                                <div className="text-sm text-text-secondary">{factura.supplier?.name || 'N/A'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-text-primary">{formatCurrency(factura.total_amount)}</div>
                              <div className="text-sm text-orange-400">
                                Vence en {factura.days_until_due} días
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {facturasProximasVencer.overdue.count === 0 && facturasProximasVencer.upcoming_due.count === 0 && (
                  <div className="text-center py-8">
                    <div className="text-green-400 text-4xl mb-2">✅</div>
                    <div className="text-text-primary font-medium">¡Excelente!</div>
                    <div className="text-text-secondary text-sm">No hay facturas próximas a vencer en los próximos {diasFiltro} días</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <div className="text-text-secondary">Cargando facturas próximas a vencer...</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Subir Documentos */}
      {isUploadDocumentsModalOpen && selectedFactura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-primary-card rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative border border-gray-700/50">
            <button 
              onClick={() => setIsUploadDocumentsModalOpen(false)} 
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-xl transition-colors duration-200"
            >
              ×
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-text-primary">Subir Documentos</h2>
            <p className="text-text-secondary mb-6">Factura: <span className="font-medium text-text-primary">{selectedFactura.invoice_number}</span></p>
            
            {uploadDocumentsError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <div className="text-red-400 text-sm">{uploadDocumentsError}</div>
              </div>
            )}

            <div className="space-y-6">
              {/* Soporte de Pago */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Soporte de Pago (PDF, JPG, PNG)
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadDocumentsData(prev => ({ ...prev, payment_support: e.target.files[0] }))}
                    className="hidden"
                    id="payment-support-upload"
                  />
                  <label htmlFor="payment-support-upload" className="cursor-pointer">
                    <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="text-text-primary font-medium">
                      {uploadDocumentsData.payment_support ? uploadDocumentsData.payment_support.name : "Haz clic para seleccionar soporte de pago"}
                    </div>
                    <div className="text-text-secondary text-sm mt-2">
                      PDF, JPG, PNG (máx. 10MB)
                    </div>
                  </label>
                </div>
                {uploadDocumentsData.payment_support && (
                  <div className="mt-2 bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <MdUpload className="h-4 w-4" />
                      <span className="text-sm font-medium">Archivo seleccionado: {uploadDocumentsData.payment_support.name}</span>
                    </div>
                    <div className="text-xs text-green-300 mt-1">
                      Tamaño: {(uploadDocumentsData.payment_support.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                )}
              </div>

              {/* Archivo de Factura */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Archivo de Factura (PDF, JPG, PNG)
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUploadDocumentsData(prev => ({ ...prev, invoice_file: e.target.files[0] }))}
                    className="hidden"
                    id="invoice-file-upload"
                  />
                  <label htmlFor="invoice-file-upload" className="cursor-pointer">
                    <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <div className="text-text-primary font-medium">
                      {uploadDocumentsData.invoice_file ? uploadDocumentsData.invoice_file.name : "Haz clic para seleccionar archivo de factura"}
                    </div>
                    <div className="text-text-secondary text-sm mt-2">
                      PDF, JPG, PNG (máx. 10MB)
                    </div>
                  </label>
                </div>
                {uploadDocumentsData.invoice_file && (
                  <div className="mt-2 bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <MdUpload className="h-4 w-4" />
                      <span className="text-sm font-medium">Archivo seleccionado: {uploadDocumentsData.invoice_file.name}</span>
                    </div>
                    <div className="text-xs text-green-300 mt-1">
                      Tamaño: {(uploadDocumentsData.invoice_file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsUploadDocumentsModalOpen(false)}
                  disabled={uploadDocumentsLoading}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUploadDocumentsSubmit}
                  disabled={uploadDocumentsLoading || (!uploadDocumentsData.payment_support && !uploadDocumentsData.invoice_file)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  {uploadDocumentsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Subiendo...
                    </>
                  ) : (
                    'Subir Documentos'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición Rápida */}
      {isQuickEditModalOpen && selectedFactura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-primary-card rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-gray-700/50">
            <button 
              onClick={() => setIsQuickEditModalOpen(false)} 
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-xl transition-colors duration-200"
            >
              ×
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-text-primary">Editar Factura</h2>
            <p className="text-text-secondary mb-6">Factura: <span className="font-medium text-text-primary">{selectedFactura.invoice_number}</span></p>
            
            {quickEditError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <div className="text-red-400 text-sm">{quickEditError}</div>
              </div>
            )}

            <div className="space-y-4">
              {/* Cambiar Centro de Costo */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Centro de Costo
                </label>
                {quickEditCentrosCosto.length === 0 ? (
                  <div className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-secondary flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    Cargando centros de costo...
                  </div>
                ) : (
                  <select
                    value={quickEditData.cost_center_id}
                    onChange={(e) => setQuickEditData(prev => ({ ...prev, cost_center_id: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar centro de costo</option>
                    {quickEditCentrosCosto.map((centro) => (
                      <option key={centro.cost_center_id} value={centro.cost_center_id}>
                        {centro.cost_center_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Cambiar Estado */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Estado de la Factura
                </label>
                <select
                  value={quickEditData.status}
                  onChange={(e) => setQuickEditData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="PAGADA">Pagada</option>
                </select>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsQuickEditModalOpen(false)}
                disabled={quickEditLoading}
                className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleQuickEditSave}
                disabled={quickEditLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                {quickEditLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Carga para Generación de Excel */}
      {generatingExcel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary-card border border-gray-700/50 rounded-xl p-8 w-full max-w-md mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-6"></div>
              <h2 className="text-xl font-bold text-text-primary mb-2">
                Generando Reporte Excel
              </h2>
              <p className="text-text-secondary mb-4">
                Por favor espera mientras se procesa tu reporte...
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>
              <p className="text-xs text-text-secondary mt-3">
                Esto puede tomar unos momentos dependiendo del tamaño del reporte
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturas;