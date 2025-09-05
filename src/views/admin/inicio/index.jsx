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
import './Inicio.css';

// Datos de ejemplo de plantas fotovoltaicas
const plantasData = [
  {
    id: 1,
    nombre: "Planta Solar Cartagena",
    ubicacion: "Cartagena, Bolívar",
    coordenadas: [10.3932, -75.4792],
    capacidad: 8.0, // kWp
    potenciaActual: 6.2, // kW
    generacionHoy: 32.8, // kWh
    estado: "activa",
    eficiencia: 88,
    ultimaActualizacion: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    nombre: "Planta Solar Barranquilla",
    ubicacion: "Barranquilla, Atlántico",
    coordenadas: [10.9685, -74.7813],
    capacidad: 6.5, // kWp
    potenciaActual: 5.8, // kW
    generacionHoy: 28.5, // kWh
    estado: "activa",
    eficiencia: 92,
    ultimaActualizacion: "2024-01-15T10:30:00Z"
  },
  {
    id: 3,
    nombre: "Planta Solar Santa Marta",
    ubicacion: "Santa Marta, Magdalena",
    coordenadas: [11.2404, -74.2110],
    capacidad: 5.5, // kWp
    potenciaActual: 0.0, // kW
    generacionHoy: 0.0, // kWh
    estado: "mantenimiento",
    eficiencia: 0,
    ultimaActualizacion: "2024-01-15T08:15:00Z"
  },
  {
    id: 4,
    nombre: "Planta Solar Valledupar",
    ubicacion: "Valledupar, Cesar",
    coordenadas: [10.4631, -73.2532],
    capacidad: 4.0, // kWp
    potenciaActual: 3.5, // kW
    generacionHoy: 18.2, // kWh
    estado: "activa",
    eficiencia: 85,
    ultimaActualizacion: "2024-01-15T10:30:00Z"
  },
  {
    id: 5,
    nombre: "Planta Solar Riohacha",
    ubicacion: "Riohacha, La Guajira",
    coordenadas: [11.5444, -72.9072],
    capacidad: 7.0, // kWp
    potenciaActual: 6.5, // kW
    generacionHoy: 35.1, // kWh
    estado: "activa",
    eficiencia: 95,
    ultimaActualizacion: "2024-01-15T10:30:00Z"
  }
];

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

const datosEficiencia = [
  { name: "Activas", value: 4, color: "var(--accent-primary)" },
  { name: "Mantenimiento", value: 1, color: "#F59E0B" }
];

const Inicio = () => {
  const [selectedPlanta, setSelectedPlanta] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calcular métricas totales
  const metricas = {
    generacionHoy: plantasData.reduce((sum, planta) => sum + planta.generacionHoy, 0),
    potenciaActual: plantasData.reduce((sum, planta) => sum + planta.potenciaActual, 0),
    plantasActivas: plantasData.filter(planta => planta.estado === "activa").length,
    capacidadTotal: plantasData.reduce((sum, planta) => sum + planta.capacidad, 0),
    eficienciaPromedio: Math.round(plantasData.filter(planta => planta.estado === "activa").reduce((sum, planta) => sum + planta.eficiencia, 0) / plantasData.filter(planta => planta.estado === "activa").length)
  };

  // Icono personalizado para los marcadores usando la imagen de paneles solares
  const createCustomIcon = (estado) => {
    const opacity = estado === "activa" ? 1 : 0.6;
    return L.divIcon({
      html: `<div style="background-image: url('/img/Paneles-solares.png'); background-size: contain; background-repeat: no-repeat; background-position: center; width: 40px; height: 40px; opacity: ${opacity}; filter: ${estado === 'activa' ? 'none' : 'grayscale(100%)'};"></div>`,
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
    setIsLoading(true);
    // Simular actualización de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CL');
  };

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
          Monitoreo en tiempo real de {plantasData.length} plantas solares en la Costa Caribe Colombiana
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
              Ubicación de Plantas
            </h2>
                         <div className="mapa-leyenda">
               <div className="leyenda-item">
                 <div className="leyenda-icon activa">
                   <img src="/img/Paneles-solares.png" alt="Planta Activa" />
                 </div>
                 <span>Planta Activa</span>
               </div>
               <div className="leyenda-item">
                 <div className="leyenda-icon mantenimiento">
                   <img src="/img/Paneles-solares.png" alt="Planta en Mantenimiento" />
                 </div>
                 <span>Planta en Mantenimiento</span>
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
            <h3 className="grafico-title">Estado de Plantas</h3>
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

      {/* Modal de detalles */}
      {isModalOpen && selectedPlanta && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
              <div className="planta-info">
                <div className="info-row">
                  <span className="info-label">Ubicación:</span>
                  <span className="info-value">{selectedPlanta.ubicacion}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Estado:</span>
                  <span className={`info-value estado-${selectedPlanta.estado}`}>
                    {selectedPlanta.estado === "activa" ? "Activa" : "En Mantenimiento"}
                  </span>
                </div>
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
                <div className="info-row">
                  <span className="info-label">Última Actualización:</span>
                  <span className="info-value">{formatDate(selectedPlanta.ultimaActualizacion)}</span>
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
