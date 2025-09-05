import React from "react";
import { MdBarChart, MdReceipt, MdAttachMoney, MdPending, MdCheckCircle, MdCancel, MdTrendingUp, MdTrendingDown, MdOutlineCalendarToday, MdVisibility, MdFolder, MdAccountBalance, MdWarning, MdNotifications } from "react-icons/md";
import ProjectInvoicesModal from "components/modal/ProjectInvoicesModal";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../../../assets/css/Calendar.css";

import { proyectosService } from "services/proyectosService";
import { gestionFinancieraService } from "services/gestionFinancieraService";
import { financialDashboardService } from "services/financialDashboardService";
import { facturasService } from "services/facturasService";
import { getApiUrl } from "config/api";

import Widget from "components/widget/Widget";
import Card from "components/card";
import LineChart from "components/charts/LineChart";
import BarChart from "components/charts/BarChart";
import PieChart from "components/charts/PieChart";

// Datos de prueba para cuando la API no esté funcionando
const MOCK_FACTURAS = [
  {
    id: 1,
    number: "FAC-2024-001",
    date: "2024-01-15",
    amount: 2500000,
    status: "Pagado",
    payment_method: "Transferencia",
    description: "Compra de paneles solares para proyecto residencial",
    supplier: "SolarTech Colombia",
    project: "Instalación Residencial Medellín"
  },
  {
    id: 2,
    number: "FAC-2024-002",
    date: "2024-01-20",
    amount: 1800000,
    status: "Pagado",
    payment_method: "Efectivo",
    description: "Inversores para proyecto comercial",
    supplier: "InverterPro",
    project: "Centro Comercial Bogotá"
  },
  {
    id: 3,
    number: "FAC-2024-003",
    date: "2024-02-05",
    amount: 3200000,
    status: "Pagado",
    payment_method: "Cheque",
    description: "Baterías de respaldo para proyecto industrial",
    supplier: "BatteryMax",
    project: "Planta Industrial Cali"
  },
  {
    id: 4,
    number: "FAC-2024-004",
    date: "2024-02-12",
    amount: 950000,
    status: "Cancelado",
    payment_method: "Transferencia",
    description: "Cables y conectores para instalación",
    supplier: "CablePro",
    project: "Instalación Residencial Medellín"
  },
  {
    id: 5,
    number: "FAC-2024-005",
    date: "2024-02-18",
    amount: 4100000,
    status: "Pendiente",
    payment_method: "Transferencia",
    description: "Sistema de monitoreo y control",
    supplier: "MonitorTech",
    project: "Centro Comercial Bogotá"
  },
  {
    id: 6,
    number: "FAC-2024-006",
    date: "2024-03-01",
    amount: 2800000,
    status: "Pagado",
    payment_method: "Efectivo",
    description: "Herramientas y equipos de instalación",
    supplier: "ToolMaster",
    project: "Planta Industrial Cali"
  },
  {
    id: 7,
    number: "FAC-2024-007",
    date: "2024-03-08",
    amount: 1650000,
    status: "Pendiente",
    payment_method: "Transferencia",
    description: "Materiales de soporte y estructura",
    supplier: "StructurePro",
    project: "Instalación Residencial Medellín"
  },
  {
    id: 8,
    number: "FAC-2024-008",
    date: "2024-03-15",
    amount: 5200000,
    status: "Pagado",
    payment_method: "Cheque",
    description: "Sistema completo de energía solar",
    supplier: "SolarSystem",
    project: "Centro Comercial Bogotá"
  }
];

// Datos de prueba para gestión financiera
const MOCK_RESUMEN_CAJA = {
  caja_disponible: 15000000,
  ingresos_mes: 8500000,
  egresos_mes: 3200000,
  saldo_proyectado: 20300000
};

const MOCK_INGRESOS = [
  { id: 1, fecha: "2024-03-01", monto: 2500000, descripcion: "Pago factura FAC-2024-001", tipo: "ingreso" },
  { id: 2, fecha: "2024-03-05", monto: 1800000, descripcion: "Pago factura FAC-2024-002", tipo: "ingreso" },
  { id: 3, fecha: "2024-03-10", monto: 3200000, descripcion: "Pago factura FAC-2024-003", tipo: "ingreso" },
  { id: 4, fecha: "2024-03-15", monto: 1000000, descripcion: "Pago factura FAC-2024-008", tipo: "ingreso" }
];

const MOCK_EGRESOS = [
  { id: 1, fecha: "2024-03-02", monto: 800000, descripcion: "Compra materiales", tipo: "egreso" },
  { id: 2, fecha: "2024-03-08", monto: 1200000, descripcion: "Pago proveedores", tipo: "egreso" },
  { id: 3, fecha: "2024-03-12", monto: 600000, descripcion: "Gastos operativos", tipo: "egreso" },
  { id: 4, fecha: "2024-03-18", monto: 600000, descripcion: "Servicios públicos", tipo: "egreso" }
];

const MOCK_FACTURAS_PROVEEDORES = [
  { id: 1, numero: "PROV-001", monto: 2500000, fecha_vencimiento: "2024-03-25", estado: "pendiente" },
  { id: 2, numero: "PROV-002", monto: 1800000, fecha_vencimiento: "2024-03-30", estado: "pendiente" },
  { id: 3, numero: "PROV-003", monto: 3200000, fecha_vencimiento: "2024-04-05", estado: "pendiente" }
];

const MOCK_ALERTAS_FINANCIERAS = [
  { id: 1, tipo: "vencimiento", mensaje: "Factura PROV-001 vence en 3 días", prioridad: "alta" },
  { id: 2, tipo: "saldo", mensaje: "Saldo bajo en cuenta principal", prioridad: "media" },
  { id: 3, tipo: "gasto", mensaje: "Gastos operativos superan presupuesto", prioridad: "baja" }
];

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

  // Estados para gestión financiera
  const [loadingFinanciero, setLoadingFinanciero] = React.useState(true);
  const [resumenCaja, setResumenCaja] = React.useState(null);
  const [ingresos, setIngresos] = React.useState([]);
  const [egresos, setEgresos] = React.useState([]);
  const [facturasProveedores, setFacturasProveedores] = React.useState([]);
  const [alertasFinancieras, setAlertasFinancieras] = React.useState([]);
  const [usingMockData, setUsingMockData] = React.useState(false);

  // Estados para dashboard financiero
  const [loadingDashboardFinanciero, setLoadingDashboardFinanciero] = React.useState(true);
  const [resumenFinanciero, setResumenFinanciero] = React.useState(null);
  const [facturasProximasVencer, setFacturasProximasVencer] = React.useState(null);
  const [proyectosActivos, setProyectosActivos] = React.useState(null);
  const [showFacturasProximasVencer, setShowFacturasProximasVencer] = React.useState(false);
  const [diasFiltro, setDiasFiltro] = React.useState(30);

  // Estados para gráficas
  const [loadingGraficas, setLoadingGraficas] = React.useState(true);
  const [facturasPorMes, setFacturasPorMes] = React.useState([]);
  const [topProveedores, setTopProveedores] = React.useState([]);
  const [estadosFacturas, setEstadosFacturas] = React.useState([]);
  const [metodosPago, setMetodosPago] = React.useState([]);

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
    console.log('🔍 Analizando facturas filtradas:', facturasFiltradas);
    
    const total_facturas = facturasFiltradas.length;
    
    // Análisis detallado del monto total
    const facturasPagadas = facturasFiltradas.filter(f => f.status === 'Pagado');
    console.log('📋 Facturas pagadas:', facturasPagadas);
    
    const monto_total = facturasPagadas.reduce((acc, f) => {
      console.log(`💰 Sumando factura ${f.number}: ${f.amount} (tipo: ${typeof f.amount})`);
      return acc + f.amount;
    }, 0);
    
    console.log('💵 Monto total calculado:', monto_total);
    
    const facturas_pendientes = facturasFiltradas.filter(f => f.status === 'Pendiente').length;
    const facturas_pagadas = facturasPagadas.length;
    const facturas_canceladas = facturasFiltradas.filter(f => f.status === 'Cancelado').length;
    const promedio_factura = total_facturas ? Math.round(monto_total / total_facturas) : 0;
    const facturas_mes_actual = total_facturas;
    const monto_mes_actual = monto_total;
    
    const resumen = {
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
    
    console.log('📊 Resumen final:', resumen);
    return resumen;
  }, [facturasFiltradas]);

  // b) Facturas por mes (para gráfica de líneas) - usar datos del backend
  const facturasPorMesFiltradas = React.useMemo(() => {
    // Si tenemos datos del backend, usarlos
    if (facturasPorMes.length > 0) {
      return facturasPorMes.map(item => ({
        mes: item.mes,
        anio: item.anio,
        cantidad: item.cantidad,
        monto: item.monto
      }));
    }
    
    // Fallback a datos locales si no hay datos del backend
    const map = {};
    facturasFiltradas.forEach(f => {
      const fecha = new Date(f.date);
      const mes = fecha.toLocaleString('es-ES', { month: 'short' });
      const anio = fecha.getFullYear();
      const key = `${mes}-${anio}`;
      if (!map[key]) map[key] = { mes, anio, cantidad: 0, monto: 0 };
      map[key].cantidad++;
      map[key].monto += f.amount;
    });
    return Object.values(map).sort((a, b) => (a.anio - b.anio) || (new Date(`${a.mes} 1, 2000`) - new Date(`${b.mes} 1, 2000`)));
  }, [facturasPorMes, facturasFiltradas]);

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
      background: 'transparent',
    },
    tooltip: {
      style: { fontSize: "12px", backgroundColor: "#2A2B31" },
      theme: "dark",
    },
    xaxis: {
      categories: facturasPorMesUltimos6.map(item => `${item.mes} ${item.anio}`),
      labels: {
        style: { colors: "#B0B3B8", fontSize: "14px", fontWeight: "500" },
      },
    },
    yaxis: [
      {
        title: { text: "Cantidad de Facturas" },
        labels: { style: { colors: "#B0B3B8", fontSize: "14px" } },
      },
      {
        opposite: true,
        title: { text: "Monto (Millones)" },
        labels: { style: { colors: "#B0B3B8", fontSize: "14px" } },
      }
    ],
    colors: ["#00C875", "#3B82F6"],
    grid: { 
      strokeDashArray: 5,
      borderColor: "#4B5563",
      xaxis: { lines: { show: true, color: "#4B5563" } },
      yaxis: { lines: { show: true, color: "#4B5563" } }
    },
    dataLabels: { enabled: false },
  };

  // c) Top proveedores - usar datos del backend
  const topProveedoresFiltrados = React.useMemo(() => {
    // Si tenemos datos del backend, usarlos
    if (topProveedores.length > 0) {
      return topProveedores.map(item => ({
        nombre: item.nombre,
        monto: item.monto,
        cantidad: item.cantidad
      }));
    }
    
    // Fallback a datos locales si no hay datos del backend
    const map = {};
    facturasFiltradas.forEach(f => {
      if (!map[f.supplier]) map[f.supplier] = { nombre: f.supplier, monto: 0, cantidad: 0 };
      map[f.supplier].monto += f.amount;
      map[f.supplier].cantidad += 1;
    });
    return Object.values(map).sort((a, b) => b.monto - a.monto).slice(0, 5);
  }, [topProveedores, facturasFiltradas]);

  // d) Métodos de pago - usar datos del backend
  const metodosPosibles = ["Transferencia", "Efectivo", "Tarjeta", "Credito"];

  const metodosPagoFiltrados = React.useMemo(() => {
    // Si tenemos datos del backend, usarlos
    if (metodosPago.length > 0) {
      return metodosPago.map(item => ({
        metodo: item.metodo,
        cantidad: item.cantidad
      }));
    }
    
    // Fallback a datos locales si no hay datos del backend
    const map = {};
    facturasFiltradas.forEach(f => {
      map[f.payment_method] = (map[f.payment_method] || 0) + 1;
    });
    return metodosPosibles.map(metodo => ({
      metodo,
      cantidad: map[metodo] || 0
    }));
  }, [metodosPago, facturasFiltradas]);

  // e) Estados de facturas - usar datos del backend
  const estadosPosibles = ["Pagado", "Pendiente", "Cancelado"];

  const facturasPorEstadoFiltradas = React.useMemo(() => {
    // Si tenemos datos del backend, usarlos
    if (estadosFacturas.length > 0) {
      return estadosFacturas.map(item => ({
        estado: item.estado,
        cantidad: item.cantidad,
        porcentaje: item.porcentaje
      }));
    }
    
    // Fallback a datos locales si no hay datos del backend
    const map = {};
    facturasFiltradas.forEach(f => {
      map[f.status] = (map[f.status] || 0) + 1;
    });
    const total = facturasFiltradas.length;
    return estadosPosibles.map(estado => ({
      estado,
      cantidad: map[estado] || 0,
      porcentaje: total ? (((map[estado] || 0) * 100) / total).toFixed(1) : 0
    }));
  }, [estadosFacturas, facturasFiltradas]);

  // f) Proyectos activos - usar datos del dashboard financiero
  const proyectosActivosFiltrados = React.useMemo(() => {
    // Si tenemos datos del dashboard financiero, usarlos
    if (proyectosActivos && proyectosActivos.projects) {
      return proyectosActivos.projects.map(proyecto => ({
        id: proyecto.project_id,
        nombre: proyecto.project_name,
        total_gastado: proyecto.financial_summary.total_paid_amount,
        cantidad_facturas: proyecto.financial_summary.total_paid_invoices,
        descripcion: `Cliente: ${proyecto.client?.name || 'N/A'} - Potencia: ${proyecto.quotation?.power_kwp || 0} kWp`
      }));
    }
    
    // Fallback a datos locales si no hay datos del dashboard
    const map = {};
    facturasFiltradas.forEach(f => {
      if (f.status === 'Pagado') {
        map[f.project] = map[f.project] || { total_gastado: 0, cantidad_facturas: 0, nombre: f.project, descripcion: `Proyecto solar ${f.project}` };
        map[f.project].total_gastado += f.amount;
        map[f.project].cantidad_facturas += 1;
      }
    });
    return Object.values(map).map((p, idx) => ({
      id: idx + 1,
      ...p
    }));
  }, [proyectosActivos, facturasFiltradas]);

  // g) Últimas facturas (ordenadas por fecha descendente)
  const ultimasFacturasFiltradas = React.useMemo(() => {
    return [...facturasFiltradas].sort((a, b) => new Date(b.date) - new Date(a.date));
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
      const data = await proyectosService.getProyectosActivos();
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
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
      color: "#00C875"
    }
  ];

  const barChartOptionsProveedores = {
    chart: {
      toolbar: { show: false },
      background: 'transparent',
    },
    tooltip: {
      style: { fontSize: "12px", backgroundColor: "#2A2B31" },
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
        style: { colors: "#B0B3B8", fontSize: "12px" },
        rotate: -45,
        rotateAlways: false
      },
    },
    yaxis: {
      title: { text: "Cantidad de Facturas" },
      labels: { style: { colors: "#B0B3B8", fontSize: "14px" } },
    },
    grid: { 
      strokeDashArray: 5,
      borderColor: "#4B5563",
      xaxis: { lines: { show: true, color: "#4B5563" } },
      yaxis: { lines: { show: true, color: "#4B5563" } }
    },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: { borderRadius: 10, columnWidth: "40px" },
    },
  };

  const barChartDataMetodos = [
    {
      name: "Cantidad",
      data: metodosPagoFiltrados.map(item => item.cantidad),
      color: "#00C875"
    }
  ];

  const barChartOptionsMetodos = {
    chart: {
      toolbar: { show: false },
      background: 'transparent',
    },
    tooltip: {
      style: { fontSize: "12px", backgroundColor: "#2A2B31" },
      theme: "dark",
    },
    xaxis: {
      categories: metodosPagoFiltrados.map(item => item.metodo),
      labels: {
        style: { colors: "#B0B3B8", fontSize: "14px" },
      },
    },
    yaxis: {
      title: { text: "Cantidad de Facturas" },
      labels: { style: { colors: "#B0B3B8", fontSize: "14px" } },
    },
    grid: { 
      strokeDashArray: 5,
      borderColor: "#4B5563",
      xaxis: { lines: { show: true, color: "#4B5563" } },
      yaxis: { lines: { show: true, color: "#4B5563" } }
    },
    dataLabels: { enabled: false },
    plotOptions: {
      bar: { borderRadius: 10, columnWidth: "40px" },
    },
  };

  const pieChartData = facturasPorEstadoFiltradas.map(item => item.cantidad);
  const pieChartOptions = {
    labels: facturasPorEstadoFiltradas.map(item => item.estado),
    colors: ["#00C875", "#F59E0B", "#EF4444"],
    chart: { 
      width: "50px",
      background: 'transparent',
    },
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
    fill: { colors: ["#00C875", "#F59E0B", "#EF4444"] },
    tooltip: {
      enabled: true,
      theme: "dark",
      style: { fontSize: "12px", backgroundColor: "#2A2B31" },
    },
  };

  // Cargar datos financieros
  const cargarDatosFinancieros = async () => {
    try {
      setLoadingFinanciero(true);
      
      // Cargar datos en paralelo
      const [
        resumenCajaData,
        ingresosData,
        egresosData,
        facturasProveedoresData,
        alertasData
      ] = await Promise.all([
        gestionFinancieraService.getResumenCaja(),
        gestionFinancieraService.getIngresos(),
        gestionFinancieraService.getEgresos(),
        gestionFinancieraService.getFacturasProveedores(),
        gestionFinancieraService.getAlertasFinancieras()
      ]);

      setResumenCaja(resumenCajaData);
      setIngresos(Array.isArray(ingresosData) ? ingresosData : ingresosData.data || []);
      setEgresos(Array.isArray(egresosData) ? egresosData : egresosData.data || []);
      setFacturasProveedores(Array.isArray(facturasProveedoresData) ? facturasProveedoresData : facturasProveedoresData.data || []);
      setAlertasFinancieras(Array.isArray(alertasData) ? alertasData : alertasData.data || []);
      
    } catch (error) {
      console.log('⚠️ Error al cargar datos financieros, usando datos de prueba:', error);
      // Usar datos mock si la API falla
      setResumenCaja(MOCK_RESUMEN_CAJA);
      setIngresos(MOCK_INGRESOS);
      setEgresos(MOCK_EGRESOS);
      setFacturasProveedores(MOCK_FACTURAS_PROVEEDORES);
      setAlertasFinancieras(MOCK_ALERTAS_FINANCIERAS);
    } finally {
      setLoadingFinanciero(false);
    }
  };

  // Cargar facturas desde el backend
  const cargarFacturas = async () => {
    try {
      setLoadingFacturas(true);
      const storedUser = localStorage.getItem('user');
      let token = null;
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token;
        } catch (e) {}
      }
      if (!token) throw new Error('No se encontró token de autorización');
      
      const response = await fetch(getApiUrl('/api/purchases'), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Si la API falla, usar datos mock
        console.log('⚠️ API no disponible, usando datos de prueba');
        setFacturas(MOCK_FACTURAS);
        setUsingMockData(true);
        setErrorFacturas(""); // Limpiar error para mostrar datos mock
        return;
      }
      
      const data = await response.json();
      
      // Verificar si la respuesta indica error
      if (data.success === false) {
        console.log('⚠️ API retornó error, usando datos de prueba:', data.message);
        setFacturas(MOCK_FACTURAS);
        setUsingMockData(true);
        setErrorFacturas(""); // Limpiar error para mostrar datos mock
        return;
      }
      
      console.log('Datos de facturas recibidos:', data);
      
      // Usar los datos directamente como en facturas.jsx
      const facturasData = Array.isArray(data) ? data : data.data || [];
      console.log('📊 Datos de facturas recibidos:', facturasData);
      console.log('📋 Ejemplo de estructura de factura:', facturasData[0]);
      
      setFacturas(facturasData);
    } catch (error) {
      // Si hay error, usar datos mock
      console.log('⚠️ Error al conectar con API, usando datos de prueba:', error.message);
      setFacturas(MOCK_FACTURAS);
      setUsingMockData(true);
      setErrorFacturas(""); // Limpiar error para mostrar datos mock
    } finally {
      setLoadingFacturas(false);
    }
  };

  // Función para cargar datos del dashboard financiero
  const cargarDashboardFinanciero = async () => {
    try {
      setLoadingDashboardFinanciero(true);
      
      // Cargar datos en paralelo
      const [
        resumenData,
        facturasProximasData,
        proyectosActivosData
      ] = await Promise.all([
        financialDashboardService.getResumenFinanciero(),
        financialDashboardService.getFacturasProximasVencer(diasFiltro),
        financialDashboardService.getProyectosActivos()
      ]);

      // Formatear datos
      if (resumenData.success) {
        const formattedResumen = financialDashboardService.formatResumenFinancieroForFrontend(resumenData);
        setResumenFinanciero(formattedResumen);
      }

      if (facturasProximasData.success) {
        const formattedFacturas = financialDashboardService.formatFacturasProximasVencerForFrontend(facturasProximasData);
        setFacturasProximasVencer(formattedFacturas);
      }

      if (proyectosActivosData.success) {
        const formattedProyectos = financialDashboardService.formatProyectosActivosForFrontend(proyectosActivosData);
        console.log('🏗️ Datos proyectos activos cargados:', formattedProyectos);
        setProyectosActivos(formattedProyectos);
      }
      
    } catch (error) {
      console.log('⚠️ Error al cargar dashboard financiero:', error);
      // Los datos se mantienen como null para mostrar fallback
    } finally {
      setLoadingDashboardFinanciero(false);
    }
  };

  // Función para cargar facturas próximas a vencer con filtro de días
  const cargarFacturasProximasVencer = async (days = 30) => {
    try {
      const data = await financialDashboardService.getFacturasProximasVencer(days);
      if (data.success) {
        const formattedData = financialDashboardService.formatFacturasProximasVencerForFrontend(data);
        setFacturasProximasVencer(formattedData);
      }
    } catch (error) {
      console.error('Error al cargar facturas próximas a vencer:', error);
    }
  };

  // Función para cargar datos de las gráficas
  const cargarDatosGraficas = async () => {
    try {
      setLoadingGraficas(true);
      
      // Cargar datos en paralelo
      const [
        facturasPorMesData,
        topProveedoresData,
        estadosFacturasData,
        metodosPagoData
      ] = await Promise.all([
        financialDashboardService.getFacturasPorMes(selectedYear, selectedMonth),
        financialDashboardService.getTopProveedores(5),
        financialDashboardService.getEstadosFacturas(),
        financialDashboardService.getMetodosPago()
      ]);

      // Formatear datos
      if (facturasPorMesData.success) {
        const formattedData = financialDashboardService.formatFacturasPorMesForFrontend(facturasPorMesData);
        console.log('📊 Datos facturas por mes cargados:', formattedData);
        setFacturasPorMes(formattedData);
      }

      if (topProveedoresData.success) {
        const formattedData = financialDashboardService.formatTopProveedoresForFrontend(topProveedoresData);
        console.log('🏆 Datos top proveedores cargados:', formattedData);
        setTopProveedores(formattedData);
      }

      if (estadosFacturasData.success) {
        const formattedData = financialDashboardService.formatEstadosFacturasForFrontend(estadosFacturasData);
        console.log('📈 Datos estados facturas cargados:', formattedData);
        setEstadosFacturas(formattedData);
      }

      if (metodosPagoData.success) {
        const formattedData = financialDashboardService.formatMetodosPagoForFrontend(metodosPagoData);
        console.log('💳 Datos métodos de pago cargados:', formattedData);
        setMetodosPago(formattedData);
      }
      
    } catch (error) {
      console.log('⚠️ Error al cargar datos de gráficas:', error);
      // Los datos se mantienen como arrays vacíos para mostrar fallback
    } finally {
      setLoadingGraficas(false);
    }
  };

  // Cargar proyectos al montar el componente
  React.useEffect(() => {
    cargarProyectosActivos();
    cargarDatosFinancieros();
    cargarFacturas();
    cargarDashboardFinanciero();
    cargarDatosGraficas();
  }, []);

  // Recargar gráficas cuando cambie el filtro de fecha
  React.useEffect(() => {
    cargarDatosGraficas();
  }, [selectedYear, selectedMonth]);

  if (loadingFacturas && loadingFinanciero) return <div className="p-8 text-center text-text-primary">Cargando dashboard...</div>;
  
  if (errorFacturas && !usingMockData) return <div className="p-8 text-center text-red-400">Error al cargar facturas: {errorFacturas}</div>;

  return (
    <div className="bg-primary min-h-screen p-6">
      {/* Mensaje de datos de prueba */}
      {usingMockData && (
        <div className="mb-6 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-yellow-400 text-lg">⚠️</div>
            <div>
              <div className="text-yellow-400 font-medium">Usando datos de prueba</div>
              <div className="text-yellow-300 text-sm">
                La API no está disponible. Se muestran datos de ejemplo para demostrar las funcionalidades del dashboard.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de datos del backend */}
      {!usingMockData && (facturasPorMes.length > 0 || topProveedores.length > 0 || estadosFacturas.length > 0 || metodosPago.length > 0) && (
        <div className="mb-6 bg-green-900/20 border border-green-700/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-green-400 text-lg">✅</div>
            <div>
              <div className="text-green-400 font-medium">Datos del backend cargados</div>
              <div className="text-green-300 text-sm">
                Las gráficas están mostrando datos reales del sistema. Gráficas: {[
                  facturasPorMes.length > 0 && 'Facturas por Mes',
                  topProveedores.length > 0 && 'Top Proveedores', 
                  estadosFacturas.length > 0 && 'Estados',
                  metodosPago.length > 0 && 'Métodos de Pago'
                ].filter(Boolean).join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Card widget */}
      {loadingFacturas ? (
        <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-primary-card border border-gray-700/50 rounded-xl p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 bg-gray-600 rounded-lg"></div>
                <div className="h-4 w-20 bg-gray-600 rounded"></div>
              </div>
              <div className="mt-4">
                <div className="h-6 w-24 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 w-16 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-3">
        <Widget
          icon={<MdAttachMoney className="h-6 w-6" />}
          title={"Total Gastado"}
          subtitle={formatCurrencyAbbreviated(resumenFinanciero?.overview?.total_amount || resumenFiltrado.monto_total)}
        />
        <Widget
          icon={<MdPending className="h-6 w-6" />}
          title={"Gastos Pendientes"}
          subtitle={formatCurrencyAbbreviated(resumenFinanciero?.overview?.total_balance || 0)}
        />
        <Widget
          icon={<MdWarning className="h-6 w-6" />}
          title={"Facturas Críticas"}
          subtitle={formatNumber(facturasProximasVencer?.summary?.total_critical || 0)}
        />
        </div>
      )}


      {/* Charts */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Gráfica de líneas - Facturas por mes */}
        <Card extra="!p-4 text-center">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Gastos por Mes</h3>
            <div className="flex items-center gap-2">
              {loadingGraficas && (
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  <span>Cargando...</span>
                </div>
              )}
              <button
                className="flex items-center gap-2 rounded-lg bg-gray-700/50 p-2 text-text-secondary hover:bg-gray-600/50 transition duration-200 text-sm"
                onClick={() => setCalendarOpen(true)}
                type="button"
              >
                <MdOutlineCalendarToday className="h-4 w-4" />
                <span>Filtrar</span>
              </button>
            </div>
          </div>
          {calendarOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="bg-primary-card rounded-xl shadow-2xl p-4 relative border border-gray-700/50">
                <button onClick={() => setCalendarOpen(false)} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary text-xl">&times;</button>
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
                  className="dark-theme"
                />
                <div className="text-xs text-text-secondary mt-2">Selecciona un mes y año</div>
              </div>
            </div>
          )}

          <div className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
            <div className="flex flex-col">
              <p className="mt-2 text-2xl font-bold text-text-primary">
                {formatNumber(resumenFiltrado.facturas_mes_actual)}
              </p>
              <div className="flex flex-col items-start">
                <p className="mt-1 text-sm text-text-secondary">Gastos este mes</p>
                <div className="flex flex-row items-center justify-center">
                  <MdTrendingUp className="font-medium text-accent-primary" />
                  <p className="text-sm font-bold text-accent-primary"> +{resumenFiltrado.crecimiento_mensual}% </p>
                </div>
              </div>
            </div>
            <div className="h-full w-full">
              <LineChart options={lineChartOptions} series={lineChartData} />
            </div>
          </div>
        </Card>

        {/* Gráfica de barras - Top proveedores */}
        <Card extra="flex flex-col w-full rounded-xl py-4 px-4 text-center">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">
              Top Proveedores
            </h3>
          </div>

          <div className="md:mt-8 lg:mt-0">
            <div className="h-[200px] w-full xl:h-[250px]">
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
        <Card extra="rounded-xl p-4">
          <div className="flex flex-row justify-between mb-4">
            <h4 className="text-lg font-semibold text-text-primary">
              Estados de Facturas
            </h4>
          </div>

          <div className="mb-auto flex h-[180px] w-full items-center justify-center">
            {pieChartData.some(val => Number(val) > 0) ? (
              <PieChart
                key={facturasPorEstadoFiltradas.map(e => e.estado + '-' + e.cantidad).join('-')}
                options={pieChartOptions}
                series={pieChartData}
              />
            ) : (
              <span className="text-text-secondary text-sm">No hay datos para mostrar</span>
            )}
          </div>
          
          <div className="flex flex-row !justify-between rounded-lg px-4 py-3 bg-gray-800/30">
            {facturasPorEstadoFiltradas.map((item, index) => (
              <div key={index} className="flex flex-col items-center justify-center">
                <div className="flex items-center justify-center">
                  <div 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: pieChartOptions.colors[index] }}
                  />
                  <p className="ml-1 text-xs font-normal text-text-secondary">{item.estado}</p>
                </div>
                <p className="mt-1 text-lg font-bold text-text-primary">
                  {item.porcentaje}%
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Gráfica de barras - Métodos de pago */}
        <Card extra="p-4">
          <div className="flex flex-row justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                Métodos de Pago
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {formatNumber(resumenFiltrado.total_facturas)}{" "}
                <span className="text-sm font-medium text-text-secondary">
                  Facturas
                </span>
              </p>
            </div>
            <div className="flex items-start">
              <div className="flex items-center text-sm text-accent-primary">
                <MdTrendingUp className="h-4 w-4" />
                <p className="font-bold"> +{resumenFiltrado.crecimiento_anual}% </p>
              </div>
            </div>
          </div>

          <div className="h-[200px] w-full">
            <BarChart
              key={metodosPagoFiltrados.map(m => m.metodo + '-' + m.cantidad).join('-')}
              chartData={barChartDataMetodos}
              chartOptions={barChartOptionsMetodos}
            />
          </div>
        </Card>
      </div>

      {/* Facturas Próximas a Vencer */}
      {!loadingDashboardFinanciero && facturasProximasVencer && (
        <div className="mt-5">
          <Card extra={"w-full h-full px-6 pb-6"}>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-2">
                <MdWarning className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-text-primary">
                  Facturas Próximas a Vencer
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowFacturasProximasVencer(true);
                  cargarFacturasProximasVencer(diasFiltro);
                }}
                className="flex items-center gap-2 rounded-lg bg-orange-600/20 border border-orange-500/30 px-3 py-1.5 text-orange-400 hover:bg-orange-600/30 transition-all duration-200 text-sm font-medium"
              >
                <MdWarning className="h-4 w-4" />
                Ver Todas
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-3">
                <div className="text-red-400 text-lg font-bold">
                  {facturasProximasVencer.overdue.count}
                </div>
                <div className="text-text-secondary text-sm">Vencidas</div>
                <div className="text-red-400 text-xs">
                  {formatCurrencyAbbreviated(facturasProximasVencer.overdue.total_amount)}
                </div>
              </div>
              <div className="bg-orange-900/10 border border-orange-500/20 rounded-lg p-3">
                <div className="text-orange-400 text-lg font-bold">
                  {facturasProximasVencer.upcoming_due.count}
                </div>
                <div className="text-text-secondary text-sm">Próximas</div>
                <div className="text-orange-400 text-xs">
                  {formatCurrencyAbbreviated(facturasProximasVencer.upcoming_due.total_amount)}
                </div>
              </div>
              <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-3">
                <div className="text-yellow-400 text-lg font-bold">
                  {facturasProximasVencer.summary.total_critical}
                </div>
                <div className="text-text-secondary text-sm">Críticas</div>
                <div className="text-yellow-400 text-xs">
                  {formatCurrencyAbbreviated(facturasProximasVencer.summary.total_overdue_amount)}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Alertas Financieras */}
      {!loadingFinanciero && alertasFinancieras.length > 0 && (
        <div className="mt-5">
          <Card extra={"w-full h-full px-6 pb-6"}>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-2">
                <MdNotifications className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-text-primary">
                  Alertas
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {alertasFinancieras.slice(0, 6).map((alerta, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-l-3 ${
                    alerta.prioridad === 'alta' 
                      ? 'bg-red-900/10 border-red-500/30 text-red-400'
                      : alerta.prioridad === 'media'
                      ? 'bg-yellow-900/10 border-yellow-500/30 text-yellow-400'
                      : 'bg-blue-900/10 border-blue-500/30 text-blue-400'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <MdWarning className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{alerta.titulo}</h3>
                      <p className="text-xs mt-1 opacity-80">{alerta.mensaje}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tabla de Facturas por Proyectos */}
      <div className="mt-5">
        <Card extra={"w-full h-full px-6 pb-6 sm:overflow-x-auto"}>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-2">
              <MdFolder className="h-5 w-5 text-accent-primary" />
              <h2 className="text-lg font-semibold text-text-primary">
                Gastos por Proyectos
              </h2>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            {proyectosActivosFiltrados.length === 0 ? (
              <div className="text-center py-6">
                <MdFolder className="h-8 w-8 text-text-secondary mx-auto mb-2" />
                <p className="text-text-secondary text-sm">No hay proyectos con gastos</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-text-disabled/20 bg-primary">
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">Proyecto</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">Total Gastado</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-text-primary">Facturas</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectosActivosFiltrados.map((proyecto) => (
                    <tr key={proyecto.id} className="border-b border-text-disabled/10 hover:bg-accent-primary/5 transition-colors">
                      <td className="px-4 py-3 text-sm text-text-primary font-medium">{proyecto.nombre}</td>
                      <td className="px-4 py-3 text-sm text-text-primary font-medium">{formatCurrency(proyecto.total_gastado)}</td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{proyecto.cantidad_facturas}</td>
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

      {/* Modal de Facturas Próximas a Vencer */}
      {showFacturasProximasVencer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary-card border border-gray-700/50 rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <MdWarning className="w-6 h-6 text-orange-500" />
                Facturas Próximas a Vencer
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={diasFiltro}
                  onChange={(e) => {
                    setDiasFiltro(parseInt(e.target.value));
                    cargarFacturasProximasVencer(parseInt(e.target.value));
                  }}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-text-primary text-sm"
                >
                  <option value={15}>15 días</option>
                  <option value={30}>30 días</option>
                  <option value={60}>60 días</option>
                  <option value={90}>90 días</option>
                </select>
                <button
                  onClick={() => setShowFacturasProximasVencer(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {facturasProximasVencer ? (
              <div className="space-y-6">
                {/* Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                    <div className="text-red-400 text-xl font-bold">
                      {facturasProximasVencer.summary.total_critical || 0}
                    </div>
                    <div className="text-text-secondary text-sm">Facturas Críticas</div>
                  </div>
                  <div className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                    <div className="text-orange-400 text-xl font-bold">
                      {formatCurrencyAbbreviated(facturasProximasVencer.summary.total_upcoming_amount || 0)}
                    </div>
                    <div className="text-text-secondary text-sm">Monto Próximo a Vencer</div>
                  </div>
                  <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                    <div className="text-red-400 text-xl font-bold">
                      {formatCurrencyAbbreviated(facturasProximasVencer.summary.total_overdue_amount || 0)}
                    </div>
                    <div className="text-text-secondary text-sm">Monto Vencido</div>
                  </div>
                </div>

                {/* Facturas Vencidas */}
                {facturasProximasVencer.overdue.count > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <MdWarning className="w-5 h-5" />
                      Facturas Vencidas ({facturasProximasVencer.overdue.count})
                    </h3>
                    <div className="space-y-2">
                      {facturasProximasVencer.overdue.invoices.map((factura) => (
                        <div key={factura.id} className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${financialDashboardService.getUrgencyColor(factura.urgency_level)}`}>
                                {financialDashboardService.getUrgencyText(factura.urgency_level)}
                              </span>
                              <div>
                                <div className="font-medium text-text-primary">{factura.invoice_number}</div>
                                <div className="text-sm text-text-secondary">{factura.supplier}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-text-primary">{formatCurrencyAbbreviated(factura.total_amount)}</div>
                              <div className="text-sm text-red-400">
                                Vencida hace {factura.days_overdue} días
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facturas Próximas a Vencer */}
                {facturasProximasVencer.upcoming_due.count > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
                      <MdWarning className="w-5 h-5" />
                      Próximas a Vencer ({facturasProximasVencer.upcoming_due.count})
                    </h3>
                    <div className="space-y-2">
                      {facturasProximasVencer.upcoming_due.invoices.map((factura) => (
                        <div key={factura.id} className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${financialDashboardService.getUrgencyColor(factura.urgency_level)}`}>
                                {financialDashboardService.getUrgencyText(factura.urgency_level)}
                              </span>
                              <div>
                                <div className="font-medium text-text-primary">{factura.invoice_number}</div>
                                <div className="text-sm text-text-secondary">{factura.supplier}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-text-primary">{formatCurrencyAbbreviated(factura.total_amount)}</div>
                              <div className="text-sm text-orange-400">
                                Vence en {factura.days_until_due} días
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {facturasProximasVencer.overdue.count === 0 && facturasProximasVencer.upcoming_due.count === 0 && (
                  <div className="text-center py-8">
                    <div className="text-green-400 text-4xl mb-2">✅</div>
                    <div className="text-text-primary font-medium">¡Excelente!</div>
                    <div className="text-text-secondary text-sm">No hay facturas próximas a vencer en los próximos {diasFiltro} días</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                <div className="text-text-secondary">Cargando facturas próximas a vencer...</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
