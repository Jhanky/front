/* eslint-disable */

import React from "react";
import { NavLink } from "react-router-dom";
import { HiX, HiChevronLeft, HiChevronRight } from "react-icons/hi";
import Links from "./components/Links";
import { useAuth } from "context/AuthContext";
import routesModule from "routes/index";

const Sidebar = ({ open, onClose, onCollapse }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const { user } = useAuth();
  
  // Obtener rutas según el rol del usuario
  const routes = routesModule.getRoutesByRole(user?.role);



  const toggleSidebar = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapse?.(newCollapsed);
  };

  return (
    <div
      className={`sm:none duration-300 linear fixed !z-50 flex min-h-full flex-col bg-primary-card pb-10 shadow-2xl shadow-black/20 transition-all text-text-primary md:!z-50 lg:!z-50 xl:!z-0 ${
        open ? "translate-x-0" : "-translate-x-96"
      } ${collapsed ? "w-20" : "w-72"}`}
    >
      <div className="flex justify-between items-center px-4 py-4">
        {!collapsed && (
          <div className="flex items-center">
            <a href="/admin/inicio" className="ml-1 mt-1 h-2.5 font-poppins text-[26px] font-bold uppercase text-text-primary hover:text-accent-primary transition-colors">
              Energy 4.0
            </a>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-accent-primary/20 transition-colors text-text-secondary hover:text-text-primary"
        >
          {collapsed ? <HiChevronRight size={24} /> : <HiChevronLeft size={24} />}
        </button>
        <span
          className="block cursor-pointer xl:hidden"
          onClick={onClose}
        >
          <HiX />
        </span>
      </div>

      <div className="mb-7 mt-2 h-px bg-text-disabled/30" />
      
      <ul className="mb-auto pt-1 overflow-y-auto max-h-[calc(100vh-120px)]">
        <Links routes={routes} collapsed={collapsed} />
      </ul>
    </div>
  );
};

export default Sidebar;
