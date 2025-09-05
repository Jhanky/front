import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Sidebar } from "components/sidebar";
import ChatWindow from "components/chat/ChatWindow";
import Navbar from "components/navbar";
import Footer from "components/footer";
import { adminRoutes } from "../../routes/adminRoutes";
import { getActiveRoute, getActiveNavbar } from "utils/routesUtils";

const Default = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = React.useState(true);
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(window.innerWidth > 1023);
  }, []);

  React.useEffect(() => {
    window.addEventListener("resize", () => setOpen(window.innerWidth > 1023));
  }, []);

  return (
    <div className="flex h-full w-full">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        variant="admin"
        onChatClick={() => setIsChatOpen(true)}
      />
      <div className="h-full w-full bg-primary">
        <main className="mx-[12px] h-full flex-none transition-all md:pr-2 xl:ml-[313px]">
          <div className="h-full">
            <Navbar
              onOpenSidenav={() => setOpen(!open)}
              brandText={getActiveRoute(adminRoutes)}
              secondary={getActiveNavbar(adminRoutes)}
            />
            <div className="pt-5s mx-auto mb-auto h-full min-h-[84vh] p-2 md:pr-2">
              <Routes>
                {adminRoutes.filter((r) => r.component).map((route, key) => (
                  <Route
                    key={key}
                    exact
                    path={route.path}
                    element={route.component}
                  />
                ))}
                <Route
                  path="/"
                  element={<Navigate to="/admin/inicio" replace />}
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
