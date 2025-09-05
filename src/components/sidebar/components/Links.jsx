/* eslint-disable */
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MdKeyboardArrowDown } from "react-icons/md";
import { MdDashboard, MdPerson, MdShoppingCart, MdChat } from "react-icons/md";
import DashIcon from "components/icons/DashIcon";
import { useAuth } from "context/AuthContext";
// chakra imports

export function SidebarLinks(props) {
  // Chakra color mode
  let location = useLocation();
  const { routes, collapsed } = props;
  const { user } = useAuth();
  const [openSubmenus, setOpenSubmenus] = useState({});



  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    return location.pathname.includes(routeName);
  };

  const toggleSubmenu = (index) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const hasAccess = (route) => {
    // Si no hay roles definidos, permitir acceso
    if (!route.allowedRoles) {
      return true;
    }
    
    // Si el usuario no tiene rol, denegar acceso
    if (!user?.role) {
      return false;
    }
    
    // Verificar si el rol del usuario está en los roles permitidos
    return route.allowedRoles.includes(user.role);
  };

  const createLinks = (routes, parentIndex = "") => {
    return routes
      .filter(route => hasAccess(route))
      .filter(route => route.path !== "sign-in") // Ocultar la opción de inicio de sesión en el menú
      .map((route, index) => {
        const currentIndex = parentIndex === "" ? index : `${parentIndex}-${index}`;
        if (
          route.layout === "/admin" ||
          route.layout === "/auth" ||
          route.layout === "/rtl"
        ) {
          return (
            <div key={currentIndex}>
              {route.submenu ? (
                <div className="relative mb-3">
                  <div
                    className={`flex w-full items-center justify-between ${
                      collapsed ? "px-4" : "px-8"
                    } ${
                      activeRoute(route.path)
                        ? "bg-accent-primary/20 text-accent-primary"
                        : "text-text-secondary hover:text-text-primary"
                    }`}
                    onClick={() => toggleSubmenu(currentIndex)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`${
                          activeRoute(route.path) === true
                            ? "font-bold text-accent-primary"
                            : "font-medium text-text-secondary"
                        }`}
                      >
                        {route.icon ? route.icon : <DashIcon />}{" "}
                      </span>
                      {!collapsed && (
                        <p
                          className={`leading-1 ml-4 flex ${
                            activeRoute(route.path) === true
                              ? "font-bold text-accent-primary"
                              : "font-medium text-text-secondary"
                          }`}
                        >
                          {route.name}
                        </p>
                      )}
                    </div>
                    {route.submenu && !collapsed && (
                      <div
                        className={`flex items-center ${
                          openSubmenus[currentIndex] ? "rotate-180" : ""
                        } transition-transform duration-200`}
                      >
                        <MdKeyboardArrowDown className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  {openSubmenus[currentIndex] && !collapsed && (
                    <div className="mt-2 space-y-2 ml-4 border-l border-text-disabled/30 pl-2">
                      {createLinks(route.submenu, currentIndex)}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={currentIndex} to={route.layout + "/" + route.path}>
                  <div className="relative mb-3 flex hover:cursor-pointer hover:bg-accent-primary/10 transition-colors rounded-lg">
                    <li
                      className={`my-[3px] flex cursor-pointer items-center ${
                        collapsed ? "px-4" : "px-8"
                      }`}
                      key={currentIndex}
                    >
                      <span
                        className={`${
                          activeRoute(route.path) === true
                            ? "font-bold text-accent-primary"
                            : "font-medium text-text-secondary"
                        }`}
                      >
                        {route.icon ? route.icon : <DashIcon />}{" "}
                      </span>
                      {!collapsed && (
                        <p
                          className={`leading-1 ml-4 flex ${
                            activeRoute(route.path) === true
                              ? "font-bold text-accent-primary"
                              : "font-medium text-text-secondary"
                          }`}
                        >
                          {route.name}
                        </p>
                      )}
                    </li>
                    {activeRoute(route.path) ? (
                      <div className="absolute right-0 top-px h-9 w-1 rounded-lg bg-accent-primary" />
                    ) : null}
                  </div>
                </Link>
              )}
            </div>
          );
        }
      });
  };
  // BRAND
  return createLinks(routes);
}

export default SidebarLinks;
