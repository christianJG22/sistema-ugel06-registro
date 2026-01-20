# 🚀 Migración a Supabase - Guía Completa

## ✅ Por Qué Supabase

- ✅ **100% GRATIS PERMANENTEMENTE**
- ✅ PostgreSQL de 500MB (suficiente para ~50,000 registros)
- ✅ No se duerme NUNCA
- ✅ API automática
- ✅ Base de datos en la nube
- ✅ Panel de administración incluido

---

## 📋 PASO 1: Crear Cuenta en Supabase

1. Ve a: **https://supabase.com**
2. Click en **"Start your project"**
3. **Sign up with GitHub**
4. Autoriza Supabase

---

## 📋 PASO 2: Crear Proyecto

1. Click en **"New Project"**
2. Configuración:
   - **Name:** `ugel06-registro`
   - **Database Password:** Genera una contraseña segura (guárdala)
   - **Region:** South America (São Paulo) - más cercano a Perú
   - **Pricing Plan:** Free
3. Click **"Create new project"**
4. Espera 2-3 minutos mientras se crea

---

## 📋 PASO 3: Crear Tablas en Supabase

1. En tu proyecto → **"Table Editor"** (menú izquierda)
2. Click **"Create a new table"**

### Tabla 1: instituciones

Click en **"New Table"** y copia esta SQL:

```sql
CREATE TABLE instituciones (
  id BIGSERIAL PRIMARY KEY,
  "nombreIE" TEXT NOT NULL,
  "nombreDirector" TEXT NOT NULL,
  "dniDirector" TEXT NOT NULL UNIQUE,
  situacion TEXT NOT NULL,
  aula TEXT NOT NULL,
  telefono TEXT NOT NULL,
  correo TEXT NOT NULL,
  "fechaRegistro" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Para ejecutarla:
- Ve a **"SQL Editor"** (menú izquierda)
- Pega el código
- Click **"Run"**

### Tabla 2: usuarios

En el mismo SQL Editor, ejecuta:

```sql
CREATE TABLE usuarios (
  id BIGSERIAL PRIMARY KEY,
  usuario TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  rol TEXT DEFAULT 'admin',
  "fechaCreacion" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear usuario admin (la contraseña ya está hasheada por bcrypt)
INSERT INTO usuarios (usuario, password, rol)
VALUES ('admin', '$2a$10$ejemplo...', 'admin');
```

⚠️ **IMPORTANTE:** Necesitarás hashear la contraseña `ugel06admin` primero.

---

## 📋 PASO 4: Obtener Connection String

1. En Supabase → **"Settings"** (menú izquierda)
2. **"Database"**
3. Busca **"Connection string"**
4. Selecciona **"URI"**
5. Copia la URL completa
6. Se ve así:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
7. Reemplaza `[YOUR-PASSWORD]` con la contraseña que generaste en el Paso 2

---

## 📋 PASO 5: Actualizar Backend

### 5.1 Actualizar `database-postgres.js`

El archivo ya está listo, solo necesita la nueva URL.

### 5.2 Crear archivo `.env` para desarrollo

Crea `backend/.env`:
```env
DATABASE_URL=postgresql://postgres:TU-PASSWORD@db.xxxxx.supabase.co:5432/postgres
NODE_ENV=development
```

### 5.3 Actualizar `.gitignore`

En `backend/.gitignore`, asegúrate de tener:
```
.env
*.db
node_modules/
```

---

## 📋 PASO 6: Crear Usuario Admin con Contraseña Hasheada

Ejecuta esto en PowerShell para generar el hash:

```powershell
cd backend
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('ugel06admin', 10));"
```

Copia el resultado y úsalo en el INSERT del Paso 3.

---

## 📋 PASO 7: Desplegar Backend en Vercel

### 7.1 Adaptar Backend para Serverless

Crea `backend/api/index.js`:

```javascript
const app = require('../server');

module.exports = app;
```

### 7.2 Modificar `server.js`

Al final del archivo, cambia:

```javascript
// Solo iniciar servidor si no es Vercel
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
  });
}

// Exportar app para Vercel
module.exports = app;
```

### 7.3 Crear `vercel.json` en la raíz del proyecto

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "mi-sistema/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "mi-sistema/$1"
    }
  ]
}
```

### 7.4 Desplegar en Vercel

1. Ve a: **https://vercel.com**
2. **Sign up with GitHub**
3. **Import Project**
4. Selecciona tu repositorio: `sistema-ugel06`
5. **Framework Preset:** Other
6. **Root Directory:** (dejar en blanco)
7. **Environment Variables:**
   ```
   DATABASE_URL = (tu connection string de Supabase)
   NODE_ENV = production
   ```
8. Click **"Deploy"**

---

## 📋 PASO 8: Configurar Frontend

### 8.1 Actualizar Variable de Entorno

En Vercel, en tu proyecto frontend:
- Settings → Environment Variables
- Agregar:
  ```
  REACT_APP_API_URL = https://tu-proyecto.vercel.app/api
  ```

### 8.2 Redeploy

- Click en "Deployments"
- Click en el último deployment
- Click "Redeploy"

---

## 🎉 PASO 9: ¡Listo! URLs Finales

```
Frontend (LINK PÚBLICO): https://tu-proyecto.vercel.app
Backend API: https://tu-proyecto.vercel.app/api
Base de Datos: Supabase Dashboard
```

---

## 📊 Ventajas de Esta Configuración

| Característica | Railway | Supabase + Vercel |
|----------------|---------|-------------------|
| **Costo** | $5/mes (30 días) | **GRATIS SIEMPRE** |
| **Base de Datos** | 1GB | 500MB (suficiente) |
| **Se duerme** | No | **NUNCA** |
| **Límites** | 500 horas/mes | **Ilimitado** |
| **Velocidad** | Media | **Muy rápida** |

---

## 🔧 Probar Localmente Primero

Antes de desplegar, prueba localmente:

```powershell
# Backend
cd backend
npm install
node server.js

# Frontend (otra terminal)
cd mi-sistema
npm start
```

Verifica que se conecte a Supabase correctamente.

---

## 📝 Checklist

- [ ] Cuenta Supabase creada
- [ ] Proyecto Supabase creado
- [ ] Tablas creadas
- [ ] Usuario admin insertado
- [ ] Connection string copiada
- [ ] Backend actualizado
- [ ] Probado localmente
- [ ] Backend desplegado en Vercel
- [ ] Frontend desplegado en Vercel
- [ ] Todo funciona

---

**¿Listo? Empieza por el Paso 1.** 🚀
