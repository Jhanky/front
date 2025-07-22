import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { MdMenu } from "react-icons/md";

import { Sidebar, Header } from "components/sidebar";
import { Button } from "components/button";
import ChatWindow from "components/chat/ChatWindow";
import Navbar from "components/navbar";
import Footer from "components/footer";

import routes from "routes.js";
import { getActiveRoute, getActiveNavbar } from "utils/routesUtils";

const Default = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(true);
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(window.innerWidth > 1023);
  }, []);

  React.useEffect(() => {
    window.addEventListener("resize", () =>
      setOpen(window.innerWidth > 1023)
    );
  }, []);

  return (
    <div className="flex h-full w-full">
      <Sidebar 
        open={open} 
        onClose={() => setOpen(false)} 
        variant="admin"
        onChatClick={() => setIsChatOpen(true)}
      />
      {/* Navbar & Main Content */}
      <div className="h-full w-full bg-lightPrimary dark:!bg-navy-900">
        {/* Main Content */}
        <main
          className={`mx-[12px] h-full flex-none transition-all md:pr-2 xl:ml-[313px]`}
        >
          {/* Routes */}
          <div className="h-full">
            <Navbar
              onOpenSidenav={() => setOpen(!open)}
              brandText={getActiveRoute(routes)}
              secondary={getActiveNavbar(routes)}
            />
            <div className="pt-5s mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2">
              <Routes>
                {routes.map((route, key) => {
                  if (route.layout === "/admin") {
                    return (
                      <Route
                        key={key}
                        exact
                        path={`${route.path}`}
                        element={route.component}
                      />
                    );
                  } else {
                    return null;
                  }
                })}
                <Route
                  path="/"
                  element={<Navigate to="/admin/default" replace />}
                />
              </Routes>
            </div>
            <div className="p-3">
              <Footer />
            </div>
          </div>
        </main>
      </div>
      <ChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

export default Default; 