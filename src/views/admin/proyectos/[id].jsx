import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Card from "components/card";
import { Chart } from "react-google-charts";
import { 
  MdArrowBack, 
  MdCalendarToday, 
  MdLocationOn, 
  MdPerson, 
  MdEngineering, 
  MdAttachMoney,
  MdSpeed,
  MdBatteryChargingFull,
  MdSolarPower,
  MdTimeline,
  MdCheckCircle,
  MdPending,
  MdPlayArrow,
  MdPause
} from "react-icons/md";
import Loading from "components/loading";
import { useAuth } from "context/AuthContext";

const ProyectoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [proyecto, setProyecto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Datos de prueba para el proyecto detallado
  const proyectoDetallado = {
    id: parseInt(id),
    nombre_proyecto: "Instalación Solar Residencial - Casa López",
    potencia: 5.4,
    tipo_proyecto: "Residencial",
    estado: "En Progreso",
    fecha_inicio: "2024-01-15",
    fecha_fin: "2024-03-15",
    dias_estimados: 60,
    valor_proyecto: 25000000,
    ubicacion: "Cartagena, Bolívar",
    descripcion: "Instalación de sistema solar fotovoltaico para vivienda residencial con capacidad de 5.4 kWp, incluyendo paneles solares, inversor y sistema de monitoreo.",
    objetivos: [
      "Reducir el consumo de energía eléctrica en un 80%",
      "Generar energía limpia y renovable",
      "Obtener retorno de inversión en 5 años",
      "Contribuir a la sostenibilidad ambiental"
    ],
    cliente: {
      name: "Juan López",
      client_type: "Residencial",
      nic: "123456789",
      department: "Bolívar",
      city: "Cartagena",
      address: "Calle 15 #23-45, Barrio Getsemaní",
      monthly_consumption_kwh: 450,
      energy_rate: 850,
      network_type: "Monofásica 110V",
      email: "juan.lopez@email.com",
      phone: "+57 300 123 4567"
    },
    productos: [
      {
        tipo: "panel",
        marca: "Canadian Solar",
        modelo: "CS6K-450MS",
        cantidad: 12,
        potencia: 450,
        capacidad: null,
        voltaje: null,
        ficha_tecnica: "/docs/panel-canadian-450w.pdf",
        precio_unitario: 850000,
        precio_total: 10200000
      },
      {
        tipo: "inverter",
        marca: "SMA",
        modelo: "Sunny Boy 5.0",
        cantidad: 1,
        potencia: 5.0,
        capacidad: null,
        voltaje: null,
        ficha_tecnica: "/docs/inverter-sma-5kw.pdf",
        precio_unitario: 3500000,
        precio_total: 3500000
      },
      {
        tipo: "estructura",
        marca: "Solar Mount",
        modelo: "SM-001",
        cantidad: 1,
        potencia: null,
        capacidad: null,
        voltaje: null,
        ficha_tecnica: "/docs/estructura-solar-mount.pdf",
        precio_unitario: 2500000,
        precio_total: 2500000
      }
    ],
    actividades: [
      { 
        id: 1, 
        nombre: "Diseño del sistema", 
        duracion: 5, 
        inicio: "2024-01-15", 
        fin: "2024-01-19", 
        estado: "Completado",
        responsable: "Ing. Carlos Mendoza",
        descripcion: "Diseño técnico del sistema solar fotovoltaico incluyendo cálculos de producción, selección de equipos y diseño de la instalación.",
        progreso: 100
      },
      { 
        id: 2, 
        nombre: "Aprobación de permisos", 
        duracion: 10, 
        inicio: "2024-01-20", 
        fin: "2024-01-29", 
        estado: "Completado",
        responsable: "Abog. María González",
        descripcion: "Gestión y obtención de todos los permisos necesarios para la instalación del sistema solar.",
        progreso: 100
      },
      { 
        id: 3, 
        nombre: "Instalación de estructura", 
        duracion: 8, 
        inicio: "2024-02-01", 
        fin: "2024-02-08", 
        estado: "En Progreso",
        responsable: "Téc. Roberto Silva",
        descripcion: "Instalación de la estructura de soporte para los paneles solares en el techo de la vivienda.",
        progreso: 60
      },
      { 
        id: 4, 
        nombre: "Instalación de paneles", 
        duracion: 5, 
        inicio: "2024-02-10", 
        fin: "2024-02-14", 
        estado: "Pendiente",
        responsable: "Téc. Roberto Silva",
        descripcion: "Instalación y conexión de los 12 paneles solares en la estructura montada.",
        progreso: 0
      },
      { 
        id: 5, 
        nombre: "Instalación de inversor", 
        duracion: 3, 
        inicio: "2024-02-15", 
        fin: "2024-02-17", 
        estado: "Pendiente",
        responsable: "Téc. Roberto Silva",
        descripcion: "Instalación del inversor solar y conexión al sistema eléctrico de la vivienda.",
        progreso: 0
      },
      { 
        id: 6, 
        nombre: "Conexión y pruebas", 
        duracion: 4, 
        inicio: "2024-02-18", 
        fin: "2024-02-21", 
        estado: "Pendiente",
        responsable: "Ing. Carlos Mendoza",
        descripcion: "Conexión final del sistema, pruebas de funcionamiento y verificación de la producción de energía.",
        progreso: 0
      },
      { 
        id: 7, 
        nombre: "Inspección final", 
        duracion: 2, 
        inicio: "2024-02-22", 
        fin: "2024-02-23", 
        estado: "Pendiente",
        responsable: "Ing. Carlos Mendoza",
        descripcion: "Inspección final del sistema instalado y entrega al cliente con capacitación en el uso.",
        progreso: 0
      }
    ],
    progreso: 35,
    equipo_trabajo: [
      {
        nombre: "Ing. Carlos Mendoza",
        rol: "Ingeniero de Proyecto",
        email: "carlos.mendoza@energy4cero.com",
        telefono: "+57 300 987 6543"
      },
      {
        nombre: "Téc. Roberto Silva",
        rol: "Técnico Instalador",
        email: "roberto.silva@energy4cero.com",
        telefono: "+57 300 456 7890"
      },
      {
        nombre: "Abog. María González",
        rol: "Asesora Legal",
        email: "maria.gonzalez@energy4cero.com",
        telefono: "+57 300 321 6547"
      }
    ],
    documentos: [
      {
        nombre: "Diseño Técnico",
        tipo: "PDF",
        fecha: "2024-01-19",
        url: "/docs/diseno-tecnico-proyecto-1.pdf"
      },
      {
        nombre: "Permisos Municipales",
        tipo: "PDF",
        fecha: "2024-01-29",
        url: "/docs/permisos-municipales-proyecto-1.pdf"
      },
      {
        nombre: "Contrato de Instalación",
        tipo: "PDF",
        fecha: "2024-01-10",
        url: "/docs/contrato-instalacion-proyecto-1.pdf"
      }
    ]
  };

  useEffect(() => {
    const cargarProyecto = async () => {
      setLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Si hay datos en el estado de navegación, usarlos
        if (location.state?.proyecto) {
          setProyecto(location.state.proyecto);
        } else {
          // Simular búsqueda por ID
          setProyecto(proyectoDetallado);
        }
        
        setError(null);
      } catch (error) {
        setError("Error al cargar los detalles del proyecto");
      } finally {
        setLoading(false);
      }
    };

    cargarProyecto();
  }, [id, location.state]);

  const formatNumber = (number) => {
    return new Intl.NumberFormat('es-CO').format(number);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'En Progreso':
        return 'bg-blue-100 text-blue-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pausado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Completado':
        return <MdCheckCircle className="h-4 w-4" />;
      case 'En Progreso':
        return <MdPlayArrow className="h-4 w-4" />;
      case 'Pendiente':
        return <MdPending className="h-4 w-4" />;
      case 'Pausado':
        return <MdPause className="h-4 w-4" />;
      default:
        return <MdPending className="h-4 w-4" />;
    }
  };

  const calcularProgresoActividad = (actividad) => {
    const hoy = new Date();
    const inicio = new Date(actividad.inicio);
    const fin = new Date(actividad.fin);
    
    if (hoy < inicio) return 0;
    if (hoy > fin) return 100;
    
    const totalDias = (fin - inicio) / (1000 * 60 * 60 * 24);
    const diasTranscurridos = (hoy - inicio) / (1000 * 60 * 60 * 24);
    return Math.round((diasTranscurridos / totalDias) * 100);
  };

  if (loading) return <Loading />;

  if (error || !proyecto) {
    return (
      <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center gap-4">
        <div className="text-red-500">{error || "Proyecto no encontrado"}</div>
        <button
          onClick={() => navigate('/admin/proyectos')}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-white transition-colors hover:bg-blue-700"
        >
          Volver a Proyectos
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5 xl:grid-cols-2 2xl:grid-cols-3">
      {/* Header con navegación */}
      <div className="col-span-1 h-fit w-full xl:col-span-2 2xl:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/proyectos')}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
            >
              <MdArrowBack className="h-5 w-5" />
              Volver
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                {proyecto.nombre_proyecto}
              </h1>
              <p className="text-sm text-gray-600">ID: {proyecto.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${getEstadoColor(proyecto.estado)}`}>
              {getEstadoIcon(proyecto.estado)}
              {proyecto.estado}
            </span>
          </div>
        </div>
      </div>

      {/* Información General */}
      <div className="col-span-1">
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información General</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MdSolarPower className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Potencia</p>
                <p className="text-lg font-semibold">{proyecto.potencia} kWp</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MdAttachMoney className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Valor del Proyecto</p>
                <p className="text-lg font-semibold">${formatNumber(proyecto.valor_proyecto)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MdLocationOn className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ubicación</p>
                <p className="text-sm">{proyecto.ubicacion}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MdCalendarToday className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Duración</p>
                <p className="text-sm">{proyecto.dias_estimados} días</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Progreso del Proyecto */}
      <div className="col-span-1">
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Progreso General</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Progreso Total</span>
                <span className="text-sm font-semibold">{proyecto.progreso}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${proyecto.progreso}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {proyecto.actividades?.filter(a => a.estado === 'Completado').length || 0}
                </p>
                <p className="text-xs text-gray-600">Completadas</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {proyecto.actividades?.filter(a => a.estado === 'Pendiente').length || 0}
                </p>
                <p className="text-xs text-gray-600">Pendientes</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Información del Cliente */}
      <div className="col-span-1">
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cliente</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <MdPerson className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{proyecto.cliente?.name}</p>
                <p className="text-sm text-gray-600">{proyecto.cliente?.client_type}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">NIC: {proyecto.cliente?.nic}</p>
              <p className="text-sm text-gray-600">{proyecto.cliente?.address}</p>
              <p className="text-sm text-gray-600">{proyecto.cliente?.city}, {proyecto.cliente?.department}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600">Consumo: {formatNumber(proyecto.cliente?.monthly_consumption_kwh)} kWh/mes</p>
              <p className="text-sm text-gray-600">Tarifa: ${formatNumber(proyecto.cliente?.energy_rate)}/kWh</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Equipos del Sistema */}
      <div className="col-span-1 xl:col-span-2">
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipos del Sistema</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Marca/Modelo</th>
                  <th className="text-center py-2">Cantidad</th>
                  <th className="text-center py-2">Especificaciones</th>
                  <th className="text-right py-2">Precio Total</th>
                </tr>
              </thead>
              <tbody>
                {proyecto.productos?.map((producto, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {producto.tipo === 'panel' && <MdSolarPower className="h-4 w-4 text-blue-500" />}
                        {producto.tipo === 'inverter' && <MdSpeed className="h-4 w-4 text-green-500" />}
                        {producto.tipo === 'battery' && <MdBatteryChargingFull className="h-4 w-4 text-purple-500" />}
                        {producto.tipo === 'estructura' && <MdEngineering className="h-4 w-4 text-gray-500" />}
                        <span className="capitalize font-medium">{producto.tipo}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{producto.marca}</p>
                        <p className="text-xs text-gray-600">{producto.modelo}</p>
                      </div>
                    </td>
                    <td className="py-3 text-center">{producto.cantidad}</td>
                    <td className="py-3 text-center">
                      {producto.potencia && <p>{producto.potencia} {producto.tipo === 'panel' ? 'W' : 'kW'}</p>}
                      {producto.capacidad && <p>{producto.capacidad} Ah</p>}
                      {producto.voltaje && <p>{producto.voltaje} V</p>}
                    </td>
                    <td className="py-3 text-right font-medium">
                      ${formatNumber(producto.precio_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Diagrama de Gantt con Google Charts */}
      <div className="col-span-1 xl:col-span-2 2xl:col-span-3">
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Cronograma del Proyecto</h3>
          
          {/* Preparar datos para Google Charts */}
          {(() => {
            // Definir las columnas según la documentación de Google Charts
            const columns = [
              { type: "string", label: "Task ID" },
              { type: "string", label: "Task Name" },
              { type: "string", label: "Resource" },
              { type: "date", label: "Start Date" },
              { type: "date", label: "End Date" },
              { type: "number", label: "Duration" },
              { type: "number", label: "Percent Complete" },
              { type: "string", label: "Dependencies" },
            ];

            // Convertir las actividades al formato requerido
            const rows = proyecto.actividades?.map((actividad) => [
              `task-${actividad.id}`,
              actividad.nombre,
              actividad.responsable,
              new Date(actividad.inicio),
              new Date(actividad.fin),
              actividad.duracion,
              actividad.progreso,
              null, // Dependencias (por ahora null)
            ]) || [];

            const data = [columns, ...rows];

            // Opciones de configuración del gráfico
            const options = {
              height: 400,
              gantt: {
                trackHeight: 50,
                criticalPathEnabled: false,
                arrow: {
                  angle: 100,
                  width: 5,
                  color: '#2196F3',
                  radius: 0,
                },
                palette: [
                  {
                    color: '#4CAF50', // Verde para completado
                    dark: '#388E3C',
                    light: '#C8E6C9',
                  },
                  {
                    color: '#2196F3', // Azul para en progreso
                    dark: '#1976D2',
                    light: '#BBDEFB',
                  },
                  {
                    color: '#FF9800', // Naranja para pendiente
                    dark: '#F57C00',
                    light: '#FFE0B2',
                  },
                  {
                    color: '#F44336', // Rojo para pausado
                    dark: '#D32F2F',
                    light: '#FFCDD2',
                  },
                ],
              },
              backgroundColor: '#ffffff',
            };

            return (
              <div>
                <Chart
                  chartType="Gantt"
                  width="100%"
                  height="400px"
                  data={data}
                  options={options}
                />
                
                {/* Información adicional de las actividades */}
                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">Detalles de Actividades</h4>
                  {proyecto.actividades?.map((actividad) => {
                    const progresoReal = calcularProgresoActividad(actividad);
                    const progresoMostrar = actividad.estado === 'Completado' ? 100 : 
                                          actividad.estado === 'En Progreso' ? Math.max(actividad.progreso, progresoReal) : 
                                          actividad.progreso;
                    
                    return (
                      <div key={actividad.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(actividad.estado)}`}>
                              {getEstadoIcon(actividad.estado)}
                              {actividad.estado}
                            </span>
                            <h5 className="font-medium text-sm">{actividad.nombre}</h5>
                          </div>
                          <span className="text-sm font-semibold text-gray-600">{progresoMostrar}%</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                          <div>📅 {formatDate(actividad.inicio)} - {formatDate(actividad.fin)}</div>
                          <div>👤 {actividad.responsable}</div>
                          <div>⏱️ {actividad.duracion} días</div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                actividad.estado === 'Completado' ? 'bg-green-500' :
                                actividad.estado === 'En Progreso' ? 'bg-blue-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${progresoMostrar}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mt-2">{actividad.descripcion}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </Card>
      </div>

      {/* Equipo de Trabajo */}
      <div className="col-span-1">
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipo de Trabajo</h3>
          <div className="space-y-4">
            {proyecto.equipo_trabajo?.map((miembro, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MdPerson className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{miembro.nombre}</p>
                    <p className="text-xs text-gray-600">{miembro.rol}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  <p>{miembro.email}</p>
                  <p>{miembro.telefono}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Documentos */}
      <div className="col-span-1">
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Documentos</h3>
          <div className="space-y-3">
            {proyecto.documentos?.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{doc.nombre}</p>
                  <p className="text-xs text-gray-600">{formatDate(doc.fecha)}</p>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  Descargar
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Objetivos del Proyecto */}
      <div className="col-span-1">
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Objetivos</h3>
          <div className="space-y-3">
            {proyecto.objetivos?.map((objetivo, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">{objetivo}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProyectoDetalle;
