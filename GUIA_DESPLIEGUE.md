# 🚀 Guía de Despliegue a Producción

## ⚠️ IMPORTANTE: Arquitectura Actual vs Producción

### 🏠 Desarrollo Local (Actual)
```
Frontend (React) → http://localhost:3000
Backend (Node.js) → http://localhost:5000
Base de Datos → ugel06.db (archivo local)
```

### ☁️ Producción (Cloud)
```
Frontend → Vercel (gratis)
Backend → Render/Railway (gratis)
Base de Datos → PostgreSQL/MongoDB (gratis)
```

---

## 📋 Plan de Despliegue Completo

### Paso 1: Frontend en Vercel ✅
### Paso 2: Backend en Render o Railway ✅
### Paso 3: Migrar de SQLite a PostgreSQL ✅

---

## 🎯 OPCIÓN RECOMENDADA (100% GRATIS)

### Frontend → Vercel
### Backend → Render
### Base de Datos → PostgreSQL (incluido en Render)

---

# 📦 Paso 1: Preparar el Proyecto

## 1.1 Verificar .gitignore del Backend

El archivo `.gitignore` del backend ya está bien configurado:
```
node_modules/
*.db          # ← IMPORTANTE: No subir base de datos local
.env
*.log
```

## 1.2 Verificar .gitignore del Frontend

Crear/verificar `.gitignore` en `mi-sistema/`:
```
# Dependencias
node_modules/

# Build
build/
dist/

# Varios
.DS_Store
.env.local
.env

# Logs
npm-debug.log*
```

---

# 🌐 Paso 2: Desplegar Frontend en Vercel

## 2.1 Preparar el Frontend

1. **Actualizar la URL del backend** para producción:

Crear archivo `mi-sistema/.env.production`:
```env
REACT_APP_API_URL=https://tu-backend.onrender.com/api
```

Crear archivo `mi-sistema/.env.development`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

2. **Modificar App.js** para usar variable de entorno:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## 2.2 Desplegar en Vercel

### Opción A: Desde la Web (Más Fácil)

1. Ve a https://vercel.com
2. Crea cuenta / Inicia sesión con GitHub
3. Click en "Add New Project"
4. Importa tu repositorio de GitHub
5. Configura:
   - **Root Directory:** `mi-sistema`
   - **Framework Preset:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
6. Click "Deploy"

### Opción B: Desde la Terminal

```bash
# Instalar Vercel CLI
npm install -g vercel

# Ir al directorio del frontend
cd mi-sistema

# Desplegar
vercel --prod
```

---

# 🖥️ Paso 3: Desplegar Backend en Render

## 3.1 ¿Por qué Render?
- ✅ 100% Gratis
- ✅ PostgreSQL incluido gratis
- ✅ Fácil de usar
- ✅ No requiere tarjeta de crédito

## 3.2 Migrar de SQLite a PostgreSQL

Primero necesitamos cambiar el backend para usar PostgreSQL en lugar de SQLite.

### Instalar dependencia PostgreSQL:
```bash
cd backend
npm install pg
```

### Crear nuevo archivo: `backend/database-postgres.js`

```javascript
const { Pool } = require('pg');

// Configuración de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Crear tablas
const inicializarDB = async () => {
  try {
    // Tabla instituciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS instituciones (
        id SERIAL PRIMARY KEY,
        "nombreIE" TEXT NOT NULL,
        "nombreDirector" TEXT NOT NULL,
        "dniDirector" TEXT NOT NULL UNIQUE,
        situacion TEXT NOT NULL,
        aula TEXT NOT NULL,
        telefono TEXT NOT NULL,
        correo TEXT NOT NULL,
        "fechaRegistro" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        usuario TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        rol TEXT DEFAULT 'admin',
        "fechaCreacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear usuario admin por defecto
    const bcrypt = require('bcryptjs');
    const hashedPassword = bcrypt.hashSync('ugel06admin', 10);
    
    await pool.query(`
      INSERT INTO usuarios (usuario, password, rol) 
      VALUES ($1, $2, $3)
      ON CONFLICT (usuario) DO NOTHING
    `, ['admin', hashedPassword, 'admin']);

    console.log('✓ Base de datos PostgreSQL inicializada');
  } catch (error) {
    console.error('Error al inicializar DB:', error);
  }
};

// Funciones CRUD adaptadas para PostgreSQL
const obtenerInstituciones = async () => {
  const result = await pool.query('SELECT * FROM instituciones ORDER BY "fechaRegistro" DESC');
  return result.rows;
};

const crearInstitucion = async (data) => {
  const { nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo } = data;
  const result = await pool.query(
    `INSERT INTO instituciones ("nombreIE", "nombreDirector", "dniDirector", situacion, aula, telefono, correo) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo]
  );
  return result.rows[0].id;
};

const actualizarInstitucion = async (id, data) => {
  const { nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo } = data;
  const result = await pool.query(
    `UPDATE instituciones 
     SET "nombreIE" = $1, "nombreDirector" = $2, "dniDirector" = $3, situacion = $4, 
         aula = $5, telefono = $6, correo = $7
     WHERE id = $8`,
    [nombreIE, nombreDirector, dniDirector, situacion, aula, telefono, correo, id]
  );
  return result.rowCount;
};

const eliminarInstitucion = async (id) => {
  const result = await pool.query('DELETE FROM instituciones WHERE id = $1', [id]);
  return result.rowCount;
};

const verificarDniExiste = async (dni, idExcluir) => {
  let query = 'SELECT id FROM instituciones WHERE "dniDirector" = $1';
  let params = [dni];
  
  if (idExcluir) {
    query += ' AND id != $2';
    params.push(idExcluir);
  }
  
  const result = await pool.query(query, params);
  return result.rows.length > 0;
};

const obtenerUsuarioPorNombre = async (usuario) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
  return result.rows[0];
};

module.exports = {
  pool,
  inicializarDB,
  obtenerInstituciones,
  crearInstitucion,
  actualizarInstitucion,
  eliminarInstitucion,
  verificarDniExiste,
  obtenerUsuarioPorNombre
};
```

### Crear archivo de configuración para Render

Crear `backend/render.yaml`:
```yaml
services:
  - type: web
    name: ugel06-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: ugel06-db
          property: connectionString

databases:
  - name: ugel06-db
    plan: free
    databaseName: ugel06
    user: ugel06_user
```

## 3.3 Desplegar en Render

1. Ve a https://render.com
2. Crea cuenta / Inicia sesión con GitHub
3. Click en "New +"
4. Selecciona "Web Service"
5. Conecta tu repositorio
6. Configura:
   - **Name:** ugel06-backend
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
7. Click en "Advanced"
8. Agrega variable de entorno:
   - `NODE_ENV` = `production`
9. En "Add Database": Selecciona "PostgreSQL"
10. Click "Create Web Service"

---

# 🔄 Paso 4: Conectar Frontend con Backend

Una vez desplegado el backend, obtendrás una URL como:
```
https://ugel06-backend.onrender.com
```

Actualiza en Vercel la variable de entorno:
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://ugel06-backend.onrender.com/api`
4. Redeploy el frontend

---

# 📊 Migración de Datos

Si ya tienes datos en SQLite local, puedes exportarlos e importarlos:

## Exportar desde SQLite:
```bash
# En el visualizador web: http://localhost:5000/db-viewer
# Usa el botón "Exportar a Excel"
```

## Importar a PostgreSQL:
Una vez desplegado el backend, usa el botón "Importar desde Excel" como admin.

---

# 🎯 RESUMEN: URLs Finales

```
Frontend:  https://tu-proyecto.vercel.app
Backend:   https://ugel06-backend.onrender.com
DB Admin:  https://ugel06-backend.onrender.com/db-viewer
API:       https://ugel06-backend.onrender.com/api
```

---

# ⚡ ALTERNATIVAS MÁS SIMPLES

## Opción 2: Todo en Render (Más Simple)

Si quieres algo más simple, puedes poner TODO en Render:

### Frontend en Render:
- Tipo: Static Site
- Build Command: `cd mi-sistema && npm install && npm run build`
- Publish Directory: `mi-sistema/build`

### Backend en Render:
- Tipo: Web Service (como antes)

**Ventaja:** Todo en un solo sitio
**Desventaja:** Frontend en Vercel es más rápido

---

## Opción 3: Railway (Alternativa a Render)

Railway es similar a Render:
1. Ve a https://railway.app
2. Conecta GitHub
3. Deploy backend con PostgreSQL incluido
4. Configuración automática

---

# 🚨 IMPORTANTE: Cambios en git

## Backend .gitignore YA está correcto:
```
node_modules/
*.db          # ← La base de datos NO se sube
.env
*.log
```

## Cuando hagas git push:
```bash
git add .
git commit -m "Sistema listo para producción"
git push origin main
```

**Se subirá:**
- ✅ Código del frontend
- ✅ Código del backend
- ✅ Configuraciones

**NO se subirá:**
- ❌ Base de datos local (ugel06.db)
- ❌ node_modules
- ❌ Variables de entorno sensibles

---

# 📝 Próximos Pasos Recomendados

1. **Ahora mismo:** Sube tu código a GitHub
   ```bash
   git add .
   git commit -m "Sistema completo con backend y frontend"
   git push origin main
   ```

2. **Desplegar Frontend:** Vercel (5 minutos)

3. **Desplegar Backend:** Render (10 minutos)

4. **Conectar:** Actualizar variable de entorno en Vercel

5. **Migrar Datos:** Exportar de SQLite e importar a PostgreSQL

---

# ❓ Preguntas Frecuentes

### ¿Los datos se perderán?
❌ NO con PostgreSQL en Render
✅ SÍ si usas SQLite en Vercel

### ¿Es realmente gratis?
✅ Sí, completamente:
- Vercel: Gratis para proyectos personales
- Render: Gratis con 750 horas/mes (suficiente)
- PostgreSQL: Gratis en Render

### ¿Qué pasa con los datos locales?
Los datos en tu computadora (ugel06.db) permanecen intactos.
Puedes exportarlos e importarlos a la nube.

### ¿Necesito cambiar mucho código?
Frontend: Solo la URL del API (variable de entorno)
Backend: Cambiar de SQLite a PostgreSQL (archivo nuevo)

---

# 🎓 ¿Necesitas Ayuda?

Dime qué opción prefieres y te ayudo a implementarla paso a paso:

1. **Opción Simple:** Todo en Render
2. **Opción Óptima:** Frontend en Vercel + Backend en Render
3. **Opción Alternativa:** Railway

¿Cuál prefieres? Te ayudo a configurarlo ahora mismo.
