// Servicio para manejar las operaciones de facturas
import { getApiUrl } from '../config/api';
import { WEBHOOK_CONFIG, validateWebhookResponse } from '../config/webhook';

// Función auxiliar para obtener token de autenticación de manera consistente
const getAuthToken = () => {
  try {
    // Intentar obtener token desde localStorage con diferentes estructuras
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData.token) return userData.token;
    }
    
    // Fallback a access_token
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) return accessToken;
    
    // Fallback a token directo
    const directToken = localStorage.getItem('token');
    if (directToken) return directToken;
    
    return null;
  } catch (error) {
    console.error('Error al obtener token de autenticación:', error);
    return null;
  }
};

// Función auxiliar para manejar respuestas de la API con manejo de errores específicos
const handleApiResponse = async (response, operation = 'operación') => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    
    // Log detallado del error para debugging
    console.error(`🚨 ERROR DE API (${operation}):`, {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData: errorData
    });
    
    // Manejo específico de errores
    switch (response.status) {
      case 401:
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      case 403:
        throw new Error('No tienes permisos para realizar esta acción.');
      case 404:
        throw new Error('Recurso no encontrado.');
      case 422:
        if (errorData.errors) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          throw new Error(`Error de validación: ${validationErrors}`);
        }
        throw new Error(errorData.message || 'Error de validación en los datos enviados.');
      case 500:
        throw new Error('Error interno del servidor. Intenta nuevamente más tarde.');
      default:
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
  }
  
  return response.json();
};

// Función auxiliar para hacer requests con timeout y retry
const makeApiRequest = async (url, options, operation = 'operación', retries = 2) => {
  const timeout = 10000; // 10 segundos
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return await handleApiResponse(response, operation);
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('La operación tardó demasiado tiempo. Intenta nuevamente.');
    }
    
    // Retry para errores de red
    if (retries > 0 && (error.message.includes('fetch') || error.message.includes('network'))) {
      console.log(`🔄 Reintentando ${operation}... (${retries} intentos restantes)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
      return makeApiRequest(url, options, operation, retries - 1);
    }
    
    throw error;
  }
};

export const facturasService = {
  // Obtener todas las facturas con filtros opcionales
  getFacturas: async (params = {}) => {
    try {
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

      // Construir parámetros de query
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.per_page) queryParams.append('per_page', params.per_page);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.provider_id) queryParams.append('provider_id', params.provider_id);
      if (params.cost_center_id) queryParams.append('cost_center_id', params.cost_center_id);
      // Nuevo esquema de filtros de fecha por mes/año
      if (params.invoice_month) queryParams.append('invoice_month', params.invoice_month);
      if (params.invoice_year) queryParams.append('invoice_year', params.invoice_year);
      // Compatibilidad previa por rango (si el backend aún lo soporta)
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      if (params.amount_min) queryParams.append('amount_min', params.amount_min);
      if (params.amount_max) queryParams.append('amount_max', params.amount_max);
      if (params.overdue) queryParams.append('overdue', params.overdue);
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_order) queryParams.append('sort_order', params.sort_order);

      const url = getApiUrl('/api/invoices') + (queryParams.toString() ? `?${queryParams.toString()}` : '');
      
      console.log('🔍 DEBUG: Obteniendo facturas desde:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 DEBUG: Resultado facturas:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      throw error;
    }
  },

  // Obtener resumen de facturas
  getFacturasResumen: async () => {
    try {
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

      const response = await fetch(getApiUrl('/api/invoices/statistics'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 DEBUG: Resultado resumen facturas:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener resumen de facturas:', error);
      throw error;
    }
  },

  // Obtener detalles de una factura específica
  getFacturaDetalles: async (facturaId) => {
    try {
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

      const response = await fetch(getApiUrl(`/api/invoices/${facturaId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 DEBUG: Resultado detalles factura:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener detalles de factura:', error);
      throw error;
    }
  },

  // Obtener facturas próximas a vencer
  getFacturasProximasVencer: async (days = 30) => {
    try {
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

      const response = await fetch(getApiUrl(`/api/invoices/upcoming-due?days=${days}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 DEBUG: Resultado facturas próximas a vencer:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener facturas próximas a vencer:', error);
      throw error;
    }
  },

  // Obtener estadísticas de facturas
  getEstadisticasFacturas: async () => {
    try {
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

      const response = await fetch(getApiUrl('/api/invoices/statistics'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 DEBUG: Resultado estadísticas facturas:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener estadísticas de facturas:', error);
      throw error;
    }
  },

  // Crear una nueva factura
  crearFactura: async (facturaData) => {
    try {
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

      // Validar datos requeridos según la documentación
      if (!facturaData.invoice_number || !facturaData.invoice_date || !facturaData.total_amount || 
          !facturaData.provider_id || !facturaData.cost_center_id) {
        throw new Error('Faltan datos requeridos: número de factura, fecha, monto total, proveedor y centro de costo');
      }

      const response = await fetch(getApiUrl('/api/invoices'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(facturaData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 DEBUG: Factura creada:', data);
      return data;
    } catch (error) {
      console.error('Error al crear factura:', error);
      throw error;
    }
  },

  // Actualizar una factura
  updateFactura: async (facturaId, facturaData) => {
    try {
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

      const response = await fetch(getApiUrl(`/api/invoices/${facturaId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(facturaData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 DEBUG: Factura actualizada:', data);
      return data;
    } catch (error) {
      console.error('Error al actualizar factura:', error);
      throw error;
    }
  },

  // Eliminar una factura
  deleteFactura: async (facturaId) => {
    try {
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

      const response = await fetch(getApiUrl(`/api/invoices/${facturaId}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 DEBUG: Factura eliminada:', data);
      return data;
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      throw error;
    }
  },

  // Procesar archivo de factura con webhook
  procesarArchivoFactura: async (file, webhookUrl = null) => {
    try {
      // Validar archivo
      if (!file) {
        throw new Error('No se proporcionó ningún archivo');
      }

      if (!WEBHOOK_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error('Tipo de archivo no soportado. Solo se permiten PDF e imágenes (JPG, PNG)');
      }

      if (file.size > WEBHOOK_CONFIG.MAX_FILE_SIZE) {
        throw new Error(`El archivo es demasiado grande. Máximo ${WEBHOOK_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      // URL del webhook
      const webhookEndpoint = webhookUrl || WEBHOOK_CONFIG.INVOICE_PROCESSING_URL;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', new Date().toISOString());
      formData.append('source', 'react-app');

      // Configurar timeout con AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), WEBHOOK_CONFIG.TIMEOUT);

      try {
        const response = await fetch(webhookEndpoint, {
          method: 'POST',
          body: formData,
          headers: WEBHOOK_CONFIG.HEADERS,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        // Validar respuesta del webhook
        validateWebhookResponse(result);

        return result;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Tiempo de espera agotado al procesar el archivo');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      throw error;
    }
  },

  // Crear factura desde datos extraídos
  crearFacturaDesdeArchivo: async (facturaData) => {
    try {
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

      // Validar datos requeridos según la documentación
      if (!facturaData.invoice_number || !facturaData.invoice_date || !facturaData.total_amount || 
          !facturaData.provider_id || !facturaData.cost_center_id) {
        throw new Error('Faltan datos requeridos: número de factura, fecha, monto total, proveedor y centro de costo');
      }

      const response = await fetch(getApiUrl('/api/invoices'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(facturaData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error al crear la factura`);
      }

      const data = await response.json();
      console.log('📋 DEBUG: Factura creada desde archivo:', data);
      return data;
    } catch (error) {
      console.error('Error al crear factura desde archivo:', error);
      throw error;
    }
  },

  // Crear factura con archivos (factura PDF + soporte de pago)
  crearFacturaConArchivos: async (facturaData, facturaFile, paymentSupportFile) => {
    try {
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

      // Validar datos requeridos
      if (!facturaData.invoice_number || !facturaData.invoice_date || !facturaData.total_amount || 
          !facturaData.cost_center_id) {
        throw new Error('Faltan datos requeridos: número de factura, fecha, monto total y centro de costo');
      }

      // Validar archivos
      if (!facturaFile) {
        throw new Error('Se requiere el archivo de factura (PDF)');
      }
      if (!paymentSupportFile) {
        throw new Error('Se requiere el archivo de soporte de pago (imagen)');
      }

      // Crear FormData para enviar archivos
      const formData = new FormData();
      
      // Agregar datos de la factura
      Object.keys(facturaData).forEach(key => {
        formData.append(key, facturaData[key]);
      });
      
      // Agregar archivos
      formData.append('factura_file', facturaFile);
      formData.append('payment_support_file', paymentSupportFile);

      const response = await fetch(getApiUrl('/api/invoices/with-files'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error al crear la factura con archivos`);
      }

      const data = await response.json();
      console.log('📋 DEBUG: Factura creada con archivos:', data);
      return data;
    } catch (error) {
      console.error('Error al crear factura con archivos:', error);
      throw error;
    }
  },

  // Función auxiliar para formatear datos de factura para el frontend
  formatFacturaForFrontend: (factura) => {
    if (!factura) return null;
    
    return {
      // Mapear campos de la API a campos del frontend
      id: factura.invoice_id || factura.id,
      number: factura.invoice_number || factura.number,
      invoice_number: factura.invoice_number || factura.number,
      date: factura.invoice_date || factura.date,
      due_date: factura.due_date,
      amount: parseFloat(factura.total_amount || factura.amount || 0),
      total_amount: parseFloat(factura.total_amount || factura.amount || 0),
      subtotal: parseFloat(factura.subtotal || 0),
      tax_amount: parseFloat(factura.tax_amount || 0),
      paid_amount: parseFloat(factura.paid_amount || 0),
      balance: parseFloat(factura.balance || 0),
      status: factura.status || 'PENDIENTE',
      payment_method: factura.payment_method || 'Transferencia',
      payment_reference: factura.payment_reference || '',
      description: factura.description || '',
      notes: factura.notes || '',
      document_url: factura.document_url || '',
      provider_id: factura.provider_id,
      cost_center_id: factura.cost_center_id,
      project_id: factura.project?.id || factura.project_id,
      user_id: factura.user?.id || factura.user_id,
      created_at: factura.created_at,
      updated_at: factura.updated_at,
      paid_at: factura.paid_at,
      cancelled_at: factura.cancelled_at,
      // Campos para facturas próximas a vencer
      days_until_due: factura.days_until_due,
      days_overdue: factura.days_overdue,
      urgency_level: factura.urgency_level,
      // Relaciones completas - mapear según estructura real de la API
      supplier: {
        id: factura.provider?.provider_id,
        name: factura.provider?.provider_name || '',
        tax_id: factura.provider?.NIT || factura.provider?.provider_tax_id || '',
        phone: factura.provider?.phone || '',
        email: factura.provider?.email || '',
        contact_name: factura.provider?.contact_name || ''
      },
      cost_center: {
        id: factura.cost_center?.cost_center_id,
        name: factura.cost_center?.cost_center_name || '',
        description: factura.cost_center?.description || ''
      },
      project: {
        id: factura.project?.id,
        name: factura.project?.name || '',
        start_date: factura.project?.start_date || '',
        estimated_end_date: factura.project?.estimated_end_date || '',
        status_id: factura.project?.status_id,
        client: factura.project?.client || null,
        quotation: factura.project?.quotation || null
      },
      user: {
        id: factura.user?.id,
        name: factura.user?.name || '',
        email: factura.user?.email || '',
        phone: factura.user?.phone || ''
      },
      responsible_user: factura.responsible_user
    };
  },

  // Función auxiliar para formatear detalles completos de factura
  formatFacturaDetallesForFrontend: (data) => {
    if (!data || !data.success || !data.data) return null;
    
    const invoiceDetails = data.data.invoice_details || {};
    const supplierInfo = data.data.supplier_info || {};
    const projectInfo = data.data.project_info || {};
    const responsibleUser = data.data.responsible_user || {};
    const systemDates = data.data.system_dates || {};
    
    return {
      // Detalles de la factura
      invoice_details: {
        number: invoiceDetails.number || '',
        date: invoiceDetails.date || '',
        due_date: invoiceDetails.due_date || '',
        total_amount: invoiceDetails.total_amount || '',
        subtotal: invoiceDetails.subtotal || '',
        tax_amount: invoiceDetails.tax_amount || '',
        paid_amount: invoiceDetails.paid_amount || '',
        balance: invoiceDetails.balance || '',
        status: invoiceDetails.status || 'Pendiente',
        payment_method: invoiceDetails.payment_method || '',
        payment_reference: invoiceDetails.payment_reference || '',
        description: invoiceDetails.description || '',
        notes: invoiceDetails.notes || '',
        document_url: invoiceDetails.document_url || '',
        paid_at: invoiceDetails.paid_at || '',
        cancelled_at: invoiceDetails.cancelled_at || ''
      },
      // Información del proveedor
      supplier_info: {
        name: supplierInfo.name || '',
        nit: supplierInfo.nit || '',
        address: supplierInfo.address || '',
        phone: supplierInfo.phone || '',
        email: supplierInfo.email || '',
        contact_person: supplierInfo.contact_person || ''
      },
      // Información del proyecto
      project_info: {
        code: projectInfo.code || '',
        name: projectInfo.name || '',
        status: projectInfo.status || '',
        start_date: projectInfo.start_date || '',
        estimated_end_date: projectInfo.estimated_end_date || '',
        actual_end_date: projectInfo.actual_end_date || ''
      },
      // Usuario responsable
      responsible_user: {
        name: responsibleUser.name || '',
        email: responsibleUser.email || '',
        phone: responsibleUser.phone || ''
      },
      // Fechas del sistema
      system_dates: {
        created_at: systemDates.created_at || '',
        updated_at: systemDates.updated_at || ''
      }
    };
  },

  // Función auxiliar para formatear datos de facturas próximas a vencer
  formatFacturasProximasVencer: (data) => {
    if (!data || !data.success) return null;
    
    const upcomingDue = data.data.upcoming_due || {};
    const overdue = data.data.overdue || {};
    const summary = data.data.summary || {};
    
    return {
      upcoming_due: {
        count: upcomingDue.count || 0,
        total_amount: parseFloat(upcomingDue.total_amount || 0),
        invoices: (upcomingDue.invoices || []).map(invoice => 
          facturasService.formatFacturaForFrontend(invoice)
        )
      },
      overdue: {
        count: overdue.count || 0,
        total_amount: parseFloat(overdue.total_amount || 0),
        invoices: (overdue.invoices || []).map(invoice => 
          facturasService.formatFacturaForFrontend(invoice)
        )
      },
      summary: {
        total_critical: summary.total_critical || 0,
        total_upcoming_amount: parseFloat(summary.total_upcoming_amount || 0),
        total_overdue_amount: parseFloat(summary.total_overdue_amount || 0),
        days_filter: summary.days_filter || 30
      }
    };
  },

  // Función auxiliar para obtener el color del nivel de urgencia
  getUrgencyColor: (urgencyLevel) => {
    const colors = {
      'critical': 'text-red-600 bg-red-100',
      'high': 'text-orange-600 bg-orange-100',
      'medium': 'text-yellow-600 bg-yellow-100',
      'low': 'text-green-600 bg-green-100'
    };
    return colors[urgencyLevel] || 'text-gray-600 bg-gray-100';
  },

  // Función auxiliar para obtener el texto del nivel de urgencia
  getUrgencyText: (urgencyLevel) => {
    const texts = {
      'critical': 'Crítico',
      'high': 'Alto',
      'medium': 'Medio',
      'low': 'Bajo'
    };
    return texts[urgencyLevel] || 'Desconocido';
  },

  // 🔄 NUEVO: Cambiar estado de factura
  changeInvoiceStatus: async (invoiceId, newStatus) => {
    try {
      // Validar parámetros de entrada
      if (!invoiceId || isNaN(invoiceId) || invoiceId <= 0) {
        throw new Error('ID de factura inválido');
      }

      if (!newStatus || typeof newStatus !== 'string') {
        throw new Error('Estado requerido');
      }

      // Validar estado
      if (!['PENDIENTE', 'PAGADA'].includes(newStatus.toUpperCase())) {
        throw new Error('Estado inválido. Solo se permiten: PENDIENTE, PAGADA');
      }

      // Obtener token de autenticación
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autorización. Por favor, inicia sesión nuevamente.');
      }

      console.log('🔄 DEBUG: Cambiando estado de factura:', invoiceId, 'a:', newStatus);

      // Validar estructura de la respuesta
      const validateResponse = (data) => {
        if (!data || typeof data !== 'object') {
          throw new Error('Respuesta del servidor inválida');
        }
        
        if (data.success === false) {
          throw new Error(data.message || 'Error en la operación');
        }
        
        return data;
      };

      const data = await makeApiRequest(
        getApiUrl(`/api/invoices/${invoiceId}/status`),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({ status: newStatus.toUpperCase() })
        },
        'cambio de estado de factura'
      );

      const validatedData = validateResponse(data);
      console.log('✅ DEBUG: Estado de factura actualizado:', validatedData);
      return validatedData;
    } catch (error) {
      console.error('Error al cambiar estado de factura:', error);
      throw error;
    }
  },

  // 🏢 NUEVO: Cambiar centro de costo de factura
  changeInvoiceCostCenter: async (invoiceId, newCostCenterId) => {
    try {
      // Validar parámetros de entrada
      if (!invoiceId || isNaN(invoiceId) || invoiceId <= 0) {
        throw new Error('ID de factura inválido');
      }

      if (!newCostCenterId || isNaN(newCostCenterId) || newCostCenterId <= 0) {
        throw new Error('ID de centro de costo inválido');
      }

      // Obtener token de autenticación
      const token = getAuthToken();
      if (!token) {
        throw new Error('No se encontró token de autorización. Por favor, inicia sesión nuevamente.');
      }

      console.log('🏢 DEBUG: Cambiando centro de costo de factura:', invoiceId, 'a:', newCostCenterId);

      // Validar estructura de la respuesta
      const validateResponse = (data) => {
        if (!data || typeof data !== 'object') {
          throw new Error('Respuesta del servidor inválida');
        }
        
        if (data.success === false) {
          throw new Error(data.message || 'Error en la operación');
        }
        
        return data;
      };

      const data = await makeApiRequest(
        getApiUrl(`/api/invoices/${invoiceId}/cost-center`),
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify({ cost_center_id: parseInt(newCostCenterId) })
        },
        'cambio de centro de costo de factura'
      );

      const validatedData = validateResponse(data);
      console.log('✅ DEBUG: Centro de costo de factura actualizado:', validatedData);
      return validatedData;
    } catch (error) {
      console.error('Error al cambiar centro de costo de factura:', error);
      throw error;
    }
  }
};