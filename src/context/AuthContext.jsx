import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Datos de ejemplo para usuarios
const USUARIOS_EJEMPLO = [
  {
    id: 1,
    email: "admin@example.com",
    password: "admin123",
    first_name: "Admin",
    last_name: "Sistema",
    role: "admin"
  },
  {
    id: 2,
    email: "vendedor@example.com",
    password: "vendedor123",
    first_name: "Vendedor",
    last_name: "Ejemplo",
    role: "vendedor"
  }
];

const ROLES = {
  1: "admin",
  2: "comercial",
  3: "tecnico",
  4: "bodeguero"
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
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          email, 
          password 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || "Error al iniciar sesión");
      }

      // Mapear el rol numérico a string y usar el campo correcto según la nueva estructura
      const userData = {
        ...data.user,
        token: data.token,
        role: ROLES[data.user.role_id] || "admin"
      };

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

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("redirectPath");
    setUser(null);
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