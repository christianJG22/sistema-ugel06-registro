# 🚂 Despliegue en Railway - Guía Paso a Paso

## ✅ Repositorio a Usar
https://github.com/christianJG22/sistema-ugel06

---

## 📋 PASO 1: Crear Cuenta en Railway

1. **Abre tu navegador** y ve a: **https://railway.app**
2. Click en **"Start a New Project"** o **"Login"**
3. **Sign up with GitHub**
4. Autoriza Railway para acceder a tus repositorios
5. ✅ Ya tienes cuenta

---

## 📋 PASO 2: Crear Base de Datos PostgreSQL

1. En Railway Dashboard → Click **"New Project"**
2. Selecciona **"Provision PostgreSQL"**
3. Espera 1 minuto mientras se crea
4. **IMPORTANTE:** Copia la variable `DATABASE_URL`:
   - Click en el servicio "PostgreSQL"
   - Pestaña **"Variables"**
   - Busca `DATABASE_URL`
   - Click en el icono de copiar 📋
   - **Guarda esto en un lugar seguro** (lo necesitarás en el Paso 4)

---

## 📋 PASO 3: Agregar Backend al Proyecto

1. En el MISMO proyecto → Click **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Si no aparece tu repo:
   - Click **"Configure GitHub App"**
   - Selecciona tu cuenta
   - Da acceso al repo `sistema-ugel06`
4. Selecciona el repositorio: **`sistema-ugel06`**
5. Railway lo detectará automáticamente

### Configurar Backend:

1. Click en el servicio que se creó
2. **Settings:**
   - **Name:** Cambia a `backend` (para identificarlo)
   - **Root Directory:** `backend`
   - **Build Command:** Dejar vacío (usa package.json)
   - **Start Command:** `node server.js`

3. **Variables de Entorno** (Tab "Variables"):
   - Click **"+ New Variable"**
   
   **Variable 1:**
   ```
   Name: NODE_ENV
   Value: production
   ```
   
   **Variable 2:**
   ```
   Name: DATABASE_URL
   Value: (pega la URL que copiaste en el Paso 2)
   ```

4. **Generate Domain** (para obtener URL pública):
   - Settings → **Networking**
   - Click **"Generate Domain"**
   - Se genera algo como: `backend-production-XXXX.up.railway.app`
   - **Copia esta URL** (la necesitas para el frontend)

5. El backend se desplegará automáticamente
   - Ve a **"Deployments"**
   - Espera 2-3 minutos
   - Debe decir **"Success"** con un ✅ verde

---

## 📋 PASO 4: Agregar Frontend al Proyecto

1. En el proyecto → Click **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Selecciona el MISMO repo: **`sistema-ugel06`**

### Configurar Frontend:

1. Click en el nuevo servicio
2. **Settings:**
   - **Name:** `frontend`
   - **Root Directory:** `mi-sistema`
   - **Builder:** Nixpacks (automático)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** Dejar vacío
   - **Watch Paths:** `mi-sistema/**`

3. **Variables de Entorno**:
   - Click **"+ New Variable"**
   
   ```
   Name: REACT_APP_API_URL
   Value: https://TU-URL-BACKEND.up.railway.app/api
   ```
   
   ⚠️ **MUY IMPORTANTE:** 
   - Reemplaza `TU-URL-BACKEND` con la URL del backend del Paso 3
   - Debe terminar en `/api`
   - Ejemplo: `https://backend-production-a1b2.up.railway.app/api`

4. **Generate Domain**:
   - Settings → Networking
   - Click "Generate Domain"
   - URL pública: `frontend-production-XXXX.up.railway.app`
   - **¡Este es tu LINK PÚBLICO para compartir!** 🎉

5. Click **"Deploy"** si no se despliega automáticamente
   - Espera 3-4 minutos
   - Debe decir "Success" ✅

---

## 🎉 PASO 5: ¡LISTO! Prueba tu Sistema

### Tu Link Público:
```
https://frontend-production-XXXX.up.railway.app
```

### Pruebas:

1. **Abre el link** en tu navegador
2. **Registra una institución** (pestaña "Registrar" - público)
3. **Login como admin:**
   - Click en "Ver Registros"
   - Usuario: `admin`
   - Contraseña: `ugel06admin`
4. **Ver registros** en el panel admin
5. **Ver base de datos:** 
   - `https://TU-BACKEND-URL.up.railway.app/db-viewer`

### ✅ Comparte el Link:
Envía `https://frontend-production-XXXX.up.railway.app` a quien quieras que se registre.

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real:
1. Click en el servicio (backend o frontend)
2. Pestaña **"Deployments"**
3. Click en el deployment activo
4. Ver logs

### Ver Uso de Recursos:
1. Click en el servicio
2. Pestaña **"Metrics"**
3. Ver CPU, RAM, Red

### Ver Base de Datos:
1. Click en "PostgreSQL"
2. Pestaña **"Data"**
3. Ver tablas: `instituciones`, `usuarios`

---

## 💰 Uso y Costos

**Con $5 USD/mes gratis:**
- Backend: ~400 horas/mes activo
- Frontend: Ilimitado (estático)
- PostgreSQL: 1GB almacenamiento

**Si excedes $5/mes:**
- Los servicios se pausan
- Se reactivan el 1ro del mes siguiente
- O agrega tarjeta (solo cobra excedente)

---

## ⚙️ Configuraciones Adicionales

### Dominio Personalizado:
1. Settings → Networking
2. Custom Domains
3. Agrega tu dominio (ej: `registro-ugel06.com`)

### Redeploy Manual:
1. Deployments
2. Click en el deployment actual
3. "Redeploy"

### Rollback:
1. Deployments
2. Click en deployment anterior
3. "Redeploy"

---

## 🆘 Solución de Problemas

### Backend no inicia:
- Revisa **Logs** en Deployments
- Verifica `DATABASE_URL` en Variables
- Verifica `NODE_ENV=production`

### Frontend no conecta:
- Verifica `REACT_APP_API_URL` tiene `/api` al final
- Debe ser HTTPS
- Redeploy: Settings → Redeploy

### Error 404:
- Verifica Root Directory: `backend` y `mi-sistema`
- Verifica que el repo tenga ambas carpetas

### Base de datos vacía:
- El primer deploy crea las tablas automáticamente
- Usuario admin se crea solo
- Verifica en PostgreSQL → Data

---

## 📝 Checklist Final

- [ ] Cuenta Railway creada
- [ ] PostgreSQL creado y `DATABASE_URL` copiada
- [ ] Backend desplegado con variables configuradas
- [ ] Backend URL generada
- [ ] Frontend desplegado con `REACT_APP_API_URL`
- [ ] Frontend URL generada (LINK PÚBLICO)
- [ ] Probado: registro público funciona
- [ ] Probado: login admin funciona
- [ ] Link compartido

---

## 🎯 URLs Finales

| Servicio | URL |
|----------|-----|
| **LINK PÚBLICO (compartir)** | `https://frontend-production-XXXX.up.railway.app` |
| **Backend API** | `https://backend-production-XXXX.up.railway.app/api` |
| **Visualizador BD** | `https://backend-production-XXXX.up.railway.app/db-viewer` |
| **PostgreSQL** | Interno (solo backend accede) |

---

**¡Listo para empezar! Ve al Paso 1.** 🚀
