import React from "react";
import { Navigate } from "react-router-dom";
import SignIn from "views/auth/SignIn";
import Unauthorized from "views/admin/unauthorized";
import Inicio from "views/admin/inicio";

// Admin pages
import Clientes from "views/admin/clientes";
import Cotizaciones from "views/admin/cotizaciones";
import DetalleCotizacion from "views/admin/cotizaciones/[id]";
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
import ProyectoDetalle from "views/admin/proyectos/[id]";

// Comercial pages
import ComercialCotizaciones from "views/comercial/cotizaciones";
import ComercialDetalleCotizacion from "views/comercial/cotizaciones/[id]";

// Mapeo de rutas a componentes
export const routeComponents = {
  "sign-in": <SignIn />,
  "inicio": <Inicio />,
  "clientes": <Clientes />,
  "cotizaciones": <Cotizaciones />,
  "cotizaciones/:id": <DetalleCotizacion />,
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
  "proyectos/:id": <ProyectoDetalle />,
  "comercial/cotizaciones": <ComercialCotizaciones />,
  "comercial/cotizaciones/:id": <ComercialDetalleCotizacion />,
  "*": <Navigate to="/404" />
};

export default routeComponents; 