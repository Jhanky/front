import React from "react";
import { MdDescription, MdPeople, MdDevices, MdBusiness, MdAccountBalance, MdReceipt, MdSolarPower, MdBatteryChargingFull, MdStore } from "react-icons/md";

export const adminRoutes = [
  // Sección Gestión comercial
  {
    section: "Gestión comercial"
  },
  {
    name: "Gestión comercial",
    icon: <MdBusiness className="h-6 w-6" />,
    layout: "/admin",
    path: "gestion-comercial",
    allowedRoles: ["admin"],
    submenu: [
      {
        name: "Clientes",
        layout: "/admin",
        path: "clientes",
        icon: <MdPeople className="h-5 w-5" />,
        allowedRoles: ["admin"]
      },
      {
        name: "Cotizaciones",
        layout: "/admin",
        path: "cotizaciones",
        icon: <MdDescription className="h-5 w-5" />,
        allowedRoles: ["admin"]
      },
      {
        name: "Propuestas",
        layout: "/admin",
        path: "propuestas",
        icon: <MdDescription className="h-5 w-5" />,
        allowedRoles: ["admin"]
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
            allowedRoles: ["admin"]
          },
          {
            name: "Inversores",
            layout: "/admin",
            path: "inversores",
            icon: <MdDevices className="h-5 w-5" />,
            allowedRoles: ["admin"]
          },
          {
            name: "Baterías",
            layout: "/admin",
            path: "baterias",
            icon: <MdBatteryChargingFull className="h-5 w-5" />,
            allowedRoles: ["admin"]
          }
        ]
      }
    ]
  },
  // Sección Proyectos
  {
    section: "Proyectos"
  },
  {
    name: "Proyectos",
    layout: "/admin",
    path: "proyectos",
    icon: <MdAccountBalance className="h-6 w-6" />,
    allowedRoles: ["admin"],
    submenu: [
      {
        name: "Proyectos",
        layout: "/admin",
        path: "proyectos",
        icon: <MdAccountBalance className="h-5 w-5" />,
        allowedRoles: ["admin"]
      },
      {
        name: "Actividades",
        layout: "/admin",
        path: "actividades",
        icon: <MdDescription className="h-5 w-5" />,
        allowedRoles: ["admin"]
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
            allowedRoles: ["admin"]
          },
          {
            name: "Acta de entrega de proyecto",
            layout: "/admin",
            path: "acta-entrega-proyecto",
            icon: <MdDescription className="h-5 w-5" />,
            allowedRoles: ["admin"]
          },
          {
            name: "Acta de servicio",
            layout: "/admin",
            path: "acta-servicio",
            icon: <MdDescription className="h-5 w-5" />,
            allowedRoles: ["admin"]
          }
        ],
        allowedRoles: ["admin"]
      }
    ]
  },
  // Sección Contabilidad
  {
    section: "Contabilidad"
  },
  {
    name: "Contabilidad",
    icon: <MdAccountBalance className="h-6 w-6" />,
    layout: "/admin",
    path: "contabilidad",
    allowedRoles: ["admin"],
    submenu: [
      {
        name: "Dashboard",
        layout: "/admin",
        path: "contabilidad/dashboard",
        icon: <MdAccountBalance className="h-5 w-5" />,
        allowedRoles: ["admin"]
      },
      {
        name: "Facturas",
        layout: "/admin",
        path: "contabilidad/facturas",
        icon: <MdReceipt className="h-5 w-5" />,
        allowedRoles: ["admin"]
      },
      {
        name: "Centros de Costo",
        layout: "/admin",
        path: "contabilidad/centros-costo",
        icon: <MdAccountBalance className="h-5 w-5" />,
        allowedRoles: ["admin"]
      },
      {
        name: "Proveedores",
        layout: "/admin",
        path: "contabilidad/proveedores",
        icon: <MdStore className="h-5 w-5" />,
        allowedRoles: ["admin"]
      }
    ]
  },
  {
    name: "Usuarios",
    layout: "/admin",
    path: "usuarios",
    icon: <MdPeople className="h-5 w-5" />,
    allowedRoles: ["admin"]
  },
  {
    name: "Agente IA",
    layout: "/admin",
    path: "agente-ia",
    icon: <MdDescription className="h-5 w-5" />,
    allowedRoles: ["admin"]
  }
];