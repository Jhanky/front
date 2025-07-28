// Servicio para manejar las operaciones de facturas
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://149.130.169.113:3030';

export const facturasService = {
  // Obtener todas las facturas
  getFacturas: async () => {
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

      const response = await fetch(`${API_BASE_URL}/purchases`, {
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
      console.error('Error al obtener facturas:', error);
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

      const response = await fetch(`${API_BASE_URL}/purchases/${facturaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(facturaData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
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

      const response = await fetch(`${API_BASE_URL}/purchases/${facturaId}`, {
        method: 'DELETE',
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

      return true;
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      throw error;
    }
  }
};