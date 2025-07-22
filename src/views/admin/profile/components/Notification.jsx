import Card from "components/card";
import CardMenu from "components/card/CardMenu";
import Switch from "components/switch";
import React from "react";

function Notification() {
  return (
    <Card extra={"w-full h-full p-3"}>
      <div className="relative mb-3 flex items-center justify-between pt-1">
        <h4 className="text-xl font-bold text-navy-700 dark:text-white">
          Notificaciones
        </h4>
        <CardMenu />
      </div>
      <div className="flex flex-col">
        {/* the custom checkbox desing added in src/index.js */}
        <div className="mt-3 flex items-center gap-3">
          <Switch id="switch1" />
          <label
            for="checkbox1"
            className="text-base font-medium text-navy-700 dark:text-white"
          >
            Notificaciones de comentarios de elementos
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Switch id="switch2" />
          <label
            for="checkbox2"
            className="text-base font-medium text-navy-700 dark:text-white"
          >
            Notificaciones de revisión de compradores
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Switch id="switch3" />
          <label
            for="checkbox3"
            className="text-base font-medium text-navy-700 dark:text-white"
          >
            Recordatorios de valoración
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Switch id="switch4" />
          <label
            for="checkbox4"
            className="text-base font-medium text-navy-700 dark:text-white"
          >
            Notificaciones de reuniones cerca de ti
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Switch id="switch5" />
          <label
            for="checkbox5"
            className="text-base font-medium text-navy-700 dark:text-white"
          >
            Notificaciones de noticias de la empresa
          </label>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Switch id="switch6" />
          <label
            for="checkbox6"
            className="text-base font-medium text-navy-700 dark:text-white"
          >
            Nuevos lanzamientos y proyectos
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Switch id="switch7" />
          <label
            for="checkbox7"
            className="text-base font-medium text-navy-700 dark:text-white"
          >
            Cambios mensuales en productos
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Switch id="switch8" />
          <label
            for="checkbox8"
            className="text-base font-medium text-navy-700 dark:text-white"
          >
            Suscribirse al boletín
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Switch id="switch8" />
          <label
            for="checkbox8"
            className="text-base font-medium text-navy-700 dark:text-white"
          >
            Enviarme un correo cuando alguien me siga
          </label>
        </div>
      </div>
    </Card>
  );
}

export default Notification;
