# API Endpoints - Usuarios

## Configuración Base
- **Base URL**: `http://localhost:8000/api`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}` (para endpoints protegidos)
  - `Accept: application/json`

---

## 1. Autenticación (Públicos)

### POST /api/auth/register
**Registrar nuevo usuario**

**Request Body:**
```json
{
    "name": "Juan Pérez",
    "username": "juanperez",
    "email": "juan.perez@energy4cero.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone": "+573001234567",
    "job_title": "Desarrollador"
}
```

**Response (201):**
```json
{
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "name": "Juan Pérez",
        "username": "juanperez",
        "email": "juan.perez@energy4cero.com",
        "phone": "+573001234567",
        "job_title": "Desarrollador",
        "profile_photo": null,
        "email_verified_at": null,
        "created_at": "2024-01-15T10:30:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z",
        "roles": [
            {
                "id": 1,
                "name": "user",
                "pivot": {
                    "user_id": 1,
                    "role_id": 1,
                    "created_at": "2024-01-15T10:30:00.000000Z",
                    "updated_at": "2024-01-15T10:30:00.000000Z"
                }
            }
        ]
    },
    "token": "1|abc123def456..."
}
```

### POST /api/auth/login
**Iniciar sesión**

**Request Body:**
```json
{
    "email": "juan.perez@energy4cero.com",
    "password": "password123"
}
```

**Response (200):**
```json
{
    "success": true,
    "message": "Inicio de sesión exitoso",
    "data": {
        "user": {
            "id": 1,
            "name": "Juan Pérez",
            "username": "juanperez",
            "email": "juan.perez@energy4cero.com",
            "phone": "+573001234567",
            "job_title": "Desarrollador",
            "profile_photo": null,
            "email_verified_at": null,
            "created_at": "2024-01-15T10:30:00.000000Z",
            "updated_at": "2024-01-15T10:30:00.000000Z",
            "roles": [
                {
                    "id": 1,
                    "name": "administrador",
                    "display_name": "Administrador",
                    "description": "Rol con acceso completo al sistema, puede gestionar usuarios, roles y configuraciones.",
                    "pivot": {
                        "user_id": 1,
                        "role_id": 1,
                        "created_at": "2024-01-15T10:30:00.000000Z",
                        "updated_at": "2024-01-15T10:30:00.000000Z"
                    }
                }
            ]
        },
        "token": "1|abc123def456...",
        "token_type": "Bearer"
    }
}
```

---

## 2. Gestión de Sesión (Protegidos)

### POST /api/auth/logout
**Cerrar sesión**

**Response (200):**
```json
{
    "message": "Logged out successfully"
}
```

### GET /api/auth/me
**Obtener usuario autenticado**

**Response (200):**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "name": "Juan Pérez",
            "username": "juanperez",
            "email": "juan.perez@energy4cero.com",
            "phone": "+573001234567",
            "job_title": "Desarrollador",
            "profile_photo": "http://localhost:8000/storage/profile-photos/photo.jpg",
            "email_verified_at": null,
            "created_at": "2024-01-15T10:30:00.000000Z",
            "updated_at": "2024-01-15T10:30:00.000000Z",
            "roles": [
                {
                    "id": 1,
                    "name": "administrador",
                    "display_name": "Administrador",
                    "description": "Rol con acceso completo al sistema, puede gestionar usuarios, roles y configuraciones.",
                    "pivot": {
                        "user_id": 1,
                        "role_id": 1,
                        "created_at": "2024-01-15T10:30:00.000000Z",
                        "updated_at": "2024-01-15T10:30:00.000000Z"
                    }
                }
            ]
        }
    }
}
```

### POST /api/auth/refresh
**Renovar token**

**Response (200):**
```json
{
    "message": "Token refreshed successfully",
    "token": "2|xyz789abc123..."
}
```

---

## 3. Gestión de Usuarios (Protegidos)

### GET /api/users
**Listar usuarios**

**Query Parameters:**
- `search` - Buscar por nombre/email/username/teléfono
- `role` - Filtrar por rol específico
- `per_page` - Elementos por página (default: 15)
- `page` - Número de página

**Ejemplos de uso:**
```
GET /api/users
GET /api/users?search=juan
GET /api/users?role=admin
GET /api/users?per_page=20&page=2
```

**Response (200):**
```json
{
    "current_page": 1,
    "data": [
        {
            "id": 1,
            "name": "Juan Pérez",
            "username": "juanperez",
            "email": "juan.perez@energy4cero.com",
            "phone": "+573001234567",
            "job_title": "Desarrollador",
            "profile_photo": "http://localhost:8000/storage/profile-photos/photo.jpg",
            "email_verified_at": null,
            "created_at": "2024-01-15T10:30:00.000000Z",
            "updated_at": "2024-01-15T10:30:00.000000Z",
            "roles": [
                {
                    "id": 1,
                    "name": "admin",
                    "pivot": {
                        "user_id": 1,
                        "role_id": 1,
                        "created_at": "2024-01-15T10:30:00.000000Z",
                        "updated_at": "2024-01-15T10:30:00.000000Z"
                    }
                }
            ]
        }
    ],
    "first_page_url": "http://localhost:8000/api/users?page=1",
    "from": 1,
    "last_page": 1,
    "last_page_url": "http://localhost:8000/api/users?page=1",
    "links": [
        {
            "url": null,
            "label": "&laquo; Previous",
            "active": false
        },
        {
            "url": "http://localhost:8000/api/users?page=1",
            "label": "1",
            "active": true
        },
        {
            "url": null,
            "label": "Next &raquo;",
            "active": false
        }
    ],
    "next_page_url": null,
    "path": "http://localhost:8000/api/users",
    "per_page": 15,
    "prev_page_url": null,
    "to": 1,
    "total": 1
}
```

### POST /api/users
**Crear usuario (Solo Administradores)**

**Permisos requeridos:** Rol de Administrador

**Request Body:**
```json
{
    "name": "María García",
    "username": "mariagarcia",
    "email": "maria.garcia@energy4cero.com",
    "password": "password123",
    "phone": "+573007654321",
    "job_title": "Vendedora",
    "role": "comercial"
}
```

**Response (201):**
```json
{
    "message": "Usuario creado exitosamente con rol asignado",
    "user": {
        "id": 2,
        "name": "María García",
        "username": "mariagarcia",
        "email": "maria.garcia@energy4cero.com",
        "phone": "+573007654321",
        "job_title": "Vendedora",
        "profile_photo": null,
        "email_verified_at": null,
        "created_at": "2024-01-15T10:30:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z",
        "roles": [
            {
                "id": 2,
                "name": "comercial",
                "display_name": "Comercial",
                "pivot": {
                    "user_id": 2,
                    "role_id": 2,
                    "created_at": "2024-01-15T10:30:00.000000Z",
                    "updated_at": "2024-01-15T10:30:00.000000Z"
                }
            }
        ]
    }
}
```

**Response (403) - Sin permisos:**
```json
{
    "message": "No tienes permisos para crear usuarios. Solo los administradores pueden crear usuarios."
}
```

### GET /api/users/{id}
**Obtener usuario específico**

**Response (200):**
```json
{
    "user": {
        "id": 1,
        "name": "Juan Pérez",
        "username": "juanperez",
        "email": "juan.perez@energy4cero.com",
        "phone": "+573001234567",
        "job_title": "Desarrollador",
        "profile_photo": "http://localhost:8000/storage/profile-photos/photo.jpg",
        "email_verified_at": null,
        "created_at": "2024-01-15T10:30:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z",
        "roles": [
            {
                "id": 1,
                "name": "admin",
                "permissions": [
                    {
                        "id": 1,
                        "name": "create_users"
                    }
                ]
            }
        ]
    }
}
```

### PUT /api/users/{id}
**Actualizar usuario (Solo Administradores)**

**Permisos requeridos:** Rol de Administrador

**Request Body:**
```json
{
    "name": "Juan Carlos Pérez",
    "username": "juancarlos",
    "email": "juan.carlos@energy4cero.com",
    "password": "newpassword123",
    "phone": "+573001234568",
    "job_title": "Gerente",
    "role": "administrador"
}
```

**Response (200):**
```json
{
    "message": "Usuario actualizado exitosamente",
    "user": {
        "id": 1,
        "name": "Juan Carlos Pérez",
        "username": "juancarlos",
        "email": "juan.carlos@energy4cero.com",
        "phone": "+573001234568",
        "job_title": "Gerente",
        "profile_photo": "http://localhost:8000/storage/profile-photos/photo.jpg",
        "email_verified_at": null,
        "created_at": "2024-01-15T10:30:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z",
        "roles": [
            {
                "id": 1,
                "name": "administrador",
                "display_name": "Administrador",
                "pivot": {
                    "user_id": 1,
                    "role_id": 1,
                    "created_at": "2024-01-15T10:30:00.000000Z",
                    "updated_at": "2024-01-15T10:30:00.000000Z"
                }
            }
        ]
    }
}
```

**Response (403) - Sin permisos:**
```json
{
    "message": "No tienes permisos para actualizar usuarios. Solo los administradores pueden actualizar usuarios."
}
```

### DELETE /api/users/{id}
**Eliminar usuario (Solo Administradores)**

**Permisos requeridos:** Rol de Administrador

**Response (200):**
```json
{
    "message": "Usuario eliminado exitosamente"
}
```

**Response (403) - Sin permisos:**
```json
{
    "message": "No tienes permisos para eliminar usuarios. Solo los administradores pueden eliminar usuarios."
}
```

**Response (400) - Intentar eliminar propia cuenta:**
```json
{
    "message": "No puedes eliminar tu propia cuenta."
}
```

### GET /api/users/me/id
**Obtener ID del usuario autenticado**

**Response (200):**
```json
{
    "success": true,
    "user_id": 1
}
```

### POST /api/users/{id}/profile-photo
**Subir foto de perfil**

**Request Body (FormData):**
```
profile_photo: [archivo de imagen]
```

**Response (200):**
```json
{
    "message": "Foto de perfil subida exitosamente",
    "profile_photo_url": "http://localhost:8000/storage/profile-photos/1234567890_1.jpg"
}
```

---

## 4. Gestión de Roles (Protegidos)

### POST /api/users/{id}/roles
**Asignar rol a usuario**

**Request Body:**
```json
{
    "role": "admin"
}
```

**Response (200):**
```json
{
    "message": "Rol asignado exitosamente",
    "user": {
        "id": 1,
        "name": "Juan Pérez",
        "username": "juanperez",
        "email": "juan.perez@energy4cero.com",
        "roles": [
            {
                "id": 1,
                "name": "admin",
                "pivot": {
                    "user_id": 1,
                    "role_id": 1,
                    "created_at": "2024-01-15T10:30:00.000000Z",
                    "updated_at": "2024-01-15T10:30:00.000000Z"
                }
            }
        ]
    }
}
```

### DELETE /api/users/{id}/roles/{role}
**Quitar rol de usuario**

**Response (200):**
```json
{
    "message": "Rol removido exitosamente",
    "user": {
        "id": 1,
        "name": "Juan Pérez",
        "username": "juanperez",
        "email": "juan.perez@energy4cero.com",
        "roles": []
    }
}
```

---

## 5. Roles Disponibles

### Roles del Sistema
```json
[
    {
        "id": 1,
        "name": "administrador",
        "display_name": "Administrador",
        "description": "Rol con acceso completo al sistema, puede gestionar usuarios, roles y configuraciones."
    },
    {
        "id": 2,
        "name": "comercial",
        "display_name": "Comercial",
        "description": "Rol para personal comercial, puede gestionar clientes, cotizaciones y ventas."
    },
    {
        "id": 3,
        "name": "tecnico",
        "display_name": "Técnico",
        "description": "Rol para personal técnico, puede gestionar proyectos, instalaciones y mantenimientos."
    }
]
```

### Permisos por Rol
- **Administrador**: Acceso completo al sistema
- **Comercial**: Gestión de clientes, cotizaciones, ventas
- **Técnico**: Gestión de proyectos, instalaciones, mantenimientos

## 6. Estructura de Datos

### Campos del Usuario
```json
{
    "id": 1,
    "name": "string",
    "username": "string (único)",
    "email": "string (único, dominio @energy4cero.com)",
    "phone": "string (opcional)",
    "job_title": "string (opcional)",
    "profile_photo": "string (URL, opcional)",
    "email_verified_at": "datetime (opcional)",
    "created_at": "datetime",
    "updated_at": "datetime"
}
```

### Campos de Rol
```json
{
    "id": 1,
    "name": "string",
    "permissions": [
        {
            "id": 1,
            "name": "string"
        }
    ],
    "pivot": {
        "user_id": 1,
        "role_id": 1,
        "created_at": "datetime",
        "updated_at": "datetime"
    }
}
```

---

## 7. Códigos de Estado HTTP

- **200** - OK (Operación exitosa)
- **201** - Created (Recurso creado)
- **400** - Bad Request (Datos inválidos)
- **401** - Unauthorized (No autenticado)
- **403** - Forbidden (Sin permisos)
- **404** - Not Found (Recurso no encontrado)
- **422** - Unprocessable Entity (Validación fallida)
- **500** - Internal Server Error (Error del servidor)

---

## 8. Respuestas de Error

### Error de Validación (422)
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "email": [
            "The email field is required."
        ],
        "username": [
            "The username has already been taken."
        ],
        "password": [
            "The password must be at least 8 characters."
        ]
    }
}
```

### Error de Autenticación (401)
```json
{
    "message": "Unauthenticated."
}
```

### Error de Permisos (403)
```json
{
    "message": "Access denied. Insufficient permissions."
}
```

### Error de Recurso No Encontrado (404)
```json
{
    "message": "User not found."
}
```

### Error de Dominio de Email (500)
```json
{
    "message": "Solo se permiten correos con dominio @energy4cero.com"
}
```

---

## 9. Ejemplos de Uso Frontend

### JavaScript con Fetch
```javascript
const API_BASE_URL = 'http://localhost:8000/api';
const token = localStorage.getItem('token');

// Headers para peticiones autenticadas
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
};

// Ejemplo: Obtener usuarios
const getUsers = async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
        method: 'GET',
        headers: headers
    });
    return response.json();
};

// Ejemplo: Crear usuario
const createUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(userData)
    });
    return response.json();
};

// Ejemplo: Subir foto de perfil
const uploadProfilePhoto = async (userId, file) => {
    const formData = new FormData();
    formData.append('profile_photo', file);

    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-photo`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        },
        body: formData
    });
    return response.json();
};
```

### Axios
```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para agregar token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Ejemplo de uso
const userService = {
    getUsers: (filters) => api.get('/users', { params: filters }),
    createUser: (userData) => api.post('/users', userData),
    updateUser: (id, userData) => api.put(`/users/${id}`, userData),
    deleteUser: (id) => api.delete(`/users/${id}`),
    getCurrentUser: () => api.get('/users/me'),
    uploadProfilePhoto: (id, file) => {
        const formData = new FormData();
        formData.append('profile_photo', file);
        return api.post(`/users/${id}/profile-photo`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
};
```
