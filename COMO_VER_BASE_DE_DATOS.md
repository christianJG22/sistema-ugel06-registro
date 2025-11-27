# 🗄️ Cómo Ver la Base de Datos SQLite

Tienes **3 opciones** para visualizar y administrar la base de datos del sistema UGEL 06.

---

## ✅ Opción 1: Visualizador Web Integrado (RECOMENDADO - LA MÁS FÁCIL)

He agregado un visualizador web directamente en tu servidor backend.

### 📍 Cómo acceder:

1. Asegúrate de que el servidor backend esté corriendo:
   ```bash
   cd backend
   node server.js
   ```

2. Abre tu navegador web y ve a:
   ```
   http://localhost:5000/db-viewer
   ```

### ✨ Características:
- ✅ Visualización en tiempo real de todas las tablas
- ✅ Interfaz bonita y fácil de usar
- ✅ Muestra estadísticas de la base de datos
- ✅ Botón de actualización para ver cambios en vivo
- ✅ No requiere instalar nada adicional
- ✅ Muestra fecha y hora de registros

### 📊 Qué verás:
- Tabla **Instituciones** con todos los registros
- Tabla **Usuarios** (administradores)
- Estadísticas: número de registros, tipos de situación, etc.

---

## 🔧 Opción 2: DB Browser for SQLite (INTERFAZ GRÁFICA PROFESIONAL)

Programa gratuito con interfaz completa para administrar bases de datos SQLite.

### 📥 Descargar e Instalar:

1. Ve a: https://sqlitebrowser.org/dl/
2. Descarga "DB Browser for SQLite" para Windows
3. Instala el programa

### 🗂️ Abrir la Base de Datos:

1. Abre DB Browser for SQLite
2. Click en "Abrir base de datos" (Open Database)
3. Navega a:
   ```
   c:\Users\CHRISTIAN\Desktop\sistema-registro-ie\backend\ugel06.db
   ```
4. Selecciona el archivo `ugel06.db`

### ✨ Características:
- ✅ Ver y editar datos directamente
- ✅ Ejecutar consultas SQL personalizadas
- ✅ Exportar datos a CSV, JSON, XML, etc.
- ✅ Ver estructura de tablas
- ✅ Crear índices y vistas
- ✅ Hacer backups de la base de datos

---

## 💻 Opción 3: Extensión de VS Code (PARA DESARROLLADORES)

Si usas Visual Studio Code, puedes instalar una extensión para ver la base de datos.

### 📥 Instalar Extensión:

1. Abre VS Code
2. Ve a la pestaña de Extensiones (Ctrl+Shift+X)
3. Busca: **"SQLite Viewer"** o **"SQLite"**
4. Instala "SQLite Viewer" de alexcvzz

### 🗂️ Ver la Base de Datos:

1. En VS Code, abre el explorador de archivos
2. Navega a: `backend\ugel06.db`
3. Click derecho en el archivo → "Open with SQLite Viewer"

### ✨ Características:
- ✅ Ver datos sin salir de VS Code
- ✅ Ejecutar consultas SQL
- ✅ Ver estructura de tablas
- ✅ Integrado con tu editor

---

## 🎯 Opción 4: Línea de Comandos (AVANZADO)

Si prefieres usar la terminal, puedes instalar SQLite3 CLI.

### 📥 Instalar SQLite3:

**Windows:**
1. Descarga de: https://www.sqlite.org/download.html
2. Busca: "sqlite-tools-win32-x86-*.zip"
3. Extrae el archivo `sqlite3.exe`
4. Muévelo a una carpeta en tu PATH o usa la ruta completa

### 💻 Comandos útiles:

```bash
# Abrir la base de datos
cd c:\Users\CHRISTIAN\Desktop\sistema-registro-ie\backend
sqlite3 ugel06.db

# Ver todas las tablas
.tables

# Ver estructura de una tabla
.schema instituciones

# Ver todos los datos de instituciones
SELECT * FROM instituciones;

# Ver todos los usuarios
SELECT * FROM usuarios;

# Contar registros
SELECT COUNT(*) FROM instituciones;

# Salir
.quit
```

---

## 📋 Resumen de Opciones

| Opción | Dificultad | Ventajas | Cuándo usarla |
|--------|-----------|----------|---------------|
| **Visualizador Web** | ⭐ Muy Fácil | No requiere instalación, interfaz bonita | Para ver datos rápidamente |
| **DB Browser** | ⭐⭐ Fácil | Completo, permite editar | Para administración completa |
| **VS Code Extension** | ⭐⭐ Fácil | Integrado con editor | Si ya usas VS Code |
| **Línea de Comandos** | ⭐⭐⭐ Avanzado | Scripting, automatización | Para usuarios técnicos |

---

## 🎯 MI RECOMENDACIÓN

**Para empezar:** Usa la **Opción 1 (Visualizador Web)** que ya está incluida en tu servidor.

Solo abre tu navegador y ve a:
```
http://localhost:5000/db-viewer
```

**Para administración completa:** Descarga **DB Browser for SQLite** (Opción 2).

---

## 📝 Ubicación del Archivo de Base de Datos

Tu base de datos SQLite está en:
```
c:\Users\CHRISTIAN\Desktop\sistema-registro-ie\backend\ugel06.db
```

Este es un archivo único que contiene TODOS los datos:
- Todas las instituciones registradas
- Todos los usuarios administradores
- Fechas de registro
- Estructura de tablas

### ⚠️ IMPORTANTE: Hacer Backups

Para hacer un backup de tu base de datos:
```bash
# Simplemente copia el archivo ugel06.db a otro lugar
copy ugel06.db ugel06_backup_2024-11-26.db
```

O en PowerShell:
```powershell
Copy-Item ugel06.db ugel06_backup_$(Get-Date -Format 'yyyy-MM-dd').db
```

---

## 🔍 Estructura de las Tablas

### Tabla: `instituciones`
```sql
- id (INTEGER, PRIMARY KEY)
- nombreIE (TEXT)
- nombreDirector (TEXT)
- dniDirector (TEXT, UNIQUE)
- situacion (TEXT)
- aula (TEXT)
- telefono (TEXT)
- correo (TEXT)
- fechaRegistro (DATETIME)
```

### Tabla: `usuarios`
```sql
- id (INTEGER, PRIMARY KEY)
- usuario (TEXT, UNIQUE)
- password (TEXT, encriptado)
- rol (TEXT)
- fechaCreacion (DATETIME)
```

---

## ❓ Preguntas Frecuentes

### ¿Los datos se guardan permanentemente?
✅ Sí, SQLite guarda todo en el archivo `ugel06.db`. Los datos permanecen incluso si apagas la computadora.

### ¿Puedo editar datos directamente en la base de datos?
✅ Sí, con DB Browser (Opción 2) puedes editar, agregar o eliminar registros directamente.

### ¿Qué pasa si borro el archivo ugel06.db?
⚠️ Se perderán TODOS los datos. El servidor creará una nueva base de datos vacía al reiniciar.

### ¿Puedo exportar los datos?
✅ Sí, tres formas:
1. Usar el botón "Exportar a Excel" en la aplicación web (como admin)
2. Usar DB Browser → File → Export → Table to CSV
3. Copiar el archivo ugel06.db completo

---

## 🎓 Ejemplo de Uso Práctico

1. **Ver datos rápido:**
   - Abrir http://localhost:5000/db-viewer
   - Ver todas las instituciones y usuarios

2. **Administrar datos:**
   - Abrir DB Browser
   - Cargar ugel06.db
   - Editar/eliminar/agregar datos
   - Guardar cambios

3. **Hacer backup antes de cambios importantes:**
   ```bash
   copy ugel06.db ugel06_backup.db
   ```

---

🎉 **¡Listo! Ahora puedes visualizar tu base de datos de múltiples formas.**

Para cualquier duda, todos los datos están en:
`c:\Users\CHRISTIAN\Desktop\sistema-registro-ie\backend\ugel06.db`
