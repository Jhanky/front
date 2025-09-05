import React from "react";
import Dropdown from "components/dropdown";
import { FiAlignJustify } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import {
  IoMdNotificationsOutline,
} from "react-icons/io";
import Logo from "components/logo";
import { useAuth } from "../../context/AuthContext";

const Navbar = (props) => {
  const { onOpenSidenav, brandText } = props;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkmode, setDarkmode] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/sign-in");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-primary-card/80 p-2 backdrop-blur-xl border border-text-disabled/20">
      <div className="ml-[6px]">
        <div className="h-6 w-[224px] pt-1">
          <a
            className="text-sm font-normal text-text-secondary hover:text-text-primary transition-colors"
            href=" "
          >
            Páginas
            <span className="mx-1 text-sm text-text-secondary">
              {" "}
              /{" "}
            </span>
          </a>
          <Link
            className="text-sm font-normal capitalize text-text-secondary hover:text-text-primary transition-colors"
            to="#"
          >
            {brandText}
          </Link>
        </div>
        <p className="shrink text-[33px] capitalize text-text-primary">
          <Link
            to="#"
            className="font-bold capitalize hover:text-accent-primary transition-colors"
          >
            {brandText}
          </Link>
        </p>
      </div>

      <div className="relative mt-[3px] flex h-[61px] w-[355px] flex-grow items-center justify-around gap-2 rounded-full bg-primary-card px-2 py-2 shadow-xl shadow-black/20 md:w-[365px] md:flex-grow-0 md:gap-1 xl:w-[365px] xl:gap-2">
        <div className="flex h-full items-center rounded-full bg-primary text-text-primary xl:w-[225px]">
          <p className="pl-3 pr-2 text-xl">
            <FiSearch className="h-4 w-4 text-text-disabled" />
          </p>
          <input
            type="text"
            placeholder="Buscar..."
            className="block h-full w-full rounded-full bg-primary text-sm font-medium text-text-primary outline-none placeholder:!text-text-disabled sm:w-fit"
          />
        </div>
        <span
          className="flex cursor-pointer text-xl text-text-secondary hover:text-text-primary transition-colors xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span>
        {/* start Notification */}
        <Dropdown
          button={
                      <p className="cursor-pointer">
            <IoMdNotificationsOutline className="h-4 w-4 text-text-secondary hover:text-text-primary transition-colors" />
          </p>
          }
          animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
          children={
            <div className="flex w-[360px] flex-col gap-3 rounded-[20px] bg-primary-card p-4 shadow-xl shadow-black/20 sm:w-[460px]">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-text-primary">
                  Notificaciones
                </p>
                <p className="text-sm font-bold text-accent-primary hover:text-accent-hover transition-colors cursor-pointer">
                  Marcar todas como leídas
                </p>
              </div>
            </div>
          }
          classNames={"py-2 top-4 -left-[230px] md:-left-[440px] w-max"}
        />
        {/* Profile & Dropdown */}
        <Dropdown
          button={
            <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-accent-primary text-white font-semibold">
              <Logo width={40} height={40} />
            </div>
          }
          children={
            <div className="flex w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none">
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    👋 Hola, {user?.first_name} {user?.last_name}
                  </p>{" "}
                </div>
              </div>
              <div className="h-px w-full bg-gray-200 dark:bg-white/20 " />

              <div className="flex flex-col p-4">
                <a
                  href=" "
                  className="text-sm text-gray-800 dark:text-white hover:dark:text-white"
                >
                  Configuración de Perfil
                </a>
                <button
                  onClick={handleLogout}
                  className="mt-3 text-left text-sm font-medium text-red-500 hover:text-red-500 transition duration-150 ease-out hover:ease-in"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          }
          classNames={"py-2 top-8 -left-[180px] w-max"}
        />
      </div>
    </nav>
  );
};

export default Navbar;
