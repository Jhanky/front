import { getApiUrl } from '../config/api';

export const gestionFinancieraService = {
  // Obtener resumen de caja
  getResumenCaja: async () => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const response = await fetch(getApiUrl('/financial/summary'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error al obtener resumen de caja');
      return await response.json();
    } catch (error) {
      console.error('Error al obtener resumen de caja:', error);
      throw error;
    }
  },

  // Obtener ingresos
  getIngresos: async (filters = {}) => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const params = new URLSearchParams();
      if (filters.fechaInicio) params.append('fecha_inicio', filters.fechaInicio);
      if (filters.fechaFin) params.append('fecha_fin', filters.fechaFin);
      if (filters.cliente) params.append('cliente', filters.cliente);
      if (filters.tipo) params.append('tipo', filters.tipo);
      
      const response = await fetch(getApiUrl(`/financial/income?${params.toString()}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error al obtener ingresos');
      return await response.json();
    } catch (error) {
      console.error('Error al obtener ingresos:', error);
      throw error;
    }
  },

  // Crear nuevo ingreso
  createIngreso: async (ingresoData) => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const response = await fetch(getApiUrl('/financial/income'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(ingresoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear ingreso');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al crear ingreso:', error);
      throw error;
    }
  },

  // Actualizar ingreso
  updateIngreso: async (id, ingresoData) => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const response = await fetch(getApiUrl(`/financial/income/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(ingresoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar ingreso');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar ingreso:', error);
      throw error;
    }
  },

  // Eliminar ingreso
  deleteIngreso: async (id) => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const response = await fetch(getApiUrl(`/financial/income/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar ingreso');
      }
      return true;
    } catch (error) {
      console.error('Error al eliminar ingreso:', error);
      throw error;
    }
  },

  // Obtener egresos
  getEgresos: async (filters = {}) => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const params = new URLSearchParams();
      if (filters.fechaInicio) params.append('fecha_inicio', filters.fechaInicio);
      if (filters.fechaFin) params.append('fecha_fin', filters.fechaFin);
      if (filters.categoria) params.append('categoria', filters.categoria);
      if (filters.proveedor) params.append('proveedor', filters.proveedor);
      
      const response = await fetch(getApiUrl(`/financial/expenses?${params.toString()}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error al obtener egresos');
      return await response.json();
    } catch (error) {
      console.error('Error al obtener egresos:', error);
      throw error;
    }
  },

  // Crear nuevo egreso
  createEgreso: async (egresoData) => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const response = await fetch(getApiUrl('/financial/expenses'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(egresoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear egreso');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al crear egreso:', error);
      throw error;
    }
  },

  // Actualizar egreso
  updateEgreso: async (id, egresoData) => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const response = await fetch(getApiUrl(`/financial/expenses/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(egresoData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar egreso');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar egreso:', error);
      throw error;
    }
  },

  // Eliminar egreso
  deleteEgreso: async (id) => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const response = await fetch(getApiUrl(`/financial/expenses/${id}`), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar egreso');
      }
      return true;
    } catch (error) {
      console.error('Error al eliminar egreso:', error);
      throw error;
    }
  },

  // Obtener facturas de proveedores
  getFacturasProveedores: async (filters = {}) => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const params = new URLSearchParams();
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.proveedor) params.append('proveedor', filters.proveedor);
      if (filters.fechaVencimiento) params.append('fecha_vencimiento', filters.fechaVencimiento);
      
      const response = await fetch(getApiUrl(`/financial/supplier-invoices?${params.toString()}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error al obtener facturas de proveedores');
      return await response.json();
    } catch (error) {
      console.error('Error al obtener facturas de proveedores:', error);
      throw error;
    }
  },

  // Marcar factura como pagada
  marcarFacturaPagada: async (id) => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const response = await fetch(getApiUrl(`/financial/supplier-invoices/${id}/pay`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al marcar factura como pagada');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al marcar factura como pagada:', error);
      throw error;
    }
  },

  // Simular escenario financiero
  simularEscenario: async (simulacionData) => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const response = await fetch(getApiUrl('/financial/simulate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(simulacionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al simular escenario');
      }
      return await response.json();
    } catch (error) {
      console.error('Error al simular escenario:', error);
      throw error;
    }
  },

  // Obtener alertas financieras
  getAlertasFinancieras: async () => {
    try {
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const response = await fetch(getApiUrl('/financial/alerts'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Error al obtener alertas financieras');
      return await response.json();
    } catch (error) {
      console.error('Error al obtener alertas financieras:', error);
      throw error;
    }
  }
};
