const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
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
  getCentrosCosto: async () => {
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
      const response = await fetch(`${API_BASE_URL}/cost-centers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al obtener centros de costo');
      return await response.json();
    } catch (error) {
      console.error('Error al obtener centros de costo:', error);
      throw error;
    }
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
      const response = await fetch(`${API_BASE_URL}/projects`, {
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