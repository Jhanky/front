# Endpoints de Clientes

## Información del Modelo

### Cliente (Client)
- **Tabla**: `clients`
- **Clave primaria**: `client_id`
- **Campos principales**:
  - `nic`: Número de identificación del cliente (único)
  - `client_type`: Tipo de cliente
  - `name`: Nombre del cliente
  - `department`: Departamento
  - `city`: Ciudad
  - `address`: Dirección
  - `monthly_consumption_kwh`: Consumo mensual en kWh
  - `energy_rate`: Tarifa de energía
  - `network_type`: Tipo de red
  - `user_id`: ID del usuario asociado
  - `is_active`: Estado activo/inactivo

### Relaciones
- **User**: Pertenece a un usuario (`belongsTo`)

### Scopes Disponibles
- `active()`: Filtra clientes activos
- `byType($type)`: Filtra por tipo de cliente
- `byDepartment($department)`: Filtra por departamento
- `byCity($city)`: Filtra por ciudad

### Accessors
- `monthly_estimated_cost`: Calcula el costo mensual estimado
- `full_identification`: Retorna nombre completo con NIC

---

## Endpoints Disponibles

### 1. Obtener Lista de Clientes
**GET** `/api/clients`

**Parámetros de consulta:**
- `search` (opcional): Búsqueda por nombre, NIC o dirección
- `client_type` (opcional): Filtrar por tipo de cliente
- `department` (opcional): Filtrar por departamento
- `city` (opcional): Filtrar por ciudad
- `is_active` (opcional): Filtrar por estado activo/inactivo
- `user_id` (opcional): Filtrar por usuario específico
- `sort_by` (opcional): Campo para ordenar (default: `created_at`)
- `sort_order` (opcional): Orden ascendente/descendente (default: `desc`)
- `per_page` (opcional): Elementos por página (default: 15)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "client_id": 1,
                "nic": "12345678",
                "client_type": "Residencial",
                "name": "Juan Pérez",
                "department": "San Salvador",
                "city": "San Salvador",
                "address": "Calle Principal #123",
                "monthly_consumption_kwh": 150.5,
                "energy_rate": 0.12,
                "network_type": "Monofásica",
                "user_id": 1,
                "is_active": true,
                "created_at": "2024-01-01T00:00:00.000000Z",
                "updated_at": "2024-01-01T00:00:00.000000Z",
                "user": {
                    "id": 1,
                    "name": "Admin User",
                    "email": "admin@example.com"
                }
            }
        ],
        "total": 1,
        "per_page": 15
    },
    "message": "Clients retrieved successfully"
}
```

---

### 2. Crear Cliente
**POST** `/api/clients`

**Datos requeridos:**
```json
{
    "nic": "12345678",
    "client_type": "Residencial",
    "name": "Juan Pérez",
    "department": "San Salvador",
    "city": "San Salvador",
    "address": "Calle Principal #123",
    "monthly_consumption_kwh": 150.5,
    "energy_rate": 0.12,
    "network_type": "Monofásica",
    "is_active": true
}
```

**Validaciones:**
- `nic`: Requerido, string, máximo 50 caracteres, único
- `client_type`: Requerido, string, máximo 50 caracteres
- `name`: Requerido, string, máximo 100 caracteres
- `department`: Requerido, string, máximo 100 caracteres
- `city`: Requerido, string, máximo 100 caracteres
- `address`: Requerido, string
- `monthly_consumption_kwh`: Requerido, numérico, mínimo 0
- `energy_rate`: Requerido, numérico, mínimo 0
- `network_type`: Requerido, string, máximo 50 caracteres
- `is_active`: Opcional, booleano

**Respuesta exitosa (201):**
```json
{
    "success": true,
    "data": {
        "client_id": 1,
        "nic": "12345678",
        "client_type": "Residencial",
        "name": "Juan Pérez",
        "department": "San Salvador",
        "city": "San Salvador",
        "address": "Calle Principal #123",
        "monthly_consumption_kwh": 150.5,
        "energy_rate": 0.12,
        "network_type": "Monofásica",
        "user_id": 1,
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z",
        "user": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com"
        }
    },
    "message": "Client created successfully"
}
```

**Respuesta de error (422):**
```json
{
    "success": false,
    "message": "Validation errors",
    "errors": {
        "nic": ["The nic field is required."],
        "name": ["The name field is required."]
    }
}
```

---

### 3. Obtener Cliente Específico
**GET** `/api/clients/{id}`

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "client_id": 1,
        "nic": "12345678",
        "client_type": "Residencial",
        "name": "Juan Pérez",
        "department": "San Salvador",
        "city": "San Salvador",
        "address": "Calle Principal #123",
        "monthly_consumption_kwh": 150.5,
        "energy_rate": 0.12,
        "network_type": "Monofásica",
        "user_id": 1,
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z",
        "user": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@example.com"
        }
    },
    "message": "Client retrieved successfully"
}
```

**Respuesta de error (404):**
```json
{
    "success": false,
    "message": "Client not found",
    "error": "No query results for model [App\\Models\\Client] 1"
}
```

---

### 4. Actualizar Cliente
**PUT/PATCH** `/api/clients/{id}`

**Datos opcionales:**
```json
{
    "nic": "87654321",
    "client_type": "Comercial",
    "name": "Juan Pérez Actualizado",
    "department": "La Libertad",
    "city": "Santa Tecla",
    "address": "Nueva Dirección #456",
    "monthly_consumption_kwh": 200.0,
    "energy_rate": 0.15,
    "network_type": "Trifásica",
    "user_id": 2,
    "is_active": false
}
```

**Validaciones:**
- Todos los campos son opcionales (usar `sometimes`)
- `nic`: Único, excluyendo el cliente actual
- `user_id`: Debe existir en la tabla users

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "client_id": 1,
        "nic": "87654321",
        "client_type": "Comercial",
        "name": "Juan Pérez Actualizado",
        "department": "La Libertad",
        "city": "Santa Tecla",
        "address": "Nueva Dirección #456",
        "monthly_consumption_kwh": 200.0,
        "energy_rate": 0.15,
        "network_type": "Trifásica",
        "user_id": 2,
        "is_active": false,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z",
        "user": {
            "id": 2,
            "name": "Other User",
            "email": "other@example.com"
        }
    },
    "message": "Client updated successfully"
}
```

---

### 5. Eliminar Cliente
**DELETE** `/api/clients/{id}`

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Client deleted successfully"
}
```

**Respuesta de error (404):**
```json
{
    "success": false,
    "message": "Error deleting client",
    "error": "No query results for model [App\\Models\\Client] 1"
}
```

---

### 6. Obtener Clientes por Usuario
**GET** `/api/clients/user/{userId}`

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": [
        {
            "client_id": 1,
            "nic": "12345678",
            "client_type": "Residencial",
            "name": "Juan Pérez",
            "department": "San Salvador",
            "city": "San Salvador",
            "address": "Calle Principal #123",
            "monthly_consumption_kwh": 150.5,
            "energy_rate": 0.12,
            "network_type": "Monofásica",
            "user_id": 1,
            "is_active": true,
            "created_at": "2024-01-01T00:00:00.000000Z",
            "updated_at": "2024-01-01T00:00:00.000000Z",
            "user": {
                "id": 1,
                "name": "Admin User",
                "email": "admin@example.com"
            }
        }
    ],
    "message": "User clients retrieved successfully"
}
```

---

### 7. Obtener Estadísticas de Clientes
**GET** `/api/clients/statistics`

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "total_clients": 100,
        "active_clients": 85,
        "inactive_clients": 15,
        "clients_by_type": [
            {
                "client_type": "Residencial",
                "count": 60
            },
            {
                "client_type": "Comercial",
                "count": 30
            },
            {
                "client_type": "Industrial",
                "count": 10
            }
        ],
        "clients_by_department": [
            {
                "department": "San Salvador",
                "count": 40
            },
            {
                "department": "La Libertad",
                "count": 25
            },
            {
                "department": "Santa Ana",
                "count": 15
            }
        ],
        "total_consumption": 15000.5,
        "average_consumption": 150.005,
        "average_energy_rate": 0.125
    },
    "message": "Client statistics retrieved successfully"
}
```

---

## Códigos de Error Comunes

### 422 - Errores de Validación
```json
{
    "success": false,
    "message": "Validation errors",
    "errors": {
        "field_name": ["Error description"]
    }
}
```

### 404 - Recurso No Encontrado
```json
{
    "success": false,
    "message": "Client not found",
    "error": "Error details"
}
```

### 500 - Error del Servidor
```json
{
    "success": false,
    "message": "Error message",
    "error": "Detailed error information"
}
```

---

## Notas Importantes

1. **Autenticación**: Todos los endpoints requieren autenticación
2. **User ID**: Al crear un cliente, el `user_id` se asigna automáticamente al usuario autenticado
3. **NIC Único**: El campo `nic` debe ser único en toda la tabla
4. **Scopes**: Se pueden combinar múltiples scopes para filtros complejos
5. **Paginación**: La lista de clientes incluye paginación automática
6. **Relaciones**: Los clientes incluyen la información del usuario asociado
7. **Estadísticas**: Las estadísticas se calculan en tiempo real
