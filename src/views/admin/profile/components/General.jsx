import Card from "components/card";
import React from "react";

const General = () => {
  return (
    <Card extra={"w-full h-full p-3"}>
      {/* Header */}
      <div className="mt-2 mb-8 w-full">
        <h4 className="px-2 text-xl font-bold text-navy-700 dark:text-white">
          Información General
        </h4>
        <p className="mt-2 px-2 text-base text-gray-600">
          A medida que vivimos, nuestros corazones se vuelven más fríos. Porque el dolor es por lo que pasamos
          a medida que envejecemos. Somos insultados por otros, perdemos la confianza en esos
          otros. Somos traicionados por amigos. Se vuelve más difícil para nosotros
          dar una mano a otros. Nuestros corazones son rotos por personas que amamos, incluso
          cuando les damos todo...
        </p>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-2 gap-4 px-2">
        <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <p className="text-sm text-gray-600">Educación</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            Universidad de Stanford
          </p>
        </div>

        <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <p className="text-sm text-gray-600">Idiomas</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            Inglés, Español, Italiano
          </p>
        </div>

        <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <p className="text-sm text-gray-600">Departamento</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            Diseño de Producto
          </p>
        </div>

        <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <p className="text-sm text-gray-600">Historial Laboral</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            Inglés, Español, Italiano
          </p>
        </div>

        <div className="flex flex-col items-start justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <p className="text-sm text-gray-600">Organización</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            Simmmple Web LLC
          </p>
        </div>

        <div className="flex flex-col justify-center rounded-2xl bg-white bg-clip-border px-3 py-4 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
          <p className="text-sm text-gray-600">Cumpleaños</p>
          <p className="text-base font-medium text-navy-700 dark:text-white">
            20 de Julio 1986
          </p>
        </div>
      </div>
    </Card>
  );
};

export default General;
