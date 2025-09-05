# Endpoints de Localización

## Información del Modelo

### Localización (Location)
- **Tabla**: `locations`
- **Clave primaria**: `location_id`
- **Campos principales**:
  - `department`: Departamento
  - `municipality`: Municipio
  - `radiation`: Radiación solar en W/m²

### Scopes Disponibles
- `byDepartment($department)`: Filtra por departamento
- `byMunicipality($municipality)`: Filtra por municipio
- `byRadiationRange($minRadiation, $maxRadiation)`: Filtra por rango de radiación
- `highRadiation($threshold = 1480.0)`: Filtra radiación alta
- `lowRadiation($threshold = 1420.0)`: Filtra radiación baja

### Accessors
- `formatted_radiation`: Retorna radiación formateada con unidades (W/m²)
- `full_location`: Retorna ubicación completa (municipio, departamento)
- `radiation_level`: Clasifica el nivel de radiación (Excelente, Muy Buena, Buena, Regular, Baja)

---

## Endpoints Disponibles

### 1. Obtener Lista de Localizaciones
**GET** `/api/locations`

**Parámetros de consulta:**
- `search` (opcional): Búsqueda por departamento o municipio
- `department` (opcional): Filtrar por departamento específico
- `municipality` (opcional): Filtrar por municipio específico
- `min_radiation` (opcional): Radiación mínima en W/m²
- `max_radiation` (opcional): Radiación máxima en W/m²
- `radiation_level` (opcional): Nivel de radiación (excelente, muy_buena, buena, regular, baja)
- `sort_by` (opcional): Campo para ordenar (default: `department`)
- `sort_order` (opcional): Orden ascendente/descendente (default: `asc`)
- `per_page` (opcional): Elementos por página (default: 15)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "current_page": 1,
        "data": [
            {
                "location_id": 1,
                "department": "San Salvador",
                "municipality": "San Salvador",
                "radiation": 1420.50,
                "created_at": "2024-01-01T00:00:00.000000Z",
                "updated_at": "2024-01-01T00:00:00.000000Z",
                "formatted_radiation": "1,420.50 W/m²",
                "full_location": "San Salvador, San Salvador",
                "radiation_level": "Buena"
            }
        ],
        "total": 70,
        "per_page": 15
    },
    "message": "Locations retrieved successfully"
}
```

---

### 2. Crear Localización
**POST** `/api/locations`

**Datos requeridos:**
```json
{
    "department": "San Salvador",
    "municipality": "Nuevo Municipio",
    "radiation": 1450.75
}
```

**Validaciones:**
- `department`: Requerido, string, máximo 100 caracteres
- `municipality`: Requerido, string, máximo 100 caracteres
- `radiation`: Requerido, numérico, mínimo 0, máximo 9999.99

**Respuesta exitosa (201):**
```json
{
    "success": true,
    "data": {
        "location_id": 71,
        "department": "San Salvador",
        "municipality": "Nuevo Municipio",
        "radiation": 1450.75,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z",
        "formatted_radiation": "1,450.75 W/m²",
        "full_location": "Nuevo Municipio, San Salvador",
        "radiation_level": "Muy Buena"
    },
    "message": "Location created successfully"
}
```

---

### 3. Obtener Localización Específica
**GET** `/api/locations/{id}`

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "location_id": 1,
        "department": "San Salvador",
        "municipality": "San Salvador",
        "radiation": 1420.50,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z",
        "formatted_radiation": "1,420.50 W/m²",
        "full_location": "San Salvador, San Salvador",
        "radiation_level": "Buena"
    },
    "message": "Location retrieved successfully"
}
```

---

### 4. Actualizar Localización
**PUT/PATCH** `/api/locations/{id}`

**Datos opcionales:**
```json
{
    "department": "La Libertad",
    "municipality": "Santa Tecla",
    "radiation": 1430.25
}
```

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "location_id": 1,
        "department": "La Libertad",
        "municipality": "Santa Tecla",
        "radiation": 1430.25,
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-01T00:00:00.000000Z",
        "formatted_radiation": "1,430.25 W/m²",
        "full_location": "Santa Tecla, La Libertad",
        "radiation_level": "Buena"
    },
    "message": "Location updated successfully"
}
```

---

### 5. Eliminar Localización
**DELETE** `/api/locations/{id}`

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Location deleted successfully"
}
```

---

### 6. Obtener Localizaciones por Departamento
**GET** `/api/locations/department/{department}`

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": [
        {
            "location_id": 1,
            "department": "San Salvador",
            "municipality": "San Salvador",
            "radiation": 1420.50,
            "formatted_radiation": "1,420.50 W/m²",
            "full_location": "San Salvador, San Salvador",
            "radiation_level": "Buena"
        }
    ],
    "message": "Department locations retrieved successfully"
}
```

---

### 7. Obtener Localizaciones por Nivel de Radiación
**GET** `/api/locations/radiation-level/{level}`

**Niveles disponibles:**
- `excelente` (≥ 1480 W/m²)
- `muy_buena` (≥ 1450 W/m²)
- `buena` (≥ 1420 W/m²)
- `regular` (≥ 1400 W/m²)
- `baja` (< 1400 W/m²)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": [
        {
            "location_id": 15,
            "department": "Ahuachapán",
            "municipality": "Atiquizaya",
            "radiation": 1495.80,
            "formatted_radiation": "1,495.80 W/m²",
            "full_location": "Atiquizaya, Ahuachapán",
            "radiation_level": "Excelente"
        }
    ],
    "message": "High radiation locations retrieved successfully"
}
```

---

### 8. Obtener Estadísticas de Radiación
**GET** `/api/locations/statistics`

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "total_locations": 70,
        "average_radiation": 1445.32,
        "max_radiation": 1495.80,
        "min_radiation": 1400.00,
        "locations_by_department": [
            {
                "department": "San Salvador",
                "count": 5,
                "average_radiation": 1423.44
            },
            {
                "department": "La Libertad",
                "count": 5,
                "average_radiation": 1433.42
            }
        ],
        "locations_by_level": [
            {
                "level": "Excelente",
                "count": 8,
                "percentage": 11.43
            },
            {
                "level": "Muy Buena",
                "count": 15,
                "percentage": 21.43
            },
            {
                "level": "Buena",
                "count": 25,
                "percentage": 35.71
            },
            {
                "level": "Regular",
                "count": 18,
                "percentage": 25.71
            },
            {
                "level": "Baja",
                "count": 4,
                "percentage": 5.71
            }
        ]
    },
    "message": "Location statistics retrieved successfully"
}
```

---

### 9. Buscar Localizaciones por Radiación Óptima
**GET** `/api/locations/optimal-radiation`

**Parámetros de consulta:**
- `min_radiation` (opcional): Radiación mínima (default: 1450)
- `max_radiation` (opcional): Radiación máxima (default: 1500)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": [
        {
            "location_id": 15,
            "department": "Ahuachapán",
            "municipality": "Atiquizaya",
            "radiation": 1495.80,
            "formatted_radiation": "1,495.80 W/m²",
            "full_location": "Atiquizaya, Ahuachapán",
            "radiation_level": "Excelente"
        }
    ],
    "message": "Optimal radiation locations retrieved successfully"
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
        "department": ["The department field is required."],
        "radiation": ["The radiation must be a number."]
    }
}
```

### 404 - Recurso No Encontrado
```json
{
    "success": false,
    "message": "Location not found",
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

1. **Unidades de Radiación**: Los valores de radiación están en W/m² (vatios por metro cuadrado)
2. **Rango de Valores**: Los valores típicos en El Salvador van de 1400 a 1500 W/m²
3. **Clasificación de Niveles**:
   - Excelente: ≥ 1480 W/m²
   - Muy Buena: ≥ 1450 W/m²
   - Buena: ≥ 1420 W/m²
   - Regular: ≥ 1400 W/m²
   - Baja: < 1400 W/m²
4. **Datos Incluidos**: 70 localizaciones de todos los departamentos de El Salvador
5. **Índices Optimizados**: La tabla incluye índices para consultas eficientes por departamento y radiación
6. **Accessors Automáticos**: Los campos `formatted_radiation`, `full_location` y `radiation_level` se calculan automáticamente
