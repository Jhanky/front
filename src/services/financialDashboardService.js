// Servicio para manejar las operaciones del dashboard financiero
import { getApiUrl } from '../config/api';

export const financialDashboardService = {
  // Obtener resumen financiero completo
  getResumenFinanciero: async () => {
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

      const response = await fetch(getApiUrl('/api/financial-dashboard/summary'), {
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
      console.log('📋 DEBUG: Resultado resumen financiero:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener resumen financiero:', error);
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

      const response = await fetch(getApiUrl(`/api/financial-dashboard/upcoming-due?days=${days}`), {
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

  // Obtener proyectos activos con análisis financiero
  getProyectosActivos: async () => {
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

      const response = await fetch(getApiUrl('/api/financial-dashboard/active-projects'), {
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
      console.log('📋 DEBUG: Resultado proyectos activos:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener proyectos activos:', error);
      throw error;
    }
  },

  // Obtener datos para gráficas - Facturas por mes
  getFacturasPorMes: async (year = null, month = null) => {
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

      let url = '/api/financial-dashboard/charts/monthly-invoices';
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      if (month) params.append('month', month);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(getApiUrl(url), {
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
      console.log('📋 DEBUG: Resultado facturas por mes:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener facturas por mes:', error);
      throw error;
    }
  },

  // Obtener datos para gráficas - Top proveedores
  getTopProveedores: async (limit = 5) => {
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

      const response = await fetch(getApiUrl(`/api/financial-dashboard/charts/top-suppliers?limit=${limit}`), {
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
      console.log('📋 DEBUG: Resultado top proveedores:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener top proveedores:', error);
      throw error;
    }
  },

  // Obtener datos para gráficas - Estados de facturas
  getEstadosFacturas: async () => {
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

      const response = await fetch(getApiUrl('/api/financial-dashboard/charts/invoice-status'), {
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
      console.log('📋 DEBUG: Resultado estados facturas:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener estados de facturas:', error);
      throw error;
    }
  },

  // Obtener datos para gráficas - Métodos de pago
  getMetodosPago: async () => {
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

      const response = await fetch(getApiUrl('/api/financial-dashboard/charts/payment-methods'), {
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
      console.log('📋 DEBUG: Resultado métodos de pago:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
      throw error;
    }
  },

  // Función auxiliar para formatear datos de facturas por mes
  formatFacturasPorMesForFrontend: (data) => {
    if (!data || !data.success || !data.data) return [];
    
    return data.data.map(item => ({
      mes: item.month,
      anio: item.year,
      cantidad: item.count,
      monto: item.total_amount
    }));
  },

  // Función auxiliar para formatear datos de top proveedores
  formatTopProveedoresForFrontend: (data) => {
    if (!data || !data.success || !data.data) return [];
    
    return data.data.map(item => ({
      nombre: item.supplier_name,
      monto: item.total_amount,
      cantidad: item.invoice_count
    }));
  },

  // Función auxiliar para formatear datos de estados de facturas
  formatEstadosFacturasForFrontend: (data) => {
    if (!data || !data.success || !data.data) return [];
    
    return data.data.map(item => ({
      estado: item.status,
      cantidad: item.count,
      porcentaje: item.percentage
    }));
  },

  // Función auxiliar para formatear datos de métodos de pago
  formatMetodosPagoForFrontend: (data) => {
    if (!data || !data.success || !data.data) return [];
    
    return data.data.map(item => ({
      metodo: item.payment_method,
      cantidad: item.count
    }));
  },

  // Función auxiliar para formatear datos del resumen financiero
  formatResumenFinancieroForFrontend: (data) => {
    if (!data || !data.success || !data.data) return null;
    
    const overview = data.data.overview || {};
    const statusBreakdown = data.data.status_breakdown || {};
    
    return {
      overview: {
        total_invoices: overview.total_invoices || 0,
        total_amount: parseFloat(overview.total_amount || 0),
        total_paid: parseFloat(overview.total_paid || 0),
        total_balance: parseFloat(overview.total_balance || 0),
        average_invoice_value: parseFloat(overview.average_invoice_value || 0),
        payment_percentage: parseFloat(overview.payment_percentage || 0)
      },
      status_breakdown: {
        pendiente: {
          count: statusBreakdown.pendiente?.count || 0,
          total_amount: parseFloat(statusBreakdown.pendiente?.total_amount || 0),
          paid_amount: parseFloat(statusBreakdown.pendiente?.paid_amount || 0),
          balance: parseFloat(statusBreakdown.pendiente?.balance || 0)
        },
        pagada: {
          count: statusBreakdown.pagada?.count || 0,
          total_amount: parseFloat(statusBreakdown.pagada?.total_amount || 0),
          paid_amount: parseFloat(statusBreakdown.pagada?.paid_amount || 0),
          balance: parseFloat(statusBreakdown.pagada?.balance || 0)
        },
        cancelada: {
          count: statusBreakdown.cancelada?.count || 0,
          total_amount: parseFloat(statusBreakdown.cancelada?.total_amount || 0),
          paid_amount: parseFloat(statusBreakdown.cancelada?.paid_amount || 0),
          balance: parseFloat(statusBreakdown.cancelada?.balance || 0)
        }
      }
    };
  },

  // Función auxiliar para formatear datos de facturas próximas a vencer
  formatFacturasProximasVencerForFrontend: (data) => {
    if (!data || !data.success || !data.data) return null;
    
    const upcomingDue = data.data.upcoming_due || {};
    const overdue = data.data.overdue || {};
    const summary = data.data.summary || {};
    
    return {
      upcoming_due: {
        count: upcomingDue.count || 0,
        total_amount: parseFloat(upcomingDue.total_amount || 0),
        invoices: (upcomingDue.invoices || []).map(invoice => ({
          id: invoice.id,
          invoice_number: invoice.invoice_number || '',
          due_date: invoice.due_date || '',
          days_until_due: invoice.days_until_due || 0,
          total_amount: parseFloat(invoice.total_amount || 0),
          balance: parseFloat(invoice.balance || 0),
          status: invoice.status || 'pendiente',
          supplier: invoice.supplier || '',
          project: invoice.project || '',
          responsible_user: invoice.responsible_user || '',
          urgency_level: invoice.urgency_level || 'low'
        }))
      },
      overdue: {
        count: overdue.count || 0,
        total_amount: parseFloat(overdue.total_amount || 0),
        invoices: (overdue.invoices || []).map(invoice => ({
          id: invoice.id,
          invoice_number: invoice.invoice_number || '',
          due_date: invoice.due_date || '',
          days_overdue: invoice.days_overdue || 0,
          total_amount: parseFloat(invoice.total_amount || 0),
          balance: parseFloat(invoice.balance || 0),
          status: invoice.status || 'pendiente',
          supplier: invoice.supplier || '',
          project: invoice.project || '',
          responsible_user: invoice.responsible_user || '',
          urgency_level: invoice.urgency_level || 'critical'
        }))
      },
      summary: {
        total_critical: summary.total_critical || 0,
        total_upcoming_amount: parseFloat(summary.total_upcoming_amount || 0),
        total_overdue_amount: parseFloat(summary.total_overdue_amount || 0),
        days_filter: summary.days_filter || 30
      }
    };
  },

  // Función auxiliar para formatear datos de proyectos activos
  formatProyectosActivosForFrontend: (data) => {
    if (!data || !data.success || !data.data) return null;
    
    const overview = data.data.overview || {};
    const projects = data.data.projects || [];
    
    return {
      overview: {
        total_active_projects: overview.total_active_projects || 0,
        total_paid_in_active_projects: parseFloat(overview.total_paid_in_active_projects || 0)
      },
      projects: projects.map(project => ({
        project_id: project.project_id,
        project_name: project.project_name || '',
        start_date: project.start_date || '',
        estimated_end_date: project.estimated_end_date || '',
        status_id: project.status_id,
        client: {
          id: project.client?.id,
          name: project.client?.name || '',
          type: project.client?.type || ''
        },
        quotation: {
          id: project.quotation?.id,
          name: project.quotation?.name || '',
          power_kwp: parseFloat(project.quotation?.power_kwp || 0)
        },
        financial_summary: {
          total_paid_invoices: project.financial_summary?.total_paid_invoices || 0,
          total_paid_amount: parseFloat(project.financial_summary?.total_paid_amount || 0)
        }
      }))
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
  }
};
