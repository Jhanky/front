import React, { createContext, useContext, useState, useEffect } from "react";
import { getApiUrl, API_CONFIG } from '../config/api';

const AuthContext = createContext(null);

// Mapeo de roles para compatibilidad con el sistema de rutas
const ROLES = {
  1: "administrador",  // Administrador
  2: "comercial",      // Comercial  
  3: "tecnico"         // Técnico
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const storedUser = localStorage.getItem("user");
    const userData = localStorage.getItem("user_data");
    
    if (storedUser || userData) {
      try {
        let parsedUser;
        
        if (storedUser) {
          parsedUser = JSON.parse(storedUser);
        } else if (userData) {
          const userFromData = JSON.parse(userData);
          const token = localStorage.getItem("access_token");
          parsedUser = {
            ...userFromData,
            token: token
          };
        }
        
        // Verificar si el usuario tiene datos válidos
        if (parsedUser && (parsedUser.token || parsedUser.id)) {
          // Asegurarnos de que el usuario tenga un rol
          if (!parsedUser.role && parsedUser.roles && parsedUser.roles.length > 0) {
            parsedUser.role = parsedUser.roles[0].name;
          } else if (!parsedUser.role) {
            parsedUser.role = "administrador"; // Rol por defecto
          }
          setUser(parsedUser);
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("user_data");
          localStorage.removeItem("access_token");
        }
      } catch (error) {
        console.error("Error al parsear usuario almacenado:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("user_data");
        localStorage.removeItem("access_token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      
      
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

      
      
              const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.mensaje || "Error al iniciar sesión");
      }

      // Procesar la respuesta según las especificaciones de la API
      let userData;
      
      if (data.success && data.data) {
        // Estructura: { success: true, data: { user: {...}, token: "..." } }
        const user = data.data.user;
        const token = data.data.token;
        
        userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          phone: user.phone,
          job_title: user.job_title,
          profile_photo: user.profile_photo,
          roles: user.roles || [],
          role: user.roles && user.roles.length > 0 ? user.roles[0].name : "administrador",
          token: token
        };
      } else if (data.user && data.token) {
        // Estructura: { user: {...}, token: "..." }
        const user = data.user;
        
        userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          phone: user.phone,
          job_title: user.job_title,
          profile_photo: user.profile_photo,
          roles: user.roles || [],
          role: user.roles && user.roles.length > 0 ? user.roles[0].name : "administrador",
          token: data.token
        };
      } else if (data.access_token) {
        // Estructura alternativa con access_token
        const user = data.user || data;
        
        userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          phone: user.phone,
          job_title: user.job_title,
          profile_photo: user.profile_photo,
          roles: user.roles || [],
          role: user.roles && user.roles.length > 0 ? user.roles[0].name : "administrador",
          token: data.access_token
        };
      } else {
        console.error('Estructura de respuesta no reconocida:', data);
        throw new Error("Estructura de respuesta no reconocida. Por favor, verifique la configuración de la API.");
      }

      

      // Guardar usuario y token en localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("user_data", JSON.stringify(userData));
      localStorage.setItem("access_token", userData.token);

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
      const token = user?.token || localStorage.getItem("access_token");
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
      localStorage.removeItem("user_data");
      localStorage.removeItem("access_token");
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