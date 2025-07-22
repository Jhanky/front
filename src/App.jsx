import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "context/AuthContext";
import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import Loading from "components/loading";

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    // Guardar la ruta actual para redirigir después del login
    const currentPath = window.location.pathname;
    if (currentPath !== "/auth/sign-in") {
      localStorage.setItem("redirectPath", currentPath);
    }
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/auth/*" element={<AuthLayout />} />
        
        {/* Rutas protegidas */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
        
        {/* Redirecciones por defecto */}
        <Route path="/" element={<Navigate to="/admin/default" replace />} />
        <Route path="*" element={<Navigate to="/admin/default" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
