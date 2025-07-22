import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "components/card";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-[calc(100vh-200px)] items-center justify-center">
      <Card extra="w-full max-w-md p-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold text-red-500">Acceso Denegado</h1>
          <p className="mb-8 text-gray-600">
            No tienes permisos para acceder a esta página.
          </p>
          <button
            onClick={() => navigate("/admin/default")}
            className="rounded-lg bg-blue-500 px-6 py-2 text-white transition-colors hover:bg-blue-600"
          >
            Volver al Inicio
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Unauthorized; 