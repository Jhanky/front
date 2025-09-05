# Sistema de Notificaciones

## Descripción
Sistema de notificaciones reutilizable para toda la aplicación, basado en el patrón usado en el módulo de clientes.

## Componentes

### NotificationManager
Componente principal que renderiza las notificaciones en la interfaz.

#### Props
- `mensajes`: Array de mensajes a mostrar
- `setMensajes`: Función para actualizar el estado de mensajes

#### Características
- Posicionamiento fijo en la esquina inferior derecha
- Animaciones suaves de entrada/salida
- Íconos según el tipo de notificación
- Botón para cerrar notificaciones individuales
- Botón para cerrar todas las notificaciones (cuando hay más de una)
- Auto-cierre configurable

## Hook useNotifications

### Funciones Disponibles

#### Notificaciones Básicas
- `showSuccess(contenido, autoClose, duration)`: Notificación de éxito
- `showError(contenido, autoClose, duration)`: Notificación de error
- `showWarning(contenido, autoClose, duration)`: Notificación de advertencia
- `showInfo(contenido, autoClose, duration)`: Notificación informativa

#### Notificaciones CRUD
- `showCRUDSuccess(operation, entity, autoClose)`: Éxito en operaciones CRUD
- `showCRUDError(operation, entity, error, autoClose)`: Error en operaciones CRUD

#### Gestión de Notificaciones
- `closeNotification(id)`: Cerrar notificación específica
- `closeAllNotifications()`: Cerrar todas las notificaciones
- `cleanOldNotifications()`: Limpiar notificaciones antiguas

### Parámetros

#### operation (para CRUD)
- `create`: Crear
- `read`: Leer/Cargar
- `update`: Actualizar
- `delete`: Eliminar
- `save`: Guardar cambios
- `upload`: Subir archivo
- `download`: Descargar archivo

#### entity
Nombre de la entidad (ej: "cliente", "cotización", "producto")

#### autoClose
- `true`: Se cierra automáticamente (por defecto)
- `false`: Permanece hasta que se cierre manualmente

#### duration
Tiempo en milisegundos antes del auto-cierre (por defecto: 3000ms para éxito, 5000ms para error)

## Ejemplo de Uso

### 1. Importar el hook
```javascript
import useNotifications from '../../../hooks/useNotifications';
```

### 2. Usar en el componente
```javascript
const {
  mensajes,
  showSuccess,
  showError,
  showCRUDSuccess,
  showCRUDError
} = useNotifications();
```

### 3. Mostrar notificaciones
```javascript
// Notificación básica
showSuccess("Operación completada exitosamente");

// Notificación CRUD
showCRUDSuccess('create', 'cliente');
showCRUDError('update', 'cotización', 'Error de conexión');

// Notificación personalizada
showError("Error personalizado", false); // No se cierra automáticamente
```

### 4. Renderizar en el JSX
```javascript
import { NotificationManager } from '../../../components/notifications';

// Al final del componente
<NotificationManager mensajes={mensajes} />
```

## Tipos de Notificación

### Success (Verde)
- Operaciones exitosas
- Confirmaciones
- Completado de tareas

### Error (Rojo)
- Errores de operación
- Fallos de validación
- Problemas de conexión

### Warning (Amarillo)
- Advertencias
- Confirmaciones requeridas
- Estados intermedios

### Info (Azul)
- Información general
- Estados del sistema
- Notas informativas

## Estilos y Animaciones

### Posicionamiento
- `fixed bottom-4 right-4`: Esquina inferior derecha
- `z-50`: Alto nivel de z-index

### Transiciones
- `transition-all duration-300`: Transiciones suaves
- `transform`: Para animaciones

### Responsive
- `max-w-md`: Ancho máximo para evitar desbordamiento
- `text-sm`: Tamaño de texto apropiado

## Integración con Módulos Existentes

### Reemplazar sistema anterior
```javascript
// Antes
const [mensajes, setMensajes] = useState([]);
setMensajes([{ contenido: "Mensaje", tipo: "success" }]);

// Después
const { mensajes, showSuccess } = useNotifications();
showSuccess("Mensaje");
```

### Mantener compatibilidad
El hook mantiene la misma estructura de datos que el sistema anterior, por lo que la migración es transparente.

## Ventajas

1. **Reutilizable**: Un solo componente para toda la aplicación
2. **Consistente**: Mismo estilo y comportamiento en todos los módulos
3. **Mantenible**: Centralizado en un solo lugar
4. **Flexible**: Configuración personalizable por notificación
5. **Accesible**: Incluye aria-labels y navegación por teclado
6. **Performance**: Optimizado con useCallback y gestión de estado eficiente
