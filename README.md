# Sistema de Gestión Solar - React

Este proyecto es un sistema web desarrollado en React para la gestión integral de clientes, cotizaciones y equipos en empresas del sector solar fotovoltaico.

## Funcionalidades principales

- **Autenticación de usuarios** con control de acceso basado en roles (admin, comercial, técnico, bodeguero).
- **Gestión de clientes**: registro, edición y consulta de clientes.
- **Cotizaciones**: creación, edición, eliminación, descarga en PDF y visualización de propuestas comerciales.
- **Gestión de equipos**: paneles solares, inversores y baterías.
- **Usuarios**: administración de usuarios y asignación de roles.
- **Agente IA**: sección para interacción con un agente inteligente (chatbot).
- **Panel de control**: dashboard con indicadores y acceso rápido a las principales funciones.

## Sistema de autenticación y roles

El sistema utiliza autenticación JWT. Al iniciar sesión, el backend responde con un token y un objeto `usuario` que incluye el campo `rol` (numérico). El frontend mapea este valor a un string para controlar el acceso a las diferentes secciones:

- `1`: admin
- `2`: comercial
- `3`: tecnico
- `4`: bodeguero

Esto permite mostrar u ocultar menús y restringir el acceso a rutas según el rol del usuario.

## Instalación y ejecución

1. Clona el repositorio y entra a la carpeta del proyecto.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```
4. Accede a la aplicación en [http://localhost:3001](http://localhost:3001) (o el puerto configurado).

## Configuración
- El backend debe estar corriendo y accesible en `http://localhost:3000` (o ajusta las URLs en los servicios del frontend).
- El sistema requiere un backend compatible con los endpoints utilizados (clientes, cotizaciones, login, etc.).

## Tecnologías principales
- React
- Tailwind CSS
- React Router
- Context API (para autenticación)

## Licencia
Este proyecto está bajo la licencia MIT.