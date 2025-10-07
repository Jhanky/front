import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  MdSolarPower, 
  MdBatteryChargingFull, 
  MdDevices, 
  MdTrendingUp, 
  MdLocationOn, 
  MdWarning,
  MdInfo,
  MdClose,
  MdRefresh
} from "react-icons/md";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from "context/AuthContext";
import { dashboardService } from "services/dashboardService";
import Loading from "components/loading";
import './Inicio.css';

// El endpoint del dashboard ya viene con el formato correcto, solo necesitamos formatear ligeramente
const mapearProyectoAPlanta = (proyecto) => {
  return dashboardService.formatProyectoForFrontend(proyecto);
};

// Datos para gráficos
const datosGeneracion = [
  { hora: "06:00", generacion: 0 },
  { hora: "08:00", generacion: 2.1 },
  { hora: "10:00", generacion: 8.5 },
  { hora: "12:00", generacion: 15.2 },
  { hora: "14:00", generacion: 12.8 },
  { hora: "16:00", generacion: 6.3 },
  { hora: "18:00", generacion: 1.2 },
  { hora: "20:00", generacion: 0 }
];

// Los datos de eficiencia se calcularán dinámicamente en el componente

const Inicio = () => {
  const { user } = useAuth();
  const [selectedPlanta, setSelectedPlanta] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [plantasData, setPlantasData] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [error, setError] = useState(null);

  // Función para cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const response = await dashboardService.getEstadisticas(user?.token);
      
      if (response.success && response.data) {
        setEstadisticas(response.data);
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      // No mostramos error para estadísticas, es opcional
    }
  };

  // Función para cargar proyectos
  const cargarProyectos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await dashboardService.getProyectos(user?.token);
      
      if (response.success && response.data) {
        // El endpoint del dashboard ya viene con el formato correcto
        const plantasMapeadas = response.data.map(mapearProyectoAPlanta);
        setPlantasData(plantasMapeadas);
      } else {
        setError('No se pudieron cargar los proyectos');
        setPlantasData([]);
      }
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      setError('Error al cargar los proyectos: ' + error.message);
      setPlantasData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar todos los datos
  const cargarDatos = async () => {
    await Promise.all([
      cargarProyectos(),
      cargarEstadisticas()
    ]);
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (user?.token) {
      cargarDatos();
    }
  }, [user?.token]);

  // Calcular métricas totales (usar estadísticas del dashboard si están disponibles)
  const metricas = {
    generacionHoy: plantasData.reduce((sum, planta) => sum + planta.generacionHoy, 0),
    potenciaActual: plantasData.reduce((sum, planta) => sum + planta.potenciaActual, 0),
    plantasActivas: estadisticas?.active_projects || plantasData.filter(planta => planta.estado === "activa").length,
    capacidadTotal: estadisticas?.active_capacity_kwp || plantasData.reduce((sum, planta) => sum + planta.capacidad, 0),
    eficienciaPromedio: estadisticas?.efficiency_average || (plantasData.filter(planta => planta.estado === "activa").length > 0 
      ? Math.round(plantasData.filter(planta => planta.estado === "activa").reduce((sum, planta) => sum + planta.eficiencia, 0) / plantasData.filter(planta => planta.estado === "activa").length)
      : 0)
  };

  // Calcular datos de eficiencia dinámicamente
  const datosEficiencia = [
    { 
      name: "Activas", 
      value: estadisticas?.active_projects || plantasData.filter(planta => planta.estado === "activa").length, 
      color: "var(--accent-primary)" 
    },
    { 
      name: "Completadas", 
      value: estadisticas?.completed_projects || plantasData.filter(planta => planta.estado === "completada").length, 
      color: "#10B981" 
    }
  ];

  // Icono personalizado para los marcadores usando la imagen de paneles solares
  const createCustomIcon = (estado) => {
    const opacity = estado === "activa" ? 1 : 0.6;
    const filter = estado === "activa" ? 'none' : 'grayscale(100%)';
    return L.divIcon({
      html: `<div style="background-image: url('/img/Paneles-solares.png'); background-size: contain; background-repeat: no-repeat; background-position: center; width: 40px; height: 40px; opacity: ${opacity}; filter: ${filter};"></div>`,
      className: "custom-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
  };

  const handleMarkerClick = (planta) => {
    setSelectedPlanta(planta);
    setIsModalOpen(true);
  };

  const handleRefresh = () => {
    cargarDatos();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CL');
  };

  // Mostrar loading si está cargando
  if (isLoading && plantasData.length === 0) {
    return (
      <div className="inicio-container">
        <div className="flex items-center justify-center h-64">
          <Loading />
        </div>
      </div>
    );
  }

  // Mostrar error si hay un error
  if (error) {
    return (
      <div className="inicio-container">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-500 text-lg font-medium mb-4">Error al cargar los datos</div>
          <div className="text-gray-500 text-sm mb-4">{error}</div>
          <button 
            onClick={handleRefresh}
            className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-hover transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inicio-container">
      {/* Header */}
      <div className="inicio-header">
        <div className="header-content">
          <h1 className="header-title">
            <MdSolarPower className="header-icon" />
            Dashboard de Plantas Fotovoltaicas
          </h1>
          <button 
            className="refresh-button"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <MdRefresh className={`refresh-icon ${isLoading ? 'spinning' : ''}`} />
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
        <p className="header-subtitle">
          Monitoreo en tiempo real de {plantasData.length} proyectos solares en la Costa Caribe Colombiana
        </p>
      </div>

      {/* Métricas principales */}
      <div className="metricas-grid">
        <div className="metrica-card">
          <div className="metrica-icon generacion">
            <MdTrendingUp />
          </div>
          <div className="metrica-content">
            <h3 className="metrica-valor">{metricas.generacionHoy.toFixed(1)} kWh</h3>
            <p className="metrica-label">Generación Hoy</p>
          </div>
        </div>

        <div className="metrica-card">
          <div className="metrica-icon potencia">
            <MdDevices />
          </div>
          <div className="metrica-content">
            <h3 className="metrica-valor">{metricas.potenciaActual.toFixed(1)} kW</h3>
            <p className="metrica-label">Potencia Actual</p>
          </div>
        </div>

        <div className="metrica-card">
          <div className="metrica-icon plantas">
            <MdLocationOn />
          </div>
          <div className="metrica-content">
            <h3 className="metrica-valor">{metricas.plantasActivas}/{plantasData.length}</h3>
            <p className="metrica-label">Plantas Activas</p>
          </div>
        </div>

        <div className="metrica-card">
          <div className="metrica-icon capacidad">
            <MdBatteryChargingFull />
          </div>
          <div className="metrica-content">
            <h3 className="metrica-valor">{metricas.capacidadTotal.toFixed(1)} kWp</h3>
            <p className="metrica-label">Capacidad Total</p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="main-content">
        {/* Mapa */}
        <div className="mapa-container">
          <div className="mapa-header">
            <h2 className="mapa-title">
              <MdLocationOn className="mapa-icon" />
              Ubicación de Proyectos
            </h2>
                         <div className="mapa-leyenda">
               <div className="leyenda-item">
                 <div className="leyenda-icon activa">
                   <img src="/img/Paneles-solares.png" alt="Proyecto Activo" />
                 </div>
                 <span>Proyecto Activo</span>
               </div>
               <div className="leyenda-item">
                 <div className="leyenda-icon completada">
                   <img src="/img/Paneles-solares.png" alt="Proyecto Completado" />
                 </div>
                 <span>Proyecto Completado</span>
               </div>
             </div>
          </div>
          
          <div className="mapa-wrapper">
            <MapContainer
              center={[10.9685, -74.7813]}
              zoom={7}
              className="mapa"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {plantasData.map((planta) => (
                <Marker
                  key={planta.id}
                  position={planta.coordenadas}
                  icon={createCustomIcon(planta.estado)}
                  eventHandlers={{
                    click: () => handleMarkerClick(planta)
                  }}
                >
                  <Popup>
                    <div className="popup-content">
                      <h3>{planta.nombre}</h3>
                      <p><strong>Estado:</strong> {planta.estado}</p>
                      <p><strong>Potencia:</strong> {planta.potenciaActual} kW</p>
                      <p><strong>Generación hoy:</strong> {planta.generacionHoy} kWh</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Gráficos */}
        <div className="graficos-container">
          <div className="grafico-card">
            <h3 className="grafico-title">Generación por Hora</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={datosGeneracion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="generacion" 
                  stroke="var(--accent-primary)" 
                  strokeWidth={2}
                  dot={{ fill: "var(--accent-primary)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grafico-card">
            <h3 className="grafico-title">Estado de Proyectos</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={datosEficiencia}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {datosEficiencia.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {datosEficiencia.map((item, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                  <span>{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal único de detalles */}
      {isModalOpen && selectedPlanta && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <MdInfo className="modal-icon" />
                {selectedPlanta.nombre}
              </h2>
              <button 
                className="modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <MdClose />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Imagen de portada */}
              <div className="modal-image-container">
                <img 
                  src={selectedPlanta.imagenPortada} 
                  alt={`Portada de ${selectedPlanta.nombre}`}
                  className="modal-image"
                  onError={(e) => {
                    e.target.src = '/img/Paneles-solares.png';
                  }}
                />
                <div className="modal-image-overlay">
                  <div className="modal-image-info">
                    <h3 className="modal-image-title">{selectedPlanta.nombre}</h3>
                    <p className="modal-image-location">{selectedPlanta.ubicacion}</p>
                    <div className="modal-image-status">
                      <span className={`status-badge status-${selectedPlanta.estado}`}>
                        {selectedPlanta.estado === "activa" ? "Activo" : 
                         selectedPlanta.estado === "completada" ? "Completado" : 
                         selectedPlanta.estado === "pausada" ? "Pausado" : 
                         selectedPlanta.estado === "cancelada" ? "Cancelado" : 
                         selectedPlanta.estado === "planificacion" ? "En Planificación" : 
                         "Desconocido"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información detallada */}
              <div className="planta-info">
                <div className="info-section">
                  <h4 className="info-section-title">Información Técnica</h4>
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="info-label">Capacidad:</span>
                      <span className="info-value">{selectedPlanta.capacidad} kWp</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Potencia Actual:</span>
                      <span className="info-value">{selectedPlanta.potenciaActual} kW</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Generación Hoy:</span>
                      <span className="info-value">{selectedPlanta.generacionHoy} kWh</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Eficiencia:</span>
                      <span className="info-value">{selectedPlanta.eficiencia}%</span>
                    </div>
                  </div>
                </div>

                {selectedPlanta.cliente && (
                  <div className="info-section">
                    <h4 className="info-section-title">Información del Cliente</h4>
                    <div className="info-grid">
                      <div className="info-row">
                        <span className="info-label">Cliente:</span>
                        <span className="info-value">{selectedPlanta.cliente.nombre}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Tipo Cliente:</span>
                        <span className="info-value">{selectedPlanta.cliente.tipo}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">NIC:</span>
                        <span className="info-value">{selectedPlanta.cliente.nic}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Consumo Mensual:</span>
                        <span className="info-value">{selectedPlanta.cliente.consumo_mensual_kwh} kWh</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="info-section">
                  <h4 className="info-section-title">Información del Proyecto</h4>
                  <div className="info-grid">
                    <div className="info-row">
                      <span className="info-label">Ubicación:</span>
                      <span className="info-value">{selectedPlanta.ubicacion}</span>
                    </div>
                    {selectedPlanta.gerenteProyecto && (
                      <div className="info-row">
                        <span className="info-label">Gerente de Proyecto:</span>
                        <span className="info-value">{selectedPlanta.gerenteProyecto}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="info-label">Última Actualización:</span>
                      <span className="info-value">{formatDate(selectedPlanta.ultimaActualizacion)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inicio;
