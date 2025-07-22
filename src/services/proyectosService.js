// Servicio para manejar las llamadas a los endpoints de proyectos
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const proyectosService = {
  // Obtener proyectos activos con facturas
  getProyectosActivos: async () => {
    try {
      // Obtener el token del localStorage desde el objeto user
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
      
      console.log('Token encontrado:', token ? 'Sí' : 'No');
      console.log('URL a llamar:', `${API_BASE_URL}/projects/activos`);
      
      if (!token) {
        throw new Error('No se encontró token de autorización');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      };

      console.log('Headers enviados:', headers);

      const response = await fetch(`${API_BASE_URL}/projects/activos`, {
        method: 'GET',
        headers: headers
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Data recibida:', data);
      return data;
    } catch (error) {
      console.error('Error al obtener proyectos activos:', error);
      throw error;
    }
  },

  // Obtener facturas de un proyecto específico
  getFacturasProyecto: async (proyectoId) => {
    try {
      // Obtener el token del localStorage desde el objeto user
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

      const response = await fetch(`${API_BASE_URL}/projects/${proyectoId}/facturas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener facturas del proyecto:', error);
      throw error;
    }
  }
}; 