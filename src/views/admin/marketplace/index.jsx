import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Paneles from "../paneles";
import Inversores from "../inversores";
import Baterias from "../baterias";

const NFTMarketplace = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  console.log("NFTMarketplace - Ruta actual:", currentPath);
  console.log("NFTMarketplace - Componentes importados:", { Paneles, Inversores, Baterias });

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        <Routes>
          <Route path="paneles" element={<Paneles />} />
          <Route path="inversores" element={<Inversores />} />
          <Route path="baterias" element={<Baterias />} />
          <Route path="*" element={
            <div className="text-xl font-bold text-navy-700 dark:text-white">
              Seleccione una categoría de productos
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default NFTMarketplace;
