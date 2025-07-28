import React from "react";
import { MdDescription, MdAccountBalance } from "react-icons/md";

export const tecnicoRoutes = [
    {
        name: "Proyectos",
        layout: "/admin",
        path: "proyectos",
        icon: <MdAccountBalance className="h-5 w-5" />,
        allowedRoles: ["tecnico"]
    },
    {
        name: "Actividades",
        layout: "/admin",
        path: "actividades",
        icon: <MdDescription className="h-5 w-5" />,
        allowedRoles: ["tecnico"]
    },
    {
        name: "Calculos",
        layout: "/admin",
        path: "calculos",
        icon: <MdDescription className="h-5 w-5" />,
        submenu: [
            {
                name: "Horas de uso",
                layout: "/admin",
                path: "actas-visita",
                icon: <MdDescription className="h-5 w-5" />,
                allowedRoles: ["tecnico"]
            },
            {
                name: "Acta de servicio",
                layout: "/admin",
                path: "acta-servicio",
                icon: <MdDescription className="h-5 w-5" />,
                allowedRoles: ["tecnico"]
            }
        ],
        allowedRoles: ["tecnico"]
    },
    {
        name: "Agente IA",
        layout: "/admin",
        path: "agente-ia",
        icon: <MdDescription className="h-5 w-5" />,
        allowedRoles: ["tecnico"]
    }
];