import { Routes, Route, Navigate } from "react-router-dom";
import routesModule from "routes/index";
import routeComponents from "routesComponents";

export default function Auth() {
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/auth") {
        return (
          <Route path={`/${prop.path}`} element={routeComponents[prop.path]} key={key} />
        );
      } else {
        return null;
      }
    });
  };
  
  document.documentElement.dir = "ltr";
  return (
    <div>
      <div className="relative float-right h-full min-h-screen w-full bg-primary">
        <main className={`mx-auto min-h-screen`}>
          <div className="relative flex">
            <div className="mx-auto flex min-h-full w-full flex-col justify-start">
              <Routes>
                {getRoutes(routesModule.allRoutes)}
                <Route
                  path="/"
                  element={<Navigate to="/auth/sign-in" replace />}
                />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
