import React from "react";
import { Navigate } from "react-router-dom";
import Main from "layouts/admin";
import SignIn from "views/auth/SignIn";
import Unauthorized from "views/admin/unauthorized";

// Admin pages
import Dashboard from "views/admin/default";
import Clientes from "views/admin/clientes";
import Cotizaciones from "views/admin/cotizaciones";
import Propuestas from "views/admin/propuestas";
import Paneles from "views/admin/paneles";
import Inversores from "views/admin/inversores";
import Baterias from "views/admin/baterias";
import Usuarios from "views/admin/usuarios";
import AgenteIA from "views/admin/agente-ia";
import ContabilidadDashboard from "views/admin/contabilidad/dashboard";
import Facturas from "views/admin/contabilidad/facturas";
import CentrosCosto from "views/admin/contabilidad/centros-costo";
import Proveedores from "views/admin/contabilidad/proveedores";
import Proyectos from "views/admin/proyectos";

// Mapeo de rutas a componentes
export const routeComponents = {
  "sign-in": <SignIn />,
  "default": <Dashboard />,
  "clientes": <Clientes />,
  "cotizaciones": <Cotizaciones />,
  "propuestas": <Propuestas />,
  "paneles": <Paneles />,
  "inversores": <Inversores />,
  "baterias": <Baterias />,
  "usuarios": <Usuarios />,
  "agente-ia": <AgenteIA />,
  "unauthorized": <Unauthorized />,
  "contabilidad/dashboard": <ContabilidadDashboard />,
  "contabilidad/facturas": <Facturas />,
  "contabilidad/centros-costo": <CentrosCosto />,
  "contabilidad/proveedores": <Proveedores />,
  "proyectos": <Proyectos />,
  "*": <Navigate to="/404" />
};

export default routeComponents; 