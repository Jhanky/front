import React from "react";
import { MdDescription, MdPeople, MdDevices, MdBusiness, MdAccountBalance, MdReceipt, MdSolarPower, MdBatteryChargingFull, MdStore } from "react-icons/md";

const routes = [
  // Sección Gestión comercial
  {
    section: "Gestión comercial"
  },
  {
    name: "Gestión comercial",
    icon: <MdBusiness className="h-6 w-6" />,
    layout: "/admin",
    path: "gestion-comercial",
    submenu: [
      {
        name: "Clientes",
        layout: "/admin",
        path: "clientes",
        icon: <MdPeople className="h-5 w-5" />,
        allowedRoles: ["admin", "comercial"]
      },
      {
        name: "Cotizaciones",
        layout: "/admin",
        path: "cotizaciones",
        icon: <MdDescription className="h-5 w-5" />,
        allowedRoles: ["admin", "comercial"]
      },
      {
        name: "Propuestas",
        layout: "/admin",
        path: "propuestas",
        icon: <MdDescription className="h-5 w-5" />,
        allowedRoles: ["admin", "comercial"]
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
            allowedRoles: ["admin", "comercial"]
          },
          {
            name: "Inversores",
            layout: "/admin",
            path: "inversores",
            icon: <MdDevices className="h-5 w-5" />,
            allowedRoles: ["admin", "comercial"]
          },
          {
            name: "Baterías",
            layout: "/admin",
            path: "baterias",
            icon: <MdBatteryChargingFull className="h-5 w-5" />,
            allowedRoles: ["admin", "comercial"]
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
    submenu: [
      {
        name: "Proyectos",
        layout: "/admin",
        path: "proyectos",
        icon: <MdAccountBalance className="h-5 w-5" />,
        allowedRoles: ["admin", "proyectos"]
      },
      {
        name: "Actividades",
        layout: "/admin",
        path: "actividades",
        icon: <MdDescription className="h-5 w-5" />,
        allowedRoles: ["admin", "proyectos"]
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
            allowedRoles: ["admin", "proyectos"]
          },
          {
            name: "Acta de entrega de proyecto",
            layout: "/admin",
            path: "acta-entrega-proyecto",
            icon: <MdDescription className="h-5 w-5" />,
            allowedRoles: ["admin", "proyectos"]
          },
          {
            name: "Acta de servicio",
            layout: "/admin",
            path: "acta-servicio",
            icon: <MdDescription className="h-5 w-5" />,
            allowedRoles: ["admin", "proyectos"]
          }
        ],
        allowedRoles: ["admin", "proyectos"]
      }
    ],
    allowedRoles: ["admin", "proyectos"]
  },

  // Sección Contabilidad (como estaba antes, agrupada)
  {
    section: "Contabilidad"
  },
  {
    name: "Contabilidad",
    icon: <MdAccountBalance className="h-6 w-6" />,
    layout: "/admin",
    path: "contabilidad",
    submenu: [
      {
        name: "Dashboard",
        layout: "/admin",
        path: "contabilidad/dashboard",
        icon: <MdAccountBalance className="h-5 w-5" />,
        allowedRoles: ["admin", "contabilidad"]
      },
      {
        name: "Facturas",
        layout: "/admin",
        path: "contabilidad/facturas",
        icon: <MdReceipt className="h-5 w-5" />,
        allowedRoles: ["admin", "contabilidad"]
      },
      {
        name: "Centros de Costo",
        layout: "/admin",
        path: "contabilidad/centros-costo",
        icon: <MdAccountBalance className="h-5 w-5" />,
        allowedRoles: ["admin", "contabilidad"]
      },
      {
        name: "Proveedores",
        layout: "/admin",
        path: "contabilidad/proveedores",
        icon: <MdStore className="h-5 w-5" />,
        allowedRoles: ["admin", "contabilidad"]
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
  },
  {
    name: "Iniciar Sesión",
    layout: "/auth",
    path: "sign-in"
  }
];

export default routes;
