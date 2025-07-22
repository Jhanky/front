import React from "react";
import Card from "components/card";

const Paneles = () => {
  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      <div className="col-span-1 h-fit w-full xl:col-span-1 2xl:col-span-2">
        <Card extra={"w-full h-full px-6 pb-6 sm:overflow-x-auto"}>
          <div className="flex h-[400px] items-center justify-center">
            <h1 className="text-4xl font-bold text-navy-700 dark:text-white">
              Página de Paneles Solares
            </h1>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Paneles; 