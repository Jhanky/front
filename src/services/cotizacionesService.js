import { getApiUrl } from '../config/api';

// Función auxiliar para manejar respuestas de la API
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
    
    // Log detallado del error para debugging
    console.error('🚨 ERROR DE API:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      errorData: errorData
    });
    
    // Si es un error de validación (422), mostrar los errores específicos
    if (response.status === 422 && errorData.errors) {
      const validationErrors = Object.entries(errorData.errors)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('; ');
      
      throw new Error(`Error de validación: ${validationErrors}`);
    }
    
    // Si hay un mensaje específico del backend, usarlo
    if (errorData.message) {
      throw new Error(errorData.message);
    }
    
    // Si hay errores específicos, mostrarlos
    if (errorData.errors) {
      const errorMessages = Object.entries(errorData.errors)
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
        .join('; ');
      throw new Error(`Errores de validación: ${errorMessages}`);
    }
    
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Función auxiliar para obtener headers de autenticación
const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
  'Accept': 'application/json'
});

export const cotizacionesService = {
  // 1. Obtener todas las cotizaciones con filtros y paginación
  getCotizaciones: async (params = {}, token) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar parámetros de query según la documentación
      if (params.page) queryParams.append('page', params.page);
      if (params.per_page) queryParams.append('per_page', params.per_page);
      if (params.search) queryParams.append('search', params.search);
      if (params.status_id) queryParams.append('status_id', params.status_id);
      if (params.system_type) queryParams.append('system_type', params.system_type);
      if (params.client_id) queryParams.append('client_id', params.client_id);
      if (params.sort_by) queryParams.append('sort_by', params.sort_by);
      if (params.sort_order) queryParams.append('sort_order', params.sort_order);

      const url = getApiUrl('/api/quotations') + (queryParams.toString() ? `?${queryParams.toString()}` : '');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const result = await handleResponse(response);
      
      // La respuesta según la documentación tiene esta estructura:
      // { success: true, data: { current_page, data: [...], total, per_page }, message }
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data.data || [], // Array de cotizaciones
          pagination: {
            current_page: result.data.current_page,
            total: result.data.total,
            per_page: result.data.per_page,
            last_page: Math.ceil(result.data.total / result.data.per_page)
          },
          message: result.message
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error al obtener cotizaciones:', error);
      throw error;
    }
  },

  // 2. Obtener cotización por ID
  getCotizacionById: async (id, token) => {
    try {
      const response = await fetch(getApiUrl(`/api/quotations/${id}`), {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      const result = await handleResponse(response);
      
      // La respuesta según la documentación tiene esta estructura:
      // { success: true, data: {...}, message }
      if (result.success && result.data) {
        return {
          success: true,
          data: result.data,
          message: result.message
        };
      }
      
      return result;
    } catch (error) {
      console.error('Error al obtener cotización:', error);
      throw error;
    }
  },

  // 3. Crear nueva cotización
  createCotizacion: async (cotizacionData, token) => {
    try {
      console.log('🚀 DEBUG: Enviando cotización al backend');
      console.log('📤 URL:', getApiUrl('/api/quotations'));
      console.log('🔑 Token disponible:', !!token);
      console.log('📋 Datos a enviar:', JSON.stringify(cotizacionData, null, 2));
      
      const response = await fetch(getApiUrl('/api/quotations'), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(cotizacionData)
      });

      console.log('📥 Respuesta del backend:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al crear cotización:', error);
      throw error;
    }
  },

  // 4. Actualizar cotización (ADAPTADO PARA CAMBIOS DINÁMICOS)
  updateCotizacion: async (id, cotizacionData, token) => {
    try {
      // Preparar datos para el backend según la documentación actualizada
      const updateData = {};
      
      // Solo incluir campos que realmente se están actualizando
      if (cotizacionData.used_products !== undefined) {
        updateData.used_products = cotizacionData.used_products;
      }
      
      if (cotizacionData.items !== undefined) {
        updateData.items = cotizacionData.items;
      }
      
      // Incluir porcentajes si se están actualizando
      if (cotizacionData.profit_percentage !== undefined) {
        updateData.profit_percentage = parseFloat(cotizacionData.profit_percentage);
      }
      
      if (cotizacionData.iva_profit_percentage !== undefined) {
        updateData.iva_profit_percentage = parseFloat(cotizacionData.iva_profit_percentage);
      }
      
      if (cotizacionData.commercial_management_percentage !== undefined) {
        updateData.commercial_management_percentage = parseFloat(cotizacionData.commercial_management_percentage);
      }
      
      if (cotizacionData.administration_percentage !== undefined) {
        updateData.administration_percentage = parseFloat(cotizacionData.administration_percentage);
      }
      
      if (cotizacionData.contingency_percentage !== undefined) {
        updateData.contingency_percentage = parseFloat(cotizacionData.contingency_percentage);
      }
      
      if (cotizacionData.withholding_percentage !== undefined) {
        updateData.withholding_percentage = parseFloat(cotizacionData.withholding_percentage);
      }
      
      // IMPORTANTE: Incluir valores monetarios calculados para sincronización completa con la BD
      // Estos campos deben actualizarse para mantener consistencia entre frontend y backend
      if (cotizacionData.total_value !== undefined) {
        updateData.total_value = parseFloat(cotizacionData.total_value);
      }
      
      if (cotizacionData.subtotal !== undefined) {
        updateData.subtotal = parseFloat(cotizacionData.subtotal);
      }
      
      if (cotizacionData.subtotal2 !== undefined) {
        updateData.subtotal2 = parseFloat(cotizacionData.subtotal2);
      }
      
      if (cotizacionData.subtotal3 !== undefined) {
        updateData.subtotal3 = parseFloat(cotizacionData.subtotal3);
      }
      
      if (cotizacionData.profit !== undefined) {
        updateData.profit = parseFloat(cotizacionData.profit);
      }
      
      if (cotizacionData.profit_iva !== undefined) {
        updateData.profit_iva = parseFloat(cotizacionData.profit_iva);
      }
      
      if (cotizacionData.commercial_management !== undefined) {
        updateData.commercial_management = parseFloat(cotizacionData.commercial_management);
      }
      
      if (cotizacionData.administration !== undefined) {
        updateData.administration = parseFloat(cotizacionData.administration);
      }
      
      if (cotizacionData.contingency !== undefined) {
        updateData.contingency = parseFloat(cotizacionData.contingency);
      }
      
      if (cotizacionData.withholdings !== undefined) {
        updateData.withholdings = parseFloat(cotizacionData.withholdings);
      }
      
      // Incluir otros campos si se están actualizando
      if (cotizacionData.client_id !== undefined) {
        updateData.client_id = parseInt(cotizacionData.client_id);
      }
      
      if (cotizacionData.user_id !== undefined) {
        updateData.user_id = parseInt(cotizacionData.user_id);
      }
      
      if (cotizacionData.project_name !== undefined) {
        updateData.project_name = cotizacionData.project_name;
      }
      
      if (cotizacionData.system_type !== undefined) {
        updateData.system_type = cotizacionData.system_type;
      }
      
      if (cotizacionData.power_kwp !== undefined) {
        updateData.power_kwp = parseFloat(cotizacionData.power_kwp);
      }
      
      if (cotizacionData.panel_count !== undefined) {
        updateData.panel_count = parseInt(cotizacionData.panel_count);
      }
      
      if (cotizacionData.requires_financing !== undefined) {
        updateData.requires_financing = Boolean(cotizacionData.requires_financing);
      }
      
      if (cotizacionData.status_id !== undefined) {
        updateData.status_id = parseInt(cotizacionData.status_id);
      }

      console.log('📊 Datos completos a enviar al backend:', updateData);
      console.log('💰 Valores monetarios incluidos:', {
        total_value: updateData.total_value,
        subtotal: updateData.subtotal,
        subtotal2: updateData.subtotal2,
        subtotal3: updateData.subtotal3,
        profit: updateData.profit,
        profit_iva: updateData.profit_iva,
        commercial_management: updateData.commercial_management,
        administration: updateData.administration,
        contingency: updateData.contingency,
        withholdings: updateData.withholdings
      });

      const response = await fetch(getApiUrl(`/api/quotations/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(updateData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al actualizar cotización:', error);
      throw error;
    }
  },

  // 5. Eliminar cotización
  deleteCotizacion: async (id, token) => {
    try {
      const response = await fetch(getApiUrl(`/api/quotations/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al eliminar cotización:', error);
      throw error;
    }
  },

  // 6. Agregar producto a cotización
  addProductToCotizacion: async (id, productData, token) => {
    try {
      const response = await fetch(getApiUrl(`/api/quotations/${id}/products`), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(productData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al agregar producto:', error);
      throw error;
    }
  },

  // 7. Agregar item a cotización
  addItemToCotizacion: async (id, itemData, token) => {
    try {
      const response = await fetch(getApiUrl(`/api/quotations/${id}/items`), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(itemData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al agregar item:', error);
      throw error;
    }
  },

  // 8. Cambiar estado de cotización
  changeCotizacionStatus: async (id, statusId, token) => {
    try {
      const response = await fetch(getApiUrl(`/api/quotations/${id}/status`), {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status_id: statusId })
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  },

  // 9. Recalcular totales (NUEVO - para sincronización con cálculos del frontend)
  recalculateTotals: async (id, token) => {
    try {
      const response = await fetch(getApiUrl(`/api/quotations/${id}/recalculate`), {
        method: 'POST',
        headers: getAuthHeaders(token)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al recalcular totales:', error);
      throw error;
    }
  },

  // 10. Obtener estadísticas
  getStatistics: async (token) => {
    try {
      const response = await fetch(getApiUrl('/api/quotations/statistics'), {
        method: 'GET',
        headers: getAuthHeaders(token)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  // 11. Sincronizar cambios del frontend (NUEVO)
  syncFrontendChanges: async (id, changes, token) => {
    try {
      // Esta función es específica para sincronizar los cambios dinámicos del frontend
      // como cambios en productos, items y porcentajes
      const syncData = {
        used_products: changes.used_products,
        items: changes.items,
        percentages: {
          profit_percentage: changes.profit_percentage,
          iva_profit_percentage: changes.iva_profit_percentage,
          commercial_management_percentage: changes.commercial_management_percentage,
          administration_percentage: changes.administration_percentage,
          contingency_percentage: changes.contingency_percentage,
          withholding_percentage: changes.withholding_percentage
        }
      };

      const response = await fetch(getApiUrl(`/api/quotations/${id}/sync`), {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(syncData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Error al sincronizar cambios del frontend:', error);
      throw error;
    }
  },

  // Función auxiliar para formatear datos de cotización para el frontend
  formatCotizacionForFrontend: (cotizacion) => {
    return {
      id: cotizacion.quotation_id,
      quotation_id: cotizacion.quotation_id,
      quotation_number: cotizacion.quotation_number,
      project_name: cotizacion.project_name,
      system_type: cotizacion.system_type,
      power_kwp: parseFloat(cotizacion.power_kwp),
      panel_count: parseInt(cotizacion.panel_count),
      requires_financing: Boolean(cotizacion.requires_financing),
      total_value: parseFloat(cotizacion.total_value),
      subtotal: parseFloat(cotizacion.subtotal),
      subtotal2: parseFloat(cotizacion.subtotal2),
      subtotal3: parseFloat(cotizacion.subtotal3),
      profit: parseFloat(cotizacion.profit),
      profit_iva: parseFloat(cotizacion.profit_iva),
      commercial_management: parseFloat(cotizacion.commercial_management),
      administration: parseFloat(cotizacion.administration),
      contingency: parseFloat(cotizacion.contingency),
      withholdings: parseFloat(cotizacion.withholdings),
      status: cotizacion.status,
      status_id: cotizacion.status_id,
      client: cotizacion.client,
      user: cotizacion.user,
      created_at: cotizacion.created_at,
      updated_at: cotizacion.updated_at,
      // Porcentajes
      profit_percentage: parseFloat(cotizacion.profit_percentage),
      iva_profit_percentage: parseFloat(cotizacion.iva_profit_percentage),
      commercial_management_percentage: parseFloat(cotizacion.commercial_management_percentage),
      administration_percentage: parseFloat(cotizacion.administration_percentage),
      contingency_percentage: parseFloat(cotizacion.contingency_percentage),
      withholding_percentage: parseFloat(cotizacion.withholding_percentage),
      // Productos e items
      used_products: cotizacion.used_products || [],
      items: cotizacion.items || []
    };
  },

  // Función auxiliar para formatear datos para enviar al backend
  formatCotizacionForBackend: (cotizacionData) => {
    return {
      client_id: parseInt(cotizacionData.client_id),
      project_name: cotizacionData.project_name,
      system_type: cotizacionData.system_type,
      power_kwp: parseFloat(cotizacionData.power_kwp),
      panel_count: parseInt(cotizacionData.panel_count),
      requires_financing: Boolean(cotizacionData.requires_financing),
      profit_percentage: parseFloat(cotizacionData.profit_percentage || 15),
      iva_profit_percentage: parseFloat(cotizacionData.iva_profit_percentage || 13),
      commercial_management_percentage: parseFloat(cotizacionData.commercial_management_percentage || 5),
      administration_percentage: parseFloat(cotizacionData.administration_percentage || 3),
      contingency_percentage: parseFloat(cotizacionData.contingency_percentage || 2),
      withholding_percentage: parseFloat(cotizacionData.withholding_percentage || 2),
      used_products: cotizacionData.used_products || [],
      items: cotizacionData.items || []
    };
  },

  // Función para validar datos de cotización
  validateCotizacionData: (data) => {
    console.log('🔍 DEBUG: validateCotizacionData recibió:', data);
    console.log('  - data.products:', data.products);
    console.log('  - data.items:', data.items);
    console.log('  - data.products?.length:', data.products?.length);
    console.log('  - data.items?.length:', data.items?.length);
    
    const errors = [];

    console.log('🔍 DEBUG: Validando campos individuales:');
    console.log('  - client_id:', data.client_id, '¿válido?', !!data.client_id);
    console.log('  - project_name:', data.project_name, '¿válido?', !!data.project_name);
    console.log('  - system_type:', data.system_type, '¿válido?', !!data.system_type);
    console.log('  - power_kwp:', data.power_kwp, '¿válido?', !!(data.power_kwp && parseFloat(data.power_kwp) > 0));
    console.log('  - panel_count:', data.panel_count, '¿válido?', !(data.panel_count === undefined || data.panel_count === null || parseInt(data.panel_count) < 0));
    
    // Validaciones básicas
    if (!data.client_id) errors.push('El cliente es requerido');
    if (!data.project_name) errors.push('El nombre del proyecto es requerido');
    if (!data.system_type) errors.push('El tipo de sistema es requerido');
    if (!data.power_kwp || parseFloat(data.power_kwp) <= 0) errors.push('La potencia debe ser mayor a 0');
    if (data.panel_count === undefined || data.panel_count === null || parseInt(data.panel_count) < 0) {
      errors.push('El número de paneles debe ser 0 o mayor');
    }

    // Validar que haya al menos un producto o item
    console.log('🔍 DEBUG: Validando productos e items:');
    console.log('  - ¿Hay productos?', !!(data.products && data.products.length > 0));
    console.log('  - ¿Hay items?', !!(data.items && data.items.length > 0));
    console.log('  - Condición total:', !((!data.products || data.products.length === 0) && (!data.items || data.items.length === 0)));
    
    // Permitir cotizaciones con solo productos, solo items, o ambos
    if ((!data.products || data.products.length === 0) && (!data.items || data.items.length === 0)) {
      errors.push('Debe haber al menos un producto o item en la cotización');
    }

    // Validar productos si existen
    if (data.products && data.products.length > 0) {
      data.products.forEach((product, index) => {
        if (!product.product_type) {
          errors.push(`Producto ${index + 1}: El tipo de producto es requerido`);
        }
        if (!product.product_id) {
          errors.push(`Producto ${index + 1}: El ID del producto es requerido`);
        }
        if (!product.quantity || parseFloat(product.quantity) <= 0) {
          errors.push(`Producto ${index + 1}: La cantidad debe ser mayor a 0`);
        }
        if (!product.unit_price || parseFloat(product.unit_price) < 0) {
          errors.push(`Producto ${index + 1}: El precio unitario no puede ser negativo`);
        }
        if (product.profit_percentage === undefined || product.profit_percentage < 0 || product.profit_percentage > 1) {
          errors.push(`Producto ${index + 1}: El porcentaje de utilidad debe estar entre 0 y 100%`);
        }
      });
    }

    // Validar items si existen
    if (data.items && data.items.length > 0) {
      data.items.forEach((item, index) => {
        if (!item.description) {
          errors.push(`Item ${index + 1}: La descripción es requerida`);
        }
        if (!item.item_type) {
          errors.push(`Item ${index + 1}: El tipo de item es requerido`);
        }
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          errors.push(`Item ${index + 1}: La cantidad debe ser mayor a 0`);
        }
        if (!item.unit) {
          errors.push(`Item ${index + 1}: La unidad es requerida`);
        }
        if (!item.unit_price || parseFloat(item.unit_price) < 0) {
          errors.push(`Item ${index + 1}: El precio unitario no puede ser negativo`);
        }
        if (item.profit_percentage === undefined || item.profit_percentage < 0 || item.profit_percentage > 1) {
          errors.push(`Item ${index + 1}: El porcentaje de utilidad debe estar entre 0 y 100%`);
        }
      });
    }

    console.log('🔍 DEBUG: Errores encontrados:', errors);
    console.log('🔍 DEBUG: ¿Es válido?', errors.length === 0);
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Función para validar cambios dinámicos (NUEVA)
  validateDynamicChanges: (changes) => {
    const errors = [];

    // Validar productos si se están actualizando
    if (changes.used_products) {
      changes.used_products.forEach((product, index) => {
        if (!product.quantity || parseFloat(product.quantity) <= 0) {
          errors.push(`Producto ${index + 1}: La cantidad debe ser mayor a 0`);
        }
        if (!product.unit_price || parseFloat(product.unit_price) < 0) {
          errors.push(`Producto ${index + 1}: El precio unitario no puede ser negativo`);
        }
        if (product.profit_percentage < 0 || product.profit_percentage > 1) {
          errors.push(`Producto ${index + 1}: El porcentaje de utilidad debe estar entre 0 y 100%`);
        }
      });
    }

    // Validar items si se están actualizando
    if (changes.items) {
      changes.items.forEach((item, index) => {
        if (!item.quantity || parseFloat(item.quantity) <= 0) {
          errors.push(`Item ${index + 1}: La cantidad debe ser mayor a 0`);
        }
        if (!item.unit_price || parseFloat(item.unit_price) < 0) {
          errors.push(`Item ${index + 1}: El precio unitario no puede ser negativo`);
        }
        if (item.profit_percentage < 0 || item.profit_percentage > 1) {
          errors.push(`Item ${index + 1}: El porcentaje de utilidad debe estar entre 0 y 100%`);
        }
      });
    }

    // Validar porcentajes si se están actualizando
    if (changes.percentages) {
      const { percentages } = changes;
      const percentageFields = [
        'profit_percentage', 'iva_profit_percentage', 'commercial_management_percentage',
        'administration_percentage', 'contingency_percentage', 'withholding_percentage'
      ];

      percentageFields.forEach(field => {
        if (percentages[field] !== undefined) {
          const value = parseFloat(percentages[field]);
          if (value < 0 || value > 1) {
            errors.push(`${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: El porcentaje debe estar entre 0 y 100%`);
          }
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};
