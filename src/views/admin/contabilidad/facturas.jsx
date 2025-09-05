import React, { useEffect, useState, useMemo } from "react";
import Card from "components/card";
import { MdOutlineCalendarToday, MdAdd, MdEdit, MdDelete, MdVisibility, MdUpload, MdCloudUpload, MdFilterList, MdSearch, MdClear, MdBarChart, MdWarning, MdSchedule, MdError } from "react-icons/md";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getApiUrl, API_CONFIG } from "config/api";
import { useAuth } from "context/AuthContext";
import Modal from "components/modal";
import Loading from "components/loading";
import { catalogosService } from "services/catalogosService";
import { facturasService } from "services/facturasService";

// Datos de prueba para cuando la API no esté funcionando
const MOCK_FACTURAS = [
  {
    id: 1,
    number: "FAC-2024-001",
    date: "2024-01-15",
    amount: 2500000,
    status: "pendiente",
    payment_method: "Transferencia",
    description: "Compra de paneles solares para proyecto residencial",
    supplier: "SolarTech Colombia",
    project: "Instalación Residencial Medellín",
    cost_center: {
      code: "CC-001",
      name: "Centro de Costos Principal",
      description: "Centro de costos para proyectos principales",
      status: "activo"
    },
    user: {
      name: "Jhan Martinez",
      email: "jhanky@energy4cero.com",
      phone: "+573015843357"
    },
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    number: "FAC-2024-002",
    date: "2024-01-20",
    amount: 1800000,
    status: "aprobada",
    payment_method: "Efectivo",
    description: "Inversores para proyecto comercial",
    supplier: "InverterPro",
    project: "Centro Comercial Bogotá",
    cost_center: {
      code: "CC-002",
      name: "Centro de Costos Comercial",
      description: "Centro de costos para proyectos comerciales",
      status: "activo"
    },
    user: {
      name: "María González",
      email: "maria@energy4cero.com",
      phone: "+573001234567"
    },
    created_at: "2024-01-20T14:15:00Z",
    updated_at: "2024-01-22T09:45:00Z"
  },
  {
    id: 3,
    number: "FAC-2024-003",
    date: "2024-02-05",
    amount: 3200000,
    status: "pagada",
    payment_method: "Cheque",
    description: "Baterías de respaldo para proyecto industrial",
    supplier: "BatteryMax",
    project: "Planta Industrial Cali",
    cost_center: {
      code: "CC-003",
      name: "Centro de Costos Industrial",
      description: "Centro de costos para proyectos industriales",
      status: "activo"
    },
    user: {
      name: "Carlos Rodríguez",
      email: "carlos@energy4cero.com",
      phone: "+573009876543"
    },
    created_at: "2024-02-05T08:20:00Z",
    updated_at: "2024-02-10T16:30:00Z"
  },
  {
    id: 4,
    number: "FAC-2024-004",
    date: "2024-02-12",
    amount: 950000,
    status: "rechazada",
    payment_method: "Transferencia",
    description: "Cables y conectores para instalación",
    supplier: "CablePro",
    project: "Instalación Residencial Medellín",
    cost_center: {
      code: "CC-001",
      name: "Centro de Costos Principal",
      description: "Centro de costos para proyectos principales",
      status: "activo"
    },
    user: {
      name: "Ana López",
      email: "ana@energy4cero.com",
      phone: "+573005555555"
    },
    created_at: "2024-02-12T11:45:00Z",
    updated_at: "2024-02-13T10:20:00Z"
  },
  {
    id: 5,
    number: "FAC-2024-005",
    date: "2024-02-18",
    amount: 4100000,
    status: "pendiente",
    payment_method: "Transferencia",
    description: "Sistema de monitoreo y control",
    supplier: "MonitorTech",
    project: "Centro Comercial Bogotá",
    cost_center: {
      code: "CC-002",
      name: "Centro de Costos Comercial",
      description: "Centro de costos para proyectos comerciales",
      status: "activo"
    },
    user: {
      name: "Luis Pérez",
      email: "luis@energy4cero.com",
      phone: "+573004444444"
    },
    created_at: "2024-02-18T15:30:00Z",
    updated_at: "2024-02-18T15:30:00Z"
  },
  {
    id: 6,
    number: "FAC-2024-006",
    date: "2024-03-01",
    amount: 2800000,
    status: "aprobada",
    payment_method: "Efectivo",
    description: "Herramientas y equipos de instalación",
    supplier: "ToolMaster",
    project: "Planta Industrial Cali",
    cost_center: {
      code: "CC-003",
      name: "Centro de Costos Industrial",
      description: "Centro de costos para proyectos industriales",
      status: "activo"
    },
    user: {
      name: "Patricia Silva",
      email: "patricia@energy4cero.com",
      phone: "+573003333333"
    },
    created_at: "2024-03-01T09:15:00Z",
    updated_at: "2024-03-03T12:45:00Z"
  },
  {
    id: 7,
    number: "FAC-2024-007",
    date: "2024-03-08",
    amount: 1650000,
    status: "pendiente",
    payment_method: "Transferencia",
    description: "Materiales de soporte y estructura",
    supplier: "StructurePro",
    project: "Instalación Residencial Medellín",
    cost_center: {
      code: "CC-001",
      name: "Centro de Costos Principal",
      description: "Centro de costos para proyectos principales",
      status: "activo"
    },
    user: {
      name: "Roberto Díaz",
      email: "roberto@energy4cero.com",
      phone: "+573002222222"
    },
    created_at: "2024-03-08T13:20:00Z",
    updated_at: "2024-03-08T13:20:00Z"
  },
  {
    id: 8,
    number: "FAC-2024-008",
    date: "2024-03-15",
    amount: 5200000,
    status: "pagada",
    payment_method: "Cheque",
    description: "Sistema completo de energía solar",
    supplier: "SolarSystem",
    project: "Centro Comercial Bogotá",
    cost_center: {
      code: "CC-002",
      name: "Centro de Costos Comercial",
      description: "Centro de costos para proyectos comerciales",
      status: "activo"
    },
    user: {
      name: "Sofia Mendoza",
      email: "sofia@energy4cero.com",
      phone: "+573001111111"
    },
    created_at: "2024-03-15T10:45:00Z",
    updated_at: "2024-03-20T14:30:00Z"
  }
];

// Datos de prueba para proyectos
const MOCK_PROYECTOS = [
  {
    id: 1,
    code: "PROJ-001",
    name: "Instalación Residencial Medellín",
    status: "en_progreso",
    start_date: "2024-01-01",
    end_date: "2024-06-30"
  },
  {
    id: 2,
    code: "PROJ-002", 
    name: "Centro Comercial Bogotá",
    status: "en_progreso",
    start_date: "2024-01-15",
    end_date: "2024-08-31"
  },
  {
    id: 3,
    code: "PROJ-003",
    name: "Planta Industrial Cali",
    status: "completado",
    start_date: "2024-02-01",
    end_date: "2024-05-31"
  }
];

// Datos de prueba para centros de costo
const MOCK_CENTROS_COSTO = [
  {
    id: 1,
    code: "CC-001",
    name: "Centro de Costos Principal",
    description: "Centro de costos para proyectos principales",
    status: "activo"
  },
  {
    id: 2,
    code: "CC-002",
    name: "Centro de Costos Comercial", 
    description: "Centro de costos para proyectos comerciales",
    status: "activo"
  },
  {
    id: 3,
    code: "CC-003",
    name: "Centro de Costos Industrial",
    description: "Centro de costos para proyectos industriales", 
    status: "activo"
  }
];

// Estilos CSS personalizados para el calendario en tema oscuro
const calendarStyles = `
  .dark-theme.react-calendar {
    background-color: #2A2B31 !important;
    border: 1px solid #4B5563 !important;
    border-radius: 0.5rem !important;
    color: #E6E6E6 !important;
    font-family: inherit !important;
  }

  .dark-theme.react-calendar__navigation {
    background-color: #2A2B31 !important;
    color: #E6E6E6 !important;
    border-bottom: 1px solid #4B5563 !important;
  }

  .dark-theme.react-calendar__navigation button {
    background-color: transparent !important;
    color: #E6E6E6 !important;
    border: none !important;
    padding: 0.75rem !important;
    font-size: 1rem !important;
    font-weight: 600 !important;
    transition: all 0.2s ease !important;
  }

  .dark-theme.react-calendar__navigation button:hover {
    background-color: #4B5563 !important;
    border-radius: 0.25rem !important;
    color: #FFFFFF !important;
  }

  .dark-theme.react-calendar__navigation button:disabled {
    background-color: transparent !important;
    color: #8A8D94 !important;
  }

  .dark-theme.react-calendar__navigation button:focus {
    outline: none !important;
    background-color: #4B5563 !important;
    border-radius: 0.25rem !important;
  }

  .dark-theme.react-calendar__month-view__weekdays {
    background-color: #2A2B31 !important;
    color: #B0B3B8 !important;
    font-weight: 600 !important;
    text-transform: uppercase !important;
    font-size: 0.75rem !important;
    border-bottom: 1px solid #4B5563 !important;
  }

  .dark-theme.react-calendar__month-view__weekdays__weekday {
    padding: 0.75rem 0.5rem !important;
    text-align: center !important;
    border-right: 1px solid #4B5563 !important;
  }

  .dark-theme.react-calendar__month-view__weekdays__weekday:last-child {
    border-right: none !important;
  }

  .dark-theme.react-calendar__month-view__days {
    background-color: #2A2B31 !important;
  }

  .dark-theme.react-calendar__month-view__days__day {
    background-color: transparent !important;
    color: #E6E6E6 !important;
    border: none !important;
    padding: 0.75rem !important;
    font-size: 0.875rem !important;
    transition: all 0.2s ease !important;
    border-right: 1px solid #4B5563 !important;
    border-bottom: 1px solid #4B5563 !important;
  }

  .dark-theme.react-calendar__month-view__days__day:nth-child(7n) {
    border-right: none !important;
  }

  .dark-theme.react-calendar__month-view__days__day:hover {
    background-color: #4B5563 !important;
    color: #FFFFFF !important;
  }

  .dark-theme.react-calendar__month-view__days__day--neighboringMonth {
    color: #8A8D94 !important;
  }

  .dark-theme.react-calendar__month-view__days__day--selected {
    background-color: #00C875 !important;
    color: white !important;
    font-weight: 600 !important;
  }

  .dark-theme.react-calendar__month-view__days__day--active {
    background-color: #009E5D !important;
    color: white !important;
    font-weight: 600 !important;
  }

  .dark-theme.react-calendar__year-view__months__month,
  .dark-theme.react-calendar__decade-view__years__year,
  .dark-theme.react-calendar__century-view__decades__decade {
    background-color: transparent !important;
    color: #E6E6E6 !important;
    border: 1px solid #4B5563 !important;
    padding: 1rem !important;
    font-size: 0.875rem !important;
    transition: all 0.2s ease !important;
    text-align: center !important;
    margin: 0.25rem !important;
    border-radius: 0.25rem !important;
  }

  .dark-theme.react-calendar__year-view__months__month:hover,
  .dark-theme.react-calendar__decade-view__years__year:hover,
  .dark-theme.react-calendar__century-view__decades__decade:hover {
    background-color: #4B5563 !important;
    color: #FFFFFF !important;
    border-color: #6B7280 !important;
  }

  .dark-theme.react-calendar__year-view__months__month--selected,
  .dark-theme.react-calendar__decade-view__years__year--selected,
  .dark-theme.react-calendar__century-view__decades__decade--selected {
    background-color: #00C875 !important;
    color: white !important;
    border-color: #00C875 !important;
    font-weight: 600 !important;
  }

  .dark-theme.react-calendar__tile {
    background-color: transparent !important;
    color: #E6E6E6 !important;
    border: none !important;
    padding: 0.75rem !important;
    font-size: 0.875rem !important;
    transition: all 0.2s ease !important;
  }

  .dark-theme.react-calendar__tile:hover {
    background-color: #4B5563 !important;
    color: #FFFFFF !important;
  }

  .dark-theme.react-calendar__tile--active {
    background-color: #00C875 !important;
    color: white !important;
    font-weight: 600 !important;
  }

  .dark-theme.react-calendar__tile--now {
    background-color: #3B82F6 !important;
    color: white !important;
    font-weight: 600 !important;
  }

  /* Corregir el problema del mes que se pone blanco al pasar el cursor */
  .dark-theme.react-calendar__year-view__months__month:focus,
  .dark-theme.react-calendar__decade-view__years__year:focus,
  .dark-theme.react-calendar__century-view__decades__decade:focus {
    background-color: #4B5563 !important;
    color: #E6E6E6 !important;
    outline: none !important;
    border-color: #6B7280 !important;
  }

  .dark-theme.react-calendar__year-view__months__month:active,
  .dark-theme.react-calendar__decade-view__years__year:active,
  .dark-theme.react-calendar__century-view__decades__decade:active {
    background-color: #00C875 !important;
    color: white !important;
    border-color: #00C875 !important;
  }

  /* Centrar la vista de meses */
  .dark-theme.react-calendar__year-view {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    align-items: center !important;
    padding: 1rem !important;
  }

  .dark-theme.react-calendar__year-view__months {
    display: grid !important;
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 0.5rem !important;
    width: 100% !important;
    max-width: 300px !important;
  }

  .dark-theme.react-calendar__year-view__months__month {
    width: 100% !important;
    height: auto !important;
    min-height: 60px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  /* Mejorar el modal del calendario */
  .calendar-modal {
    background-color: #2A2B31 !important;
    border: 1px solid #4B5563 !important;
    border-radius: 1rem !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
  }

  .calendar-modal-header {
    background-color: #2A2B31 !important;
    border-bottom: 1px solid #4B5563 !important;
    color: #E6E6E6 !important;
  }

  .calendar-modal-close {
    color: #B0B3B8 !important;
    transition: all 0.2s ease !important;
  }

  .calendar-modal-close:hover {
    color: #E6E6E6 !important;
    background-color: #4B5563 !important;
  }

  .calendar-modal-footer {
    background-color: #2A2B31 !important;
    border-top: 1px solid #4B5563 !important;
  }

  /* Asegurar que los meses no seleccionados mantengan el color correcto */
  .dark-theme.react-calendar__year-view__months__month:not(.react-calendar__year-view__months__month--selected) {
    background-color: transparent !important;
    color: #E6E6E6 !important;
    border-color: #4B5563 !important;
  }

  .dark-theme.react-calendar__year-view__months__month:not(.react-calendar__year-view__months__month--selected):hover {
    background-color: #4B5563 !important;
    color: #E6E6E6 !important;
    border-color: #6B7280 !important;
  }

  /* Sobrescribir completamente los estilos por defecto del react-calendar */
  .dark-theme.react-calendar button {
    background-color: transparent !important;
    color: #E6E6E6 !important;
    border: none !important;
  }

  .dark-theme.react-calendar button:hover {
    background-color: #4B5563 !important;
    color: #E6E6E6 !important;
  }

  .dark-theme.react-calendar button:focus {
    outline: none !important;
    background-color: #4B5563 !important;
    color: #E6E6E6 !important;
  }

  /* Estilos específicos para los meses en la vista de año */
  .dark-theme.react-calendar__year-view__months__month {
    background-color: transparent !important;
    color: #E6E6E6 !important;
    border: 1px solid #4B5563 !important;
    padding: 1rem !important;
    font-size: 0.875rem !important;
    transition: all 0.2s ease !important;
    text-align: center !important;
    margin: 0.25rem !important;
    border-radius: 0.25rem !important;
    cursor: pointer !important;
  }

  .dark-theme.react-calendar__year-view__months__month:hover {
    background-color: #4B5563 !important;
    color: #E6E6E6 !important;
    border-color: #6B7280 !important;
  }

  .dark-theme.react-calendar__year-view__months__month--selected {
    background-color: #00C875 !important;
    color: white !important;
    border-color: #00C875 !important;
    font-weight: 600 !important;
  }

  .dark-theme.react-calendar__year-view__months__month--selected:hover {
    background-color: #00C875 !important;
    color: white !important;
    border-color: #00C875 !important;
  }
`;

const Facturas = () => {
  const { user } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    invoice_number: "",
    date: "",
    total_amount: "",
    payment_method: "",
    status: "",
    description: "",
    supplier_id: "",
    cost_center_id: "",
    project_id: ""
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [usingMockData, setUsingMockData] = useState(false);

  // Estados para el modal de upload
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [centrosCosto, setCentrosCosto] = useState([]);
  const [uploadFormData, setUploadFormData] = useState({
    project_id: "",
    cost_center_id: "",
    status: "pendiente"
  });

  // Estados para filtros
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    supplier_id: "",
    cost_center_id: "",
    project_id: "",
    payment_method: "",
    date_from: "",
    date_to: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState(null);
  const [showEstadisticas, setShowEstadisticas] = useState(false);

  // Estados para facturas próximas a vencer
  const [facturasProximasVencer, setFacturasProximasVencer] = useState(null);
  const [showFacturasProximasVencer, setShowFacturasProximasVencer] = useState(false);
  const [diasFiltro, setDiasFiltro] = useState(30);

  // Estados únicos para filtros
  const estadosUnicos = useMemo(() => {
    const estados = [...new Set(facturas.map(f => f.status).filter(Boolean))];
    return estados.sort();
  }, [facturas]);

  const proyectosUnicos = useMemo(() => {
    // Obtener todos los proyectos únicos de la nueva estructura
    const proyectosMap = new Map();
    
    facturas.forEach(factura => {
      if (factura.project && factura.project.name) {
        // Usar el nombre del proyecto como ID único
        const projectName = factura.project.name;
        proyectosMap.set(projectName, {
          id: projectName,
          name: projectName
        });
      }
    });
    
    const proyectosUnicos = Array.from(proyectosMap.values()).sort((a, b) => {
      const nameA = String(a.name || '');
      const nameB = String(b.name || '');
      return nameA.localeCompare(nameB);
    });
    console.log('Proyectos únicos encontrados:', proyectosUnicos);
    return proyectosUnicos;
  }, [facturas]);

  const selectRef = React.useRef(null);

  const meses = [
    { value: "", label: "Todos los meses" },
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const handleCalendarChange = (date) => {
    // El mes de JS es base 0, pero el mes que queremos guardar es base 1 (enero = 01)
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    setSelectedMonth(mes);
    setSelectedYear(date.getFullYear().toString());
    setCalendarOpen(false);
  };

  const facturasFiltradas = useMemo(() => {
    console.log('Filtrando facturas:', {
      total: facturas.length,
      selectedProject,
      selectedStatus,
      selectedMonth,
      selectedYear
    });
    
    return facturas.filter(f => {
      // Filtro por fecha
      let fechaOk = true;
      if (selectedMonth || selectedYear) {
        if (!f.date) return false;
        const fecha = new Date(f.date);
        const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
        const anio = fecha.getFullYear().toString();
        const mesOk = selectedMonth ? mes === selectedMonth : true;
        const anioOk = selectedYear ? anio === selectedYear : true;
        fechaOk = mesOk && anioOk;
      }

      // Filtro por estado
      const estadoOk = selectedStatus ? f.status === selectedStatus : true;

      // Filtro por proyecto - comparar el nombre del proyecto
      const proyectoOk = selectedProject ? f.project?.name === selectedProject : true;

      if (selectedProject) {
        console.log('Verificando proyecto:', {
          facturaId: f.id,
          projectName: f.project?.name,
          selectedProject,
          proyectoOk
        });
      }

      return fechaOk && estadoOk && proyectoOk;
    });
  }, [facturas, selectedMonth, selectedYear, selectedStatus, selectedProject]);

  // Función para cargar facturas
  const fetchFacturas = async (filterParams = {}) => {
    setLoading(true);
    setError("");
    try {
      console.log('🔍 DEBUG: Cargando facturas con filtros:', filterParams);
      
      const data = await facturasService.getFacturas(filterParams);
      
      if (data.success && data.data) {
        // Procesar facturas con formateo
        let facturasFormateadas = [];
        if (Array.isArray(data.data.data)) {
          // Estructura paginada
          facturasFormateadas = data.data.data.map(factura => 
            facturasService.formatFacturaForFrontend(factura)
          );
        } else if (Array.isArray(data.data)) {
          // Estructura directa
          facturasFormateadas = data.data.map(factura => 
            facturasService.formatFacturaForFrontend(factura)
          );
        }
        setFacturas(facturasFormateadas);
        setUsingMockData(false);
      } else if (Array.isArray(data)) {
        const facturasFormateadas = data.map(factura => 
          facturasService.formatFacturaForFrontend(factura)
        );
        setFacturas(facturasFormateadas);
        setUsingMockData(false);
      } else {
        throw new Error('Formato de respuesta inesperado');
      }
    } catch (err) {
      // Si hay error, usar datos mock
      console.log('⚠️ Error al conectar con API, usando datos de prueba:', err.message);
      setFacturas(MOCK_FACTURAS);
      setUsingMockData(true);
      setError(""); // Limpiar error para mostrar datos mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  // Cargar catálogos cuando se abre el modal de upload
  useEffect(() => {
    if (isUploadModalOpen) {
      loadCatalogos();
    }
  }, [isUploadModalOpen]);

  const loadCatalogos = async () => {
    try {
      console.log('🔍 DEBUG: Cargando catálogos para facturas...');
      
      const [proyectosData, centrosCostoData] = await Promise.all([
        catalogosService.getProyectos(),
        catalogosService.getCentrosCosto({ status: 'activo', per_page: 50 })
      ]);
      
      console.log('📋 DEBUG: Datos de catálogos recibidos:', { proyectosData, centrosCostoData });
      
      // Procesar proyectos
      let proyectosFormateados = [];
      if (Array.isArray(proyectosData)) {
        proyectosFormateados = proyectosData;
      } else if (proyectosData.data) {
        proyectosFormateados = Array.isArray(proyectosData.data) ? proyectosData.data : [];
      }
      
      // Procesar centros de costo
      let centrosCostoFormateados = [];
      if (centrosCostoData.success && centrosCostoData.data) {
        if (Array.isArray(centrosCostoData.data.data)) {
          // Estructura paginada
          centrosCostoFormateados = centrosCostoData.data.data.map(centro => 
            catalogosService.formatCentroCostoForFrontend(centro)
          );
        } else if (Array.isArray(centrosCostoData.data)) {
          // Estructura directa
          centrosCostoFormateados = centrosCostoData.data.map(centro => 
            catalogosService.formatCentroCostoForFrontend(centro)
          );
        }
      } else if (Array.isArray(centrosCostoData)) {
        centrosCostoFormateados = centrosCostoData.map(centro => 
          catalogosService.formatCentroCostoForFrontend(centro)
        );
      }
      
      console.log('✅ DEBUG: Catálogos formateados:', { proyectosFormateados, centrosCostoFormateados });
      
      setProyectos(proyectosFormateados);
      setCentrosCosto(centrosCostoFormateados);
      setUploadError(""); // Limpiar error
      
    } catch (error) {
      console.log('⚠️ Error al cargar catálogos, usando datos de prueba:', error);
      // Usar datos mock si la API falla
      setProyectos(MOCK_PROYECTOS);
      setCentrosCosto(MOCK_CENTROS_COSTO);
      setUploadError(""); // Limpiar error
    }
  };

  const handleView = async (factura) => {
    try {
      setLoading(true);
      // Obtener detalles completos de la factura
      const data = await facturasService.getFacturaDetalles(factura.id);
      if (data.success && data.data) {
        const formattedData = facturasService.formatFacturaDetallesForFrontend(data);
        setSelectedFactura(formattedData);
        setShowModal(true);
      } else {
        // Fallback a datos básicos si no se pueden obtener los detalles
        setSelectedFactura(factura);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error al obtener detalles de factura:', error);
      // Fallback a datos básicos en caso de error
      setSelectedFactura(factura);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    const filterParams = {};
    if (filters.search) filterParams.search = filters.search;
    if (filters.status) filterParams.status = filters.status;
    if (filters.supplier_id) filterParams.supplier_id = filters.supplier_id;
    if (filters.cost_center_id) filterParams.cost_center_id = filters.cost_center_id;
    if (filters.project_id) filterParams.project_id = filters.project_id;
    if (filters.payment_method) filterParams.payment_method = filters.payment_method;
    if (filters.date_from) filterParams.date_from = filters.date_from;
    if (filters.date_to) filterParams.date_to = filters.date_to;
    
    fetchFacturas(filterParams);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      status: "",
      supplier_id: "",
      cost_center_id: "",
      project_id: "",
      payment_method: "",
      date_from: "",
      date_to: ""
    });
    fetchFacturas();
  };

  // Función para cargar estadísticas
  const loadEstadisticas = async () => {
    try {
      const data = await facturasService.getEstadisticasFacturas();
      if (data.success && data.data) {
        setEstadisticas(data.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  // Función para cargar facturas próximas a vencer
  const loadFacturasProximasVencer = async (days = 30) => {
    try {
      const data = await facturasService.getFacturasProximasVencer(days);
      if (data.success && data.data) {
        const formattedData = facturasService.formatFacturasProximasVencer(data);
        setFacturasProximasVencer(formattedData);
      }
    } catch (error) {
      console.error('Error al cargar facturas próximas a vencer:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  // Funciones auxiliares para niveles de urgencia
  const getUrgencyColor = (urgencyLevel) => {
    return facturasService.getUrgencyColor(urgencyLevel);
  };

  const getUrgencyText = (urgencyLevel) => {
    return facturasService.getUrgencyText(urgencyLevel);
  };

  const getUrgencyIcon = (urgencyLevel) => {
    switch (urgencyLevel) {
      case 'critical':
        return <MdError className="w-4 h-4" />;
      case 'high':
        return <MdWarning className="w-4 h-4" />;
      case 'medium':
        return <MdSchedule className="w-4 h-4" />;
      case 'low':
        return <MdOutlineCalendarToday className="w-4 h-4" />;
      default:
        return <MdOutlineCalendarToday className="w-4 h-4" />;
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFactura(null);
  };



  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleCreate = () => {
    setFormData({
      invoice_number: "",
      date: "",
      total_amount: "",
      payment_method: "",
      status: "",
      description: "",
      supplier_id: "",
      cost_center_id: "",
      project_id: ""
    });
    setFormError("");
    setIsCreateModalOpen(true);
  };

  const handleEdit = (factura) => {
    setSelectedFactura(factura);
    setFormData({
              invoice_number: factura.number || "",
      date: factura.date ? factura.date.split('T')[0] : "",
              total_amount: factura.amount || "",
      payment_method: factura.payment_method || "",
      status: factura.status || "",
      description: factura.description || "",
      supplier_id: factura.supplier_id || "",
      cost_center_id: factura.cost_center_id || "",
      project_id: factura.project_id || ""
    });
    setFormError("");
    setIsEditModalOpen(true);
  };

  const handleDelete = (factura) => {
    setSelectedFactura(factura);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      if (!formData.invoice_number || !formData.date || !formData.total_amount) {
        throw new Error("Por favor complete los campos obligatorios");
      }

      const url = selectedFactura 
        ? getApiUrl(`${API_CONFIG.ENDPOINTS.PURCHASES}/${selectedFactura.id}`)
        : getApiUrl(API_CONFIG.ENDPOINTS.PURCHASES);
      
      const method = selectedFactura ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al ${selectedFactura ? 'actualizar' : 'crear'} la factura`);
      }

      const facturaData = await response.json();

      // Actualización dinámica del estado local
      if (selectedFactura) {
        setFacturas(prev => prev.map(factura => 
          factura.id === selectedFactura.id ? facturaData : factura
        ));
      } else {
        setFacturas(prev => [...prev, facturaData]);
      }

      const successMessage = selectedFactura 
        ? `Factura "${formData.invoice_number}" actualizada exitosamente`
        : `Factura "${formData.invoice_number}" creada exitosamente`;
      showNotification(successMessage, "success");

      // Cerrar modal
      if (selectedFactura) {
        setIsEditModalOpen(false);
      } else {
        setIsCreateModalOpen(false);
      }
      setSelectedFactura(null);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setFormLoading(true);
      const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.PURCHASES}/${selectedFactura.id}`), {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.token}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la factura");
      }

      // Actualización dinámica del estado local
      setFacturas(prev => prev.filter(factura => factura.id !== selectedFactura.id));

              showNotification(`Factura "${selectedFactura.number}" eliminada exitosamente`, "success");

      setIsDeleteModalOpen(false);
      setSelectedFactura(null);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Funciones para el modal de upload
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Solo se permiten archivos PDF o imágenes (JPG, PNG)');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setUploadError('El archivo es demasiado grande. Máximo 10MB');
        return;
      }
      setUploadFile(file);
      setUploadError("");
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setUploadError('Por favor selecciona un archivo');
      return;
    }

    setUploadLoading(true);
    setUploadError("");

    try {
      // Usar el servicio para procesar el archivo
      const result = await facturasService.procesarArchivoFactura(uploadFile);
      setExtractedData(result);
      
      // Llenar automáticamente el formulario con los datos extraídos
      if (result.success && result.data) {
        setFormData({
          invoice_number: result.data.number || "",
          date: result.data.date || "",
                      total_amount: result.data.amount || "",
          payment_method: result.data.payment_method || "",
          status: uploadFormData.status,
          description: result.data.description || "",
          supplier_id: result.data.supplier_id || "",
          cost_center_id: uploadFormData.cost_center_id,
          project_id: uploadFormData.project_id
        });
      }

      showNotification('Archivo procesado exitosamente', 'success');
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      setUploadError(error.message || 'Error al procesar el archivo. Por favor intenta de nuevo.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleUploadFormSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFormData.project_id || !uploadFormData.cost_center_id) {
      setUploadError('Por favor selecciona el proyecto y centro de costo');
      return;
    }

    try {
      setFormLoading(true);
      
      // Usar el servicio para crear la factura
      const facturaData = await facturasService.crearFacturaDesdeArchivo(formData);
      setFacturas(prev => [...prev, facturaData]);

      showNotification(`Factura "${formData.invoice_number}" creada exitosamente`, "success");
      setIsUploadModalOpen(false);
      
      // Limpiar estados
      setUploadFile(null);
      setExtractedData(null);
      setUploadFormData({
        project_id: "",
        cost_center_id: "",
        status: "pendiente"
      });
      setFormData({
        invoice_number: "",
        date: "",
        total_amount: "",
        payment_method: "",
        status: "",
        description: "",
        supplier_id: "",
        cost_center_id: "",
        project_id: ""
      });
    } catch (error) {
      setUploadError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUploadModalClose = () => {
    setIsUploadModalOpen(false);
    setUploadFile(null);
    setExtractedData(null);
    setUploadError("");
    setUploadFormData({
      project_id: "",
      cost_center_id: "",
      status: "pendiente"
    });
    setFormData({
      invoice_number: "",
      date: "",
      total_amount: "",
      payment_method: "",
      status: "",
      description: "",
      supplier_id: "",
      cost_center_id: "",
      project_id: ""
    });
  };

  if (loading) {
    return <Loading />;
  }
  if (error) return <div className="p-8 text-center text-red-400">Error: {error}</div>;

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      {/* Inyectar estilos CSS para el calendario */}
      <style>{calendarStyles}</style>
      
      <div className="col-span-1 h-fit w-full xl:col-span-2 2xl:col-span-3">
        <Card extra={"w-full h-full px-8 pb-8 sm:overflow-x-auto"}>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">
                Facturas
              </h1>
              {usingMockData && (
                <span className="px-3 py-1 bg-yellow-600/20 border border-yellow-500/50 text-yellow-400 rounded-lg text-sm font-medium">
                  🧪 Datos de Prueba
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFacturasProximasVencer(true);
                  loadFacturasProximasVencer(diasFiltro);
                }}
                className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-white hover:bg-orange-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                <MdWarning className="h-4 w-4" />
                Próximas a Vencer
              </button>
              <button
                onClick={() => {
                  setShowEstadisticas(true);
                  loadEstadisticas();
                }}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                <MdBarChart className="h-4 w-4" />
                Estadísticas
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2.5 text-white hover:bg-accent-hover transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                <MdCloudUpload className="h-4 w-4" />
                Subir Factura
              </button>
            </div>
          </div>

          {/* Mensaje de datos de prueba */}
          {usingMockData && (
            <div className="mb-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-yellow-400 text-lg">⚠️</div>
                <div>
                  <div className="text-yellow-400 font-medium">Usando datos de prueba</div>
                  <div className="text-yellow-300 text-sm">
                    La API no está disponible. Se muestran datos de ejemplo para demostrar las funcionalidades del sistema.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="mb-6">
            <div className="bg-primary-card border border-gray-700/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Filtros de Búsqueda</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro por Estado */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Estado
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-primary-card border border-gray-600/50 rounded-lg px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-200"
                  >
                    <option value="">Todos los estados</option>
                    {estadosUnicos.map((estado) => (
                      <option key={estado} value={estado}>
                        {estado}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Proyecto */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Proyecto
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full bg-primary-card border border-gray-600/50 rounded-lg px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-all duration-200"
                  >
                    <option value="">Todos los proyectos</option>
                    {proyectosUnicos.map((proyecto) => (
                      <option key={proyecto.id} value={proyecto.id}>
                        {proyecto.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Fecha */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Fecha
                  </label>
                  <button
                    onClick={() => setCalendarOpen(true)}
                    className="w-full flex items-center justify-between bg-primary-card border border-gray-600/50 rounded-lg px-3 py-2.5 text-text-primary hover:bg-gray-700/30 hover:border-accent-primary transition-all duration-200"
                  >
                    <span className="text-sm">
                      {selectedMonth && selectedYear 
                        ? `${selectedYear}-${selectedMonth}`
                        : "Seleccionar fecha"
                      }
                    </span>
                    <MdOutlineCalendarToday className="h-4 w-4 text-accent-primary" />
                  </button>
                </div>

                {/* Botón Limpiar Filtros */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    &nbsp;
                  </label>
                  {(selectedMonth || selectedYear || selectedStatus || selectedProject) && (
                    <button
                      onClick={() => { 
                        setSelectedMonth(""); 
                        setSelectedYear(""); 
                        setSelectedStatus("");
                        setSelectedProject("");
                      }}
                      className="w-full rounded-lg bg-red-600/20 border border-red-500/50 px-4 py-2.5 text-red-400 hover:bg-red-600/30 hover:text-red-300 transition-all duration-200 text-sm font-medium"
                    >
                      Limpiar Filtros
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-text-secondary">
              Mostrando <span className="font-medium text-text-primary">{facturasFiltradas.length}</span> de <span className="font-medium text-text-primary">{facturas.length}</span> facturas
            </div>
            {(selectedMonth || selectedYear || selectedStatus || selectedProject) && (
              <div className="text-sm text-text-secondary">
                <span className="font-medium text-text-primary">Filtros activos:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedMonth && selectedYear && (
                    <span className="px-3 py-1.5 bg-accent-primary/20 border border-accent-primary/30 text-accent-primary rounded-lg text-xs font-medium">
                      📅 Fecha: {selectedYear}-{selectedMonth}
                    </span>
                  )}
                  {selectedStatus && (
                    <span className="px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-lg text-xs font-medium">
                      📊 Estado: {selectedStatus}
                    </span>
                  )}
                  {selectedProject && (
                    <span className="px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-medium">
                      🏗️ Proyecto: {proyectosUnicos.find(p => p.id === selectedProject)?.name}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tabla de Facturas */}
          <div className="mt-6 overflow-x-auto">
            <div className="bg-primary-card border border-gray-700/50 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50 border-b border-gray-700/50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Número</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Monto Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Proveedor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Proyecto</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-primary">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {facturasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-text-secondary">
                        <div className="flex flex-col items-center">
                          <div className="text-xl font-medium mb-3 text-text-primary">No se encontraron facturas</div>
                          <div className="text-sm">
                            {selectedMonth || selectedYear || selectedStatus || selectedProject
                              ? "Intenta ajustar los filtros de búsqueda"
                              : "No hay facturas registradas"
                            }
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    facturasFiltradas.map((factura) => (
                      <tr key={factura.id} className="border-b border-gray-700/30 hover:bg-accent-primary/5 transition-all duration-200">
                        <td className="px-6 py-4 text-sm text-text-primary font-medium">{factura.number}</td>
                        <td className="px-6 py-4 text-sm text-text-primary">{factura.date ? new Date(factura.date).toLocaleDateString('es-CO') : ''}</td>
                        <td className="px-6 py-4 text-sm text-text-primary font-medium">{factura.amount ? `$${Number(factura.amount).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : ''}</td>
                        <td className="px-6 py-4 text-sm text-text-primary">{factura.status}</td>
                        <td className="px-6 py-4 text-sm text-text-primary">{factura.supplier?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-text-primary">{factura.project?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(factura)}
                              className="text-accent-primary hover:text-accent-hover transition-all duration-200 p-1 rounded-lg hover:bg-accent-primary/10"
                              title="Ver detalles"
                            >
                              <MdVisibility className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal del calendario */}
      {calendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="calendar-modal rounded-2xl shadow-2xl p-6 relative max-w-md w-full mx-4">
            <div className="calendar-modal-header flex items-center justify-between mb-4 pb-4">
              <h3 className="text-lg font-semibold text-text-primary">Seleccionar Fecha</h3>
              <button 
                onClick={() => setCalendarOpen(false)} 
                className="calendar-modal-close text-xl transition-colors duration-200 p-2 rounded-lg hover:bg-gray-700/50"
              >
                ×
              </button>
            </div>
            <div className="flex justify-center">
              <Calendar
                onChange={handleCalendarChange}
                value={selectedYear && selectedMonth ? new Date(`${selectedYear}-${selectedMonth}-01`) : new Date()}
                view="year"
                onClickMonth={handleCalendarChange}
                maxDetail="year"
                minDetail="decade"
                locale="es-ES"
                className="dark-theme w-full"
              />
            </div>
            <div className="calendar-modal-footer mt-4 pt-4">
              <div className="text-xs text-text-secondary text-center mb-4">
                Selecciona un mes y año para filtrar las facturas
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setCalendarOpen(false)}
                  className="rounded-lg bg-accent-primary px-4 py-2 text-white hover:bg-accent-hover transition-colors text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      {showModal && selectedFactura && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-primary-card rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative border border-gray-700/50">
            <button onClick={closeModal} className="absolute top-2 right-2 text-text-secondary hover:text-text-primary text-xl transition-colors duration-200">&times;</button>
            <h2 className="text-xl font-bold mb-4 text-text-primary">Detalles de la Factura</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="font-semibold text-lg mb-3 text-text-primary">Información de la Factura</div>
                <div className="space-y-2">
                  <div><span className="font-semibold text-text-primary">Número:</span> <span className="text-text-secondary">{selectedFactura.number}</span></div>
                  <div><span className="font-semibold text-text-primary">Fecha:</span> <span className="text-text-secondary">{selectedFactura.date ? new Date(selectedFactura.date).toLocaleDateString('es-CO') : ''}</span></div>
                  <div><span className="font-semibold text-text-primary">Monto Total:</span> <span className="text-text-secondary">{selectedFactura.amount ? `$${Number(selectedFactura.amount).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : ''}</span></div>
                  <div><span className="font-semibold text-text-primary">Estado:</span> <span className="text-text-secondary">{selectedFactura.status}</span></div>
                  <div><span className="font-semibold text-text-primary">Método de Pago:</span> <span className="text-text-secondary">{selectedFactura.payment_method || 'N/A'}</span></div>
                  <div><span className="font-semibold text-text-primary">Descripción:</span> <span className="text-text-secondary">{selectedFactura.description || 'N/A'}</span></div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg mb-3 text-text-primary">Centro de Costos</div>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold text-text-primary">Categoría:</span> 
                    {selectedFactura.cost_center?.category ? (
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: selectedFactura.cost_center.category.color }}
                        ></div>
                        <span className="text-text-secondary">{selectedFactura.cost_center.category.name}</span>
                      </div>
                    ) : (
                      <span className="text-text-secondary ml-2">N/A</span>
                    )}
                  </div>
                  <div><span className="font-semibold text-text-primary">Nombre:</span> <span className="text-text-secondary">{selectedFactura.cost_center?.name || 'N/A'}</span></div>
                  <div><span className="font-semibold text-text-primary">Descripción:</span> <span className="text-text-secondary">{selectedFactura.cost_center?.description || 'N/A'}</span></div>
                  <div><span className="font-semibold text-text-primary">Estado:</span> <span className="text-text-secondary">{selectedFactura.cost_center?.status || 'N/A'}</span></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="font-semibold text-lg mb-3 text-text-primary">Información del Proveedor</div>
                <div className="space-y-2">
                  <div><span className="font-semibold text-text-primary">Nombre:</span> <span className="text-text-secondary">{selectedFactura.supplier || 'N/A'}</span></div>
                  <div><span className="font-semibold text-text-primary">NIT:</span> <span className="text-text-secondary">N/A</span></div>
                  <div><span className="font-semibold text-text-primary">Dirección:</span> <span className="text-text-secondary">N/A</span></div>
                  <div><span className="font-semibold text-text-primary">Teléfono:</span> <span className="text-text-secondary">N/A</span></div>
                  <div><span className="font-semibold text-text-primary">Email:</span> <span className="text-text-secondary">N/A</span></div>
                  <div><span className="font-semibold text-text-primary">Contacto:</span> <span className="text-text-secondary">N/A</span></div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg mb-3 text-text-primary">Información del Proyecto</div>
                <div className="space-y-2">
                  <div><span className="font-semibold text-text-primary">Código:</span> <span className="text-text-secondary">N/A</span></div>
                  <div><span className="font-semibold text-text-primary">Nombre:</span> <span className="text-text-secondary">{selectedFactura.project || 'N/A'}</span></div>
                  <div><span className="font-semibold text-text-primary">Estado:</span> <span className="text-text-secondary">N/A</span></div>
                  <div><span className="font-semibold text-text-primary">Fecha de Inicio:</span> <span className="text-text-secondary">N/A</span></div>
                  <div><span className="font-semibold text-text-primary">Fecha de Fin:</span> <span className="text-text-secondary">N/A</span></div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="font-semibold text-lg mb-3 text-text-primary">Usuario Responsable</div>
                <div className="space-y-2">
                  <div><span className="font-semibold text-text-primary">Nombre:</span> <span className="text-text-secondary">{selectedFactura.user?.name || 'N/A'}</span></div>
                  <div><span className="font-semibold text-text-primary">Email:</span> <span className="text-text-secondary">{selectedFactura.user?.email || 'N/A'}</span></div>
                  <div><span className="font-semibold text-text-primary">Teléfono:</span> <span className="text-text-secondary">{selectedFactura.user?.phone || 'N/A'}</span></div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg mb-3 text-text-primary">Fechas del Sistema</div>
                <div className="space-y-2">
                  <div><span className="font-semibold text-text-primary">Creado:</span> <span className="text-text-secondary">{selectedFactura.created_at ? new Date(selectedFactura.created_at).toLocaleDateString('es-CO') : 'N/A'}</span></div>
                  <div><span className="font-semibold text-text-primary">Actualizado:</span> <span className="text-text-secondary">{selectedFactura.updated_at ? new Date(selectedFactura.updated_at).toLocaleDateString('es-CO') : 'N/A'}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upload de Factura */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-primary-card rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative border border-gray-700/50 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={handleUploadModalClose} 
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary text-xl transition-colors duration-200"
            >
              ×
            </button>
            
            <h2 className="text-xl font-bold mb-6 text-text-primary">Subir y Procesar Factura</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel izquierdo - Subida de archivo */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-lg font-semibold mb-4 text-text-primary">1. Subir Archivo</h3>
                  
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <div className="text-text-primary font-medium">
                          {uploadFile ? uploadFile.name : "Haz clic para seleccionar archivo"}
                        </div>
                        <div className="text-text-secondary text-sm mt-2">
                          PDF, JPG, PNG (máx. 10MB)
                        </div>
                      </label>
                    </div>

                    {uploadFile && (
                      <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-400">
                          <MdUpload className="h-4 w-4" />
                          <span className="text-sm font-medium">Archivo seleccionado: {uploadFile.name}</span>
                        </div>
                        <div className="text-xs text-green-300 mt-1">
                          Tamaño: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleFileUpload}
                      disabled={!uploadFile || uploadLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {uploadLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <MdUpload className="h-4 w-4" />
                          Procesar Archivo
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Configuración de la factura */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-lg font-semibold mb-4 text-text-primary">2. Configuración</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Proyecto *
                      </label>
                      <select
                        value={uploadFormData.project_id}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, project_id: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar proyecto</option>
                        {proyectos.map((proyecto) => (
                          <option key={proyecto.id} value={proyecto.id}>
                            {proyecto.code} - {proyecto.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Centro de Costo *
                      </label>
                      <select
                        value={uploadFormData.cost_center_id}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, cost_center_id: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar centro de costo</option>
                        {centrosCosto.map((centro) => (
                          <option key={centro.cost_center_id} value={centro.cost_center_id}>
                            {centro.category ? `${centro.category.name} - ` : ''}{centro.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Estado de la Factura
                      </label>
                      <select
                        value={uploadFormData.status}
                        onChange={(e) => setUploadFormData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="aprobada">Aprobada</option>
                        <option value="rechazada">Rechazada</option>
                        <option value="pagada">Pagada</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel derecho - Formulario de datos */}
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <h3 className="text-lg font-semibold mb-4 text-text-primary">3. Datos de la Factura</h3>
                  
                  {extractedData ? (
                    <div className="space-y-4">
                      <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-400">
                          <MdUpload className="h-4 w-4" />
                          <span className="text-sm font-medium">Datos extraídos automáticamente</span>
                        </div>
                      </div>

                      <form onSubmit={handleUploadFormSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Número de Factura
                            </label>
                            <input
                              type="text"
                              value={formData.invoice_number}
                              onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Número de factura"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Fecha
                            </label>
                            <input
                              type="date"
                              value={formData.date}
                              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Monto Total
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.total_amount}
                              onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">
                              Método de Pago
                            </label>
                            <input
                              type="text"
                              value={formData.payment_method}
                              onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value }))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Efectivo, Transferencia, etc."
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-text-primary mb-2">
                            Descripción
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows="3"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Descripción de la factura"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={formLoading}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          {formLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Creando factura...
                            </>
                          ) : (
                            <>
                              <MdAdd className="h-4 w-4" />
                              Crear Factura
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MdCloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <div className="text-text-secondary">
                        Sube un archivo para extraer los datos automáticamente
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mensajes de error */}
            {(uploadError || formError) && (
              <div className="mt-4 bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                <div className="text-red-400 text-sm">
                  {uploadError || formError}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Estadísticas */}
      {showEstadisticas && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-primary-card border border-gray-700/50 rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                <MdBarChart className="w-6 h-6 text-blue-500" />
                Estadísticas de Facturas
              </h2>
              <button
                onClick={() => setShowEstadisticas(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {estadisticas ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                  <div className="text-blue-400 text-2xl font-bold">
                    {estadisticas.total_invoices || 0}
                  </div>
                  <div className="text-text-secondary text-sm">Total de Facturas</div>
                </div>
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
                  <div className="text-green-400 text-2xl font-bold">
                    {formatCurrency(estadisticas.total_amount || 0)}
                  </div>
                  <div className="text-text-secondary text-sm">Monto Total</div>
                </div>
                <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                  <div className="text-yellow-400 text-2xl font-bold">
                    {estadisticas.pending_invoices || 0}
                  </div>
                  <div className="text-text-secondary text-sm">Facturas Pendientes</div>
                </div>
                <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4">
                  <div className="text-purple-400 text-2xl font-bold">
                    {estadisticas.paid_invoices || 0}
                  </div>
                  <div className="text-text-secondary text-sm">Facturas Pagadas</div>
                </div>
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                  <div className="text-red-400 text-2xl font-bold">
                    {estadisticas.cancelled_invoices || 0}
                  </div>
                  <div className="text-text-secondary text-sm">Facturas Canceladas</div>
                </div>
                <div className="bg-gray-900/20 border border-gray-700/50 rounded-lg p-4">
                  <div className="text-gray-400 text-2xl font-bold">
                    {formatCurrency(estadisticas.average_invoice || 0)}
                  </div>
                  <div className="text-text-secondary text-sm">Promedio por Factura</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <div className="text-text-secondary">Cargando estadísticas...</div>
              </div>
            )}
          </div>
        </div>
      )}

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
                    loadFacturasProximasVencer(parseInt(e.target.value));
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
                      {formatCurrency(facturasProximasVencer.summary.total_upcoming_amount || 0)}
                    </div>
                    <div className="text-text-secondary text-sm">Monto Próximo a Vencer</div>
                  </div>
                  <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                    <div className="text-red-400 text-xl font-bold">
                      {formatCurrency(facturasProximasVencer.summary.total_overdue_amount || 0)}
                    </div>
                    <div className="text-text-secondary text-sm">Monto Vencido</div>
                  </div>
                </div>

                {/* Facturas Vencidas */}
                {facturasProximasVencer.overdue.count > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <MdError className="w-5 h-5" />
                      Facturas Vencidas ({facturasProximasVencer.overdue.count})
                    </h3>
                    <div className="space-y-2">
                      {facturasProximasVencer.overdue.invoices.map((factura) => (
                        <div key={factura.id} className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(factura.urgency_level)}`}>
                                {getUrgencyIcon(factura.urgency_level)}
                                <span className="ml-1">{getUrgencyText(factura.urgency_level)}</span>
                              </span>
                              <div>
                                <div className="font-medium text-text-primary">{factura.number}</div>
                                <div className="text-sm text-text-secondary">{factura.supplier?.name || 'N/A'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-text-primary">{formatCurrency(factura.total_amount)}</div>
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
                      <MdSchedule className="w-5 h-5" />
                      Próximas a Vencer ({facturasProximasVencer.upcoming_due.count})
                    </h3>
                    <div className="space-y-2">
                      {facturasProximasVencer.upcoming_due.invoices.map((factura) => (
                        <div key={factura.id} className="bg-orange-900/20 border border-orange-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(factura.urgency_level)}`}>
                                {getUrgencyIcon(factura.urgency_level)}
                                <span className="ml-1">{getUrgencyText(factura.urgency_level)}</span>
                              </span>
                              <div>
                                <div className="font-medium text-text-primary">{factura.number}</div>
                                <div className="text-sm text-text-secondary">{factura.supplier?.name || 'N/A'}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-text-primary">{formatCurrency(factura.total_amount)}</div>
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

export default Facturas;