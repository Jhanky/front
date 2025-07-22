import Cotizaciones from "views/admin/cotizaciones/index";
import DetalleCotizacion from "views/admin/cotizaciones/[id]";
import ContabilidadDashboard from "views/admin/contabilidad/dashboard";
import Facturas from "views/admin/contabilidad/facturas";
import CentrosCosto from "views/admin/contabilidad/centros-costo";
import Proveedores from "views/admin/contabilidad/proveedores";

{
  name: "Cotizaciones",
  layout: "/admin",
  path: "cotizaciones",
  icon: <MdAttachMoney className="h-6 w-6" />,
  component: <Cotizaciones />,
},
{
  name: "Detalle Cotización",
  layout: "/admin",
  path: "cotizaciones/:id",
  icon: <MdAttachMoney className="h-6 w-6" />,
  component: <DetalleCotizacion />,
},
{
  name: "Dashboard Contabilidad",
  layout: "/admin",
  path: "contabilidad/dashboard",
  icon: <MdDashboard className="h-6 w-6" />,
  component: <ContabilidadDashboard />,
},
{
  name: "Facturas",
  layout: "/admin",
  path: "contabilidad/facturas",
  icon: <MdReceipt className="h-6 w-6" />,
  component: <Facturas />,
},
{
  name: "Centros de Costo",
  layout: "/admin",
  path: "contabilidad/centros-costo",
  icon: <MdBusiness className="h-6 w-6" />,
  component: <CentrosCosto />,
},
{
  name: "Proveedores",
  layout: "/admin",
  path: "contabilidad/proveedores",
  icon: <MdStore className="h-6 w-6" />,
  component: <Proveedores />,
}, 