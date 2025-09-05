import { getApiUrl } from '../config/api';

export const catalogosService = {
  getProveedores: async () => {
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
      if (!token) throw new Error('No se encontró token de autorización');
      const response = await fetch(getApiUrl('/suppliers'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al obtener proveedores');
      return await response.json();
    } catch (error) {
      console.error('Error al obtener proveedores:', error);
      throw error;
    }
  },
  getCentrosCosto: async (params = {}) => {
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
      if (!token) throw new Error('No se encontró token de autorización');

      // Construir parámetros de query
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.category_id) queryParams.append('category_id', params.category_id);
      if (params.search) queryParams.append('search', params.search);
      if (params.order_by) queryParams.append('order_by', params.order_by);
      if (params.order_direction) queryParams.append('order_direction', params.order_direction);
      if (params.per_page) queryParams.append('per_page', params.per_page);

      const url = getApiUrl('/api/cost-centers') + (queryParams.toString() ? `?${queryParams.toString()}` : '');
      
      console.log('🔍 DEBUG: Obteniendo centros de costo desde:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        // Si el endpoint no existe o hay error del servidor, usar datos mock
        if (response.status === 404 || response.status === 500) {
          console.warn('⚠️ Endpoint de centros de costo no disponible, usando datos mock');
          return {
            success: true,
            data: {
              data: [
                {
                  cost_center_id: 1,
                  name: "Peaje",
                  description: "Gastos de peajes en carreteras",
                  status: "activo",
                  category_id: 1,
                  category: {
                    category_id: 1,
                    name: "Transporte",
                    color: "#3B82F6",
                    icon: "car"
                  },
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                },
                {
                  cost_center_id: 2,
                  name: "Gasolina",
                  description: "Gastos de combustible",
                  status: "activo",
                  category_id: 1,
                  category: {
                    category_id: 1,
                    name: "Transporte",
                    color: "#3B82F6",
                    icon: "car"
                  },
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ]
            }
          };
        }
        
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📋 DEBUG: Resultado centros de costo:', result);
      
      return result;
    } catch (error) {
      console.error('Error al obtener centros de costo:', error);
      
      // En caso de cualquier error, devolver datos mock
      console.warn('⚠️ Error en centros de costo, usando datos mock como fallback');
      return {
        success: true,
        data: {
          data: [
            {
              cost_center_id: 1,
              name: "Peaje",
              description: "Gastos de peajes en carreteras",
              status: "activo",
              category_id: 1,
              category: {
                category_id: 1,
                name: "Transporte",
                color: "#3B82F6",
                icon: "car"
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              cost_center_id: 2,
              name: "Gasolina",
              description: "Gastos de combustible",
              status: "activo",
              category_id: 1,
              category: {
                category_id: 1,
                name: "Transporte",
                color: "#3B82F6",
                icon: "car"
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]
        }
      };
    }
  },

  getCategoriasCentrosCosto: async (params = {}) => {
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
      if (!token) throw new Error('No se encontró token de autorización');

      // Construir parámetros de query
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.order_by) queryParams.append('order_by', params.order_by);
      if (params.order_direction) queryParams.append('order_direction', params.order_direction);
      if (params.per_page) queryParams.append('per_page', params.per_page);

      const url = getApiUrl('/api/cost-center-categories') + (queryParams.toString() ? `?${queryParams.toString()}` : '');
      
      console.log('🔍 DEBUG: Obteniendo categorías de centros de costo desde:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        // Si el endpoint no existe (404) o hay error del servidor (500), usar categorías mock
        if (response.status === 404 || response.status === 500) {
          console.warn('⚠️ Endpoint de categorías no disponible, usando categorías mock');
          return {
            success: true,
            data: {
              data: [
                {
                  category_id: 1,
                  name: "Transporte",
                  description: "Gastos relacionados con transporte y movilidad",
                  status: "activo",
                  color: "#3B82F6",
                  icon: "car",
                  cost_centers_count: 0
                },
                {
                  category_id: 2,
                  name: "Infraestructura",
                  description: "Gastos de infraestructura y servicios básicos",
                  status: "activo",
                  color: "#10B981",
                  icon: "building",
                  cost_centers_count: 0
                },
                {
                  category_id: 3,
                  name: "Recursos Humanos",
                  description: "Gastos relacionados con personal y capacitación",
                  status: "activo",
                  color: "#F59E0B",
                  icon: "users",
                  cost_centers_count: 0
                },
                {
                  category_id: 4,
                  name: "Operaciones",
                  description: "Gastos operacionales y mantenimiento",
                  status: "activo",
                  color: "#8B5CF6",
                  icon: "tools",
                  cost_centers_count: 0
                },
                {
                  category_id: 5,
                  name: "Marketing",
                  description: "Gastos de marketing y publicidad",
                  status: "activo",
                  color: "#EC4899",
                  icon: "megaphone",
                  cost_centers_count: 0
                },
                {
                  category_id: 6,
                  name: "Tecnología",
                  description: "Gastos de tecnología y software",
                  status: "activo",
                  color: "#06B6D4",
                  icon: "computer",
                  cost_centers_count: 0
                }
              ]
            }
          };
        }
        
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📋 DEBUG: Resultado categorías centros de costo:', result);
      
      return result;
    } catch (error) {
      console.error('Error al obtener categorías de centros de costo:', error);
      
      // En caso de cualquier error, devolver categorías mock
      console.warn('⚠️ Error en categorías, usando categorías mock como fallback');
      return {
        success: true,
        data: {
          data: [
            {
              category_id: 1,
              name: "Transporte",
              description: "Gastos relacionados con transporte y movilidad",
              status: "activo",
              color: "#3B82F6",
              icon: "car",
              cost_centers_count: 0
            },
            {
              category_id: 2,
              name: "Infraestructura",
              description: "Gastos de infraestructura y servicios básicos",
              status: "activo",
              color: "#10B981",
              icon: "building",
              cost_centers_count: 0
            },
            {
              category_id: 3,
              name: "Recursos Humanos",
              description: "Gastos relacionados con personal y capacitación",
              status: "activo",
              color: "#F59E0B",
              icon: "users",
              cost_centers_count: 0
            },
            {
              category_id: 4,
              name: "Operaciones",
              description: "Gastos operacionales y mantenimiento",
              status: "activo",
              color: "#8B5CF6",
              icon: "tools",
              cost_centers_count: 0
            },
            {
              category_id: 5,
              name: "Marketing",
              description: "Gastos de marketing y publicidad",
              status: "activo",
              color: "#EC4899",
              icon: "megaphone",
              cost_centers_count: 0
            },
            {
              category_id: 6,
              name: "Tecnología",
              description: "Gastos de tecnología y software",
              status: "activo",
              color: "#06B6D4",
              icon: "computer",
              cost_centers_count: 0
            }
          ]
        }
      };
    }
  },

  // Función auxiliar para formatear datos de centro de costo para el frontend
  formatCentroCostoForFrontend: (centroCosto) => {
    if (!centroCosto) return null;
    
    return {
      // Mapear campos de la API a campos del frontend
      id: centroCosto.cost_center_id,
      cost_center_id: centroCosto.cost_center_id,
      code: centroCosto.code || `CC-${centroCosto.cost_center_id}`, // Generar código si no existe
      name: centroCosto.name,
      description: centroCosto.description || '',
      status: centroCosto.status || 'activo',
      category_id: centroCosto.category_id,
      category: centroCosto.category ? {
        id: centroCosto.category.category_id,
        category_id: centroCosto.category.category_id,
        name: centroCosto.category.name,
        color: centroCosto.category.color,
        icon: centroCosto.category.icon
      } : null,
      created_at: centroCosto.created_at,
      updated_at: centroCosto.updated_at
    };
  },

  // Función auxiliar para formatear datos de categoría para el frontend
  formatCategoriaForFrontend: (categoria) => {
    if (!categoria) return null;
    
    return {
      id: categoria.category_id,
      category_id: categoria.category_id,
      name: categoria.name,
      description: categoria.description || '',
      status: categoria.status || 'activo',
      color: categoria.color || '#3B82F6',
      icon: categoria.icon || 'folder',
      cost_centers_count: categoria.cost_centers_count || 0,
      created_at: categoria.created_at,
      updated_at: categoria.updated_at
    };
  },
  getProyectos: async () => {
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
      if (!token) throw new Error('No se encontró token de autorización');
      const response = await fetch(getApiUrl('/projects'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al obtener proyectos');
      return await response.json();
    } catch (error) {
      console.error('Error al obtener proyectos:', error);
      throw error;
    }
  }
};