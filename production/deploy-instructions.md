# 🚀 Instrucciones de Despliegue - Energy4Cero Dashboard

## 📋 **Problema Resuelto: Error 404 al Recargar Página**

### **¿Por qué ocurre el error 404?**
- React Router maneja la navegación del lado del cliente
- Al recargar la página, el servidor busca el archivo físico
- Si no existe, devuelve error 404
- **Solución**: Configurar el servidor para redirigir todas las rutas a `index.html`

---

## 🔧 **Configuración del Servidor**

### **Para Nginx:**
1. **Copiar** `nginx.conf` a `/etc/nginx/sites-available/`
2. **Crear enlace simbólico**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/nginx.conf /etc/nginx/sites-enabled/
   ```
3. **Reiniciar nginx**:
   ```bash
   sudo systemctl restart nginx
   ```

### **Para Apache:**
1. **Copiar** `.htaccess` a la carpeta raíz del sitio web
2. **Asegurar** que `mod_rewrite` esté habilitado:
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```

---

## 📁 **Estructura de Archivos**

```
/var/www/html/  (o tu directorio web)
├── index.html
├── static/
│   ├── css/
│   ├── js/
│   └── media/
├── manifest.json
├── robots.txt
└── .htaccess  (para Apache)
```

---

## ✅ **Verificación**

### **Pruebas a realizar:**
1. **Navegación normal**: ✅ Debe funcionar
2. **Recarga de página (F5)**: ✅ Debe funcionar
3. **URL directa**: ✅ Debe funcionar
4. **Navegación con botones del navegador**: ✅ Debe funcionar

### **URLs de prueba:**
- `https://tu-dominio.com/` ✅
- `https://tu-dominio.com/admin/dashboard` ✅
- `https://tu-dominio.com/admin/contabilidad` ✅
- `https://tu-dominio.com/admin/proyectos` ✅

---

## 🚨 **Solución Rápida**

### **Si ya tienes el sitio desplegado:**

1. **Para Nginx**:
   ```bash
   # Editar configuración
   sudo nano /etc/nginx/sites-available/tu-sitio
   
   # Agregar esta línea dentro del bloque location /:
   try_files $uri $uri/ /index.html;
   
   # Reiniciar
   sudo systemctl restart nginx
   ```

2. **Para Apache**:
   ```bash
   # Crear/editar .htaccess en la raíz del sitio
   echo "RewriteEngine On" > .htaccess
   echo "RewriteCond %{REQUEST_FILENAME} !-f" >> .htaccess
   echo "RewriteCond %{REQUEST_FILENAME} !-d" >> .htaccess
   echo "RewriteRule . /index.html [L]" >> .htaccess
   ```

---

## 📞 **Soporte**

Si necesitas ayuda adicional, verifica:
- ✅ Archivos de configuración copiados correctamente
- ✅ Servidor web reiniciado
- ✅ Permisos de archivos correctos
- ✅ Logs del servidor para errores adicionales
