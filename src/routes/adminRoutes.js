import React from "react";
import { MdDescription, MdPeople, MdDevices, MdBusiness, MdAccountBalance, MdReceipt, MdSolarPower, MdBatteryChargingFull, MdStore, MdDashboard, MdBugReport, MdSync } from "react-icons/md";
import Inicio from "views/admin/inicio/index";

export const adminRoutes = [
  {
    name: "Inicio",
    layout: "/admin",
    path: "inicio",
    icon: <MdDashboard className="h-6 w-6" />,
    allowedRoles: ["administrador"],
    component: Inicio
  },
  // Sección Gestión comercial
  {
    section: "Gestión comercial"
  },
  {
    name: "Gestión comercial",
    icon: <MdBusiness className="h-6 w-6" />,
    layout: "/admin",
    path: "gestion-comercial",
    allowedRoles: ["administrador"],
    submenu: [
      {
        name: "Clientes",
        layout: "/admin",
        path: "clientes",
        icon: <MdPeople className="h-5 w-5" />,
        allowedRoles: ["administrador"]
      },
      {
        name: "Cotizaciones",
        layout: "/admin",
        path: "cotizaciones",
        icon: <MdDescription className="h-5 w-5" />,
        allowedRoles: ["administrador"]
      },
      {
        name: "Equipos",
        icon: <MdDevices className="h-5 w-5" />,
        layout: "/admin",
        path: "equipos",
        submenu: [
          {
            name: "Paneles",
            layout: "/admin",
            path: "paneles",
            icon: <MdSolarPower className="h-5 w-5" />,
            allowedRoles: ["administrador"]
          },
          {
            name: "Inversores",
            layout: "/admin",
            path: "inversores",
            icon: <MdDevices className="h-5 w-5" />,
            allowedRoles: ["administrador"]
          },
          {
            name: "Baterías",
            layout: "/admin",
            path: "baterias",
            icon: <MdBatteryChargingFull className="h-5 w-5" />,
            allowedRoles: ["administrador"]
          },
          {
            name: "Siigo",
            layout: "/admin",
            path: "siigo",
            icon: <MdSync className="h-5 w-5" />,
            allowedRoles: ["administrador"]
          }
        ]
      }
    ]
  },
  // Sección Proyectos
  {
    section: "Gestión técnica"
  },
  {
    name: "Gestión técnica",
    layout: "/admin",
    path: "proyectos",
    icon: <MdAccountBalance className="h-6 w-6" />,
    allowedRoles: ["administrador"],
    submenu: [
      {
        name: "Proyectos",
        layout: "/admin",
        path: "proyectos",
        icon: <MdAccountBalance className="h-5 w-5" />,
        allowedRoles: ["administrador"]
      },
      {
        name: "Actividades",
        layout: "/admin",
        path: "actividades",
        icon: <MdDescription className="h-5 w-5" />,
        allowedRoles: ["administrador"]
      },
      {
        name: "Actas",
        layout: "/admin",
        path: "actas",
        icon: <MdDescription className="h-5 w-5" />,
        submenu: [
          {
            name: "Actas de visita",
            layout: "/admin",
            path: "actas-visita",
            icon: <MdDescription className="h-5 w-5" />,
            allowedRoles: ["administrador"]
          },
          {
            name: "Acta de entrega de proyecto",
            layout: "/admin",
            path: "acta-entrega-proyecto",
            icon: <MdDescription className="h-5 w-5" />,
            allowedRoles: ["administrador"]
          },
          {
            name: "Acta de servicio",
            layout: "/admin",
            path: "acta-servicio",
            icon: <MdDescription className="h-5 w-5" />,
            allowedRoles: ["administrador"]
          }
        ],
        allowedRoles: ["administrador"]
      }
    ]
  },
  // Sección Contabilidad
  {
    section: "Contabilidad"
  },
  {
    name: "Gestión financiera",
    icon: <MdAccountBalance className="h-6 w-6" />,
    layout: "/admin",
    path: "contabilidad",
    allowedRoles: ["administrador", "contador"],
    submenu: [
      {
        name: "Dashboard",
        layout: "/admin",
        path: "contabilidad/dashboard",
        icon: <MdAccountBalance className="h-5 w-5" />,
        allowedRoles: ["administrador", "contador"]
      },
      {
        name: "Facturas",
        layout: "/admin",
        path: "contabilidad/facturas",
        icon: <MdReceipt className="h-5 w-5" />,
        allowedRoles: ["administrador", "contador"]
      },
      {
        name: "Centros de Costo",
        layout: "/admin",
        path: "contabilidad/centros-costo",
        icon: <MdAccountBalance className="h-5 w-5" />,
        allowedRoles: ["administrador", "contador"]
      },
      {
        name: "Proveedores",
        layout: "/admin",
        path: "contabilidad/proveedores",
        icon: <MdStore className="h-5 w-5" />,
        allowedRoles: ["administrador", "contador"]
      }
    ]
  },
  {
    name: "Usuarios",
    layout: "/admin",
    path: "usuarios",
    icon: <MdPeople className="h-5 w-5" />,
    allowedRoles: ["administrador"]
  },
  {
    name: "Agente IA",
    layout: "/admin",
    path: "agente-ia",
    icon: <MdDescription className="h-5 w-5" />,
    allowedRoles: ["administrador"]
  }
];