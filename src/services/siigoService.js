import { getApiUrl } from '../config/api';

class SiigoService {
  constructor() {
    // El backend maneja toda la autenticación automáticamente
  }

  // Base URL del backend para Siigo
  getBaseUrl() {
    return getApiUrl('/api/siigo');
  }

  // Obtener productos de Siigo a través del backend
  async getProducts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Parámetros de paginación
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('page_size', params.pageSize);
      if (params.name) queryParams.append('name', params.name);
      if (params.code) queryParams.append('code', params.code);
      // Removido params.search - no existe en la API

      const url = `${this.getBaseUrl()}/products?${queryParams.toString()}`;
      
      // Obtener token de autenticación del localStorage
      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('Token de autenticación requerido. Por favor, inicia sesión.');
      }
      
      console.log('🔍 SiigoService - Iniciando petición:', {
        url,
        params,
        hasAuthToken: !!authToken,
        timestamp: new Date().toISOString()
      });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('📡 SiigoService - Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ SiigoService - Error en respuesta:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url
        });
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ SiigoService - Datos recibidos:', {
        success: data.success,
        message: data.message,
        dataLength: data.data?.results?.length || 0,
        pagination: data.data?.pagination
      });
      
      // El backend devuelve la estructura: { success, message, data: { results, pagination } }
      return data;
    } catch (error) {
      console.error('💥 SiigoService - Error completo:', {
        message: error.message,
        stack: error.stack,
        params,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // Obtener un producto específico por ID
  async getProduct(productId) {
    try {
      const url = `${this.getBaseUrl()}/products/${productId}`;
      
      // Obtener token de autenticación
      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('Token de autenticación requerido. Por favor, inicia sesión.');
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en SiigoService.getProduct:', error);
      throw error;
    }
  }

  // Obtener facturas de Siigo a través del backend
  async getInvoices(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('page_size', params.pageSize);
      if (params.documentId) queryParams.append('document_id', params.documentId);
      if (params.createdStart) queryParams.append('created_start', params.createdStart);
      if (params.createdEnd) queryParams.append('created_end', params.createdEnd);

      const url = `${this.getBaseUrl()}/invoices?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en SiigoService.getInvoices:', error);
      throw error;
    }
  }

  // Obtener clientes de Siigo a través del backend
  async getCustomers(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.pageSize) queryParams.append('page_size', params.pageSize);
      if (params.name) queryParams.append('name', params.name);
      if (params.document) queryParams.append('document', params.document);

      const url = `${this.getBaseUrl()}/customers?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en SiigoService.getCustomers:', error);
      throw error;
    }
  }

  // Obtener información del token (para debugging)
  async getTokenInfo() {
    try {
      const url = `${this.getBaseUrl()}/token-info`;
      
      // Obtener token de autenticación
      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('Token de autenticación requerido. Por favor, inicia sesión.');
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en SiigoService.getTokenInfo:', error);
      throw error;
    }
  }

  // Probar conexión con Siigo
  async testConnection() {
    try {
      const url = `${this.getBaseUrl()}/test-connection`;
      
      // Obtener token de autenticación
      const authToken = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!authToken) {
        throw new Error('Token de autenticación requerido. Por favor, inicia sesión.');
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en SiigoService.testConnection:', error);
      throw error;
    }
  }
}

// Exportar instancia única del servicio
export const siigoService = new SiigoService();
export default siigoService;