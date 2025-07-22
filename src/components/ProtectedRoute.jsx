import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import Loading from "components/loading";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
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

  // Si hay roles permitidos y el usuario no tiene uno de esos roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute; 