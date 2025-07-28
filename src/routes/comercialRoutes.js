import React from "react";
import { MdDescription, MdPeople, MdDevices, MdBusiness, MdSolarPower, MdBatteryChargingFull } from "react-icons/md";

export const comercialRoutes = [
  // Sección Gestión comercial
  {
    section: "Gestión comercial"
  },
  {
    name: "Gestión comercial",
    icon: <MdBusiness className="h-6 w-6" />,
    layout: "/admin",
    path: "gestion-comercial",
    allowedRoles: ["comercial"],
    submenu: [
      {
        name: "Clientes",
        layout: "/admin",
        path: "clientes",
        icon: <MdPeople className="h-5 w-5" />,
        allowedRoles: ["comercial"]
      },
      {
        name: "Cotizaciones",
        layout: "/admin",
        path: "cotizaciones",
        icon: <MdDescription className="h-5 w-5" />,
        allowedRoles: ["comercial"]
      },
      {
        name: "Propuestas",
        layout: "/admin",
        path: "propuestas",
        icon: <MdDescription className="h-5 w-5" />,
        allowedRoles: ["comercial"]
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
            allowedRoles: ["comercial"]
          },
          {
            name: "Inversores",
            layout: "/admin",
            path: "inversores",
            icon: <MdDevices className="h-5 w-5" />,
            allowedRoles: ["comercial"]
          },
          {
            name: "Baterías",
            layout: "/admin",
            path: "baterias",
            icon: <MdBatteryChargingFull className="h-5 w-5" />,
            allowedRoles: ["comercial"]
          }
        ]
      }
    ]
  },
  {
    name: "Agente IA",
    layout: "/admin",
    path: "agente-ia",
    icon: <MdDescription className="h-5 w-5" />,
    allowedRoles: ["comercial"]
  }
];