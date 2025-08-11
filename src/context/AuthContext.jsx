import React, { createContext, useContext, useState, useEffect } from "react";
import { getApiUrl } from '../config/api';

const AuthContext = createContext(null);

// Mapeo de roles para compatibilidad
const ROLES = {
  1: "admin",      // Administrador
  2: "comercial",  // Comercial  
  3: "tecnico"     // Técnico
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Verificar si el token ha expirado
        if (parsedUser.token) {
          // Asegurarnos de que el usuario tenga un rol
          if (!parsedUser.role) {
            parsedUser.role = "admin"; // Rol por defecto para usuarios existentes
          }
          setUser(parsedUser);
        } else {
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Error al parsear usuario almacenado:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Intentando login con:', { email });
      console.log('URL de login:', getApiUrl('/api/auth/login'));
      
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          email, 
          password 
        })
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || data.mensaje || "Error al iniciar sesión");
      }

      // Adaptar la respuesta de Laravel a la estructura esperada
      let userData;
      
      if (data.user && data.token) {
        // Estructura típica de Laravel con Sanctum/Passport
        userData = {
          id: data.user.id,
          email: data.user.email,
          first_name: data.user.first_name || data.user.name?.split(' ')[0] || '',
          last_name: data.user.last_name || data.user.name?.split(' ').slice(1).join(' ') || '',
          name: data.user.name || `${data.user.first_name} ${data.user.last_name}`,
          role: ROLES[data.user.role_id] || data.user.role || "admin",
          role_id: data.user.role_id,
          token: data.token
        };
      } else if (data.access_token) {
        // Estructura alternativa con access_token
        userData = {
          id: data.user?.id || data.id,
          email: data.user?.email || data.email,
          first_name: data.user?.first_name || data.first_name || '',
          last_name: data.user?.last_name || data.last_name || '',
          name: data.user?.name || data.name || `${data.first_name} ${data.last_name}`,
          role: ROLES[data.user?.role_id || data.role_id] || data.role || "admin",
          role_id: data.user?.role_id || data.role_id,
          token: data.access_token
        };
      } else {
        throw new Error("Estructura de respuesta no reconocida");
      }

      console.log('Usuario procesado:', userData);

      // Guardar usuario y token en localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      // Actualizar el estado
      setUser(userData);

      return true;
    } catch (error) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = user?.token;
      if (token) {
        // Intentar hacer logout en el servidor
        try {
          await fetch(getApiUrl('/api/auth/logout'), {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
              "Accept": "application/json"
            }
          });
        } catch (error) {
          console.warn('Error al hacer logout en servidor:', error);
          // Continuar con el logout local aunque falle el servidor
        }
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar datos locales siempre
      localStorage.removeItem("user");
      localStorage.removeItem("redirectPath");
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};