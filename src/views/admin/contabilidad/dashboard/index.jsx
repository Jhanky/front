import React from "react";
import { MdBarChart, MdReceipt, MdAttachMoney, MdPending, MdCheckCircle, MdCancel, MdTrendingUp, MdOutlineCalendarToday, MdVisibility, MdFolder } from "react-icons/md";
import ProjectInvoicesModal from "components/modal/ProjectInvoicesModal";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { proyectosService } from "services/proyectosService";

import Widget from "components/widget/Widget";
import Card from "components/card";
import LineChart from "components/charts/LineChart";
import BarChart from "components/charts/BarChart";
import PieChart from "components/charts/PieChart";

const Dashboard = () => {
  // Estado para el modal
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState(null);
  const [selectedProjectInvoices, setSelectedProjectInvoices] = React.useState([]);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  // Estados para datos de proyectos
  const [loadingFacturas, setLoadingFacturas] = React.useState(true);
  const [errorFacturas, setErrorFacturas] = React.useState(null);
  const [facturas, setFacturas] = React.useState([]);

  // 1. Array base de facturas (simulación de datos desde 2023 hasta julio 2025)
  // const facturas = [
  //   // 2023 - Enero (5 facturas)
  //   { id: 1, numero: "FAC-2023-001", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2023", monto: 8000000, estado: "Pagado", fecha: "2023-01-05", metodo_pago: "Transferencia" },
  //   { id: 2, numero: "FAC-2023-002", proveedor: "Paneles Plus", proyecto: "Comercial 2023", monto: 7500000, estado: "Pendiente", fecha: "2023-01-10", metodo_pago: "Efectivo" },
  //   { id: 3, numero: "FAC-2023-003", proveedor: "Solar Tech", proyecto: "Industrial 2023", monto: 9000000, estado: "Cancelado", fecha: "2023-01-15", metodo_pago: "Credito" },
  //   { id: 4, numero: "FAC-2023-004", proveedor: "Green Energy", proyecto: "Residencial 2023", monto: 8200000, estado: "Pagado", fecha: "2023-01-20", metodo_pago: "Transferencia" },
  //   { id: 5, numero: "FAC-2023-005", proveedor: "Eco Solutions", proyecto: "Comercial 2023", monto: 7800000, estado: "Pendiente", fecha: "2023-01-25", metodo_pago: "Efectivo" },
  //   { id: 6, numero: "FAC-2023-006", proveedor: "Solar Tech", proyecto: "Industrial 2023", monto: 9100000, estado: "Pagado", fecha: "2023-02-02", metodo_pago: "Transferencia" },
  //   { id: 7, numero: "FAC-2023-007", proveedor: "Green Energy", proyecto: "Residencial 2023", monto: 8300000, estado: "Pendiente", fecha: "2023-02-06", metodo_pago: "Efectivo" },
  //   { id: 8, numero: "FAC-2023-008", proveedor: "Paneles Plus", proyecto: "Comercial 2023", monto: 7700000, estado: "Cancelado", fecha: "2023-02-11", metodo_pago: "Credito" },
  //   { id: 9, numero: "FAC-2023-009", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2023", monto: 8100000, estado: "Pagado", fecha: "2023-02-16", metodo_pago: "Transferencia" },
  //   { id: 10, numero: "FAC-2023-010", proveedor: "Eco Solutions", proyecto: "Comercial 2023", monto: 7900000, estado: "Pendiente", fecha: "2023-02-20", metodo_pago: "Efectivo" },
  //   { id: 11, numero: "FAC-2023-011", proveedor: "Solar Tech", proyecto: "Industrial 2023", monto: 9200000, estado: "Pagado", fecha: "2023-02-24", metodo_pago: "Transferencia" },
  //   { id: 12, numero: "FAC-2023-012", proveedor: "Green Energy", proyecto: "Residencial 2023", monto: 8400000, estado: "Pendiente", fecha: "2023-02-28", metodo_pago: "Efectivo" },

  //   // 2023 - Marzo (2 facturas)
  //   { id: 13, numero: "FAC-2023-013", proveedor: "Paneles Plus", proyecto: "Comercial 2023", monto: 7600000, estado: "Cancelado", fecha: "2023-03-05", metodo_pago: "Credito" },
  //   { id: 14, numero: "FAC-2023-014", proveedor: "Solar Tech", proyecto: "Industrial 2023", monto: 9300000, estado: "Pagado", fecha: "2023-03-10", metodo_pago: "Transferencia" },

  //   // 2023 - Abril (4 facturas)
  //   { id: 15, numero: "FAC-2023-015", proveedor: "Green Energy", proyecto: "Residencial 2023", monto: 8500000, estado: "Pendiente", fecha: "2023-04-03", metodo_pago: "Efectivo" },
  //   { id: 16, numero: "FAC-2023-016", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2023", monto: 8250000, estado: "Pagado", fecha: "2023-04-08", metodo_pago: "Transferencia" },
  //   { id: 17, numero: "FAC-2023-017", proveedor: "Eco Solutions", proyecto: "Comercial 2023", monto: 7950000, estado: "Pendiente", fecha: "2023-04-14", metodo_pago: "Efectivo" },
  //   { id: 18, numero: "FAC-2023-018", proveedor: "Paneles Plus", proyecto: "Comercial 2023", monto: 7750000, estado: "Cancelado", fecha: "2023-04-20", metodo_pago: "Credito" },

  //   // 2023 - Mayo (6 facturas)
  //   { id: 19, numero: "FAC-2023-019", proveedor: "Solar Tech", proyecto: "Industrial 2023", monto: 9400000, estado: "Pagado", fecha: "2023-05-01", metodo_pago: "Transferencia" },
  //   { id: 20, numero: "FAC-2023-020", proveedor: "Green Energy", proyecto: "Residencial 2023", monto: 8600000, estado: "Pendiente", fecha: "2023-05-06", metodo_pago: "Efectivo" },
  //   { id: 21, numero: "FAC-2023-021", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2023", monto: 8350000, estado: "Pagado", fecha: "2023-05-11", metodo_pago: "Transferencia" },
  //   { id: 22, numero: "FAC-2023-022", proveedor: "Eco Solutions", proyecto: "Comercial 2023", monto: 8000000, estado: "Pendiente", fecha: "2023-05-16", metodo_pago: "Efectivo" },
  //   { id: 23, numero: "FAC-2023-023", proveedor: "Paneles Plus", proyecto: "Comercial 2023", monto: 7850000, estado: "Cancelado", fecha: "2023-05-22", metodo_pago: "Credito" },
  //   { id: 24, numero: "FAC-2023-024", proveedor: "Solar Tech", proyecto: "Industrial 2023", monto: 9500000, estado: "Pagado", fecha: "2023-05-28", metodo_pago: "Transferencia" },

  //   // 2023 - Junio (3 facturas)
  //   { id: 25, numero: "FAC-2023-025", proveedor: "Green Energy", proyecto: "Residencial 2023", monto: 8700000, estado: "Pendiente", fecha: "2023-06-04", metodo_pago: "Efectivo" },
  //   { id: 26, numero: "FAC-2023-026", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2023", monto: 8450000, estado: "Pagado", fecha: "2023-06-10", metodo_pago: "Transferencia" },
  //   { id: 27, numero: "FAC-2023-027", proveedor: "Eco Solutions", proyecto: "Comercial 2023", monto: 8100000, estado: "Pendiente", fecha: "2023-06-18", metodo_pago: "Efectivo" },

  //   // 2023 - Julio (5 facturas)
  //   { id: 28, numero: "FAC-2023-028", proveedor: "Solar Tech", proyecto: "Industrial 2023", monto: 9600000, estado: "Pagado", fecha: "2023-07-02", metodo_pago: "Transferencia" },
  //   { id: 29, numero: "FAC-2023-029", proveedor: "Green Energy", proyecto: "Residencial 2023", monto: 8800000, estado: "Pendiente", fecha: "2023-07-07", metodo_pago: "Efectivo" },
  //   { id: 30, numero: "FAC-2023-030", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2023", monto: 8550000, estado: "Pagado", fecha: "2023-07-12", metodo_pago: "Transferencia" },
  //   { id: 31, numero: "FAC-2023-031", proveedor: "Eco Solutions", proyecto: "Comercial 2023", monto: 8200000, estado: "Pendiente", fecha: "2023-07-18", metodo_pago: "Efectivo" },
  //   { id: 32, numero: "FAC-2023-032", proveedor: "Paneles Plus", proyecto: "Comercial 2023", monto: 7950000, estado: "Cancelado", fecha: "2023-07-25", metodo_pago: "Credito" },

  //   // 2023 - Agosto (7 facturas)
  //   { id: 33, numero: "FAC-2023-033", proveedor: "Solar Tech", proyecto: "Industrial 2023", monto: 9700000, estado: "Pagado", fecha: "2023-08-01", metodo_pago: "Transferencia" },
  //   { id: 34, numero: "FAC-2023-034", proveedor: "Green Energy", proyecto: "Residencial 2023", monto: 8900000, estado: "Pendiente", fecha: "2023-08-06", metodo_pago: "Efectivo" },
  //   { id: 35, numero: "FAC-2023-035", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2023", monto: 8650000, estado: "Pagado", fecha: "2023-08-11", metodo_pago: "Transferencia" },
  //   { id: 36, numero: "FAC-2023-036", proveedor: "Eco Solutions", proyecto: "Comercial 2023", monto: 8300000, estado: "Pendiente", fecha: "2023-08-16", metodo_pago: "Efectivo" },
  //   { id: 37, numero: "FAC-2023-037", proveedor: "Paneles Plus", proyecto: "Comercial 2023", monto: 8050000, estado: "Cancelado", fecha: "2023-08-22", metodo_pago: "Credito" },
  //   { id: 38, numero: "FAC-2023-038", proveedor: "Solar Tech", proyecto: "Industrial 2023", monto: 9800000, estado: "Pagado", fecha: "2023-08-26", metodo_pago: "Transferencia" },
  //   { id: 39, numero: "FAC-2023-039", proveedor: "Green Energy", proyecto: "Residencial 2023", monto: 9000000, estado: "Pendiente", fecha: "2023-08-30", metodo_pago: "Efectivo" },

  //   // 2023 - Septiembre (2 facturas)
  //   { id: 40, numero: "FAC-2023-040", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2023", monto: 8750000, estado: "Pagado", fecha: "2023-09-05", metodo_pago: "Transferencia" },
  //   { id: 41, numero: "FAC-2023-041", proveedor: "Eco Solutions", proyecto: "Comercial 2023", monto: 8400000, estado: "Pendiente", fecha: "2023-09-10", metodo_pago: "Efectivo" },

  //   // 2023 - Octubre (4 facturas)
  //   { id: 42, numero: "FAC-2023-042", proveedor: "Solar Tech", proyecto: "Industrial 2023", monto: 9900000, estado: "Pagado", fecha: "2023-10-02", metodo_pago: "Transferencia" },
  //   { id: 43, numero: "FAC-2023-043", proveedor: "Green Energy", proyecto: "Residencial 2023", monto: 9100000, estado: "Pendiente", fecha: "2023-10-08", metodo_pago: "Efectivo" },
  //   { id: 44, numero: "FAC-2023-044", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2023", monto: 8850000, estado: "Pagado", fecha: "2023-10-14", metodo_pago: "Transferencia" },
  //   { id: 45, numero: "FAC-2023-045", proveedor: "Eco Solutions", proyecto: "Comercial 2023", monto: 8500000, estado: "Pendiente", fecha: "2023-10-20", metodo_pago: "Efectivo" },

  //   // 2023 - Noviembre (6 facturas)
  //   { id: 46, numero: "FAC-2023-046", proveedor: "Solar Tech", proyecto: "Industrial 2023", monto: 10000000, estado: "Pagado", fecha: "2023-11-01", metodo_pago: "Transferencia" },
  //   { id: 47, numero: "FAC-2023-047", proveedor: "Green Energy", proyecto: "Residencial 2023", monto: 9200000, estado: "Pendiente", fecha: "2023-11-06", metodo_pago: "Efectivo" },
  //   { id: 48, numero: "FAC-2023-048", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2023", monto: 8950000, estado: "Pagado", fecha: "2023-11-12", metodo_pago: "Transferencia" },
  //   { id: 49, numero: "FAC-2023-049", proveedor: "Eco Solutions", proyecto: "Comercial 2023", monto: 8600000, estado: "Pendiente", fecha: "2023-11-18", metodo_pago: "Efectivo" },
  //   { id: 50, numero: "FAC-2023-050", proveedor: "Paneles Plus", proyecto: "Comercial 2023", monto: 8250000, estado: "Cancelado", fecha: "2023-11-24", metodo_pago: "Credito" },
  //   { id: 51, numero: "FAC-2023-051", proveedor: "Solar Tech", proyecto: "Industrial 2023", monto: 10100000, estado: "Pagado", fecha: "2023-11-30", metodo_pago: "Transferencia" },

  //   // 2023 - Diciembre (3 facturas)
  //   { id: 52, numero: "FAC-2023-052", proveedor: "Green Energy", proyecto: "Residencial 2023", monto: 9300000, estado: "Pendiente", fecha: "2023-12-05", metodo_pago: "Efectivo" },
  //   { id: 53, numero: "FAC-2023-053", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2023", monto: 9050000, estado: "Pagado", fecha: "2023-12-10", metodo_pago: "Transferencia" },
  //   { id: 54, numero: "FAC-2023-054", proveedor: "Eco Solutions", proyecto: "Comercial 2023", monto: 8700000, estado: "Pendiente", fecha: "2023-12-18", metodo_pago: "Efectivo" },
  //   // 2024 - Enero (4 facturas)
  //   { id: 55, numero: "FAC-2024-001", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2024", monto: 13000000, estado: "Pagado", fecha: "2024-01-10", metodo_pago: "Transferencia" },
  //   { id: 56, numero: "FAC-2024-002", proveedor: "Paneles Plus", proyecto: "Comercial 2024", monto: 14000000, estado: "Pendiente", fecha: "2024-01-15", metodo_pago: "Efectivo" },
  //   { id: 57, numero: "FAC-2024-003", proveedor: "Solar Tech", proyecto: "Industrial 2024", monto: 15000000, estado: "Cancelado", fecha: "2024-01-20", metodo_pago: "Tarjeta" },
  //   { id: 58, numero: "FAC-2024-004", proveedor: "Green Energy", proyecto: "Residencial 2024", monto: 16000000, estado: "Pagado", fecha: "2024-01-25", metodo_pago: "Transferencia" },

  //   // 2024 - Febrero (6 facturas)
  //   { id: 59, numero: "FAC-2024-005", proveedor: "Eco Solutions", proyecto: "Comercial 2024", monto: 17000000, estado: "Pendiente", fecha: "2024-02-05", metodo_pago: "Efectivo" },
  //   { id: 60, numero: "FAC-2024-006", proveedor: "Solar Tech", proyecto: "Industrial 2024", monto: 18000000, estado: "Pagado", fecha: "2024-02-10", metodo_pago: "Transferencia" },
  //   { id: 61, numero: "FAC-2024-007", proveedor: "Green Energy", proyecto: "Residencial 2024", monto: 19000000, estado: "Pendiente", fecha: "2024-02-15", metodo_pago: "Efectivo" },
  //   { id: 62, numero: "FAC-2024-008", proveedor: "Paneles Plus", proyecto: "Comercial 2024", monto: 20000000, estado: "Cancelado", fecha: "2024-02-20", metodo_pago: "Tarjeta" },
  //   { id: 63, numero: "FAC-2024-009", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2024", monto: 21000000, estado: "Pagado", fecha: "2024-02-25", metodo_pago: "Transferencia" },
  //   { id: 64, numero: "FAC-2024-010", proveedor: "Eco Solutions", proyecto: "Comercial 2024", monto: 22000000, estado: "Pendiente", fecha: "2024-02-28", metodo_pago: "Efectivo" },

  //   // 2024 - Marzo (5 facturas)
  //   { id: 65, numero: "FAC-2024-011", proveedor: "Solar Tech", proyecto: "Industrial 2024", monto: 23000000, estado: "Pagado", fecha: "2024-03-05", metodo_pago: "Transferencia" },
  //   { id: 66, numero: "FAC-2024-012", proveedor: "Green Energy", proyecto: "Residencial 2024", monto: 24000000, estado: "Pendiente", fecha: "2024-03-10", metodo_pago: "Efectivo" },
  //   { id: 67, numero: "FAC-2024-013", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2024", monto: 25000000, estado: "Pagado", fecha: "2024-03-15", metodo_pago: "Transferencia" },
  //   { id: 68, numero: "FAC-2024-014", proveedor: "Eco Solutions", proyecto: "Comercial 2024", monto: 26000000, estado: "Pendiente", fecha: "2024-03-20", metodo_pago: "Efectivo" },
  //   { id: 69, numero: "FAC-2024-015", proveedor: "Paneles Plus", proyecto: "Comercial 2024", monto: 27000000, estado: "Cancelado", fecha: "2024-03-25", metodo_pago: "Tarjeta" },

  //   // 2024 - Abril (3 facturas)
  //   { id: 70, numero: "FAC-2024-016", proveedor: "Solar Tech", proyecto: "Industrial 2024", monto: 28000000, estado: "Pagado", fecha: "2024-04-05", metodo_pago: "Transferencia" },
  //   { id: 71, numero: "FAC-2024-017", proveedor: "Green Energy", proyecto: "Residencial 2024", monto: 29000000, estado: "Pendiente", fecha: "2024-04-10", metodo_pago: "Efectivo" },
  //   { id: 72, numero: "FAC-2024-018", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2024", monto: 30000000, estado: "Pagado", fecha: "2024-04-15", metodo_pago: "Transferencia" },

  //   // 2024 - Mayo (7 facturas)
  //   { id: 73, numero: "FAC-2024-019", proveedor: "Eco Solutions", proyecto: "Comercial 2024", monto: 31000000, estado: "Pendiente", fecha: "2024-05-05", metodo_pago: "Efectivo" },
  //   { id: 74, numero: "FAC-2024-020", proveedor: "Solar Tech", proyecto: "Industrial 2024", monto: 32000000, estado: "Pagado", fecha: "2024-05-10", metodo_pago: "Transferencia" },
  //   { id: 75, numero: "FAC-2024-021", proveedor: "Green Energy", proyecto: "Residencial 2024", monto: 33000000, estado: "Pendiente", fecha: "2024-05-15", metodo_pago: "Efectivo" },
  //   { id: 76, numero: "FAC-2024-022", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2024", monto: 34000000, estado: "Pagado", fecha: "2024-05-20", metodo_pago: "Transferencia" },
  //   { id: 77, numero: "FAC-2024-023", proveedor: "Eco Solutions", proyecto: "Comercial 2024", monto: 35000000, estado: "Pendiente", fecha: "2024-05-25", metodo_pago: "Efectivo" },
  //   { id: 78, numero: "FAC-2024-024", proveedor: "Paneles Plus", proyecto: "Comercial 2024", monto: 36000000, estado: "Cancelado", fecha: "2024-05-28", metodo_pago: "Tarjeta" },
  //   { id: 79, numero: "FAC-2024-025", proveedor: "Solar Tech", proyecto: "Industrial 2024", monto: 37000000, estado: "Pagado", fecha: "2024-05-30", metodo_pago: "Transferencia" },

  //   // 2024 - Junio (2 facturas)
  //   { id: 80, numero: "FAC-2024-026", proveedor: "Green Energy", proyecto: "Residencial 2024", monto: 38000000, estado: "Pendiente", fecha: "2024-06-10", metodo_pago: "Efectivo" },
  //   { id: 81, numero: "FAC-2024-027", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2024", monto: 39000000, estado: "Pagado", fecha: "2024-06-15", metodo_pago: "Transferencia" },

  //   // 2024 - Julio (4 facturas)
  //   { id: 82, numero: "FAC-2024-028", proveedor: "Eco Solutions", proyecto: "Comercial 2024", monto: 40000000, estado: "Pendiente", fecha: "2024-07-05", metodo_pago: "Efectivo" },
  //   { id: 83, numero: "FAC-2024-029", proveedor: "Solar Tech", proyecto: "Industrial 2024", monto: 41000000, estado: "Pagado", fecha: "2024-07-10", metodo_pago: "Transferencia" },
  //   { id: 84, numero: "FAC-2024-030", proveedor: "Green Energy", proyecto: "Residencial 2024", monto: 42000000, estado: "Pendiente", fecha: "2024-07-15", metodo_pago: "Efectivo" },
  //   { id: 85, numero: "FAC-2024-031", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2024", monto: 43000000, estado: "Pagado", fecha: "2024-07-20", metodo_pago: "Transferencia" },

  //   // 2024 - Agosto (6 facturas)
  //   { id: 86, numero: "FAC-2024-032", proveedor: "Eco Solutions", proyecto: "Comercial 2024", monto: 44000000, estado: "Pendiente", fecha: "2024-08-05", metodo_pago: "Efectivo" },
  //   { id: 87, numero: "FAC-2024-033", proveedor: "Solar Tech", proyecto: "Industrial 2024", monto: 45000000, estado: "Pagado", fecha: "2024-08-10", metodo_pago: "Transferencia" },
  //   { id: 88, numero: "FAC-2024-034", proveedor: "Green Energy", proyecto: "Residencial 2024", monto: 46000000, estado: "Pendiente", fecha: "2024-08-15", metodo_pago: "Efectivo" },
  //   { id: 89, numero: "FAC-2024-035", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2024", monto: 47000000, estado: "Pagado", fecha: "2024-08-20", metodo_pago: "Transferencia" },
  //   { id: 90, numero: "FAC-2024-036", proveedor: "Eco Solutions", proyecto: "Comercial 2024", monto: 48000000, estado: "Pendiente", fecha: "2024-08-25", metodo_pago: "Efectivo" },
  //   { id: 91, numero: "FAC-2024-037", proveedor: "Paneles Plus", proyecto: "Comercial 2024", monto: 49000000, estado: "Cancelado", fecha: "2024-08-30", metodo_pago: "Tarjeta" },

  //   // 2024 - Septiembre (5 facturas)
  //   { id: 92, numero: "FAC-2024-038", proveedor: "Solar Tech", proyecto: "Industrial 2024", monto: 50000000, estado: "Pagado", fecha: "2024-09-05", metodo_pago: "Transferencia" },
  //   { id: 93, numero: "FAC-2024-039", proveedor: "Green Energy", proyecto: "Residencial 2024", monto: 51000000, estado: "Pendiente", fecha: "2024-09-10", metodo_pago: "Efectivo" },
  //   { id: 94, numero: "FAC-2024-040", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2024", monto: 52000000, estado: "Pagado", fecha: "2024-09-15", metodo_pago: "Transferencia" },
  //   { id: 95, numero: "FAC-2024-041", proveedor: "Eco Solutions", proyecto: "Comercial 2024", monto: 53000000, estado: "Pendiente", fecha: "2024-09-20", metodo_pago: "Efectivo" },
  //   { id: 96, numero: "FAC-2024-042", proveedor: "Paneles Plus", proyecto: "Comercial 2024", monto: 54000000, estado: "Cancelado", fecha: "2024-09-25", metodo_pago: "Tarjeta" },

  //   // 2024 - Octubre (3 facturas)
  //   { id: 97, numero: "FAC-2024-043", proveedor: "Solar Tech", proyecto: "Industrial 2024", monto: 55000000, estado: "Pagado", fecha: "2024-10-05", metodo_pago: "Transferencia" },
  //   { id: 98, numero: "FAC-2024-044", proveedor: "Green Energy", proyecto: "Residencial 2024", monto: 56000000, estado: "Pendiente", fecha: "2024-10-10", metodo_pago: "Efectivo" },
  //   { id: 99, numero: "FAC-2024-045", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2024", monto: 57000000, estado: "Pagado", fecha: "2024-10-15", metodo_pago: "Transferencia" },

  //   // 2024 - Noviembre (7 facturas)
  //   { id: 100, numero: "FAC-2024-046", proveedor: "Eco Solutions", proyecto: "Comercial 2024", monto: 58000000, estado: "Pendiente", fecha: "2024-11-05", metodo_pago: "Efectivo" },
  //   { id: 101, numero: "FAC-2024-047", proveedor: "Solar Tech", proyecto: "Industrial 2024", monto: 59000000, estado: "Pagado", fecha: "2024-11-10", metodo_pago: "Transferencia" },
  //   { id: 102, numero: "FAC-2024-048", proveedor: "Green Energy", proyecto: "Residencial 2024", monto: 60000000, estado: "Pendiente", fecha: "2024-11-15", metodo_pago: "Efectivo" },
  //   { id: 103, numero: "FAC-2024-049", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2024", monto: 61000000, estado: "Pagado", fecha: "2024-11-20", metodo_pago: "Transferencia" },
  //   { id: 104, numero: "FAC-2024-050", proveedor: "Eco Solutions", proyecto: "Comercial 2024", monto: 62000000, estado: "Pendiente", fecha: "2024-11-25", metodo_pago: "Efectivo" },
  //   { id: 105, numero: "FAC-2024-051", proveedor: "Paneles Plus", proyecto: "Comercial 2024", monto: 63000000, estado: "Cancelado", fecha: "2024-11-28", metodo_pago: "Tarjeta" },
  //   { id: 106, numero: "FAC-2024-052", proveedor: "Solar Tech", proyecto: "Industrial 2024", monto: 64000000, estado: "Pagado", fecha: "2024-11-30", metodo_pago: "Transferencia" },

  //   // 2024 - Diciembre (2 facturas)
  //   { id: 107, numero: "FAC-2024-053", proveedor: "Green Energy", proyecto: "Residencial 2024", monto: 65000000, estado: "Pendiente", fecha: "2024-12-10", metodo_pago: "Efectivo" },
  //   { id: 108, numero: "FAC-2024-054", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2024", monto: 66000000, estado: "Pagado", fecha: "2024-12-15", metodo_pago: "Transferencia" },
  //   // 2025 - Enero (5 facturas)
  //   { id: 109, numero: "FAC-2025-001", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2025", monto: 67000000, estado: "Pagado", fecha: "2025-01-10", metodo_pago: "Transferencia" },
  //   { id: 110, numero: "FAC-2025-002", proveedor: "Paneles Plus", proyecto: "Comercial 2025", monto: 68000000, estado: "Pendiente", fecha: "2025-01-15", metodo_pago: "Efectivo" },
  //   { id: 111, numero: "FAC-2025-003", proveedor: "Solar Tech", proyecto: "Industrial 2025", monto: 69000000, estado: "Cancelado", fecha: "2025-01-20", metodo_pago: "Tarjeta" },
  //   { id: 112, numero: "FAC-2025-004", proveedor: "Green Energy", proyecto: "Residencial 2025", monto: 70000000, estado: "Pagado", fecha: "2025-01-25", metodo_pago: "Transferencia" },
  //   { id: 113, numero: "FAC-2025-005", proveedor: "Eco Solutions", proyecto: "Comercial 2025", monto: 71000000, estado: "Pendiente", fecha: "2025-01-30", metodo_pago: "Efectivo" },

  //   // 2025 - Febrero (4 facturas)
  //   { id: 114, numero: "FAC-2025-006", proveedor: "Solar Tech", proyecto: "Industrial 2025", monto: 72000000, estado: "Pagado", fecha: "2025-02-05", metodo_pago: "Transferencia" },
  //   { id: 115, numero: "FAC-2025-007", proveedor: "Green Energy", proyecto: "Residencial 2025", monto: 73000000, estado: "Pendiente", fecha: "2025-02-10", metodo_pago: "Efectivo" },
  //   { id: 116, numero: "FAC-2025-008", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2025", monto: 74000000, estado: "Pagado", fecha: "2025-02-15", metodo_pago: "Transferencia" },
  //   { id: 117, numero: "FAC-2025-009", proveedor: "Eco Solutions", proyecto: "Comercial 2025", monto: 75000000, estado: "Pendiente", fecha: "2025-02-20", metodo_pago: "Efectivo" },

  //   // 2025 - Marzo (6 facturas)
  //   { id: 118, numero: "FAC-2025-010", proveedor: "Solar Tech", proyecto: "Industrial 2025", monto: 76000000, estado: "Pagado", fecha: "2025-03-05", metodo_pago: "Transferencia" },
  //   { id: 119, numero: "FAC-2025-011", proveedor: "Green Energy", proyecto: "Residencial 2025", monto: 77000000, estado: "Pendiente", fecha: "2025-03-10", metodo_pago: "Efectivo" },
  //   { id: 120, numero: "FAC-2025-012", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2025", monto: 78000000, estado: "Pagado", fecha: "2025-03-15", metodo_pago: "Transferencia" },
  //   { id: 121, numero: "FAC-2025-013", proveedor: "Eco Solutions", proyecto: "Comercial 2025", monto: 79000000, estado: "Pendiente", fecha: "2025-03-20", metodo_pago: "Efectivo" },
  //   { id: 122, numero: "FAC-2025-014", proveedor: "Paneles Plus", proyecto: "Comercial 2025", monto: 80000000, estado: "Cancelado", fecha: "2025-03-25", metodo_pago: "Tarjeta" },
  //   { id: 123, numero: "FAC-2025-015", proveedor: "Solar Tech", proyecto: "Industrial 2025", monto: 81000000, estado: "Pagado", fecha: "2025-03-30", metodo_pago: "Transferencia" },

  //   // 2025 - Abril (3 facturas)
  //   { id: 124, numero: "FAC-2025-016", proveedor: "Green Energy", proyecto: "Residencial 2025", monto: 82000000, estado: "Pendiente", fecha: "2025-04-10", metodo_pago: "Efectivo" },
  //   { id: 125, numero: "FAC-2025-017", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2025", monto: 83000000, estado: "Pagado", fecha: "2025-04-15", metodo_pago: "Transferencia" },
  //   { id: 126, numero: "FAC-2025-018", proveedor: "Eco Solutions", proyecto: "Comercial 2025", monto: 84000000, estado: "Pendiente", fecha: "2025-04-20", metodo_pago: "Efectivo" },

  //   // 2025 - Mayo (5 facturas)
  //   { id: 127, numero: "FAC-2025-019", proveedor: "Solar Tech", proyecto: "Industrial 2025", monto: 85000000, estado: "Pagado", fecha: "2025-05-05", metodo_pago: "Transferencia" },
  //   { id: 128, numero: "FAC-2025-020", proveedor: "Green Energy", proyecto: "Residencial 2025", monto: 86000000, estado: "Pendiente", fecha: "2025-05-10", metodo_pago: "Efectivo" },
  //   { id: 129, numero: "FAC-2025-021", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2025", monto: 87000000, estado: "Pagado", fecha: "2025-05-15", metodo_pago: "Transferencia" },
  //   { id: 130, numero: "FAC-2025-022", proveedor: "Eco Solutions", proyecto: "Comercial 2025", monto: 88000000, estado: "Pendiente", fecha: "2025-05-20", metodo_pago: "Efectivo" },
  //   { id: 131, numero: "FAC-2025-023", proveedor: "Paneles Plus", proyecto: "Comercial 2025", monto: 89000000, estado: "Cancelado", fecha: "2025-05-25", metodo_pago: "Tarjeta" },

  //   // 2025 - Junio (4 facturas)
  //   { id: 132, numero: "FAC-2025-024", proveedor: "Solar Tech", proyecto: "Industrial 2025", monto: 90000000, estado: "Pagado", fecha: "2025-06-05", metodo_pago: "Transferencia" },
  //   { id: 133, numero: "FAC-2025-025", proveedor: "Green Energy", proyecto: "Residencial 2025", monto: 91000000, estado: "Pendiente", fecha: "2025-06-10", metodo_pago: "Efectivo" },
  //   { id: 134, numero: "FAC-2025-026", proveedor: "Energía Solar S.A.", proyecto: "Residencial 2025", monto: 92000000, estado: "Pagado", fecha: "2025-06-15", metodo_pago: "Transferencia" },
  //   { id: 135, numero: "FAC-2025-027", proveedor: "Eco Solutions", proyecto: "Comercial 2025", monto: 93000000, estado: "Pendiente", fecha: "2025-06-20", metodo_pago: "Efectivo" }
  // ];

  // 2. Filtro por mes y año
  const [selectedMonth, setSelectedMonth] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState("");

  const facturasFiltradas = React.useMemo(() => {
    if (!selectedMonth && !selectedYear) return facturas;
    return facturas.filter(f => {
      const fecha = new Date(f.fecha);
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const anio = fecha.getFullYear().toString();
      const mesOk = selectedMonth ? mes === selectedMonth : true;
      const anioOk = selectedYear ? anio === selectedYear : true;
      return mesOk && anioOk;
    });
  }, [facturas, selectedMonth, selectedYear]);

  // 3. Datos derivados para widgets, gráficas y tablas
  // a) Resumen
  const resumenFiltrado = React.useMemo(() => {
    const total_facturas = facturasFiltradas.length;
    const monto_total = facturasFiltradas.filter(f => f.estado === 'Pagado').reduce((acc, f) => acc + f.monto, 0);
    const facturas_pendientes = facturasFiltradas.filter(f => f.estado === 'Pendiente').length;
    const facturas_pagadas = facturasFiltradas.filter(f => f.estado === 'Pagado').length;
    const facturas_canceladas = facturasFiltradas.filter(f => f.estado === 'Cancelado').length;
    const promedio_factura = total_facturas ? Math.round(monto_total / total_facturas) : 0;
    const facturas_mes_actual = total_facturas;
    const monto_mes_actual = monto_total;
    return {
      total_facturas,
      monto_total,
      facturas_pendientes,
      facturas_pagadas,
      facturas_canceladas,
      promedio_factura,
      facturas_mes_actual,
      monto_mes_actual,
      crecimiento_mensual: 0,
      crecimiento_anual: 0
    };
  }, [facturasFiltradas]);

  // b) Facturas por mes (para gráfica de líneas)
  const facturasPorMesFiltradas = React.useMemo(() => {
    const map = {};
    facturasFiltradas.forEach(f => {
      const fecha = new Date(f.fecha);
      const mes = fecha.toLocaleString('es-ES', { month: 'short' });
      const anio = fecha.getFullYear();
      const key = `${mes}-${anio}`;
      if (!map[key]) map[key] = { mes, anio, cantidad: 0, monto: 0 };
      map[key].cantidad++;
      map[key].monto += f.monto;
    });
    return Object.values(map).sort((a, b) => (a.anio - b.anio) || (new Date(`${a.mes} 1, 2000`) - new Date(`${b.mes} 1, 2000`)));
  }, [facturasFiltradas]);

  const facturasPorMesUltimos6 = React.useMemo(() => {
    const arr = facturasPorMesFiltradas;
    return arr.length > 6 ? arr.slice(-6) : arr;
  }, [facturasPorMesFiltradas]);

  const lineChartData = [
    {
      name: "Facturas",
      data: facturasPorMesUltimos6.map(item => item.cantidad)
    },
    {
      name: "Monto (M)",
      data: facturasPorMesUltimos6.map(item => item.monto / 1000000)
    }
  ];

  const lineChartOptions = {
    chart: {
      toolbar: { show: false },
    },
    tooltip: {
      style: { fontSize: "12px", backgroundColor: "#000000" },
      theme: "dark",
    },
    xaxis: {
      categories: facturasPorMesUltimos6.map(item => `${item.mes} ${item.anio}`),
      labels: {
        style: { colors: "#A3AED0", fontSize: "14px", fontWeight: "500" },
      },
    },
    yaxis: [
      {
        title: { text: "Cantidad de Facturas" },
        labels: { style: { colors: "#A3AED0", fontSize: "14px" } },
      },
      {
        opposite: true,
        title: { text: "Monto (Millones)" },
        labels: { style: { colors: "#A3AED0", fontSize: "14px" } },
      }
    ],
    colors: ["#4318FF", "#6AD2FF"],
    grid: { strokeDashArray: 5 },
    dataLabels: { enabled: false },
  };

  // c) Top proveedores
  const topProveedoresFiltrados = React.useMemo(() => {
    const map = {};
    facturasFiltradas.forEach(f => {
      if (!map[f.proveedor]) map[f.proveedor] = { nombre: f.proveedor, monto: 0, cantidad: 0 };
      map[f.proveedor].monto += f.monto;
      map[f.proveedor].cantidad += 1;
    });
    return Object.values(map).sort((a, b) => b.monto - a.monto).slice(0, 5);
  }, [facturasFiltradas]);

  // d) Métodos de pago
  const metodosPosibles = ["Transferencia", "Efectivo", "Tarjeta", "Credito"];

  const metodosPagoFiltrados = React.useMemo(() => {
    const map = {};
    facturasFiltradas.forEach(f => {
      map[f.metodo_pago] = (map[f.metodo_pago] || 0) + 1;
    });
    return metodosPosibles.map(metodo => ({
      metodo,
      cantidad: map[metodo] || 0
    }));
  }, [facturasFiltradas]);

  // e) Estados de facturas
  const estadosPosibles = ["Pagado", "Pendiente", "Cancelado"];

  const facturasPorEstadoFiltradas = React.useMemo(() => {
    const map = {};
    facturasFiltradas.forEach(f => {
      map[f.estado] = (map[f.estado] || 0) + 1;
    });
    const total = facturasFiltradas.length;
    return estadosPosibles.map(estado => ({
      estado,
      cantidad: map[estado] || 0,
      porcentaje: total ? (((map[estado] || 0) * 100) / total).toFixed(1) : 0
    }));
  }, [facturasFiltradas]);

  // f) Proyectos activos
  const proyectosActivosFiltrados = React.useMemo(() => {
    const map = {};
    facturasFiltradas.forEach(f => {
      if (f.estado === 'Pagado') {
        map[f.proyecto] = map[f.proyecto] || { total_gastado: 0, cantidad_facturas: 0, nombre: f.proyecto, descripcion: `Proyecto solar ${f.proyecto}` };
        map[f.proyecto].total_gastado += f.monto;
        map[f.proyecto].cantidad_facturas += 1;
      }
    });
    return Object.values(map).map((p, idx) => ({
      id: idx + 1,
      ...p
    }));
  }, [facturasFiltradas]);

  // g) Últimas facturas (ordenadas por fecha descendente)
  const ultimasFacturasFiltradas = React.useMemo(() => {
    return [...facturasFiltradas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [facturasFiltradas]);

  const formatCurrency = (amount) => {
    return '$' + new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' COP';
  };

  const formatCurrencyAbbreviated = (amount) => {
    if (amount >= 1000000000) {
      return '$' + new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount / 1000000000) + 'B COP';
    } else if (amount >= 1000000) {
      return '$' + new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount / 1000000) + 'M COP';
    } else {
      return '$' + new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount) + ' COP';
    }
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-CO').format(number);
  };

  // Función para abrir el modal con las facturas de un proyecto
  const handleViewProjectInvoices = async (project) => {
    try {
      setSelectedProject(project);
      setModalOpen(true);
      
      // Cargar las facturas del proyecto desde el backend
      const facturasProyecto = await cargarFacturasProyecto(project.id);
      setSelectedProjectInvoices(facturasProyecto);
    } catch (error) {
      console.error('Error al cargar facturas:', error);
      // Mostrar mensaje de error al usuario
      alert('Error al cargar las facturas del proyecto. Por favor, inténtalo de nuevo.');
      setModalOpen(false);
    }
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProject(null);
    setSelectedProjectInvoices([]);
  };

  // Función para cargar proyectos activos
  const cargarProyectosActivos = async () => {
    try {
      // setLoadingProyectos(true); // This state is no longer needed for projects
      // setErrorProyectos(null); // This state is no longer needed for projects
      const data = await proyectosService.getProyectosActivos();
      // setProyectosActivos(data); // This state is no longer needed for projects
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      // setErrorProyectos('Error al cargar los proyectos. Por favor, inténtalo de nuevo.'); // This state is no longer needed for projects
    } finally {
      // setLoadingProyectos(false); // This state is no longer needed for projects
    }
  };

  // Función para cargar facturas de un proyecto
  const cargarFacturasProyecto = async (proyectoId) => {
    try {
      setLoadingFacturas(true);
      const data = await proyectosService.getFacturasProyecto(proyectoId);
      return data;
    } catch (error) {
      console.error('Error al cargar facturas del proyecto:', error);
      throw error;
    } finally {
      setLoadingFacturas(false);
    }
  };

  const handleCalendarChange = (date) => {
    // El mes de JS es base 0, pero el mes que queremos guardar es base 1 (enero = 01)
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    setSelectedMonth(mes);
    setSelectedYear(date.getFullYear().toString());
    setCalendarOpen(false);
  };

  const barChartDataProveedores = [
    {
      name: "Cantidad de Facturas",
      data: topProveedoresFiltrados.map(item => item.cantidad),
      color: "#6AD2FF"
    }
  ];

  const barChartOptionsProveedores = {
    chart: {
      toolbar: { show: false },
    },
    tooltip: {
      style: { fontSize: "12px", backgroundColor: "#000000" },
      theme: "dark",
      y: {
        formatter: function (val) {
          return val + ' facturas';
        }
      }
    },
    xaxis: {
      categories: topProveedoresFiltrados.map(item => item.nombre),
      labels: {
        style: { colors: "#A3AED0", fontSize: "12px" },
        rotate: -45,
        rotateAlways: false
      },
    },
    yaxis: {
      title: { text: "Cantidad de Facturas" },
      labels: { style: { colors: "#A3AED0", fontSize: "14px" } },
    },
    grid: { strokeDashArray: 5 },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: { borderRadius: 10, columnWidth: "40px" },
    },
  };

  const barChartDataMetodos = [
    {
      name: "Cantidad",
      data: metodosPagoFiltrados.map(item => item.cantidad),
      color: "#6AD2FF"
    }
  ];

  const barChartOptionsMetodos = {
    chart: {
      toolbar: { show: false },
    },
    tooltip: {
      style: { fontSize: "12px", backgroundColor: "#000000" },
      theme: "dark",
    },
    xaxis: {
      categories: metodosPagoFiltrados.map(item => item.metodo),
      labels: {
        style: { colors: "#A3AED0", fontSize: "14px" },
      },
    },
    yaxis: {
      title: { text: "Cantidad de Facturas" },
      labels: { style: { colors: "#A3AED0", fontSize: "14px" } },
    },
    grid: { strokeDashArray: 5 },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: { borderRadius: 10, columnWidth: "40px" },
    },
  };

  const pieChartData = facturasPorEstadoFiltradas.map(item => item.cantidad);
  const pieChartOptions = {
    labels: facturasPorEstadoFiltradas.map(item => item.estado),
    colors: ["#18981D", "#FFA500", "#FF0000"],
    chart: { width: "50px" },
    states: { hover: { filter: { type: "none" } } },
    legend: { show: false },
    dataLabels: { enabled: false },
    hover: { mode: null },
    plotOptions: {
      donut: {
        expandOnClick: false,
        donut: { labels: { show: false } },
      },
    },
    fill: { colors: ["#18981D", "#FFA500", "#FF0000"] },
    tooltip: {
      enabled: true,
      theme: "dark",
      style: { fontSize: "12px", backgroundColor: "#000000" },
    },
  };

  // Cargar proyectos al montar el componente
  React.useEffect(() => {
    cargarProyectosActivos();
  }, []);


  React.useEffect(() => {
    // Datos de prueba para facturas
    const facturasPrueba = [
      { id: 1, numero: "FAC-2025-001", proveedor: "Proveedor A", proyecto: "Proyecto X", monto: 10000, estado: "Pagado", fecha: "2025-08-01", metodo_pago: "Transferencia" },
      { id: 2, numero: "FAC-2025-002", proveedor: "Proveedor B", proyecto: "Proyecto Y", monto: 20000, estado: "Pendiente", fecha: "2025-08-02", metodo_pago: "Efectivo" },
      { id: 3, numero: "FAC-2025-003", proveedor: "Proveedor C", proyecto: "Proyecto Z", monto: 15000, estado: "Cancelado", fecha: "2025-08-03", metodo_pago: "Tarjeta" },
    ];
    setFacturas(facturasPrueba);
    setLoadingFacturas(false);
  }, []);

  if (loadingFacturas) return <div className="p-8 text-center">Cargando facturas...</div>;
  // Si hay error, mostrar datos de prueba en vez de error
  // if (errorFacturas) return <div className="p-8 text-center text-red-600">Error: {errorFacturas}</div>;

  return (
    <div>
      {/* Card widget */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget
          icon={<MdReceipt className="h-7 w-7" />}
          title={"Total Facturas"}
          subtitle={formatNumber(resumenFiltrado.total_facturas)}
        />
        <Widget
          icon={<MdAttachMoney className="h-6 w-6" />}
          title={"Monto Total"}
          subtitle={formatCurrencyAbbreviated(resumenFiltrado.monto_total)}
        />
        <Widget
          icon={<MdPending className="h-7 w-7" />}
          title={"Facturas Pendientes"}
          subtitle={formatNumber(resumenFiltrado.facturas_pendientes)}
        />
        <Widget
          icon={<MdCheckCircle className="h-6 w-6" />}
          title={"Facturas Pagadas"}
          subtitle={formatNumber(resumenFiltrado.facturas_pagadas)}
        />
        <Widget
          icon={<MdCancel className="h-7 w-7" />}
          title={"Facturas Canceladas"}
          subtitle={formatNumber(resumenFiltrado.facturas_canceladas)}
        />
        <Widget
          icon={<MdTrendingUp className="h-6 w-6" />}
          title={"Promedio por Factura"}
          subtitle={formatCurrencyAbbreviated(resumenFiltrado.promedio_factura)}
        />
      </div>

      {/* Charts */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Gráfica de líneas - Facturas por mes */}
        <Card extra="!p-[20px] text-center">
          <div className="flex justify-between">
            <button
              className="linear mt-1 flex items-center justify-center gap-2 rounded-lg bg-lightPrimary p-2 text-gray-600 transition duration-200 hover:cursor-pointer hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:hover:opacity-90 dark:active:opacity-80"
              onClick={() => setCalendarOpen(true)}
              type="button"
            >
              <MdOutlineCalendarToday />
              <span className="text-sm font-medium text-gray-600">Filtrar por mes y año</span>
              {selectedMonth && selectedYear && (
                <span className="ml-2 text-xs text-brand-500">{`${selectedYear}-${selectedMonth}`}</span>
              )}
            </button>
            {(selectedMonth || selectedYear) && (
              <button
                className="ml-2 text-xs text-red-500 underline"
                onClick={() => { setSelectedMonth(""); setSelectedYear(""); }}
                type="button"
              >
                Limpiar filtro
              </button>
            )}
            <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
              <MdBarChart className="h-6 w-6" />
            </button>
          </div>
          {calendarOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg p-6 relative">
                <button onClick={() => setCalendarOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl">&times;</button>
                <Calendar
                  onChange={handleCalendarChange}
                  value={
                    selectedYear && selectedMonth
                      ? new Date(Number(selectedYear), Number(selectedMonth) - 1, 1)
                      : new Date()
                  }
                  view="year"
                  onClickMonth={handleCalendarChange}
                  maxDetail="year"
                  minDetail="decade"
                  locale="es-ES"
                />
                <div className="text-xs text-gray-500 mt-2">Selecciona un mes y año</div>
              </div>
            </div>
          )}

          <div className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
            <div className="flex flex-col">
              <p className="mt-[20px] text-3xl font-bold text-navy-700 dark:text-white">
                {formatNumber(resumenFiltrado.facturas_mes_actual)}
              </p>
              <div className="flex flex-col items-start">
                <p className="mt-2 text-sm text-gray-600">Facturas este mes</p>
                <div className="flex flex-row items-center justify-center">
                  <MdTrendingUp className="font-medium text-green-500" />
                  <p className="text-sm font-bold text-green-500"> +{resumenFiltrado.crecimiento_mensual}% </p>
                </div>
              </div>
            </div>
            <div className="h-full w-full">
              <LineChart options={lineChartOptions} series={lineChartData} />
            </div>
          </div>
        </Card>

        {/* Gráfica de barras - Top proveedores */}
        <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-2 text-center">
          <div className="mb-auto flex items-center justify-between px-6">
            <h2 className="text-lg font-bold text-navy-700 dark:text-white">
              Top Proveedores
            </h2>
            <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-brand-500 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
              <MdBarChart className="h-6 w-6" />
            </button>
          </div>

          <div className="md:mt-16 lg:mt-0">
            <div className="h-[250px] w-full xl:h-[350px]">
              <BarChart
                key={topProveedoresFiltrados.map(p => p.nombre).join('-')}
                chartData={barChartDataProveedores}
                chartOptions={barChartOptionsProveedores}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Tables & Charts */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Gráfica circular - Estados de facturas */}
        <Card extra="rounded-[20px] p-3">
          <div className="flex flex-row justify-between px-3 pt-2">
            <div>
              <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                Estados de Facturas
              </h4>
            </div>
            <div className="mb-6 flex items-center justify-center">
              <select className="mb-3 mr-2 flex items-center justify-center text-sm font-bold text-gray-600 hover:cursor-pointer dark:!bg-navy-800 dark:text-white">
                <option value="porcentaje">Por Porcentaje</option>
                <option value="cantidad">Por Cantidad</option>
                <option value="monto">Por Monto</option>
              </select>
            </div>
          </div>

          <div className="mb-auto flex h-[220px] w-full items-center justify-center">
            {pieChartData.some(val => Number(val) > 0) ? (
              <PieChart
                key={facturasPorEstadoFiltradas.map(e => e.estado + '-' + e.cantidad).join('-')}
                options={pieChartOptions}
                series={pieChartData}
              />
            ) : (
              <span className="text-gray-400">No hay datos para mostrar</span>
            )}
          </div>
          
          <div className="flex flex-row !justify-between rounded-2xl px-6 py-3 shadow-2xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
            {facturasPorEstadoFiltradas.map((item, index) => (
              <div key={index} className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center">
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: pieChartOptions.colors[index] }}
                  />
                  <p className="ml-1 text-sm font-normal text-gray-600">{item.estado}</p>
                </div>
                <p className="mt-px text-xl font-bold text-navy-700 dark:text-white">
                  {item.porcentaje}%
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Gráfica de barras - Métodos de pago */}
        <Card extra="pb-7 p-[20px]">
          <div className="flex flex-row justify-between">
            <div className="ml-1 pt-2">
              <p className="text-sm font-medium leading-4 text-gray-600">
                Métodos de Pago
              </p>
              <p className="text-[34px] font-bold text-navy-700 dark:text-white">
                {formatNumber(resumenFiltrado.total_facturas)}{" "}
                <span className="text-sm font-medium leading-6 text-gray-600">
                  Facturas
                </span>
              </p>
            </div>
            <div className="mt-2 flex items-start">
              <div className="flex items-center text-sm text-green-500">
                <MdTrendingUp className="h-5 w-5" />
                <p className="font-bold"> +{resumenFiltrado.crecimiento_anual}% </p>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full pt-10 pb-0">
            <BarChart
              key={metodosPagoFiltrados.map(m => m.metodo + '-' + m.cantidad).join('-')}
              chartData={barChartDataMetodos}
              chartOptions={barChartOptionsMetodos}
            />
          </div>
        </Card>
      </div>

      {/* Tabla de Facturas por Proyectos */}
      <div className="mt-5">
        <Card extra={"w-full h-full px-8 pb-8 sm:overflow-x-auto"}>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-2">
              <MdFolder className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                Facturas por Proyectos
              </h1>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            {proyectosActivosFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <MdFolder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay proyectos con facturas</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Nombre del Proyecto</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Descripción</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Total Gastado</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">Cantidad de Facturas</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectosActivosFiltrados.map((proyecto) => (
                    <tr key={proyecto.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{proyecto.nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{proyecto.descripcion}</td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">{formatCurrency(proyecto.total_gastado)}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{proyecto.cantidad_facturas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* Modal para mostrar facturas del proyecto */}
      <ProjectInvoicesModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        project={selectedProject}
        invoices={selectedProjectInvoices}
        loading={loadingFacturas}
      />
    </div>
  );
};

export default Dashboard;
